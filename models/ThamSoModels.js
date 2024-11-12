const mongoose = require('mongoose')

const thamsoSchema = new mongoose.Schema({
  maCode: { type: String },
  chucnang: { type: String },
  type: { type: String },
  giatri: { type: Number },
  ghichu: { type: String }
})

const ThamSo = mongoose.model('thamso', thamsoSchema)
module.exports = ThamSo
