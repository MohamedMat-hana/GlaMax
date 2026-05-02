/**
 * connection.js — Mongoose connection to MongoDB Atlas.
 * Call connectDB() once in index.js before starting the server.
 */

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set in .env');

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}

module.exports = { connectDB };
