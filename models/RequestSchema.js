const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const model = mongoose.model;

const bookSchema = new Schema(
    {
        book_name:{
            type: String,
            required: true,
        },
        quantity:{
            type: Number,
            required: true,
        },
        price:{
            type: Number,
            required: true,
        },
        lang :{
            type: String,
            enum: ['eng', 'hin', 'ben'],
            required: true,
        },
        type:{
            type: String,
            enum: ['small', 'big', 'mahabig'],
            required: true,
        }
    }
)

const RequestSchema = new Schema({
    bace: {
        type: String,
        required: true,
    },
    books: {
        type: [bookSchema],
        required: true,
    },
    note:{
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SentSchema = new Schema(

{
    bace: {
        type: String,
        required: true,
    },
    books: {
        type: [bookSchema],
        required: true,
    },
    note:{
        type: String,
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
                unique: true,
                default: function() {
                    return 'admin-' + new mongoose.Types.ObjectId().toString();
                }
            },
    timestamp: {
        type: Date,
        default: Date.now
    },
    
}
)

module.exports = {
   Request : model('Request',RequestSchema),
    Sent : model('Sent',SentSchema)
};