const router = require('express').Router();
const Cart = require('../models/CartSchema');
const { verifyToken, authorize } = require('../middleware/authMiddleware');

router.post('/add', verifyToken, authorize(['admin','bace']), async (req, res) => {


    try {
      const { books, bace } = req.body;
      // console.table(books)
      if (!Array.isArray(books) || books.length === 0) {
        return res.status(400).json({ message: 'books must be a non-empty array' });
      }

      // First, try to increment quantity for existing books (matching book_name and lang)
      for (const item of books) {
        const updateResult = await Cart.updateOne(
          {
            bace: req.body.bace,
            "books.book_name": item.book_name,
            "books.lang": item.lang
          },
          {
            $inc: { "books.$.quantity": item.quantity }
          }
        );
        if (updateResult.matchedCount === 0) {
          // Book with this name and lang not found, so push as new
          await Cart.updateOne(
            { bace: bace },
            {
              $push: {
                books: {
                  book_name: item.book_name,
                  type: item.type,
                  lang: item.lang,
                  quantity: item.quantity,
                  price: item.price
                }
              }
            },
            { upsert: true }
          );
        }
      }

      res.status(200).json({ message: 'Books added to cart successfully', success: true });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Internal server error' });
    }

});

router.get('/:bace',
   verifyToken, authorize(['bace']),
    async (req, res) => {
    try{
        const { bace } = req.params;
        const cart = await Cart.findOne({ bace });

        if(!cart){
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    }
    catch(error){
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/update', verifyToken, authorize(['bace']), async (req, res) => {

  try{
    const { books } = req.body;
    if (!Array.isArray(books) || books.length === 0) {
      return res.status(400).json({ message: 'books must be a non-empty array' });
    }

    for (const item of books) {
      await Cart.updateOne(
        {
          bace: req.body.bace,
          "books._id": item._id
        },
        {
          $set: { "books.$.quantity": item.quantity }
        }
      );
    }

    res.status(200).json({ message: 'Cart updated successfully', success: true });
  }
  catch(e){
    console.error('Error updating cart:', e);
    res.status(500).json({ message: 'Internal server error'});
  }


}
)

router.delete('/remove', verifyToken, authorize(['bace']), async (req, res) => {

    try {
        const { bace, id } = req.body;

        const updatedCart = await Cart.findOneAndUpdate(
            { bace },
            { $pull: { books: { _id: id } } },
            { new: true }
        );

        if (!updatedCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error removing book from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;