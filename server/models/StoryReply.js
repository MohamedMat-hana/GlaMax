const { Schema, model } = require('mongoose');

const StoryReplySchema = new Schema({
  storyId:      String,
  storyTitleAr: String,
  storyTitleEn: String,
  storyImg:     String,
  senderName:   String,
  message:      String,
  ts:           { type: Number, default: Date.now },
  read:         { type: Boolean, default: false },
}, { timestamps: true });

StoryReplySchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id.toString(); return ret; }
});

module.exports = model('StoryReply', StoryReplySchema);
