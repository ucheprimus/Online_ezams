// routes/progress.js
const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { auth } = require('../middleware/auth');
const { calculateAndUpdateProgress } = require('../utils/progressCalculator');

// GET /api/progress/:courseId - Get progress for a specific course
router.get('/:courseId', auth, async (req, res) => {
  try {
    console.log('📊 Fetching progress for course:', req.params.courseId);
    console.log('👤 User ID:', req.user.id);

    let progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (!progress) {
      console.log('No progress found, creating default progress');
      // Create default progress if none exists
      progress = new Progress({
        studentId: req.user.id,
        courseId: req.params.courseId,
        progressPercentage: 0,
        completedLessons: [],
        totalTimeSpent: 0,
        lastAccessed: new Date()
      });
      await progress.save();
    }

    console.log('✅ Progress found:', progress.progressPercentage + '%');
    res.json({
      success: true,
      progress: progress,
      message: 'Progress retrieved successfully'
    });

  } catch (error) {
    console.error('❌ Error fetching progress:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch progress', 
      error: error.message 
    });
  }
});

// POST /api/progress/:courseId/complete-lesson - Mark lesson as complete
router.post('/:courseId/complete-lesson', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    console.log('✅ Marking lesson complete:', { 
      lessonId, 
      courseId: req.params.courseId, 
      userId: req.user.id 
    });
    
    // Check if lesson has a quiz that requires completion
    const quiz = await Quiz.findOne({ lessonId: lessonId });
    if (quiz && quiz.isMandatory !== false) {
      // Check if user has passed the quiz
      const passedAttempt = await QuizAttempt.findOne({
        quizId: quiz._id,
        studentId: req.user.id,
        passed: true
      });
      
      if (!passedAttempt) {
        return res.status(400).json({
          success: false,
          message: "You must pass the quiz to complete this lesson"
        });
      }
    }
    
    let progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (!progress) {
      console.log('Creating new progress record');
      progress = new Progress({
        studentId: req.user.id,
        courseId: req.params.courseId,
        progressPercentage: 0,
        completedLessons: [],
        totalTimeSpent: 0
      });
    }

    // Check if lesson is already completed
    const isAlreadyCompleted = progress.completedLessons.some(
      lesson => lesson.lessonId.toString() === lessonId
    );

    if (!isAlreadyCompleted) {
      console.log('Adding lesson to completed lessons');
      
      // Add the lesson to completedLessons
      progress.completedLessons.push({
        lessonId: lessonId,
        completedAt: new Date()
      });
      
      // Save the progress first
      await progress.save();
      console.log('✅ Progress saved with new completed lesson');
      
      // Then calculate and update progress
      const updatedProgress = await calculateAndUpdateProgress(req.user.id, req.params.courseId);
      
      console.log('✅ Lesson marked as complete. Progress:', updatedProgress.progressPercentage + '%');
      console.log('✅ Completed lessons count:', updatedProgress.completedLessons.length);
      
      res.json({
        success: true,
        progress: updatedProgress,
        message: 'Lesson marked as complete'
      });
    } else {
      console.log('Lesson already completed');
      res.json({
        success: true,
        progress: progress,
        message: 'Lesson was already completed'
      });
    }

  } catch (error) {
    console.error('❌ Error completing lesson:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark lesson complete', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/progress/:courseId/uncomplete-lesson - Mark lesson as incomplete
router.post('/:courseId/uncomplete-lesson', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'Lesson ID is required'
      });
    }

    let progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    const initialLength = progress.completedLessons.length;
    
    // Remove the lesson from completed lessons
    progress.completedLessons = progress.completedLessons.filter(
      lesson => lesson.lessonId.toString() !== lessonId
    );

    if (progress.completedLessons.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: 'Lesson was not completed'
      });
    }
    
    // Update progress percentage
    const updatedProgress = await calculateAndUpdateProgress(req.user.id, req.params.courseId);
    
    updatedProgress.lastAccessed = new Date();
    await updatedProgress.save();

    console.log('✅ Lesson marked as incomplete');

    res.json({
      success: true,
      progress: updatedProgress,
      message: 'Lesson marked as incomplete'
    });

  } catch (error) {
    console.error('Error uncompleting lesson:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark lesson incomplete', 
      error: error.message 
    });
  }
});

// GET /api/progress/:courseId/completion-status/:lessonId - Check if user can complete lesson
router.get('/:courseId/completion-status/:lessonId', auth, async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Check if lesson has a quiz
    const quiz = await Quiz.findOne({ lessonId: lessonId });
    let canComplete = true;
    let message = 'Lesson can be completed';
    
    if (quiz && quiz.isMandatory !== false) {
      const passedAttempt = await QuizAttempt.findOne({
        quizId: quiz._id,
        studentId: req.user.id,
        passed: true
      });
      
      if (!passedAttempt) {
        canComplete = false;
        message = 'You must pass the quiz to complete this lesson';
      }
    }
    
    res.json({
      success: true,
      canComplete,
      message,
      hasQuiz: !!quiz,
      quizRequired: !!(quiz && quiz.isMandatory !== false)
    });
    
  } catch (error) {
    console.error('Error checking completion status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check completion status',
      error: error.message
    });
  }
});

module.exports = router;