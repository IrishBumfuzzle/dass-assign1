const express = require("express");
const router = express.Router();
const { createTeam, joinTeam, getMyTeams, getTeamChat } = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

router.post("/create", protect, createTeam);
router.post("/join", protect, joinTeam);
router.get("/my-teams", protect, getMyTeams);
router.get("/:teamId/chat", protect, getTeamChat);

module.exports = router;
