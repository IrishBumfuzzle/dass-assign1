const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getOrganizers,
    getOrganizerById,
    followOrganizer,
    unfollowOrganizer,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile);

router.get("/organizers", getOrganizers);
router.get("/organizers/:id", getOrganizerById);

router.put("/follow/:organizerId", protect, authorize("Participant"), followOrganizer);
router.put("/unfollow/:organizerId", protect, authorize("Participant"), unfollowOrganizer);

module.exports = router;
