const mongoose = require('mongoose')

const caSchema = new mongoose.Schema({
  tenca:{type:String},
  giaca:{type:Number},
  begintime:{type:Date},
  endtime:{type:Date},
  trangthai:{type:String}
})

const Ca = mongoose.model('ca', caSchema)
module.exports = Ca
