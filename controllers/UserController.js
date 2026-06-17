const router = require('express').Router();
const { registerSchema, loginSchema } = require('../models/auth-validator');
const User = require('../models/UserSchema');
const BaceBook = require('../models/BaceSchema');
const Cart = require('../models/CartSchema');
const bcrypt = require('bcrypt');
const validate = require('../middleware/validate-middleware');

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
        const { name, password, role } = req.body;

        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this name already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, password: hashedPassword, role });
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

module.exports = router;