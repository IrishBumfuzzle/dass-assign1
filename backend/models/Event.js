const mongoose = require("mongoose");

const options = { discriminatorKey: "eventType", collection: "events" };

// Base Event Schema
const EventSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        eventType: {
            type: String,
            enum: ["Normal", "Merchandise"],
            required: true,
        },
        status: {
            type: String,
            enum: ["Draft", "Published", "Ongoing", "Closed"],
            default: "Draft",
        },
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [{ type: String }],
        eligibility: { type: String }, // e.g., "All", "IIIT Only"
        registrationLimit: { type: Number },
        fee: { type: Number, default: 0 },
        deadline: { type: Date },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    options,
);

const Event = mongoose.model("Event", EventSchema);

// Normal Event Schema (Custom Form Fields)
const NormalEventSchema = new mongoose.Schema({
    customFormFields: [
        {
            label: { type: String, required: true },
            fieldType: {
                type: String,
                enum: ["text", "number", "email", "dropdown", "checkbox", "file"],
                required: true,
            },
            options: [{ type: String }], // For dropdowns
            required: { type: Boolean, default: false },
            order: { type: Number, default: 0 },
        },
    ],
    formLocked: { type: Boolean, default: false }, // Lock after first registration
    isTeamEvent: { type: Boolean, default: false },
    maxTeamSize: { type: Number, default: 1 },
});

// Merchandise Event Schema (Item Details)
const MerchandiseEventSchema = new mongoose.Schema({
    merchandiseDetails: {
        sizes: [{ type: String }],
        colors: [{ type: String }],
        variants: [{ type: String }],
        stock: { type: Number, default: 0 },
        imageUrl: { type: String },
        purchaseLimitPerParticipant: { type: Number, default: 1 },
    },
});

const NormalEvent = Event.discriminator("Normal", NormalEventSchema);
const MerchandiseEvent = Event.discriminator("Merchandise", MerchandiseEventSchema);

module.exports = { Event, NormalEvent, MerchandiseEvent };
