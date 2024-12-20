const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['guest', 'registered_user', 'admin'],
    default: 'registered_user',
  },
});

module.exports = mongoose.model('User', userSchema);
