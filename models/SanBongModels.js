const mongoose = require('mongoose')

const sanbongSchema = new mongoose.Schema({
  masan: { type: String },
  tensan: { type: String },
  loaisan:{type:mongoose.Types.ObjectId,ref:'loaisan'},
  trangthai: { type: String },
  booking:[{type:mongoose.Types.ObjectId,ref:'booking'}]
})

const SanBong = mongoose.model('sanbong', sanbongSchema)
module.exports = SanBong
