const { Sent } = require('../models/RequestSchema');
const AllBooks = require('../models/AllBooksSchema');
const BaceBook = require('../models/BaceSchema');
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.post('/create', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { bace, books, note } = req.body;

        if (!bace || !Array.isArray(books) || books.length === 0) {
            return res.status(400).json({ message: 'Bace and books are required' });
        }

        const stockDelta = books.reduce(
            (accumulator, book) => {
                const quantity = Number(book.quantity) || 0;

                if (book.type === 'small') {
                    accumulator.small_books += quantity;
                } else if (book.type === 'big') {
                    accumulator.big_books += quantity;
                } else if (book.type === 'mahabig') {
                    accumulator.mahabig_books += quantity;
                }

                accumulator.total_books += quantity;
                return accumulator;
            },
            { small_books: 0, big_books: 0, mahabig_books: 0, total_books: 0 }
        );

        const baceStock = await BaceBook.findOne({ name: bace });
        if (!baceStock) {
            return res.status(404).json({ message: 'Bace record not found' });
        }

        for (const book of books) {
            const quantity = Number(book.quantity) || 0;

            if (quantity <= 0) {
                return res.status(400).json({ message: 'Book quantity must be greater than zero' });
            }

            const availableBook = await AllBooks.findOne({
                book_name: book.book_name,
                lang: book.lang,
                type: book.type,
            });

            if (!availableBook) {
                return res.status(404).json({
                    message: `Book not found in all books: ${book.book_name}`,
                });
            }

            if ((availableBook.quantity || 0) < quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${book.book_name}`,
                });
            }
        }

        for (const book of books) {
            const quantity = Number(book.quantity) || 0;

            await AllBooks.findOneAndUpdate(
                {
                    book_name: book.book_name,
                    lang: book.lang,
                    type: book.type,
                },
                {
                    $inc: { quantity: -quantity },
                }
            );
        }

        baceStock.small_books = (baceStock.small_books || 0) + stockDelta.small_books;
        baceStock.big_books = (baceStock.big_books || 0) + stockDelta.big_books;
        baceStock.mahabig_books = (baceStock.mahabig_books || 0) + stockDelta.mahabig_books;
        baceStock.total_books = (baceStock.small_books || 0) + (baceStock.big_books || 0) + (baceStock.mahabig_books || 0);

        await baceStock.save();

        const totalAmount = books.reduce(
            (sum, book) => sum + (Number(book.price) || 0) * (Number(book.quantity) || 0),
            0
        );

        const sent = new Sent({
            bace,
            books,
            note,
            amount: {
                paid: 0,
                pending: totalAmount,
            },
        });
        await sent.save();
        res.status(201).json({ message: 'Sent created successfully', sent , success:true});
    } catch (error) {
        console.error('Error creating sent:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/all', verifyToken, authorize(['admin']), async (req, res) => {
    try {
        const sents = await Sent.find();
        res.status(200).json(sents);
    } catch (error) {
        console.error('Error fetching sents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:bace', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { bace } = req.params;
        const sents = await Sent.find({ bace });
        res.status(200).json(sents);
    } catch (error) {
        console.error('Error fetching sents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/pay', verifyToken, authorize(['admin','bace']), async (req, res) => {
    try {
        const { id, bace, paid, pending, transaction_id } = req.body;

        const sent = await Sent.findById(id);
        if (!sent) {
            return res.status(404).json({ message: 'Sent not found' });
        }

        const nextPaid = Number(paid);
        const nextPending = Number(pending);

        if (!Number.isFinite(nextPaid) || !Number.isFinite(nextPending)) {
            return res.status(400).json({ message: 'Paid and pending amounts are required' });
        }

        if (!sent.amount) {
            const totalAmount = (sent.books || []).reduce(
                (sum, book) => sum + (Number(book.price) || 0) * (Number(book.quantity) || 0),
                0
            );
            sent.amount = {
                paid: 0,
                pending: totalAmount,
            };
        }

        const booksTotal = (sent.books || []).reduce(
            (sum, book) => sum + (Number(book.price) || 0) * (Number(book.quantity) || 0),
            0
        );
        const storedTotal = (sent.amount?.paid || 0) + (sent.amount?.pending || 0);
        const currentTotal = storedTotal > 0 ? storedTotal : booksTotal;

        if (currentTotal <= 0) {
            return res.status(400).json({ message: 'Unable to determine total amount for this record' });
        }

        if (currentTotal !== nextPaid + nextPending) {
            return res.status(400).json({
                message: `Total amount should be ${currentTotal}, you have currently paid:${nextPaid} and pending:${nextPending}`,
            });
        }

        const update = {
            bace: bace || sent.bace,
            amount: {
                paid: nextPaid,
                pending: nextPending,
            },
        };

        if (typeof transaction_id === 'string' && transaction_id.trim()) {
            update.transaction_id = transaction_id.trim();
        }

        const updatedSent = await Sent.findByIdAndUpdate(
            id,
            { $set: update },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Sent updated successfully', sent: updatedSent });
    } catch (error) {
        console.error('Error updating sent:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;

