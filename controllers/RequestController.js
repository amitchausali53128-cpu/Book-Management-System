const {Request, Sent} = require('../models/RequestSchema');
const Cart = require('../models/CartSchema');
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { bace, books, note } = req.body;
        const request = new Request({ bace, books, note });
        await request.save();

        const cart = await Cart.findOne({ bace });
        if (cart) {
            cart.books = [];
            await cart.save();
        }


        res.status(201).json({ message: 'Request created successfully', request , success:true});
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/all',
    //  verifyToken, authorize(['admin']),
      async (req, res) => {
    try {
        const requests = await Request.find();
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:bace', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { bace } = req.params;
        const requests = await Request.find({ bace });
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/get-request/:id', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Request.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json(request);
    } catch (error) {
        console.error('Error fetching request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete/:id', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { id } = req.params;
        const request = await Request.findByIdAndDelete(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request deleted successfully', success:true });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/update/:id', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { id } = req.params;
        const { bace, books, note } = req.body;
        const request = await Request.findByIdAndUpdate(id, { bace, books, note }, { new: true });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.status(200).json({ message: 'Request updated successfully', request , success:true});
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;