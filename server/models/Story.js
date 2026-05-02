const { Schema, model } = require('mongoose');

const StorySchema = new Schema({
  _id:      { type: String },
  titleAr:  { type: String, required: true },
  titleEn:  { type: String, default: '' },
  img:      { type: String, default: '' },
  duration: { type: Number, default: 5000 },
  createdAt:{ type: Number, default: Date.now },
}, { _id: false });

StorySchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; return ret; }
});

module.exports = model('Story', StorySchema);
