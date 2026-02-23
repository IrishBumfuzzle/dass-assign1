const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const { User, Organizer, Admin, Participant } = require("./models/User");
const { Event, NormalEvent, MerchandiseEvent } = require("./models/Event");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/campusevents");
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        // Clear existing data
        await User.deleteMany({});
        await Event.deleteMany({});
        console.log("Data cleared");

        // Create Admin
        const admin = await Admin.create({
            email: "admin@felicity.iiit.ac.in",
            password: "password123",
            role: "Admin",
        });
        console.log("Admin created:", admin.email);

        // Create Organizer
        const organizer = await Organizer.create({
            email: "techclub@felicity.iiit.ac.in",
            password: "password123",
            role: "Organizer",
            organizerName: "Tech Club IIIT",
            description:
                "The official tech club of IIIT Hyderabad organizing workshops, hackathons, and tech talks.",
            category: "Technical",
            contactEmail: "techclub@iiit.ac.in",
            discordWebhookUrl: "",
        });
        console.log("Organizer created:", organizer.email);

        // Create a second organizer
        const organizer2 = await Organizer.create({
            email: "literaryclub@felicity.iiit.ac.in",
            password: "password123",
            role: "Organizer",
            organizerName: "Literary Club",
            description: "Debates, quiz competitions, and creative writing at IIIT Hyderabad.",
            category: "Literary",
            contactEmail: "litclub@iiit.ac.in",
        });
        console.log("Organizer 2 created:", organizer2.email);

        // Create Participant (IIIT)
        const participantIIIT = await Participant.create({
            email: "student@students.iiit.ac.in",
            password: "password123",
            role: "Participant",
            firstName: "Rahul",
            lastName: "Sharma",
            contactNumber: "9876543210",
            collegeOrOrgName: "IIIT Hyderabad",
            type: "IIIT",
            interests: ["Coding", "Robotics", "AI"],
        });
        console.log("Participant (IIIT) created:", participantIIIT.email);

        // Create Participant (Non-IIIT)
        const participantNonIIIT = await Participant.create({
            email: "external@gmail.com",
            password: "password123",
            role: "Participant",
            firstName: "Priya",
            lastName: "Patel",
            contactNumber: "9876543211",
            collegeOrOrgName: "IIT Bombay",
            type: "Non-IIIT",
            interests: ["Music", "Dance"],
        });
        console.log("Participant (Non-IIIT) created:", participantNonIIIT.email);

        // Create Normal Event (Published)
        const techTalk = await NormalEvent.create({
            name: "AI in 2026: Future Trends",
            description:
                "An insightful session on the advancements of Artificial Intelligence. Join leading researchers and industry experts as they discuss the future trajectory of AI.",
            eventType: "Normal",
            status: "Published",
            organizerId: organizer._id,
            startDate: new Date("2026-03-10T10:00:00"),
            endDate: new Date("2026-03-10T12:00:00"),
            deadline: new Date("2026-03-09T23:59:59"),
            fee: 0,
            eligibility: "Open to All",
            registrationLimit: 100,
            tags: ["AI", "Tech", "Seminar"],
            customFormFields: [
                {
                    label: "Year of Study",
                    fieldType: "dropdown",
                    options: ["1st", "2nd", "3rd", "4th"],
                    required: true,
                    order: 0,
                },
                { label: "LinkedIn Profile", fieldType: "text", required: false, order: 1 },
            ],
        });
        console.log("Normal Event created:", techTalk.name);

        // Create Team Event (Published)
        const hackathon = await NormalEvent.create({
            name: "Felicity Hackathon 2026",
            description:
                "A 24-hour hackathon where teams compete to build innovative solutions. Form your team and register now!",
            eventType: "Normal",
            status: "Published",
            organizerId: organizer._id,
            startDate: new Date("2026-03-20T09:00:00"),
            endDate: new Date("2026-03-21T09:00:00"),
            deadline: new Date("2026-03-19T23:59:59"),
            fee: 200,
            eligibility: "IIIT Only",
            registrationLimit: 50,
            tags: ["Hackathon", "Coding", "Tech"],
            isTeamEvent: true,
            maxTeamSize: 4,
            customFormFields: [
                { label: "Problem Statement Preference", fieldType: "text", required: true, order: 0 },
            ],
        });
        console.log("Team Event created:", hackathon.name);

        // Create Merchandise Event (Published)
        const hoodieSale = await MerchandiseEvent.create({
            name: "Felicity Campus Hoodie",
            description:
                "Official Felicity 2026 Campus Hoodies. Limited Stock! Premium quality with exclusive designs.",
            eventType: "Merchandise",
            status: "Published",
            organizerId: organizer._id,
            startDate: new Date("2026-03-15T09:00:00"),
            endDate: new Date("2026-03-20T18:00:00"),
            deadline: new Date("2026-03-20T18:00:00"),
            fee: 499,
            eligibility: "IIIT Students Only",
            registrationLimit: 50,
            tags: ["Merch", "Clothing", "Limited"],
            merchandiseDetails: {
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: ["Navy Blue", "Black", "Grey"],
                stock: 50,
                imageUrl: "https://via.placeholder.com/400x300?text=Felicity+Hoodie",
                purchaseLimitPerParticipant: 2,
            },
        });
        console.log("Merchandise Event created:", hoodieSale.name);

        // Create a Draft event
        const draftEvent = await NormalEvent.create({
            name: "Workshop: Web Development Basics",
            description:
                "A hands-on workshop covering HTML, CSS, and JavaScript fundamentals. Draft - not yet published.",
            eventType: "Normal",
            status: "Draft",
            organizerId: organizer._id,
            startDate: new Date("2026-04-01T14:00:00"),
            endDate: new Date("2026-04-01T17:00:00"),
            deadline: new Date("2026-03-31T23:59:59"),
            fee: 0,
            eligibility: "Open to All",
            registrationLimit: 30,
            tags: ["Web", "Workshop", "Beginner"],
        });
        console.log("Draft Event created:", draftEvent.name);

        console.log("\n=== Seed Completed Successfully ===");
        console.log("\nLogin Credentials:");
        console.log("Admin: admin@felicity.iiit.ac.in / password123");
        console.log("Organizer: techclub@felicity.iiit.ac.in / password123");
        console.log("Organizer 2: literaryclub@felicity.iiit.ac.in / password123");
        console.log("Participant (IIIT): student@students.iiit.ac.in / password123");
        console.log("Participant (Non-IIIT): external@gmail.com / password123");

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
