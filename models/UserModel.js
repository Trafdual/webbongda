const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  success:{type:Boolean,enum:[true], default:true},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user','nhomdich'], default: 'user' },
  payment:[{ type: mongoose.Schema.Types.ObjectId, ref: 'payment' }],
  coin:Number
});

const User = mongoose.model('user', userSchema);
module.exports = User;