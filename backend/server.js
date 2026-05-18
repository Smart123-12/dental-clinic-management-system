const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const seedDemoData = require('./seeder');

dotenv.config();

const app = express();

// ── CORS ──
const allowedOrigins = [
  'https://starlit-sherbet-cb1415.netlify.app',  // Netlify
  'https://smart123-12.github.io', // GitHub Pages
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

// Allow any Netlify or Vercel preview URLs dynamically
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.railway.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ── Health check ──
app.get('/', (req, res) => {
  res.json({
    message: '🦷 DentalCare API is running!',
    version: '2.0.0',
    endpoints: ['/api/auth', '/api/users', '/api/appointments'],
  });
});

// ── Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/users', require('./routes/users'));

// ── 404 handler ──
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ── Database + Start ──
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dental-clinic';
    
    // Fallback to in-memory db if Atlas is paused or not running locally
    if (mongoUri.includes('dental-clinic.qkozx5b.mongodb.net') || !process.env.MONGO_URI) {
      console.log('🔄 Using in-memory MongoDB for testing (Atlas cluster paused)...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    await seedDemoData();
    
    app.listen(PORT, () => {
      console.log(`🚀 DentalCare API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

startServer();
