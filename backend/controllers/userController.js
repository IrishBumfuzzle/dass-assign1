const { User, Participant, Organizer } = require("../models/User");
const bcrypt = require("bcryptjs");

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {

                        if (user.role === "Participant") {
                user.firstName = req.body.firstName || user.firstName;
                user.lastName = req.body.lastName || user.lastName;
                user.contactNumber = req.body.contactNumber || user.contactNumber;
                user.interests = req.body.interests || user.interests;
                user.collegeOrOrgName = req.body.collegeOrOrgName || user.collegeOrOrgName;
            } else if (user.role === "Organizer") {
                user.organizerName = req.body.organizerName || user.organizerName;
                user.description = req.body.description || user.description;
                user.category = req.body.category || user.category;
                user.contactEmail = req.body.contactEmail || user.contactEmail;
                user.discordWebhookUrl = req.body.discordWebhookUrl || user.discordWebhookUrl;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name:
                    user.role === "Organizer"
                        ? updatedUser.organizerName
                        : `${updatedUser.firstName} ${updatedUser.lastName}`,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.find({}).select(
            "organizerName description category contactEmail",
        );
        res.json(organizers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};




const getOrganizerById = async (req, res) => {
    try {
        const organizer = await Organizer.findById(req.params.id).select("-password");
        if (organizer) {
            res.json(organizer);
        } else {
            res.status(404).json({ message: "Organizer not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};




const followOrganizer = async (req, res) => {
    try {
        const participant = await Participant.findById(req.user._id);
        const organizerId = req.params.organizerId;

        if (!participant.followedOrganizers.includes(organizerId)) {
            participant.followedOrganizers.push(organizerId);
            await participant.save();
        }
        res.json({
            message: "Followed successfully",
            followedOrganizers: participant.followedOrganizers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};




const unfollowOrganizer = async (req, res) => {
    try {
        const participant = await Participant.findById(req.user._id);
        const organizerId = req.params.organizerId;

        participant.followedOrganizers = participant.followedOrganizers.filter(
            (id) => id.toString() !== organizerId,
        );
        await participant.save();
        res.json({
            message: "Unfollowed successfully",
            followedOrganizers: participant.followedOrganizers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    getOrganizers,
    getOrganizerById,
    followOrganizer,
    unfollowOrganizer,
};
