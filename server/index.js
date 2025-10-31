// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

console.log('🔧 Starting server...');

// Route imports with debugging
console.log('🔧 Loading auth routes...');
const authRoutes = require('./routes/auth');

console.log('🔧 Loading profile routes...');
const profileRoutes = require('./routes/profile');

console.log('🔧 Loading course routes...');
const courseRoutes = require('./routes/courses');

const app = express();

// ======================
// 🔐 Middleware
// ======================
app.use(express.json());

// ✅ CORS setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================
// 📦 MongoDB Connection
// ======================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ======================
// 🚏 Routes
// ======================
console.log('🔧 Setting up routes...');
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/courses', courseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Server running smoothly' });
});

// ======================
// 🚀 Server start
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server listening on port ${PORT}`);
  console.log(`📍 Health check:  http://localhost:${PORT}/api/health`);
  console.log(`📍 Profile route: http://localhost:${PORT}/api/profile\n`);
});