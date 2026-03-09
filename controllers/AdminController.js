const express = require('express');
const router = express.Router();
const AdminBook = require('../models/AdminSchema');


router.post('/update-books', async (req, res) => {
    try {
        const { small_books, big_books, mahabig_books } = req.body;

        // Calculate total books
        const total_books = small_books + big_books + mahabig_books;

        // Create a new AdminBook document
        const adminBook = new AdminBook({
            small_books,
            big_books,
            mahabig_books,
            total_books
        });

        // Save the document to the database
        await adminBook.save();

        res.status(200).json({ message: 'Books updated successfully', adminBook });
    } catch (error) {
        console.error('Error updating books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}); 


module.exports = router;