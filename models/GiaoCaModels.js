const mongoose = require('mongoose')

const giaocaSchema = new mongoose.Schema({
 nvhientai:{type:mongoose.Types.ObjectId, ref :'user'},
 nvtuonglai:{type:mongoose.Types.ObjectId, ref :'user'},
 timenhanca:{type:Date},
 timegiaoca:{type:Date},
 tienbandau:{type:Number},
 hoadonthanhtoan:{type:Number},
 hoadonchuathanhtoan:{type:Number},
 tienphatsinh:{type:Number},
 tongtientttienmat:{type:Number},
 tongtienttchuyenkhoan:{type:Number},
 nhanca:{type:Boolean,default:false}
})

const GiaoCa = mongoose.model('giaoca', giaocaSchema)
module.exports = GiaoCa
