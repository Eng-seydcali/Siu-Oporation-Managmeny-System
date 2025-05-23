import mongoose from 'mongoose';

const RequestItemSchema = new mongoose.Schema({
  budgetItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget.items',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
});

const RequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    unique: true // ✅ `required` laga saaray si uu u auto-generate-gareeyo
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [RequestItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'partially_approved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Auto-generate requestId haddii uusan horey u jirin
RequestSchema.pre('save', async function(next) {
  if (!this.requestId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    this.requestId = `REQ-${year}${month}-${random}`;
  }
  next();
});

const Request = mongoose.model('Request', RequestSchema);

export default Request;
