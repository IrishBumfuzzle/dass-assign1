const { Event, NormalEvent, MerchandiseEvent } = require("../models/Event");
const Ticket = require("../models/Ticket");
const { Participant } = require("../models/User");

const createEvent = async (req, res) => {
    try {
        const {
            name,
            description,
            eventType,
            tags,
            eligibility,
            registrationLimit,
            fee,
            deadline,
            startDate,
            endDate,
            status,
            customFormFields,
            merchandiseDetails,
            isTeamEvent,
            maxTeamSize,
        } = req.body;

        const eventData = {
            name,
            description,
            eventType,
            organizerId: req.user._id,
            tags,
            eligibility,
            registrationLimit,
            fee,
            deadline,
            startDate,
            endDate,
            status: status || "Draft",
        };

        let event;

        if (eventType === "Normal") {
            event = new NormalEvent({
                ...eventData,
                customFormFields: customFormFields || [],
                isTeamEvent: isTeamEvent || false,
                maxTeamSize: maxTeamSize || 1,
            });
        } else if (eventType === "Merchandise") {
            event = new MerchandiseEvent({
                ...eventData,
                merchandiseDetails,
            });
        } else {
            return res.status(400).json({ message: "Invalid event type" });
        }

        const createdEvent = await event.save();

        if (createdEvent.status === "Published") {
            const { sendEventNotification } = require("../utils/discord");
            const { User } = require("../models/User");
            const organizerUser = await User.findById(req.user._id);
            if (organizerUser && organizerUser.discordWebhookUrl) {
                sendEventNotification(organizerUser.discordWebhookUrl, createdEvent);
            }
        }

        res.status(201).json(createdEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this event" });
        }

        const currentStatus = event.status;
        const updates = req.body;

        if (currentStatus === "Draft") {
            Object.keys(updates).forEach((key) => {
                if (key === "eventType" || key === "organizerId") return;
                event[key] = updates[key];
            });

            if (event.eventType === "Normal" && updates.customFormFields) {
                event.customFormFields = updates.customFormFields;
            }
            if (event.eventType === "Normal" && updates.isTeamEvent !== undefined) {
                event.isTeamEvent = updates.isTeamEvent;
                event.maxTeamSize = updates.maxTeamSize || event.maxTeamSize;
            }
            if (event.eventType === "Merchandise" && updates.merchandiseDetails) {
                event.merchandiseDetails = updates.merchandiseDetails;
            }
        } else if (currentStatus === "Published") {
            const allowedFields = ["description", "deadline", "registrationLimit", "status"];
            Object.keys(updates).forEach((key) => {
                if (!allowedFields.includes(key)) return;
                if (key === "deadline") {
                    if (new Date(updates.deadline) > new Date(event.deadline)) {
                        event.deadline = updates.deadline;
                    }
                } else if (key === "registrationLimit") {
                    if (updates.registrationLimit > event.registrationLimit) {
                        event.registrationLimit = updates.registrationLimit;
                    }
                } else if (key === "status") {
                    if (["Ongoing", "Closed"].includes(updates.status)) {
                        event.status = updates.status;
                    }
                } else {
                    event[key] = updates[key];
                }
            });
        } else if (currentStatus === "Ongoing" || currentStatus === "Closed") {
            if (updates.status) {
                if (currentStatus === "Ongoing" && ["Closed"].includes(updates.status)) {
                    event.status = updates.status;
                }
            } else {
                return res
                    .status(400)
                    .json({ message: `Event is ${currentStatus}. Only status changes are allowed.` });
            }
        }

        if (event.eventType === "Normal" && updates.customFormFields) {
            const ticketCount = await Ticket.countDocuments({
                eventId: event._id,
                status: { $ne: "Cancelled" },
            });
            if (ticketCount > 0) {
                delete updates.customFormFields;
                event.formLocked = true;
            }
        }

        if (updates.status === "Published" && currentStatus === "Draft") {
            const { sendEventNotification } = require("../utils/discord");
            const { User } = require("../models/User");
            const organizerUser = await User.findById(req.user._id);
            if (organizerUser && organizerUser.discordWebhookUrl) {
                sendEventNotification(organizerUser.discordWebhookUrl, event);
            }
        }

        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const { keyword, type, startDate, endDate, eligibility, sort, followedClubs, userId } =
            req.query;

        let query = {};

        query.status = { $in: ["Published", "Ongoing"] };

        if (keyword) {
            const searchResults = await Event.aggregate([
                {
                    $search: {
                        index: "default",
                        text: {
                            query: keyword,
                            path: "name",
                            fuzzy: {},
                        },
                    },
                },
                { $project: { _id: 1 } },
            ]);
            query._id = { $in: searchResults.map((res) => res._id) };
        }

        if (type) {
            query.eventType = type;
        }

        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate) };
            query.endDate = { $lte: new Date(endDate) };
        } else if (startDate) {
            query.startDate = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.endDate = { $lte: new Date(endDate) };
        }

        if (eligibility) {
            query.eligibility = { $regex: eligibility, $options: "i" };
        }

        if (followedClubs) {
            const clubIds = followedClubs.split(",");
            query.organizerId = { $in: clubIds };
        }

        let sortOption = { startDate: 1 };

        if (sort === "trending") {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const trendingEvents = await Ticket.aggregate([
                { $match: { registrationDate: { $gte: twentyFourHoursAgo } } },
                { $group: { _id: "$eventId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ]);

            const trendingIds = trendingEvents.map((t) => t._id);

            if (trendingIds.length > 0) {
                if (query._id && query._id.$in) {
                    const existingIdsStr = query._id.$in.map((id) => id.toString());
                    query._id.$in = trendingIds.filter((id) => existingIdsStr.includes(id.toString()));
                } else {
                    query._id = { $in: trendingIds };
                }
            }

            sortOption = { createdAt: -1 };
        } else if (sort === "date") {
            sortOption = { startDate: 1 };
        }

        let events = await Event.find(query)
            .sort(sortOption)
            .populate("organizerId", "organizerName email");

        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            "organizerId",
            "organizerName contactEmail email",
        );

        if (event) {
            res.json(event);
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizerId: req.user._id }).sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getAnalyticsSummary = async (req, res) => {
    try {
        const events = await Event.find({ organizerId: req.user._id });
        const eventIds = events.map((e) => e._id);

        const tickets = await Ticket.find({ eventId: { $in: eventIds } });

        const totalRegistrations = tickets.filter((t) => t.status === "Registered").length;
        const totalRevenue = tickets
            .filter((t) => t.paymentStatus === "Approved" || t.paymentStatus === "Paid")
            .reduce((sum, t) => {
                const evt = events.find((e) => e._id.toString() === t.eventId.toString());
                return sum + (evt ? evt.fee : 0);
            }, 0);
        const totalAttendance = tickets.filter((t) => t.attended).length;
        const totalMerchSales = tickets.filter(
            (t) =>
                t.eventId &&
                events.find(
                    (e) => e._id.toString() === t.eventId.toString() && e.eventType === "Merchandise",
                ) &&
                t.paymentStatus === "Approved",
        ).length;

        res.json({
            totalEvents: events.length,
            totalRegistrations,
            totalRevenue,
            totalAttendance,
            totalMerchSales,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createEvent,
    updateEvent,
    getEvents,
    getEventById,
    getMyEvents,
    getAnalyticsSummary,
};
