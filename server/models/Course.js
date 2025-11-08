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
      duration: Number,
      order: Number,
      isPreview: {
        type: Boolean,
        default: false
      },
      content: String,
      resources: [{
        title: String,
        url: String,
        type: String
      }]
    }]
  }]
}, {
  timestamps: true
});

// ===== GRANULAR CURRICULUM METHODS =====

// Add a new section to course
courseSchema.methods.addSection = function(sectionData) {
  const newSection = {
    title: sectionData.title || 'New Section',
    description: sectionData.description || '',
    order: this.curriculum.length,
    lessons: []
  };
  
  this.curriculum.push(newSection);
  return this.curriculum[this.curriculum.length - 1];
};

// Update an existing section
courseSchema.methods.updateSection = function(sectionId, updates) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  // Update provided fields
  if (updates.title !== undefined) section.title = updates.title;
  if (updates.description !== undefined) section.description = updates.description;
  if (updates.order !== undefined) section.order = updates.order;
  
  return section;
};

// Delete a section
courseSchema.methods.deleteSection = function(sectionId) {
  const sectionIndex = this.curriculum.findIndex(s => s._id.toString() === sectionId);
  if (sectionIndex === -1) {
    throw new Error('Section not found');
  }
  
  this.curriculum.splice(sectionIndex, 1);
  
  // Reorder remaining sections
  this.curriculum.forEach((section, index) => {
    section.order = index;
  });
};

// Add a lesson to a section
courseSchema.methods.addLesson = function(sectionId, lessonData) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  const newLesson = {
    title: lessonData.title || 'New Lesson',
    description: lessonData.description || '',
    videoUrl: lessonData.videoUrl || '',
    duration: lessonData.duration || 0,
    order: section.lessons.length,
    isPreview: lessonData.isPreview || false,
    content: lessonData.content || '',
    resources: lessonData.resources || []
  };
  
  section.lessons.push(newLesson);
  return section.lessons[section.lessons.length - 1];
};

// Update an existing lesson
courseSchema.methods.updateLesson = function(sectionId, lessonId, updates) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  const lesson = section.lessons.id(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }
  
  // Update only provided fields
  const allowedFields = ['title', 'description', 'videoUrl', 'duration', 'order', 'isPreview', 'content', 'resources'];
  allowedFields.forEach(field => {
    if (updates[field] !== undefined) {
      lesson[field] = updates[field];
    }
  });
  
  return lesson;
};

// Delete a lesson from a section
courseSchema.methods.deleteLesson = function(sectionId, lessonId) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  const lessonIndex = section.lessons.findIndex(l => l._id.toString() === lessonId);
  if (lessonIndex === -1) {
    throw new Error('Lesson not found');
  }
  
  section.lessons.splice(lessonIndex, 1);
  
  // Reorder remaining lessons
  section.lessons.forEach((lesson, index) => {
    lesson.order = index;
  });
};

// Move section up or down
courseSchema.methods.moveSection = function(sectionId, direction) {
  const sectionIndex = this.curriculum.findIndex(s => s._id.toString() === sectionId);
  if (sectionIndex === -1) {
    throw new Error('Section not found');
  }

  if (direction === 'up' && sectionIndex > 0) {
    // Swap with previous section
    [this.curriculum[sectionIndex - 1], this.curriculum[sectionIndex]] = 
    [this.curriculum[sectionIndex], this.curriculum[sectionIndex - 1]];
  } else if (direction === 'down' && sectionIndex < this.curriculum.length - 1) {
    // Swap with next section
    [this.curriculum[sectionIndex], this.curriculum[sectionIndex + 1]] = 
    [this.curriculum[sectionIndex + 1], this.curriculum[sectionIndex]];
  }

  // Update all orders
  this.curriculum.forEach((section, index) => {
    section.order = index;
  });
};

// Move lesson within section
courseSchema.methods.moveLesson = function(sectionId, lessonId, direction) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }

  const lessonIndex = section.lessons.findIndex(l => l._id.toString() === lessonId);
  if (lessonIndex === -1) {
    throw new Error('Lesson not found');
  }

  if (direction === 'up' && lessonIndex > 0) {
    // Swap with previous lesson
    [section.lessons[lessonIndex - 1], section.lessons[lessonIndex]] = 
    [section.lessons[lessonIndex], section.lessons[lessonIndex - 1]];
  } else if (direction === 'down' && lessonIndex < section.lessons.length - 1) {
    // Swap with next lesson
    [section.lessons[lessonIndex], section.lessons[lessonIndex + 1]] = 
    [section.lessons[lessonIndex + 1], section.lessons[lessonIndex]];
  }

  // Update all lesson orders in the section
  section.lessons.forEach((lesson, index) => {
    lesson.order = index;
  });
};

// Get specific section by ID
courseSchema.methods.getSection = function(sectionId) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  return section;
};

// Get specific lesson by IDs
courseSchema.methods.getLesson = function(sectionId, lessonId) {
  const section = this.curriculum.id(sectionId);
  if (!section) {
    throw new Error('Section not found');
  }
  
  const lesson = section.lessons.id(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }
  
  return lesson;
};

// Validate a single lesson (for granular saving)
courseSchema.methods.validateLesson = function(lessonData) {
  const errors = [];
  
  if (!lessonData.title || lessonData.title.trim() === '') {
    errors.push('Lesson title is required');
  }
  
  if (!lessonData.duration || lessonData.duration < 1) {
    errors.push('Lesson duration must be at least 1 minute');
  }
  
  if (lessonData.videoUrl && !this.isValidVideoUrl(lessonData.videoUrl)) {
    errors.push('Invalid video URL format');
  }
  
  return errors;
};

// Helper method to validate video URLs
courseSchema.methods.isValidVideoUrl = function(url) {
  if (!url) return true; // Empty URL is valid (optional field)
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/(\d+)/;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url);
};

// ===== EXISTING METHODS =====

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
  this.totalHours = Math.round(totalMinutes / 60 * 10) / 10;
};

// Get course statistics
courseSchema.methods.getStats = function() {
  let totalLessons = 0;
  let totalDuration = 0;
  
  this.curriculum.forEach(section => {
    totalLessons += section.lessons.length;
    section.lessons.forEach(lesson => {
      totalDuration += lesson.duration || 0;
    });
  });
  
  return {
    totalSections: this.curriculum.length,
    totalLessons,
    totalDuration, // in minutes
    totalHours: this.totalHours,
    enrolledStudents: this.studentsEnrolled.length,
    averageRating: this.averageRating
  };
};

// Index for better search performance
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1, createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);