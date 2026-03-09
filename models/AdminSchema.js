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
  },
  total_books:{
    type: Number,
  }
})

module.exports = mongoose.model('AdminBook', AdminSchema)