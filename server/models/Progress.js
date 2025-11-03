const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  completedLessons: [{
    lessonId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    }, // Reference to lesson ID (not as ref since it's nested)
    completedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  progressPercentage: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  totalTimeSpent: { 
    type: Number, 
    default: 0 
  } // in minutes
}, { 
  timestamps: true 
});

// Compound index to ensure one progress document per student per course
progressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);