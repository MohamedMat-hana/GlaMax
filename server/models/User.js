const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name:  { type: String, required: true },
  email: { type: String, lowercase: true, default: '' },
  since: { type: Number, default: Date.now },
});

module.exports = model('User', UserSchema);
