const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
 loaisanbong:{type:mongoose.Schema.Types.ObjectId,ref:'loaisan'},
 ca:[{type:mongoose.Schema.Types.ObjectId,ref:'ca'}],
 ngayda:{type:Date},
 ngaydat:{type:Date},
 tiencoc:{type:Number},
 coc:{type:Boolean,default: false},
 checkin:{type:Boolean,default: false},
 thanhtoan:{type:Boolean,default: false},
 soluongsan:{type:Number}
})

const Booking = mongoose.model('booking', bookingSchema
)
module.exports = Booking
