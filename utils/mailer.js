require('dotenv').config();

const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is required to send password reset emails');
}

const resend = new Resend(resendApiKey);

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const fromAddress = process.env.MAIL_FROM || 'onboarding@resend.dev';

    try {
        const response = await resend.emails.send({
            from: fromAddress,
            to: to,
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
        });

        if (response.error) {
            throw new Error(`Resend API error: ${response.error.message}`);
        }

        console.log(`[Mailer] ✓ Email sent via Resend to ${to}. Message ID: ${response.data.id}`);
    } catch (error) {
        console.error('[Mailer] Error sending password reset email:', error.message);
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail,
};
