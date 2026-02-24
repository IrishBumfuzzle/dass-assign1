const express = require("express");
const router = express.Router();
const {
    createOrganizer,
    getAllOrganizers,
    deleteOrganizer,
    archiveOrganizer,
    getPasswordResetRequests,
    resolvePasswordReset,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router
    .route("/organizers")
    .post(protect, authorize("Admin"), createOrganizer)
    .get(protect, authorize("Admin"), getAllOrganizers);

router.route("/organizers/:id").delete(protect, authorize("Admin"), deleteOrganizer);

router.route("/organizers/:id/archive").put(protect, authorize("Admin"), archiveOrganizer);

router.route("/password-resets").get(protect, authorize("Admin"), getPasswordResetRequests);

router.route("/password-resets/:id").put(protect, authorize("Admin"), resolvePasswordReset);

module.exports = router;
