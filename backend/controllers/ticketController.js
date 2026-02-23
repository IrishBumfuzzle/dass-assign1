const Ticket = require("../models/Ticket");
const { Event, MerchandiseEvent, NormalEvent } = require("../models/Event");
const { User, Participant } = require("../models/User");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const { sendTicketEmail, sendMerchandiseConfirmationEmail } = require("../utils/email");

// Generate QR code as data URL
const generateQR = async (data) => {
    try {
        const url = await QRCode.toDataURL(JSON.stringify(data), { width: 250, margin: 2 });
        return url;
    } catch (err) {
        console.error("QR generation failed:", err);
        return null;
    }
};

// @desc    Register for an event (Participant only)
// @route   POST /api/tickets
// @access  Private (Participant)
const registerForEvent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { eventId, formData, merchandiseSelection, paymentProofUrl } = req.body;
        const participantId = req.user._id;

        // 1. Check if Event exists and is Published/Ongoing
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Event not found" });
        }

        if (!["Published", "Ongoing"].includes(event.status)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Event is not open for registration" });
        }

        // 2. Check deadline
        if (event.deadline && new Date(event.deadline) < new Date()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Registration deadline has passed" });
        }

        // 3. Check for existing registration
        const existingTicket = await Ticket.findOne({
            participantId,
            eventId,
            status: { $nin: ["Cancelled", "Rejected"] },
        }).session(session);
        if (existingTicket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "You are already registered for this event" });
        }

        // 4. Handle Normal Event Constraints
        if (event.eventType === "Normal") {
            if (event.registrationLimit > 0) {
                const registrationCount = await Ticket.countDocuments({
                    eventId,
                    status: { $nin: ["Cancelled", "Rejected"] },
                }).session(session);
                if (registrationCount >= event.registrationLimit) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Event registration full" });
                }
            }

            // Lock form after first registration
            const normalEvent = await NormalEvent.findById(eventId).session(session);
            if (normalEvent && !normalEvent.formLocked) {
                normalEvent.formLocked = true;
                await normalEvent.save({ session });
            }
        }

        // 5. Handle Merchandise Event Constraints
        if (event.eventType === "Merchandise") {
            const merchEvent = await MerchandiseEvent.findById(eventId).session(session);
            if (merchEvent.merchandiseDetails && merchEvent.merchandiseDetails.stock !== undefined) {
                if (merchEvent.merchandiseDetails.stock <= 0) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Merchandise out of stock" });
                }
            }
        }

        let ticketStatus = "Registered";
        let paymentStat = event.fee > 0 ? "Pending" : "NA";

        if (event.eventType === "Merchandise") {
            ticketStatus = "Pending";
            paymentStat = "Pending";
        }

        // 6. Create Ticket
        const ticket = await Ticket.create(
            [
                {
                    participantId,
                    eventId,
                    status: ticketStatus,
                    formData: formData || {},
                    merchandiseSelection: merchandiseSelection || {},
                    paymentStatus: paymentStat,
                    paymentProofUrl: paymentProofUrl || null,
                },
            ],
            { session },
        );

        const createdTicket = ticket[0];

        // 7. Generate QR Code for normal events (Merchandise gets QR on approval)
        if (event.eventType === "Normal") {
            const qrData = {
                ticketId: createdTicket._id.toString(),
                eventId: event._id.toString(),
                eventName: event.name,
                participantId: participantId.toString(),
            };
            const qrCodeData = await generateQR(qrData);
            createdTicket.qrCodeData = qrCodeData;
            await createdTicket.save({ session });

            // 8. Send email for Normal events
            const participant = await User.findById(participantId).session(session);
            if (participant) {
                const pName = participant.firstName
                    ? `${participant.firstName} ${participant.lastName}`
                    : participant.email;
                sendTicketEmail(
                    participant.email,
                    pName,
                    event.name,
                    createdTicket._id.toString(),
                    qrCodeData,
                );
            }
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(createdTicket);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get my tickets
// @route   GET /api/tickets/my-tickets
// @access  Private (Participant)
const getMyTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ participantId: req.user._id })
            .populate({
                path: "eventId",
                select: "name startDate endDate eventType organizerId description",
                populate: { path: "organizerId", select: "organizerName" },
            })
            .populate("teamId", "teamName")
            .sort({ registrationDate: -1 });
        res.json(tickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get tickets for an event (Organizer only)
// @route   GET /api/tickets/event/:eventId
// @access  Private (Organizer)
const getEventTickets = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { search } = req.query;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to view analytics for this event" });
        }

        let tickets = await Ticket.find({ eventId })
            .populate("participantId", "firstName lastName email contactNumber collegeOrOrgName")
            .populate("teamId", "teamName")
            .sort({ registrationDate: -1 });

        // Search/filter by participant name or email
        if (search) {
            const searchLower = search.toLowerCase();
            tickets = tickets.filter((t) => {
                const p = t.participantId;
                if (!p) return false;
                const fullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
                return (
                    fullName.includes(searchLower) ||
                    (p.email && p.email.toLowerCase().includes(searchLower))
                );
            });
        }

        // Compute analytics
        const totalRegistrations = tickets.filter(
            (t) => t.status !== "Cancelled" && t.status !== "Rejected",
        ).length;
        const totalAttendance = tickets.filter((t) => t.attended).length;
        const totalRevenue =
            tickets
                .filter((t) => t.paymentStatus === "Approved" || t.paymentStatus === "Paid")
                .reduce(() => event.fee, 0) *
            tickets.filter((t) => t.paymentStatus === "Approved" || t.paymentStatus === "Paid").length;

        res.json({
            tickets,
            analytics: {
                totalRegistrations,
                totalAttendance,
                totalRevenue:
                    tickets.filter((t) => t.paymentStatus === "Approved" || t.paymentStatus === "Paid")
                        .length * event.fee,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Resolve Merchandise Payment (Organizer)
// @route   PUT /api/tickets/:id/resolve-payment
// @access  Private (Organizer)
const resolvePayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { status } = req.body; // "Approved" or "Rejected"
        const ticketId = req.params.id;

        const ticket = await Ticket.findById(ticketId)
            .populate("eventId")
            .populate("participantId", "firstName lastName email")
            .session(session);
        if (!ticket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Ticket not found" });
        }

        if (ticket.eventId.organizerId.toString() !== req.user._id.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Not authorized" });
        }

        if (status === "Approved") {
            ticket.paymentStatus = "Approved";
            ticket.status = "Registered";

            // Decrement Stock
            const merchEvent = await MerchandiseEvent.findById(ticket.eventId._id).session(session);
            if (merchEvent.merchandiseDetails) {
                if (merchEvent.merchandiseDetails.stock <= 0) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Cannot approve, out of stock" });
                }
                merchEvent.merchandiseDetails.stock -= 1;
                await merchEvent.save({ session });
            }

            // Generate QR Code on approval
            const qrData = {
                ticketId: ticket._id.toString(),
                eventId: ticket.eventId._id.toString(),
                eventName: ticket.eventId.name,
                participantId: ticket.participantId._id.toString(),
            };
            const qrCodeData = await generateQR(qrData);
            ticket.qrCodeData = qrCodeData;

            // Send confirmation email
            if (ticket.participantId) {
                const pName = `${ticket.participantId.firstName} ${ticket.participantId.lastName}`;
                sendMerchandiseConfirmationEmail(
                    ticket.participantId.email,
                    pName,
                    ticket.eventId.name,
                    ticket._id.toString(),
                    ticket.merchandiseSelection,
                    qrCodeData,
                );
            }
        } else if (status === "Rejected") {
            ticket.paymentStatus = "Rejected";
            ticket.status = "Rejected";
        } else {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "Invalid status" });
        }

        await ticket.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json(ticket);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    registerForEvent,
    getMyTickets,
    getEventTickets,
    resolvePayment,
};
