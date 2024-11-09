const mongoose = require('mongoose')

const dothueSchema = new mongoose.Schema({
  madothue: { type: String },
  tendothue: { type: String },
  image:{type:String},
  soluong:{type:Number},
  price:{type:Number},
})

const DoThue = mongoose.model('dothue', dothueSchema)
module.exports = DoThue
