const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
    },
    status: {
        type: String,
        enum: ["Registered", "Pending", "Cancelled", "Rejected", "Completed"],
        default: "Registered",
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    formData: { type: Map, of: String },
    merchandiseSelection: {
        size: { type: String },
        color: { type: String },
        quantity: { type: Number, default: 1 },
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Approved", "Rejected", "Paid", "NA"],
        default: "Pending",
    },
    paymentProofUrl: { type: String },
    transactionId: { type: String },
    attended: { type: Boolean, default: false },
    attendedAt: { type: Date },
    qrCodeData: { type: String }, // Base64 QR code image
});

module.exports = mongoose.model("Ticket", TicketSchema);
