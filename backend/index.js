const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Or specific frontend URL
        methods: ["GET", "POST"],
    },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded bodies

// Database Connection
const promptConnection = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI || "mongodb://localhost:27017/felicityeventmanager",
        );
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

promptConnection();

// Basic Route
app.get("/", (req, res) => {
    res.send("Felicity event manager API is running...");
});

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const teamRoutes = require("./routes/teamRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/teams", teamRoutes);
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
const Message = require("./models/Message");

// Socket.io for Team Chat
const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("userOnline", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("joinTeamRoom", (teamId) => {
        socket.join(teamId);
        console.log(`User ${socket.id} joined room ${teamId}`);
    });

    socket.on("typing", (data) => {
        socket.to(data.teamId).emit("userTyping", { userName: data.userName, isTyping: true });
    });

    socket.on("stopTyping", (data) => {
        socket.to(data.teamId).emit("userTyping", { userName: data.userName, isTyping: false });
    });

    socket.on("sendMessage", async (data) => {
        try {
            const { teamId, senderId, senderName, text, fileUrl } = data;

            // Save to DB (Assuming Message schema is updated for fileUrl if you want to persist)
            const message = await Message.create({
                teamId,
                senderId,
                senderName,
                text,
            });

            // If we have a fileUrl (not in original schema, but attaching to object for live transmission)
            const transmitMsg = message.toObject();
            if (fileUrl) transmitMsg.fileUrl = fileUrl;

            // Emit to everyone in the room (including sender)
            io.to(teamId).emit("receiveMessage", transmitMsg);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        for (let [userId, sockId] of onlineUsers.entries()) {
            if (sockId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Server Error", error: err.message });
});

if (process.env.NODE_ENV !== "production") {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
