const express = require('express');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/courses - Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;
    
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
      .populate('instructor', 'name email')
      .select('-lectures -studentsEnrolled')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/:id - Get single course (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('ratings.user', 'name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Hide some data if not enrolled and not instructor
    if (!req.user || (req.user.id !== course.instructor._id.toString() && !course.studentsEnrolled.includes(req.user.id))) {
      course.lectures = course.lectures.filter(lecture => lecture.isPreview);
    }
    
    res.json(course);
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses - Create new course (instructor only)
// POST /api/courses - Create new course (instructor only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can create courses' });
    }
    
    // ADD thumbnail to destructuring
    const { title, description, price, category, level, thumbnail } = req.body;
    
    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      thumbnail, // ← ADD THIS LINE
      instructor: req.user.id
    });
    
    await course.save();
    await course.populate('instructor', 'name email');
    
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
    
    // ADD thumbnail here
    const { title, description, price, category, level, isPublished, thumbnail } = req.body;
    
    // Update allowed fields - ADD thumbnail
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (level) course.level = level;
    if (isPublished !== undefined) course.isPublished = isPublished;
    if (thumbnail !== undefined) course.thumbnail = thumbnail; // ← ADD THIS
    
    await course.save();
    await course.populate('instructor', 'name email');
    
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
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/instructor/my-courses - Get instructor's courses
router.get('/instructor/my-courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can access this' });
    }
    
    const courses = await Course.find({ instructor: req.user.id })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (err) {
    console.error('Get instructor courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;