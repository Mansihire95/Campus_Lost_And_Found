const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
      required: [true, 'Item type is required'],
    },
    title: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'ID Card',
        'Electronics',
        'Wallet',
        'Bag',
        'Books',
        'Keys',
        'Documents',
        'Clothing',
        'Accessories',
        'Other',
      ],
      required: [true, 'Category is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    additionalDetails: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // stores relative path like /uploads/filename.jpg
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED'],
      default: 'ACTIVE',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
