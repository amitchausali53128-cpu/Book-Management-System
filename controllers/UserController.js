const router = require('express').Router();
const crypto = require('crypto');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, linkEmailSchema } = require('../models/auth-validator');
const User = require('../models/UserSchema');
const BaceBook = require('../models/BaceSchema');
const Cart = require('../models/CartSchema');
const bcrypt = require('bcrypt');
const validate = require('../middleware/validate-middleware');
const { sendPasswordResetEmail } = require('../utils/mailer');

router.get('/all', async (req, res) => {
    try {
        const users = await User.find({}, 'name role createdAt');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/register', validate(registerSchema) ,async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this name already exists' });
        }

        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        if(role === 'bace'){
            const existingBace = await BaceBook.findOne({ name });
                if (existingBace) {
                    return res.status(400).json({ message: 'Bace with this name already exists' });
                }
                const bace = new BaceBook({ name, password, small_books: 0, big_books: 0, mahabig_books: 0, total_books: 0 });
                
                const cart = new Cart({ bace: name, books: [] });
                await bace.save();
                await cart.save();
        }

        res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name, role: user.role }, token: await user.generateToken(), success: true });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', validate(loginSchema) ,async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // In production, use bcrypt to compare hashed passwords
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role }, token: await user.generateToken() ,success: true });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(200).json({
                message: 'If an account exists for that email, a reset link has been sent.',
                success: true,
            });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save();

        const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendBaseUrl}/forgot-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(normalizedEmail)}`;

        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
        });

        res.status(200).json({
            message: 'If an account exists for that email, a reset link has been sent.',
            success: true,
        });
    } catch (error) {
        console.error('Error generating password reset token:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/link-email', validate(linkEmailSchema), async (req, res) => {
    try {
        const { name, password, email } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await User.findOne({ name });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (existingEmail) {
            return res.status(400).json({ message: 'This email is already linked to another account' });
        }

        user.email = normalizedEmail;
        await user.save();

        res.status(200).json({
            message: 'Email linked successfully. You can now request a reset link by email.',
            success: true,
        });
    } catch (error) {
        console.error('Error linking email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
    try {
        const { resetToken, password } = req.body;
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({
            message: 'Password updated successfully',
            success: true,
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;