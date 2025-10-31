const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['web-development', 'data-science', 'mobile-development', 'design', 'business', 'music', 'photography', 'health', 'language']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  image: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
courseSchema.index({ instructor: 1, createdAt: -1 });
courseSchema.index({ category: 1, rating: -1 });

module.exports = mongoose.model('Course', courseSchema);