const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const options = { discriminatorKey: "role", collection: "users" };

const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["Participant", "Organizer", "Admin"],
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    options,
);

UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

const ParticipantSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    collegeOrOrgName: { type: String, required: true },
    type: {
        type: String,
        enum: ["IIIT", "Non-IIIT"],
        required: true,
    },
    interests: [{ type: String }],
    followedOrganizers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const OrganizerSchema = new mongoose.Schema({
    organizerName: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    contactEmail: { type: String },
    discordWebhookUrl: { type: String },
    isArchived: { type: Boolean, default: false },
});

const AdminSchema = new mongoose.Schema({});

const Participant = User.discriminator("Participant", ParticipantSchema);
const Organizer = User.discriminator("Organizer", OrganizerSchema);
const Admin = User.discriminator("Admin", AdminSchema);

module.exports = { User, Participant, Organizer, Admin };
