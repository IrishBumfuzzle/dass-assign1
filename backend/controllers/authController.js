const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Participant, Organizer, Admin } = require("../models/User");
const PasswordResetRequest = require("../models/PasswordResetRequest");
const axios = require("axios");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

const verifyCaptcha = async (token) => {
    if (!token) return false;

    const secret = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";
    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`,
        );
        return response.data.success;
    } catch (error) {
        console.error("Captcha verification error", error);
        return false;
    }
};

const registerParticipant = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            contactNumber,
            collegeOrOrgName,
            type,
            interests,
            captcha,
        } = req.body;

        const isValidCaptcha = await verifyCaptcha(captcha);
        if (!isValidCaptcha) {
            return res.status(400).json({ message: "Invalid CAPTCHA" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const iiitEmailRegex = /@(research\.iiit\.ac\.in|students\.iiit\.ac\.in|iiit\.ac\.in)$/;
        if (type === "IIIT" && !iiitEmailRegex.test(email)) {
            return res.status(400).json({
                message:
                    "IIIT students must use a valid IIIT email (students.iiit.ac.in, research.iiit.ac.in, or iiit.ac.in)",
            });
        }

        const user = await Participant.create({
            firstName,
            lastName,
            email,
            password,
            contactNumber,
            collegeOrOrgName,
            type,
            interests,
            role: "Participant",
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password, captcha } = req.body;

        const isValidCaptcha = await verifyCaptcha(captcha);
        if (!isValidCaptcha) {
            return res.status(400).json({ message: "Invalid CAPTCHA" });
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isArchived) {
                return res
                    .status(403)
                    .json({ message: "This account has been archived. Please contact an admin." });
            }
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
};

const requestPasswordReset = async (req, res) => {
    try {
        const { email, reason } = req.body;
        const user = await Organizer.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Organizer not found with this email" });
        }

        const existingReq = await PasswordResetRequest.findOne({
            organizerId: user._id,
            status: "Pending",
        });
        if (existingReq) {
            return res
                .status(400)
                .json({ message: "A pending password reset request already exists for this account." });
        }

        const resetRequest = await PasswordResetRequest.create({
            organizerId: user._id,
            reason,
        });

        res.status(201).json({
            message: "Password reset request submitted successfully",
            request: resetRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

module.exports = {
    registerParticipant,
    loginUser,
    getMe,
    requestPasswordReset,
};
