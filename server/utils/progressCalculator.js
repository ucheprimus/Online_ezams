// utils/progressCalculator.js
const Progress = require('../models/Progress');
const Course = require('../models/Course');

const calculateAndUpdateProgress = async (studentId, courseId) => {
  try {
    const course = await Course.findById(courseId);
    const progress = await Progress.findOne({ studentId, courseId });
    
    if (!course || !progress) return null;
    
    let totalLessons = 0;
    let completedCount = 0;
    
    // Calculate total lessons and completed lessons
    if (course.curriculum && course.curriculum.length > 0) {
      course.curriculum.forEach(section => {
        if (section.lessons && section.lessons.length > 0) {
          totalLessons += section.lessons.length;
          section.lessons.forEach(lesson => {
            const isCompleted = progress.completedLessons.some(
              completed => completed.lessonId.toString() === lesson._id.toString()
            );
            if (isCompleted) completedCount++;
          });
        }
      });
    }
    
    const progressPercentage = totalLessons > 0 ? 
      Math.round((completedCount / totalLessons) * 100) : 0;
    
    // Update progress in database
    progress.progressPercentage = progressPercentage;
    progress.lastAccessed = new Date();
    await progress.save();
    
    return progress;
  } catch (error) {
    console.error('Progress calculation error:', error);
    throw error;
  }
};

module.exports = { calculateAndUpdateProgress };