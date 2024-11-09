const mongoose = require('mongoose')

const douongSchema = new mongoose.Schema({
  madouong: { type: String },
  tendouong: { type: String },
  image: { type: String },
  soluong: { type: Number },
  price: { type: Number }
})

const DoUong = mongoose.model('douong', douongSchema)
module.exports = DoUong
