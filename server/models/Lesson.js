// server/models/Lesson.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  videoType: {
    type: String,
    enum: ['youtube', 'upload'],
    default: 'youtube'
  },
  videoId: String,
  videoUrl: String,
  duration: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: String,
  sectionTitle: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);