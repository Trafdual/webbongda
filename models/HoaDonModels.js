const mongoose = require('mongoose')

const hoadonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'booking' },
  dothue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'dothue' }],
  douong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'douong' }],
  tongtien:{type:Number},
  date:{type:Date}
})

const Hoadon = mongoose.model('hoadon', hoadonSchema)
module.exports = Hoadon
