// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');

// GET /api/dashboard/summary - Get dashboard summary data
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`📊 Fetching dashboard data for ${userRole}: ${userId}`);

    if (userRole === 'instructor') {
      // Instructor dashboard data
      const courseCount = await Course.countDocuments({ instructorId: userId });
      console.log(`📚 Instructor course count: ${courseCount}`);
      
      // Get total students across all instructor's courses
      const instructorCourses = await Course.find({ instructorId: userId }).select('_id');
      const courseIds = instructorCourses.map(course => course._id);
      
      const studentCount = courseIds.length > 0 
        ? await Enrollment.countDocuments({ courseId: { $in: courseIds } })
        : 0;
      console.log(`👥 Instructor student count: ${studentCount}`);
      
      // For messages, use a placeholder since we don't have Message model
      const messageCount = 0;

      res.json({
        instructor: {
          courseCount,
          studentCount,
          messageCount
        }
      });

    } else {
      // Student dashboard data
      const enrolledCount = await Enrollment.countDocuments({ studentId: userId });
      console.log(`📖 Student enrolled courses: ${enrolledCount}`);
      
      // Count courses with any progress
      const progressCount = await Progress.countDocuments({ 
        studentId: userId,
        'completedLessons.0': { $exists: true } // Has at least one completed lesson
      });
      console.log(`✅ Student courses with progress: ${progressCount}`);
      
      // Count passed quizzes as certificates for now
      const certificateCount = await QuizAttempt.countDocuments({
        studentId: userId,
        passed: true
      });
      console.log(`🏆 Student certificates (passed quizzes): ${certificateCount}`);
      
      // For wishlist - placeholder
      const wishlistCount = 0;

      res.json({
        student: {
          enrolledCount,
          progressCount,
          certificateCount,
          wishlistCount
        }
      });
    }

  } catch (error) {
    console.error('❌ Dashboard summary error:', error);
    
    // Return empty data instead of error
    res.json({
      instructor: {
        courseCount: 0,
        studentCount: 0,
        messageCount: 0
      },
      student: {
        enrolledCount: 0,
        progressCount: 0,
        certificateCount: 0,
        wishlistCount: 0
      }
    });
  }
});

module.exports = router;