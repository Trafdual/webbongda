const mongoose = require('mongoose')

const loaisanSchema = new mongoose.Schema({
 maloaisan:{type:String},
 tenloaisan:{type:String},
 sanbong:[{type:mongoose.Types.ObjectId,ref:'sanbong'}],
})

const LoaiSan = mongoose.model('loaisan', loaisanSchema)
module.exports = LoaiSan
