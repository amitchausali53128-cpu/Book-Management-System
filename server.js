const port = 4000
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const adminRoutes = require('./controllers/AdminController')
const transactionRoutes = require('./controllers/TransactionController')
const baceRoutes = require('./controllers/BaceController')
const cors = require('cors')

app.use(cors())

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
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(express.json())
app.use('/admin', adminRoutes)
app.use('/transactions', transactionRoutes)
app.use('/bace', baceRoutes)