const mongoose = require('mongoose')

const Schema = mongoose.Schema

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
  }
},
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true}
})

AdminSchema.virtual('total_books').get(function() {
  return this.small_books + this.big_books + this.mahabig_books;
});

module.exports = mongoose.model('AdminBook', AdminSchema)