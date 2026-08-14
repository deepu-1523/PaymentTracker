import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    reminderDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['7_days_before', '3_days_before', '1_day_before', 'on_due_date', 'overdue_repeat', 'manual'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'cancelled'],
      default: 'scheduled',
    },
    message: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Reminder = mongoose.model('Reminder', reminderSchema);
