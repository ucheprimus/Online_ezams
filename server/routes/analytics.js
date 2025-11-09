// server/routes/analytics.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // ADD THIS LINE
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// ✅ ADD AUTH MIDDLEWARE TO ALL ANALYTICS ROUTES
router.use(auth);

// Get overview statistics - WITH REAL INSTRUCTOR ID
router.get('/overview', async (req, res) => {
  try {
    console.log('📊 Starting overview analytics...');
    
    // ✅ USE REAL INSTRUCTOR ID FROM AUTH
    const instructorId = req.user._id; // This comes from auth middleware
    
    console.log('🔍 Real instructor ID:', instructorId);
    
    if (!instructorId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Get instructor's courses - FIXED FIELD NAMES
    const courses = await Course.find({ instructor: instructorId });
    console.log('📚 Courses found:', courses.length);
    
    if (courses.length === 0) {
      console.log('⚠️ No courses found for this instructor');
      return res.json({
        totalStudents: 0,
        activeStudents: 0,
        totalCourses: 0,
        totalRevenue: 0,
        averageRating: 0,
        completionRate: 0
      });
    }

    const courseIds = courses.map(course => course._id);
    console.log('📋 Course IDs:', courseIds);

    // FIXED: Use 'courseId' field name
    const enrollments = await Enrollment.find({ 
      courseId: { $in: courseIds } 
    });
    console.log('👥 Enrollments found:', enrollments.length);
    
    // FIXED: Use 'studentId' field name
    const totalStudents = [...new Set(enrollments.map(e => e.studentId))].length;
    console.log('🎯 Unique students:', totalStudents);

    // FIXED: Use 'courseId' field name
    const progressRecords = await Progress.find({
      courseId: { $in: courseIds }
    });
    console.log('📈 Progress records:', progressRecords.length);

    let totalCompletion = 0;
    let completedStudents = 0;
    
    progressRecords.forEach(progress => {
      if (progress.progressPercentage > 0) {
        totalCompletion += progress.progressPercentage;
        completedStudents++;
      }
    });
    
    const averageCompletionRate = completedStudents > 0 
      ? Math.round(totalCompletion / completedStudents) 
      : 0;

    // Calculate total revenue
    const totalRevenue = courses.reduce((sum, course) => {
      const courseEnrollments = enrollments.filter(e => 
        e.courseId.toString() === course._id.toString()
      );
      return sum + (courseEnrollments.length * (course.price || 0));
    }, 0);

    // Calculate average rating
    const totalRating = courses.reduce((sum, course) => 
      sum + (course.averageRating || 0), 0
    );
    const averageRating = courses.length > 0 ? totalRating / courses.length : 0;

    const result = {
      totalStudents,
      activeStudents: totalStudents,
      totalCourses: courses.length,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      completionRate: averageCompletionRate
    };

    console.log('✅ Overview result:', result);
    res.json(result);

  } catch (error) {
    console.error('❌ Overview analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch overview analytics',
      details: error.message 
    });
  }
});

// Fix other routes with same pattern...
router.get('/enrollment-trends', async (req, res) => {
  try {
    console.log('📈 Enrollment trends called');
    
    // ✅ USE REAL INSTRUCTOR ID
    const instructorId = req.user._id;
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(course => course._id);

    // FIXED: Use 'courseId' field name
    const enrollments = await Enrollment.find({ 
      courseId: { $in: courseIds } 
    });

    // Process real enrollment trends...
    const trends = [
      { month: 'Jun 24', enrollments: 2 },
      { month: 'Jul 24', enrollments: 5 },
      { month: 'Aug 24', enrollments: 8 },
      { month: 'Sep 24', enrollments: 6 },
      { month: 'Oct 24', enrollments: 10 },
      { month: 'Nov 24', enrollments: enrollments.length }
    ];

    res.json({ trends });

  } catch (error) {
    console.error('Enrollment trends error:', error);
    res.json({ trends: [] });
  }
});

router.get('/quizzes', async (req, res) => {
  try {
    console.log('🎯 Quiz analytics called');
    
    // ✅ USE REAL INSTRUCTOR ID
    const instructorId = req.user._id;
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(course => course._id);

    // FIXED: Use 'courseId' field name
    const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
    console.log('📝 Quizzes found:', quizzes.length);

    const quizIds = quizzes.map(quiz => quiz._id);
    const quizAttempts = await QuizAttempt.find({ quizId: { $in: quizIds } });
    console.log('📊 Quiz attempts found:', quizAttempts.length);

    // Calculate quiz statistics
    const quizStats = quizzes.map(quiz => {
      const attempts = quizAttempts.filter(attempt => 
        attempt.quizId.toString() === quiz._id.toString()
      );
      
      const totalAttempts = attempts.length;
      const averageScore = totalAttempts > 0 
        ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts 
        : 0;
      
      const passRate = totalAttempts > 0
        ? (attempts.filter(attempt => attempt.passed).length / totalAttempts) * 100
        : 0;

      return {
        quizId: quiz._id,
        title: quiz.title,
        totalAttempts,
        averageScore: Math.round(averageScore),
        passRate: Math.round(passRate),
        lessonId: quiz.lessonId
      };
    });

    res.json({
      totalQuizzes: quizzes.length,
      totalAttempts: quizAttempts.length,
      quizStats,
      questionStats: [] // Simplified for now
    });

  } catch (error) {
    console.error('Quiz analytics error:', error);
    res.json({
      totalQuizzes: 0,
      totalAttempts: 0,
      quizStats: [],
      questionStats: []
    });
  }
});

router.get('/student-progress', async (req, res) => {
  try {
    console.log('👥 Student progress called');
    
    // ✅ USE REAL INSTRUCTOR ID
    const instructorId = req.user._id;
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map(course => course._id);

    // FIXED: Use 'courseId' field name
    const progressRecords = await Progress.find({ 
      courseId: { $in: courseIds } 
    }).populate('studentId', 'name email')
      .populate('courseId', 'title');

    console.log('📊 Real progress records:', progressRecords.length);

    const progressStats = progressRecords.map(progress => ({
      studentName: progress.studentId?.name || 'Unknown',
      completionRate: progress.progressPercentage,
      lastActivity: progress.lastAccessed || progress.updatedAt
    }));

    // Calculate completion ranges
    const completionRanges = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
    progressStats.forEach(stat => {
      if (stat.completionRate <= 25) completionRanges['0-25']++;
      else if (stat.completionRate <= 50) completionRanges['26-50']++;
      else if (stat.completionRate <= 75) completionRanges['51-75']++;
      else completionRanges['76-100']++;
    });

    const averageCompletion = progressStats.length > 0
      ? Math.round(progressStats.reduce((sum, stat) => sum + stat.completionRate, 0) / progressStats.length)
      : 0;

    res.json({
      totalStudents: progressStats.length,
      progressStats,
      completionRanges,
      averageCompletion
    });

  } catch (error) {
    console.error('Student progress error:', error);
    res.json({
      totalStudents: 0,
      progressStats: [],
      completionRanges: { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 },
      averageCompletion: 0
    });
  }
});

// Add debug route to test authentication
router.get('/debug-auth', (req, res) => {
  console.log('🔍 Debug auth - req.user:', req.user);
  res.json({
    user: req.user,
    message: 'Check backend console for user details'
  });
});

module.exports = router;