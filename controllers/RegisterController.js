const {body, validationResult} = require('express-validator');
const User = require('../models/UserSchema');
const router = require('express').Router();
// ...existing code...
router.post('/register', 
    [
        body('name').notEmpty().withMessage('Name is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, password } = req.body;

            const existingUser = await User.findOne({ name });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this name already exists' });
            }

            if(password !== process.env.PASS){
                return res.status(400).json({ message: 'Invalid password' });
            }
            const user = new User({ name });
            await user.save();

            res.status(201).json({ message: 'User registered successfully', user: { id: user._id, name: user.name } });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
);

module.exports = router;