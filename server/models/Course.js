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
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    enum: ['web-dev', 'data-science', 'mobile-dev', 'design', 'business', 'marketing', 'music', 'photography']
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
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
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalHours: {
    type: Number,
    default: 0
  },
  // CHANGED: Use curriculum with sections and lessons for better progress tracking
  curriculum: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    order: Number,
    lessons: [{
      title: {
        type: String,
        required: true
      },
      description: String,
      videoUrl: String,
      duration: Number, // in minutes
      order: Number,
      isPreview: {
        type: Boolean,
        default: false
      },
      content: String, // for text content
      resources: [{
        title: String,
        url: String,
        type: String // pdf, link, file, etc.
      }]
    }]
  }]
}, {
  timestamps: true
});

// Update average rating when new ratings are added
courseSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
  this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
};

// Calculate total hours from curriculum
courseSchema.methods.calculateTotalHours = function() {
  let totalMinutes = 0;
  this.curriculum.forEach(section => {
    section.lessons.forEach(lesson => {
      totalMinutes += lesson.duration || 0;
    });
  });
  this.totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Convert to hours with 1 decimal
};

// Index for better search performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1, createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);