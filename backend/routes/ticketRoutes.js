const express = require("express");
const router = express.Router();
const {
    registerForEvent,
    getMyTickets,
    getEventTickets,
    resolvePayment,
} = require("../controllers/ticketController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/event/:eventId", protect, authorize("Organizer"), getEventTickets);

router.route("/").post(protect, authorize("Participant"), registerForEvent);

router.get("/my-tickets", protect, authorize("Participant"), getMyTickets);

router.put("/:id/resolve-payment", protect, authorize("Organizer"), resolvePayment);

module.exports = router;
