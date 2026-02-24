const nodemailer = require("nodemailer");


let transporter;

const getTransporter = async () => {
    if (transporter) return transporter;

    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    return transporter;
};

const sendTicketEmail = async (participantEmail, participantName, eventName, ticketId, qrCodeData) => {
    try {
        const transport = await getTransporter();

        const mailOptions = {
            from: process.env.SMTP_FROM || '"Fest event manager" <noreply@felicity.iiit.ac.in>',
            to: participantEmail,
            subject: `🎟️ Registration Confirmed - ${eventName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="margin: 0;">🎉 Registration Confirmed!</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                        <p>Hi <strong>${participantName}</strong>,</p>
                        <p>Your registration for <strong>${eventName}</strong> has been confirmed!</p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #d1d5db;">
                            <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Ticket ID</p>
                            <p style="font-family: monospace; font-size: 18px; background: #f1f5f9; padding: 10px; border-radius: 4px; margin: 0;">${ticketId}</p>
                            ${qrCodeData ? `<div style="margin-top: 20px;"><img src="cid:qrCode" alt="QR Code" style="width: 200px; height: 200px;" /></div>` : ""}
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">Please present this ticket (or the QR code) at the venue for entry.</p>
                        <p style="color: #6b7280; font-size: 14px;">Thank you for registering!</p>
                    </div>
                </div>
            `,
            attachments: qrCodeData ? [{ filename: "qrcode.png", path: qrCodeData, cid: "qrCode" }] : [],
        };

        const info = await transport.sendMail(mailOptions);
        console.log("Ticket email sent:", info.messageId);
        if (info.messageUrl) {
            console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
        }
        return true;
    } catch (error) {
        console.error("Failed to send ticket email:", error.message);
        return false;
    }
};

const sendMerchandiseConfirmationEmail = async (
    participantEmail,
    participantName,
    eventName,
    ticketId,
    selection,
    qrCodeData,
) => {
    try {
        const transport = await getTransporter();

        const mailOptions = {
            from: process.env.SMTP_FROM || '"Fest event manager" <noreply@felicity.iiit.ac.in>',
            to: participantEmail,
            subject: `🛍️ Merchandise Order Confirmed - ${eventName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="margin: 0;">🛍️ Order Confirmed!</h1>
                    </div>
                    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                        <p>Hi <strong>${participantName}</strong>,</p>
                        <p>Your merchandise order for <strong>${eventName}</strong> has been approved!</p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                            <p><strong>Size:</strong> ${selection?.size || "N/A"}</p>
                            <p><strong>Color:</strong> ${selection?.color || "N/A"}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px dashed #d1d5db;">
                            <p style="font-family: monospace; font-size: 16px;">Ticket ID: ${ticketId}</p>
                            ${qrCodeData ? `<div style="margin-top: 15px;"><img src="cid:qrCode" alt="QR Code" style="width: 200px; height: 200px;" /></div>` : ""}
                        </div>
                        <p style="color: #6b7280; font-size: 14px;">Show this QR code when collecting your merchandise.</p>
                    </div>
                </div>
            `,
            attachments: qrCodeData ? [{ filename: "qrcode.png", path: qrCodeData, cid: "qrCode" }] : [],
        };

        const info = await transport.sendMail(mailOptions);
        console.log("Merchandise email sent:", info.messageId);
        return true;
    } catch (error) {
        console.error("Failed to send merchandise email:", error.message);
        return false;
    }
};

module.exports = { sendTicketEmail, sendMerchandiseConfirmationEmail };
