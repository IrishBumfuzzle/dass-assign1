const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { User, Organizer } = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};


const generatePassword = () => {
    return crypto.randomBytes(6).toString("base64url").slice(0, 12);
};


const generateOrgEmail = (organizerName) => {
    const slug = organizerName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${slug}@felicity.iiit.ac.in`;
};

const createOrganizer = async (req, res) => {
    try {
        const {
            organizerName,
            email,
            password,
            contactEmail,
            discordWebhookUrl,
            category,
            description,
        } = req.body;

        const finalEmail = email || generateOrgEmail(organizerName);
        const finalPassword = password || generatePassword();

        const userExists = await User.findOne({ email: finalEmail });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const organizer = await Organizer.create({
            role: "Organizer",
            organizerName,
            email: finalEmail,
            password: finalPassword,
            contactEmail: contactEmail || finalEmail,
            discordWebhookUrl,
            category: category || "",
            description: description || "",
        });

        if (organizer) {
            res.status(201).json({
                _id: organizer._id,
                organizerName: organizer.organizerName,
                email: organizer.email,
                role: organizer.role,
                generatedPassword: finalPassword, 
            });
        } else {
            res.status(400).json({ message: "Invalid organizer data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};




const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({ role: "Organizer" }).select("-password");
        res.json(organizers);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};




const deleteOrganizer = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: req.params.id });
            res.json({ message: "Organizer removed" });
        } else {
            res.status(404).json({ message: "Organizer not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};




const getPasswordResetRequests = async (req, res) => {
    try {
        const requests = await PasswordResetRequest.find({})
            .populate("organizerId", "organizerName email")
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};




const resolvePasswordReset = async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        const resetRequest = await PasswordResetRequest.findById(req.params.id).populate("organizerId");

        if (!resetRequest) {
            return res.status(404).json({ message: "Request not found" });
        }

        resetRequest.status = status;
        resetRequest.adminComments = adminComments || "";

        if (status === "Approved") {
            const newPassword = generatePassword();
            resetRequest.newPassword = newPassword;

            const user = await User.findById(resetRequest.organizerId._id);
            user.password = newPassword; 
            await user.save();
        }

        await resetRequest.save();
        res.json({ message: `Password reset request ${status}`, request: resetRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    createOrganizer,
    getAllOrganizers,
    deleteOrganizer,
    getPasswordResetRequests,
    resolvePasswordReset,
};
