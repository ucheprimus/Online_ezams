// server/models/Course.js
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
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Design', 'Business', 'Marketing', 'Other']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x225?text=Course+Thumbnail'
  },
  duration: {
    type: Number, // in hours
    default: 0
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Future: Add lessons/modules array reference
  // lessons: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Lesson'
  // }]
}, {
  timestamps: true
});

// Index for search optimization
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });

// Virtual for student count
courseSchema.virtual('studentCount').get(function() {
  return this.enrolledStudents.length;
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);