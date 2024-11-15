const mongoose = require('mongoose')

const lichsuSchema = new mongoose.Schema({
 maGD:{type:String},
 hovaten:{type:String},
 sodienthoai:{type:String},
 method:{type:String},
 ngaygio:{type:Date},
 noiDung:{type:String},
 tongtien:{type:Number}
})

const LichSu = mongoose.model('lichsu', lichsuSchema
)
module.exports = LichSu

