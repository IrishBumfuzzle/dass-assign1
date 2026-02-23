const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    leaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    teamName: {
        type: String,
        required: true,
    },
    maxTeamSize: {
        type: Number,
        required: true,
    },
    members: [
        {
            participantId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: { type: String, enum: ["Pending", "Accepted", "Leader"], default: "Pending" },
        },
    ],
    inviteCode: {
        type: String,
        required: true,
        unique: true,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Team", TeamSchema);
