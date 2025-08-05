const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for better search performance
postSchema.index({ title: 'text', description: 'text' });
postSchema.index({ slug: 1 });
postSchema.index({ published: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);