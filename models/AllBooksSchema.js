const mongoose = require('mongoose');

const AllBooksSchema = new mongoose.Schema({
    book_name:{
        type: String,
        required: true
    },
    lang:{
        type: String,
        enum: ['hin', 'eng', 'ben'],
        required: true
    },
    type: {
        type: String,
        enum: ['small', 'big', 'mahabig'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('AllBooks', AllBooksSchema);