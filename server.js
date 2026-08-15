const port = process.env.PORT || 4000
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const adminRoutes = require('./controllers/AdminController')
const transactionRoutes = require('./controllers/TransactionController')
const baceRoutes = require('./controllers/BaceController')
const userRoutes = require('./controllers/UserController')
const cartRoutes = require('./controllers/CartController')
const requestRoutes = require('./controllers/RequestController')
const sentRoutes = require('./controllers/SentController')
const cors = require('cors')
const allBooksRoutes = require('./controllers/AllBooksController')

app.use(cors(
  {
    origin: ['http://localhost:5173', 'https://bookdistribution.vercel.app'],
  }
))

app.use(express.json())

const BaceBook = require('./models/BaceSchema')
require('dotenv').config()


mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB')
})
.then(async()=>{
  await BaceBook.syncIndexes()
  console.log('Indexes synchronized')
})
.catch((err) => {
  console.log('Error connecting to MongoDB', err)
})


app.get('/', (req, res) => {
  res.send('Hare Krsna!')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
app.use('/admin', adminRoutes)
app.use('/transactions', transactionRoutes)
app.use('/bace', baceRoutes)
app.use('/user', userRoutes)
app.use('/cart', cartRoutes)
app.use('/books',allBooksRoutes)
app.use('/request', requestRoutes)
app.use('/sent', sentRoutes)