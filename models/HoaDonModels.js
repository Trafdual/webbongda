const mongoose = require('mongoose')

const hoadonSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  mahd: { type: String },
  giasan:{ type: Number },
  tiencoc:{ type: Number },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'booking' },
  dothue: [
    {
      iddothue: { type: mongoose.Schema.Types.ObjectId, ref: 'dothue' },
      soluong: { type: Number },
      tien: { type: Number }
    }
  ],
  douong: [
    {
      iddouong: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'douong'
      },
      soluong: { type: Number },
      tien: { type: Number }
    }
  ],
  tongtien: { type: Number },
  date: { type: Date },
  thanhtoan: { type: Boolean, default: false }
})

const Hoadon = mongoose.model('hoadon', hoadonSchema)
module.exports = Hoadon
