const nodemailer = require('nodemailer');

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

    if (!host || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // 🌟 Add these critical production settings for Render:
        family: 4,               // Forces IPv4 (Render often fails trying to connect over IPv6)
        connectionTimeout: 10000, // 10 seconds timeout limit before dropping the hanging request
        greetingTimeout: 10000,  // Prevents long delays while shaking hands with the mail server
        tls: {
            rejectUnauthorized: false // Bypasses self-signed certificate blocks common on hosting networks
        }
    });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    // Keep a single instance per request or move outside to prevent connection leaks
    const transporter = createTransporter();
    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

    // Verify connection before attempting to send (Helps surface specific Render connection errors)
    try {
        await transporter.verify();
    } catch (verifyError) {
        console.error("Nodemailer transporter connection failed:", verifyError);
        throw new Error("Email service connection failed.");
    }

    await transporter.sendMail({
        from: fromAddress,
        to,
        subject: 'Reset your password',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
                <h2 style="margin: 0 0 16px;">Hare Krishna ${name},</h2>
                <h3>Dandwat Pranams</h3>
                <p style="margin: 0 0 16px;">We received a request to reset your password.</p>
                <p style="margin: 0 0 24px;">Click the link below to choose a new password. This link expires in 15 minutes.</p>
                <p style="margin: 0 0 24px;">
                    <a href="${resetUrl}" style="background: #f59e0b; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 8px; display: inline-block;">Reset Password</a>
                </p>
                <p style="margin: 0 0 8px;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="word-break: break-all; color: #b45309;">${resetUrl}</p>
            </div>
        `,
        text: `Hello ${name},\n\nReset your password using this link: ${resetUrl}\n\nThis link expires in 15 minutes.`,
    });
};

module.exports = {
    sendPasswordResetEmail,
};
