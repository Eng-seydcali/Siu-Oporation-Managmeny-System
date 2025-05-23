import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import budgetRoutes from './routes/budgets.js';
import requestRoutes from './routes/requests.js';
import emergencyRoutes from './routes/emergencies.js';
import academicYearRoutes from './routes/academicYears.js';
import reportRoutes from './routes/reports.js';
import departmentRoutes from './routes/departments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://siu-oporation-managmeny-system.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))
// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://milgo:2366@cluster0.u8hg6b7.mongodb.net/Opms?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB Connected seccsefully'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/departments', departmentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Siu Oporation Management System  API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});