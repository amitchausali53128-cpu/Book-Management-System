const nodemailer = require('nodemailer');
const dns = require('dns').promises;
const net = require('net');

// Resolve hostname to IPv4 address explicitly
async function resolveToIPv4(hostname) {
    try {
        const addresses = await dns.resolve4(hostname);
        if (addresses.length === 0) {
            throw new Error('No IPv4 addresses found');
        }
        console.log(`[DNS] Resolved ${hostname} to IPv4: ${addresses[0]}`);
        return addresses[0];
    } catch (error) {
        console.error(`[DNS] Failed to resolve ${hostname}:`, error.message);
        throw new Error(`DNS resolution failed for ${hostname}`);
    }
}

const createTransporter = async () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    console.log('[SMTP Config Debug]', {
        host: host || '❌ MISSING',
        port,
        secure,
        user: user ? `${user.substring(0, 5)}...` : '❌ MISSING',
        pass: pass ? '✓ SET' : '❌ MISSING',
    });

    if (!host || !user || !pass) {
        const missing = [];
        if (!host) missing.push('SMTP_HOST');
        if (!user) missing.push('SMTP_USER');
        if (!pass) missing.push('SMTP_PASS');
        throw new Error(`SMTP configuration missing: ${missing.join(', ')}`);
    }

    // Resolve hostname to IPv4 on Render
    const resolvedHost = await resolveToIPv4(host);

    return nodemailer.createTransport({
        host: resolvedHost,  // Use resolved IPv4 address
        port,
        secure,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    });
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;
    
    try {
        // createTransporter is now async - wait for it to resolve IPv4
        const transporter = await createTransporter();

        // Verify connection before attempting to send
        try {
            await transporter.verify();
            console.log('[Mailer] ✓ SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('[Mailer] ❌ SMTP connection failed:', {
                message: verifyError.message,
                code: verifyError.code,
                errno: verifyError.errno,
                syscall: verifyError.syscall,
                address: verifyError.address,
                port: verifyError.port,
            });
            throw new Error(`Email service connection failed: ${verifyError.message}`);
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
        console.log(`[Mailer] ✓ Password reset email sent to ${to}`);
    } catch (error) {
        console.error('[Mailer] Error sending password reset email:', error.message);
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail,
};
