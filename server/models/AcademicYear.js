import mongoose from 'mongoose';

const AcademicYearSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AcademicYear = mongoose.model('AcademicYear', AcademicYearSchema);

export default AcademicYear;