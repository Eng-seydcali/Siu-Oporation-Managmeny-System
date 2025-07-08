import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import budgetRoutes from './routes/budgets.js';
import requestRoutes from './routes/requests.js';
import emergencyRoutes from './routes/emergencies.js';
import academicYearRoutes from './routes/academicYears.js';
import reportRoutes from './routes/reports.js';
import departmentRoutes from './routes/departments.js';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Trust proxy for deployment platforms
app.set('trust proxy', 1);

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://siu-oporation-managmeny-system.vercel.app',
      'https://siu-operation-managmeny-system.vercel.app',
      'https://siu-oporation-managmeny-system.onrender.com',
      // Add your actual frontend domain here
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // For now, allow all origins to fix CORS issues
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'x-auth-token',
    'Origin',
    'X-Requested-With',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['x-auth-token'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, Origin, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory if it exists
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb+srv://milgo:2366@cluster0.u8hg6b7.mongodb.net/Opms?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
   
      bufferCommands: false, // Disable mongoose buffering
    });
    
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // Don't exit the process, let it retry
    setTimeout(connectDB, 5000);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Connect to MongoDB
connectDB();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);


// STATIC REACT BUILD
const buildPath = path.join(__dirname, '../client/build')
app.use(express.static(buildPath))

// ✅ CATCH-ALL REACT ROUTE (IMPORTANT)
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'))
})


// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SIU Operation Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'SIU Operation Management System API',
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/budgets',
      '/api/requests',
      '/api/emergencies',
      '/api/academic-years',
      '/api/reports',
      '/api/departments'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ msg: 'Validation Error', errors });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ msg: `${field} already exists` });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token expired' });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    msg: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

export default app;