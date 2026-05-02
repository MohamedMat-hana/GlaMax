require('dotenv').config();

const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const { connectDB } = require('./db/connection');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/products',      require('./routes/products'));
app.use('/api/stories',       require('./routes/stories'));
app.use('/api/comments',      require('./routes/comments'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/upload',        require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/story-replies', require('./routes/storyReplies'));
app.use('/api/chats',         require('./routes/chats'));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✨ Glamax CRS running on port ${PORT}`));
}).catch(err => {
  console.error('❌ DB connection failed:', err.message);
  process.exit(1);
});
