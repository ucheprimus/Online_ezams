// routes/users.js
const express = require('express');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/enrolled-courses - Get student's enrolled courses
router.get('/enrolled-courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can access enrolled courses' });
    }

    const { page = 1, limit = 10 } = req.query;
    
    // Find courses where the student is enrolled
    const courses = await Course.find({ 
      studentsEnrolled: req.user.id,
      isPublished: true // Only show published courses
    })
      .populate('instructor', 'name email')
      .select('-lectures') // Hide lectures data
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments({ 
      studentsEnrolled: req.user.id,
      isPublished: true 
    });

    // Add progress data to each course (you'll need to implement this based on your progress tracking)
    const coursesWithProgress = courses.map(course => ({
      ...course.toObject(),
      progress: calculateCourseProgress(req.user.id, course) // You need to implement this function
    }));

    res.json({
      courses: coursesWithProgress,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get enrolled courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate course progress (you need to implement this based on your data structure)
const calculateCourseProgress = (userId, course) => {
  // This is a placeholder - implement based on your progress tracking system
  // For example, if you track completed lessons:
  // const completedLessons = user.completedLessons.filter(lesson => course.lectures.includes(lesson))
  // return (completedLessons.length / course.lectures.length) * 100;
  
  return Math.floor(Math.random() * 100); // Random progress for demo
};

module.exports = router;