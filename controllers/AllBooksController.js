const router = require('express').Router();
const AllBooks = require('../models/AllBooksSchema');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.get('/all', async (req, res) => {

    try{
        const books = await AllBooks.find();
        res.status(200).json(books);
    }
    catch(error){
        console.error('Error fetching books:', error);
        res.status(500).json({ message: 'Internal server error' });
    }

});

router.post('/add',verifyToken, authorize(['admin']), async (req, res) => {
try{
    const {book_name, type, lang, price} = req.body;
    const newBook = new AllBooks({book_name, type, lang, price});
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook , success: true});

}catch(error){
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Internal server error' });
}
});

router.put('/update',verifyToken, authorize(['admin']), async (req, res) => {
try{
    const {id, book_name, type, lang, price, quantity} = req.body;
    const updatedBook = await AllBooks.findByIdAndUpdate(id, {book_name, type, lang, price, quantity}, {new: true});
    if(!updatedBook){
        return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book updated successfully', book: updatedBook, success: true });

}catch(error){
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Internal server error' });
}
});

router.delete('/delete',verifyToken, authorize(['admin']), async (req, res) => {
try{
    const {ids} = req.body;
    
    const deletedBooks = await AllBooks.deleteMany({_id: { $in: ids }});

    if(!deletedBooks){
        return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully', success: true });

}catch(error){
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Internal server error' });
}
});

module.exports = router;