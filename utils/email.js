const nodemailer = require('nodemailer');

// 1. Create a transporter object using your Gmail credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//2. Verify Gmail connection right after transporter creation
transporter.verify((error, success) => {
    if (error) {
        console.error("Gmail SMTP connection failed:", error.message);
    } else {
        console.log(" Gmail SMTP connection ready to send emails!");
    }
});

/**
Sends a booking confirmation email.
@param {string} recipientEmail - The user's email address.
@param {object} bookingDetails - Details of the booking (name, listing title, etc.).
 */
module.exports.sendBookingConfirmation = async (recipientEmail, bookingDetails) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: recipientEmail,
            subject: `Nestero Booking Confirmed for ${bookingDetails.listingTitle}`,
            html: `
                <h2>🎉 Booking Successfully Confirmed!</h2>
                <p>Hello ${bookingDetails.fullName},</p>
                <p>Your reservation for <b>${bookingDetails.listingTitle}</b> has been successfully processed.</p>
                
                <table style="border: 1px solid #ccc; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border: 1px solid #ccc;">Destination:</td><td style="padding: 8px; border: 1px solid #ccc;">${bookingDetails.listingTitle}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ccc;">Adults:</td><td style="padding:8px;border:1px solid #ccc;">${bookingDetails.adults}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ccc;">Children:</td><td style="padding:8px;border:1px solid #ccc;">${bookingDetails.children}</td></tr>
                    <tr><td style="padding:8px;border:1px solid #ccc;">Selected Date:</td><td style="padding:8px;border:1px solid #ccc;">${new Date(bookingDetails.bookingDate).toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ccc;">Confirmation ID:</td><td style="padding: 8px; border: 1px solid #ccc;">${bookingDetails.bookingId}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ccc;">Booking Date:</td><td style="padding: 8px; border: 1px solid #ccc;">${new Date().toLocaleDateString()}</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">Status:</td><td style="padding: 8px; border: 1px solid #ccc; color: green; font-weight: bold;">CONFIRMED</td></tr>
                </table>
                <p>Kindly remit the full payment to the property owner.</p>
                <p>We look forward to seeing you!</p>
                <p>—The Nestero Team</p>     `
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("✉️ Confirmation Email Sent: %s", info.messageId);

    } catch (error) {
        console.error("Nodemailer Error:", error);
    }
};
