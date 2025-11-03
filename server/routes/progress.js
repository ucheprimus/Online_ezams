const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth'); // FIXED: Destructure auth from the export
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { calculateAndUpdateProgress } = require('../utils/progressCalculator');

// Mark lesson as completed
router.post('/:courseId/complete-lesson', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    // Validate input
    if (!lessonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lesson ID is required' 
      });
    }

    // Verify enrollment
    const isEnrolled = await Course.exists({
      _id: courseId,
      studentsEnrolled: studentId
    });

    if (!isEnrolled) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not enrolled in this course' 
      });
    }

    // Update progress - add lesson to completed if not already
    const progress = await Progress.findOneAndUpdate(
      { studentId, courseId },
      { 
        $addToSet: { completedLessons: { lessonId } },
        $set: { lastAccessed: new Date() }
      },
      { upsert: true, new: true }
    );

    // Recalculate progress percentage
    const updatedProgress = await calculateAndUpdateProgress(studentId, courseId);

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark lesson as completed' 
    });
  }
});

// Mark lesson as incomplete (remove from completed)
router.post('/:courseId/uncomplete-lesson', auth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    // Validate input
    if (!lessonId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lesson ID is required' 
      });
    }

    // Remove lesson from completed
    await Progress.findOneAndUpdate(
      { studentId, courseId },
      { 
        $pull: { completedLessons: { lessonId } },
        $set: { lastAccessed: new Date() }
      }
    );

    // Recalculate progress percentage
    const updatedProgress = await calculateAndUpdateProgress(studentId, courseId);

    res.json({
      success: true,
      progress: updatedProgress
    });
  } catch (error) {
    console.error('Uncomplete lesson error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update lesson progress' 
    });
  }
});

// Get course progress
router.get('/:courseId', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId
    });

    if (!progress) {
      return res.json({
        success: true,
        progress: {
          progressPercentage: 0,
          completedLessons: [],
          totalTimeSpent: 0,
          lastAccessed: new Date()
        }
      });
    }

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch progress' 
    });
  }
});

// Update time spent on course
router.post('/:courseId/update-time', auth, async (req, res) => {
  try {
    const { timeSpent } = req.body; // in minutes
    const studentId = req.user.id;
    const courseId = req.params.courseId;

    // Validate input
    if (!timeSpent || timeSpent <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid time spent is required' 
      });
    }

    await Progress.findOneAndUpdate(
      { studentId, courseId },
      { 
        $inc: { totalTimeSpent: timeSpent },
        $set: { lastAccessed: new Date() }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Time updated successfully'
    });
  } catch (error) {
    console.error('Update time error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update time' 
    });
  }
});

module.exports = router;