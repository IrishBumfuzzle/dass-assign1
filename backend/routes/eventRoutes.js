const express = require("express");
const router = express.Router();
const {
    createEvent,
    getEvents,
    getEventById,
    getMyEvents,
    updateEvent,
    getAnalyticsSummary,
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/my-events", protect, authorize("Organizer"), getMyEvents);
router.get("/analytics-summary", protect, authorize("Organizer"), getAnalyticsSummary);

router.route("/").get(getEvents).post(protect, authorize("Organizer"), createEvent);

router.route("/:id").get(getEventById).put(protect, authorize("Organizer"), updateEvent);

module.exports = router;
