const mongoose = require('mongoose');

//Bace_Name, Small books, Mahabig Books, Big Books, total_books, Amount Paid/Pending, transaction_id object
const TransactionSchema = new mongoose.Schema(
    {
        bace : {
            type: String,
            required: true,
        },
        userId: {
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
        },
        amount: {
            paid:{
                type: Number,
            },
            pending:{
                type: Number,
            }
        },
        transaction_id: {
            type: String,
        },
        timestamp:{
            type: Date,
            default: Date.now
        }
    }
)

module.exports = mongoose.model('TransactionRecord', TransactionSchema)