const express = require('express');
const router = express.Router();
const BaceBook = require('../models/BaceSchema');
// ...existing code...
router.post('/register', async (req, res) => {
    try {
        const { name } = req.body;
        const existingBace = await BaceBook.findOne({ name });
        if (existingBace) {
            return res.status(400).json({ message: 'Bace with this name already exists' });
        }
        const bace = new BaceBook({ name, small_books: 0, big_books: 0, mahabig_books: 0, total_books: 0 });
        await bace.save();
        res.status(201).json({ message: 'Bace registered successfully', bace });
    } catch (error) {
        console.error('Error registering bace:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/update-books', async (req, res) => {
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

router.get('/get-details/:name', async (req, res) => {
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

router.get('/all', async (req, res) => {
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

router.delete('/delete', async (req, res) => {
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

module.exports = router;