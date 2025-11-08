// models/Quiz.js - ENHANCED VERSION
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple_choice', 'theory'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  // For multiple choice
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Number for MC, String for theory
    required: true
  },
  // For theory questions
  expectedKeywords: [{
    type: String,
    default: []
  }],
  minWords: {
    type: Number,
    default: 0
  },
  maxWords: {
    type: Number,
    default: 1000
  },
  gradingRubric: {
    type: String,
    default: ''
  },
  // Common fields
  points: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String,
    default: ''
  },
  caseSensitive: {
    type: Boolean,
    default: false
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: [questionSchema],
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
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
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30,
    min: 1
  },
  maxAttempts: {
    type: Number,
    default: 3,
    min: 1
  },
  isMandatory: {
    type: Boolean,
    default: true
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);