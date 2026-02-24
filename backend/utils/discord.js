const axios = require("axios");

const sendEventNotification = async (webhookUrl, eventData) => {
    if (!webhookUrl) return;

    try {
        const message = {
            embeds: [
                {
                    title: "New Event Published! 🎉",
                    color: 5814783, 
                    fields: [
                        { name: "Event Name", value: eventData.name },
                        { name: "Date", value: new Date(eventData.startDate).toDateString() },
                        { name: "Type", value: eventData.eventType },
                        {
                            name: "Registration Fee",
                            value: eventData.fee > 0 ? `$${eventData.fee}` : "Free",
                        },
                    ],
                    description: eventData.description,
                    timestamp: new Date(),
                },
            ],
        };

        await axios.post(webhookUrl, message);
        console.log(`Notification sent to Discord for event: ${eventData.name}`);
    } catch (error) {
        console.error("Failed to send Discord notification:", error.message);
    }
};

module.exports = { sendEventNotification };
