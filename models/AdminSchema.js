const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BookSchema = new Schema(
  {
    book_name : {
      type: String,
      required: true
    },
    quantity : {
      type: Number,
      required: true
    },
    type : {
      type: String,
      enum: ['small', 'big', 'mahabig'],
      required: true
    },
    price : {
      type: Number,
      required: true
    }
  }
)

//Small books, Mahabig Books, Big Books, total_books
const AdminSchema = new Schema({
  small_books:{
    type: Number,
  },
  big_books:{
    type: Number,
  },
  mahabig_books:{
    type: Number,
  },
  bengali : [BookSchema],
  english : [BookSchema],
  hindi : [BookSchema]
},

{
  toJSON: { virtuals: true },
  toObject: { virtuals: true}
})

AdminSchema.virtual('total_books').get(function() {
  return this.small_books + this.big_books + this.mahabig_books;
});

module.exports = mongoose.model('AdminBook', AdminSchema)