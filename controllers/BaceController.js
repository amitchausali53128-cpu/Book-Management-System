const express = require('express');
const router = express.Router();
const BaceBook = require('../models/BaceSchema');
const Transaction = require('../models/TransactionSchema');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const {Sent} = require('../models/RequestSchema');

// ...existing code...
router.post('/register',verifyToken, authorize(['admin','bace']) ,async (req, res) => {
    try {
        const { name, password } = req.body;
        const existingBace = await BaceBook.findOne({ name });
        if (existingBace) {
            return res.status(400).json({ message: 'Bace with this name already exists' });
        }
        const bace = new BaceBook({ name, password, small_books: 0, big_books: 0, mahabig_books: 0, total_books: 0 });
        await bace.save();
        res.status(201).json({ message: 'Bace registered successfully', bace, success:'true' });
    } catch (error) {
        console.error('Error registering bace:', error);
        res.status(500).json({ message: 'Internal server error', success:'false' });
    }
});

router.post('/update-books',verifyToken, authorize(['admin','bace']) , async (req, res) => {
    try {
        const { name, small_books, big_books, mahabig_books } = req.body;
        const total_books = small_books + big_books + mahabig_books;
        const baceBook = await BaceBook.findOne({ name });
        if (!baceBook) {
            return res.status(404).json({ message: 'Bace book not found' });
        }
        baceBook.small_books = small_books;
        baceBook.big_books = big_books;
        baceBook.mahabig_books = mahabig_books;
        baceBook.total_books = total_books;
        await baceBook.save();
        res.status(200).json({ message: 'Books updated successfully', baceBook });
    } catch (error) {
        console.error('Error updating books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/get-details/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const baceBook = await BaceBook.findById(id);
        if (!baceBook) {
            return res.status(404).json({ message: 'No book record found' });
        }
        res.status(200).json(baceBook);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/getbyname/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const baceBook = await BaceBook.findOne({ name });
        if (!baceBook) {
            return res.status(404).json({ message: 'No book record found' });
        }
        res.status(200).json(baceBook);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/all',verifyToken, authorize(['admin','bace']) , async (req, res) => {
    try {
        const baceBooks = await BaceBook.find({}).sort({ createdAt: -1 });
        if (baceBooks.length === 0) {
            return res.status(404).json({ message: 'No book records found' });
        }
        res.status(200).json(baceBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/delete',verifyToken, authorize(['admin','bace']) , async (req, res) => {
    try {
        const { name } = req.body;
        const deletedBaceBook = await BaceBook.findOneAndDelete({ name });
        if (!deletedBaceBook) {
            return res.status(404).json({ message: 'Bace book record not found' });
        }
        res.status(200).json({ message: 'Bace book record deleted successfully' });
    } catch (error) {
        console.error('Error deleting bace book record:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/request',verifyToken, authorize(['bace']) , async (req, res) => {
    try {
        const { name, small_books, big_books, mahabig_books, desc } = req.body;
        const total_books = small_books + big_books + mahabig_books;
        new Transaction({
            bace: name,
            small_books,
            big_books,
            mahabig_books,
            total_books,
            desc,
            amount: {
                paid: 0,
                pending: 0
            },
            transaction_id: 'request-' + new mongoose.Types.ObjectId().toString(),
        }).save();
        res.status(200).json({ message: 'Book request submitted successfully', success: 'true' });
    } catch (error) {
        console.error('Error requesting books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//*********************New endpoint for v2 book request*********************

router.post('/v2/request', verifyToken, authorize(['bace']) , async (req, res) => {
    try {
        const { bace, books, desc } = req.body;

        

    } catch (error) {
        console.error('Error requesting books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/payBill', verifyToken, authorize(['bace']) , async (req, res) => {
    try {
        const { name, amount, transaction_id } = req.body;
        const sent = await Sent.findOne(transaction_id);
        if (!sent) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        else if (amount > sent.amount.pending) {
            return res.status(400).json({ message: 'Amount exceeds pending amount' });
        }
        else if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero' });
        }

        sent.amount.paid += amount;
        sent.amount.pending -= amount;
        await sent.save();
        res.status(200).json({ message: 'Payment recorded successfully', success: 'true' });

    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;