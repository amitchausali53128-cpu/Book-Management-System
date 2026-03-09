const mongoose = require('mongoose');


//Bace_Name , Small books, Mahabig Books, Big Books, total_books
const BaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    small_books: {
        type: Number,
    },
    big_books: {
        type: Number,
    },
    mahabig_books: {
        type: Number,
    },
    total_books: {
        type: Number,
    }
})


module.exports = mongoose.model('BaceBook', BaceSchema)