// server/routes/instructor.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');

// GET /api/instructor/students - Get all students enrolled in instructor's courses
router.get('/students', auth, async (req, res) => {
  try {
    // Check if user is instructor
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Instructor only.'
      });
    }

    const instructorId = req.user.id;

    // Get all courses by this instructor
    const instructorCourses = await Course.find({ instructorId }).select('_id title');
    const courseIds = instructorCourses.map(course => course._id);

    if (courseIds.length === 0) {
      return res.json({
        success: true,
        students: [],
        courses: [],
        totalStudents: 0
      });
    }

    // Get all enrollments for these courses with student details
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email avatar role')
      .populate('courseId', 'title category level thumbnail')
      .sort({ enrolledAt: -1 });

    // Group students by course and get progress data
    const studentsByCourse = {};
    const uniqueStudents = new Set();
    
    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId._id.toString();
      const studentId = enrollment.studentId._id.toString();
      
      uniqueStudents.add(studentId);

      if (!studentsByCourse[courseId]) {
        studentsByCourse[courseId] = {
          course: enrollment.courseId,
          students: []
        };
      }

      // Get student progress for this course
      const progress = await Progress.findOne({
        studentId: enrollment.studentId._id,
        courseId: enrollment.courseId._id
      });

      // Get quiz attempts for this student in this course
      const quizAttempts = await QuizAttempt.find({
        studentId: enrollment.studentId._id,
        quizId: { $in: await getCourseQuizIds(enrollment.courseId._id) }
      }).sort({ createdAt: -1 });

      studentsByCourse[courseId].students.push({
        student: enrollment.studentId,
        enrollmentDate: enrollment.enrolledAt,
        progress: progress ? {
          percentage: progress.progressPercentage,
          completedLessons: progress.completedLessons.length,
          lastAccessed: progress.lastAccessed
        } : null,
        quizAttempts: quizAttempts.map(attempt => ({
          score: attempt.score,
          passed: attempt.passed,
          date: attempt.createdAt,
          timeSpent: attempt.timeSpent
        })),
        totalQuizzesPassed: quizAttempts.filter(a => a.passed).length
      });
    }

    // Format response
    const courses = Object.values(studentsByCourse).map(courseData => ({
      ...courseData.course,
      studentCount: courseData.students.length
    }));

    const allStudents = [];
    Object.values(studentsByCourse).forEach(courseData => {
      courseData.students.forEach(studentData => {
        allStudents.push({
          ...studentData,
          courseTitle: courseData.course.title
        });
      });
    });

    res.json({
      success: true,
      students: allStudents,
      courses,
      totalStudents: uniqueStudents.size,
      stats: {
        totalEnrollments: enrollments.length,
        averageProgress: calculateAverageProgress(allStudents),
        activeStudents: allStudents.filter(s => 
          s.progress && s.progress.percentage > 0
        ).length
      }
    });

  } catch (error) {
    console.error('❌ Instructor students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student data',
      error: error.message
    });
  }
});

// GET /api/instructor/student/:studentId/details - Get detailed student analytics
router.get('/student/:studentId/details', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Instructor only.'
      });
    }

    const { studentId } = req.params;
    const instructorId = req.user.id;

    // Verify student is enrolled in instructor's courses
    const instructorCourses = await Course.find({ instructorId }).select('_id');
    const courseIds = instructorCourses.map(course => course._id);

    const enrollments = await Enrollment.find({
      studentId,
      courseId: { $in: courseIds }
    }).populate('courseId', 'title category');

    if (enrollments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your courses'
      });
    }

    // Get student details
    const student = await User.findById(studentId).select('name email avatar role createdAt');
    
    // Get progress for all enrolled courses
    const progressData = await Progress.find({
      studentId,
      courseId: { $in: courseIds }
    }).populate('courseId', 'title');

    // Get all quiz attempts
    const quizAttempts = await QuizAttempt.find({
      studentId,
      quizId: { $in: await getCourseQuizIds(courseIds) }
    }).populate('quizId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      student,
      enrollments: enrollments.map(enrollment => ({
        course: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt
      })),
      progress: progressData.map(progress => ({
        course: progress.courseId,
        percentage: progress.progressPercentage,
        completedLessons: progress.completedLessons.length,
        lastAccessed: progress.lastAccessed
      })),
      quizPerformance: quizAttempts.map(attempt => ({
        quiz: attempt.quizId?.title || 'Unknown Quiz',
        score: attempt.score,
        passed: attempt.passed,
        date: attempt.createdAt,
        timeSpent: attempt.timeSpent
      })),
      analytics: {
        totalCourses: enrollments.length,
        averageProgress: progressData.length > 0 
          ? progressData.reduce((sum, p) => sum + p.progressPercentage, 0) / progressData.length 
          : 0,
        totalQuizzesTaken: quizAttempts.length,
        quizzesPassed: quizAttempts.filter(a => a.passed).length,
        averageScore: quizAttempts.length > 0
          ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
          : 0
      }
    });

  } catch (error) {
    console.error('❌ Student details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student details',
      error: error.message
    });
  }
});

// Helper function to get quiz IDs for courses
async function getCourseQuizIds(courseIds) {
  const Course = require('../models/Course');
  const courses = await Course.find({ _id: { $in: courseIds } }).populate('quizzes');
  const quizIds = [];
  courses.forEach(course => {
    if (course.quizzes) {
      course.quizzes.forEach(quiz => quizIds.push(quiz._id));
    }
  });
  return quizIds;
}

// Helper function to calculate average progress
function calculateAverageProgress(students) {
  const studentsWithProgress = students.filter(s => s.progress);
  if (studentsWithProgress.length === 0) return 0;
  return studentsWithProgress.reduce((sum, s) => sum + s.progress.percentage, 0) / studentsWithProgress.length;
}

module.exports = router;