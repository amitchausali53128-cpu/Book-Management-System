const express = require('express');
const router = express.Router();
const AdminBook = require('../models/AdminSchema');
const Transaction = require('../models/TransactionSchema');
const BaceBook = require('../models/BaceSchema');


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

router.get('/get-details', async (req, res) => {
    try {
        const adminBooks = await AdminBook.find().sort({ createdAt: -1 });
        if (adminBooks.length === 0) {
            return res.status(404).json({ message: 'No book records found' });
        }
        res.status(200).json(adminBooks[0]);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
});


router.post('/transfer', async (req, res) => {
    try {
        const {name, small_books, big_books, mahabig_books, amount } = req.body;


        const small = Number(small_books);
        const big = Number(big_books);
        const mahabig = Number(mahabig_books);

        // Calculate total books
        const total_books = small + big + mahabig;

        const bace = await BaceBook.findOne({name});

        if(!bace){
            return res.status(404).json({ message: 'Bace record not found' });
        }

        bace.small_books += small;
        bace.big_books += big;
        bace.mahabig_books += mahabig;
        bace.total_books += total_books;

        await bace.save();

        await AdminBook.findOneAndUpdate(
  {},
  {
    $inc: {
      small_books: -small,
      big_books: -big,
      mahabig_books: -mahabig,
      total_books : -total_books
    }
  },
  { new: true, upsert: true }
);

        // Create a new AdminBook document
       const transaction = new Transaction({
            bace: name,
            small_books,
            big_books,
            mahabig_books,
            total_books,
            amount: {
                paid: 0,
                pending: amount
            }
       })

        // Save the document to the database
        await transaction.save();

        res.status(200).json({ message: 'Books transferred successfully', transaction });
    } catch (error) {
        console.error('Error transferring books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;