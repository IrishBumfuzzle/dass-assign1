const express = require("express");
const router = express.Router();
const {
    registerParticipant,
    loginUser,
    getMe,
    requestPasswordReset,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerParticipant);
router.post("/login", loginUser);
router.get("/profile", protect, getMe);
router.post("/password-reset", requestPasswordReset);

module.exports = router;
