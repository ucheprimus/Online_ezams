// models/QuizAttempt.js - FIXED VERSION
const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  answers: [{
    questionIndex: {
      type: Number,
      required: true
    },
    selectedOption: {
      type: String, // For multiple choice: "0", "1", "2", "3"
      default: ''
    },
    textAnswer: {
      type: String, // For theory/text questions
      default: ''
    },
    isCorrect: {
      type: Boolean,
      required: true
    },
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
});

// Add index for faster queries
quizAttemptSchema.index({ studentId: 1, quizId: 1 });
quizAttemptSchema.index({ quizId: 1, studentId: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);