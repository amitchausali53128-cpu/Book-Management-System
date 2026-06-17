const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    book_name:{
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['small', 'big', 'mahabig'],
        required: true
    },
    lang:{
        type: String,
        enum: ['hin', 'eng', 'ben'],
        required: true
    },
    price: {
        type: Number,
        required: true
    }
    
});

const CartSchema = new mongoose.Schema({
    bace:{
        type: String,
        required: true
    },
    books: [BookSchema]
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

CartSchema.virtual('total_price').get(function() {
    return this.books.reduce((total, book) => total + book.price * book.quantity, 0);
});

module.exports = mongoose.model('Cart', CartSchema)