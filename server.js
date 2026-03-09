const port = 4000
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const adminRoutes = require('./controllers/AdminController')

mongoose.connect('mongodb+srv://amitchausali53128_db_user:b50yFicex0EzrHbG@records.zwb9s31.mongodb.net/?appName=Records').then(() => {
  console.log('Connected to MongoDB')
}).catch((err) => {
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