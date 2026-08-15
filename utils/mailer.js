const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 DNS resolution globally for this process
dns.setDefaultResultOrder('ipv4first');

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = port === 465; // Auto-detect: 465 = secure, 587 = not secure
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

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
        // Force IPv4 on Render - critical for avoiding IPv6 issues
        connectionUrl: `smtp${secure ? 's' : ''}://${user}:${pass}@${host}:${port}/?family=4`,
        pool: {
            maxConnections: 1,
            maxMessages: 5,
            rateDelta: 20000,
            rateLimit: 5,
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
    // Keep a single instance per request or move outside to prevent connection leaks
    const transporter = createTransporter();
    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER;

    // Verify connection before attempting to send (Helps surface specific Render connection errors)
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
};

module.exports = {
    sendPasswordResetEmail,
};
