// models/Emergency.js
import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  emergencyId: {
    type: String,
    unique: true // ⚠️ Maaha in required laga dhigo sababtoo ah pre-save ayaa abuuraya
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  mediaFile: {
    data: Buffer,
    contentType: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate emergencyId before saving
EmergencySchema.pre('save', async function (next) {
  if (!this.emergencyId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.emergencyId = `EMR-${year}${month}-${random}`;
  }
  next();
});

const Emergency = mongoose.model('Emergency', EmergencySchema);

export default Emergency;
