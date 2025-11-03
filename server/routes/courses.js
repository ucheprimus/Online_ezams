const express = require('express');
const Course = require('../models/Course');
const Progress = require('../models/Progress'); // ADD THIS IMPORT
const { auth } = require('../middleware/auth');
const { calculateAndUpdateProgress } = require('../utils/progressCalculator'); // ADD THIS IMPORT
const router = express.Router();

// GET /api/courses - Get all PUBLISHED courses (public - for students/browsing)
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
    // ONLY show published courses to public
    let query = { isPublished: true };
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by level
    if (level && level !== 'all') {
      query.level = level;
    }
    
    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .populate('studentsEnrolled', 'name')
      .select('-curriculum') // Hide curriculum for public listing
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    // Add enrolled count to each course
    const coursesWithCount = courses.map(course => ({
      ...course.toObject(),
      enrolledCount: course.studentsEnrolled.length
    }));
    
    res.json({
      courses: coursesWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id - Get single course (public access for published courses)
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching course with ID:', req.params.id);
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio')
      .populate('studentsEnrolled', 'name');

    if (!course) {
      console.log('Course not found in database');
      return res.status(404).json({ message: 'Course not found' });
    }

    const isInstructor = req.user && req.user.role === 'instructor';
    const isCourseOwner = req.user && course.instructor._id.toString() === req.user.id;
    const isEnrolled = req.user && course.studentsEnrolled.some(
      student => student._id.toString() === req.user.id
    );

    console.log('Course access check:', {
      isPublished: course.isPublished,
      isInstructor,
      isCourseOwner,
      isEnrolled,
      hasUser: !!req.user
    });

    // ACCESS RULES:
    // 1. Published courses: Anyone can view (public access)
    // 2. Unpublished courses: Only course owner can view
    if (!course.isPublished && !isCourseOwner) {
      console.log('Access denied: Course is unpublished and user is not owner');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Prepare course data for response
    const responseCourse = course.toObject();
    
    // Hide sensitive data based on user role
    if (!isCourseOwner && !isEnrolled) {
      // For non-enrolled users, hide curriculum details
      responseCourse.curriculum = responseCourse.curriculum.map(section => ({
        ...section,
        lessons: section.lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          // Hide videoUrl and content for non-enrolled users
          videoUrl: lesson.isPreview ? lesson.videoUrl : undefined,
          content: lesson.isPreview ? lesson.content : undefined
        }))
      }));
    }

    // Add enrolled count
    responseCourse.enrolledCount = responseCourse.studentsEnrolled?.length || 0;
    
    // Hide student list from non-owners
    if (!isCourseOwner) {
      responseCourse.studentsEnrolled = []; 
    }

    console.log('Sending course data to client');
    res.json(responseCourse);
  } catch (err) {
    console.error('Get course error:', err);
    
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/student/enrolled-courses - Get student's enrolled courses with progress
router.get('/student/enrolled-courses', auth, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Only students can access this
    if (req.user.role !== 'student') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only students can access enrolled courses' 
      });
    }
    
    const courses = await Course.find({
      'studentsEnrolled': studentId,
      'isPublished': true
    })
    .populate('instructor', 'name avatar')
    .select('-curriculum') // Hide full curriculum for listing
    .sort({ createdAt: -1 });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await Progress.findOne({
          studentId: studentId,
          courseId: course._id
        });
        
        const courseObj = course.toObject();
        
        return {
          ...courseObj,
          progressPercentage: progress ? progress.progressPercentage : 0,
          lastAccessed: progress ? progress.lastAccessed : null,
          enrolledCount: course.studentsEnrolled.length
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithProgress
    });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    });
  }
});

// POST /api/courses - Create new course (instructor only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can create courses' });
    }
    
    const { title, description, price, category, level, thumbnail, curriculum } = req.body;
    
    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      curriculum: curriculum || [],
      instructor: req.user.id
    });
    
    // Calculate total hours from curriculum
    course.calculateTotalHours();
    
    await course.save();
    await course.populate('instructor', 'name email avatar');
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (err) {
    console.error('Create course error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/courses/:id - Update course (instructor only - owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    const { title, description, price, category, level, isPublished, thumbnail, curriculum } = req.body;
    
    // Update allowed fields
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (level) course.level = level;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (curriculum) course.curriculum = curriculum;
    
    // Recalculate total hours if curriculum changed
    if (curriculum) {
      course.calculateTotalHours();
    }
    
    await course.save();
    await course.populate('instructor', 'name email avatar');
    
    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (err) {
    console.error('Update course error:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/courses/:id - Delete course (instructor only - owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }
    
    // Also delete progress records for this course
    await Progress.deleteMany({ courseId: req.params.id });
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/instructor/my-courses - Get instructor's ALL courses (published + unpublished)
router.get('/instructor/my-courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can access this' });
    }
    
    // Show ALL courses for the instructor (both published and unpublished)
    const courses = await Course.find({ instructor: req.user.id })
      .populate('instructor', 'name email avatar')
      .populate('studentsEnrolled', 'name')
      .sort({ createdAt: -1 });
    
    // Add enrolled count to each course
    const coursesWithCount = courses.map(course => ({
      ...course.toObject(),
      enrolledCount: course.studentsEnrolled.length
    }));
    
    res.json(coursesWithCount);
  } catch (err) {
    console.error('Get instructor courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses/:id/enroll - Enroll in a course (student only)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }
    
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({ message: 'Cannot enroll in unpublished course' });
    }
    
    // Check if already enrolled
    if (course.studentsEnrolled.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Add student to enrolled list
    course.studentsEnrolled.push(req.user.id);
    await course.save();
    
    // Create initial progress record
    const progress = new Progress({
      studentId: req.user.id,
      courseId: course._id,
      progressPercentage: 0,
      completedLessons: [],
      totalTimeSpent: 0
    });
    await progress.save();
    
    res.json({
      message: 'Successfully enrolled in course',
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        instructor: course.instructor,
        thumbnail: course.thumbnail
      }
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/instructor/course/:id - Get course for editing (instructor only)
router.get('/instructor/course/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can access this' });
    }
    
    console.log('Fetching course for editing:', req.params.id);
    
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar')
      .populate('studentsEnrolled', 'name');

    if (!course) {
      console.log('Course not found for editing');
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the course instructor
    if (course.instructor._id.toString() !== req.user.id) {
      console.log('User not authorized to edit this course');
      return res.status(403).json({ message: 'Not authorized to access this course' });
    }

    console.log('Sending course data for editing');
    res.json(course);
  } catch (err) {
    console.error('Get instructor course error:', err);
    
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;