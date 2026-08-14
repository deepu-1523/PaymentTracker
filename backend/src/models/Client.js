import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientRefId: {
      type: String,
      trim: true,
      default: '',
    },
    name: {
      type: String,
      required: [true, 'Client/Person name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total agreed amount is required'],
      min: [0, 'Total amount must be greater than or equal to 0'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    notes: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    ledgerType: {
      type: String,
      enum: ['RECEIVABLE', 'PAYABLE'],
      default: 'RECEIVABLE', // RECEIVABLE: Borrowed from me (They owe me); PAYABLE: I borrowed (I owe them)
    },
  },
  { timestamps: true }
);

// Compound index for querying user's active clients efficiently
clientSchema.index({ userId: 1, isArchived: 1, dueDate: 1 });

export const Client = mongoose.model('Client', clientSchema);
