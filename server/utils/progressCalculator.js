// utils/progressCalculator.js
const Progress = require('../models/Progress');
const Course = require('../models/Course');

const calculateAndUpdateProgress = async (studentId, courseId) => {
  try {
    console.log('🔄 Calculating progress for:', { studentId, courseId });
    
    const course = await Course.findById(courseId);
    const progress = await Progress.findOne({ studentId, courseId });
    
    if (!course) {
      console.log('❌ Course not found for progress calculation');
      throw new Error('Course not found');
    }
    
    if (!progress) {
      console.log('❌ Progress record not found');
      throw new Error('Progress record not found');
    }
    
    let totalLessons = 0;
    let completedCount = 0;
    
    console.log('📚 Course curriculum sections:', course.curriculum?.length || 0);
    
    // Calculate total lessons and completed lessons
    if (course.curriculum && course.curriculum.length > 0) {
      course.curriculum.forEach((section, sectionIndex) => {
        if (section.lessons && section.lessons.length > 0) {
          totalLessons += section.lessons.length;
          console.log(`Section ${sectionIndex}: ${section.lessons.length} lessons`);
          
// ✅ FIXED CODE - Replace lines 25-33
section.lessons.forEach((lesson, lessonIndex) => {
  const lessonId = lesson._id ? lesson._id.toString() : null;
  
  if (lessonId) {
    const isCompleted = progress.completedLessons.some(completed => {
      // ✅ FIX: Always use completed.lessonId.toString()
      return completed.lessonId.toString() === lessonId;
    });
    
    if (isCompleted) {
      completedCount++;
      console.log(`  ✅ Lesson ${lessonIndex} completed: ${lesson.title}`);
    }
  }
});
        }
      });
    }
    
    const progressPercentage = totalLessons > 0 ? 
      Math.round((completedCount / totalLessons) * 100) : 0;
    
    console.log(`📊 Progress calculated: ${completedCount}/${totalLessons} lessons (${progressPercentage}%)`);
    
    // Update progress in database
    progress.progressPercentage = progressPercentage;
    progress.lastAccessed = new Date();
    await progress.save();
    
    console.log('✅ Progress updated successfully');
    return progress;
    
  } catch (error) {
    console.error('❌ Progress calculation error:', error);
    throw error;
  }
};

module.exports = { calculateAndUpdateProgress };