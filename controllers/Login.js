const jwt = require('jsonwebtoken');
const router = require('express').Router();
const User = require('../models/UserSchema');

router.post('/login', async (req, res) => {
    const { name, password } = req.body;

    const user = await User.findOne({ name });    

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        if (password !== process.env.PASS) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    });


module.exports = router;