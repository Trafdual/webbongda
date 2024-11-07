const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  hovaten:{type:String},
  phone:{type:String},
  email:{type:String},
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user','staff'], default: 'user' },
});

const User = mongoose.model('user', userSchema);
module.exports = User;
