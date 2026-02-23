const Team = require("../models/Team");
const { NormalEvent } = require("../models/Event");
const Ticket = require("../models/Ticket");
const crypto = require("crypto");
const Message = require("../models/Message");
const QRCode = require("qrcode");
const { sendTicketEmail } = require("../utils/email");
const { User } = require("../models/User");

const generateQR = async (data) => {
    try {
        return await QRCode.toDataURL(JSON.stringify(data), { width: 250, margin: 2 });
    } catch (err) {
        return null;
    }
};

const createTeam = async (req, res) => {
    try {
        const { eventId, teamName } = req.body;
        const participantId = req.user._id;

        const event = await NormalEvent.findById(eventId);
        if (!event || !event.isTeamEvent) {
            return res.status(400).json({ message: "Invalid event or not a team event" });
        }

        // Check if user already in a team for this event
        const existingTeam = await Team.findOne({ eventId, "members.participantId": participantId });
        if (existingTeam) {
            return res.status(400).json({ message: "You are already a part of a team for this event." });
        }

        const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();

        const team = await Team.create({
            eventId,
            leaderId: participantId,
            teamName,
            maxTeamSize: event.maxTeamSize,
            members: [{ participantId, status: "Leader" }],
            inviteCode,
            isComplete: event.maxTeamSize === 1,
        });

        // If team of 1, auto-generate ticket
        if (team.isComplete) {
            const qrData = {
                ticketId: "pending",
                eventId: event._id.toString(),
                eventName: event.name,
                participantId: participantId.toString(),
            };
            const qrCodeData = await generateQR(qrData);

            const ticket = await Ticket.create({
                participantId,
                eventId: team.eventId,
                teamId: team._id,
                status: "Registered",
                qrCodeData,
            });

            // Send email
            const participant = await User.findById(participantId);
            if (participant) {
                const pName = `${participant.firstName} ${participant.lastName}`;
                sendTicketEmail(participant.email, pName, event.name, ticket._id.toString(), qrCodeData);
            }
        }

        res.status(201).json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const joinTeam = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const participantId = req.user._id;

        const team = await Team.findOne({ inviteCode });
        if (!team) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        if (team.isComplete) {
            return res.status(400).json({ message: "Team is already full or completed" });
        }

        const alreadyInTeam = team.members.find(
            (m) => m.participantId.toString() === participantId.toString(),
        );
        if (alreadyInTeam) {
            return res.status(400).json({ message: "You are already in this team" });
        }

        const existingTeamEntry = await Team.findOne({
            eventId: team.eventId,
            "members.participantId": participantId,
        });
        if (existingTeamEntry) {
            return res
                .status(400)
                .json({ message: "You are already a part of another team for this event." });
        }

        team.members.push({ participantId, status: "Accepted" });

        if (team.members.length === team.maxTeamSize) {
            team.isComplete = true;
        }

        await team.save();

        // If complete, generate tickets for everyone
        if (team.isComplete) {
            const event = await NormalEvent.findById(team.eventId);
            for (let member of team.members) {
                const qrData = {
                    ticketId: "pending",
                    eventId: team.eventId.toString(),
                    eventName: event ? event.name : "Event",
                    participantId: member.participantId.toString(),
                    teamName: team.teamName,
                };
                const qrCodeData = await generateQR(qrData);

                const ticket = await Ticket.create({
                    participantId: member.participantId,
                    eventId: team.eventId,
                    teamId: team._id,
                    status: "Registered",
                    qrCodeData,
                });

                // Send email to each member
                const participant = await User.findById(member.participantId);
                if (participant && event) {
                    const pName = `${participant.firstName} ${participant.lastName}`;
                    sendTicketEmail(
                        participant.email,
                        pName,
                        event.name,
                        ticket._id.toString(),
                        qrCodeData,
                    );
                }
            }
        }

        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getMyTeams = async (req, res) => {
    try {
        const participantId = req.user._id;
        const teams = await Team.find({ "members.participantId": participantId })
            .populate("eventId", "name startDate eventType")
            .populate("members.participantId", "firstName lastName");
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getTeamChat = async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const messages = await Message.find({ teamId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createTeam,
    joinTeam,
    getMyTeams,
    getTeamChat,
};
