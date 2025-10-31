const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth, instructorOnly } = require('../middleware/auth');

// GET /api/courses - Get all courses (public)
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .populate('instructor', 'name email')
      .select('-studentsEnrolled')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/courses/instructor - Get instructor's courses
router.get('/instructor', auth, instructorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/courses/:id - Get single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('studentsEnrolled', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /api/courses - Create new course (instructor only)
router.post('/', auth, instructorOnly, async (req, res) => {
  try {
    const { title, description, price, category, level, image } = req.body;

    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      image,
      instructor: req.user._id
    });

    const savedCourse = await course.save();
    await savedCourse.populate('instructor', 'name email');
    
    res.status(201).json(savedCourse);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /api/courses/:id - Update course (instructor only)
router.put('/:id', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only update your own courses.' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email');

    res.json(updatedCourse);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE /api/courses/:id - Delete course (instructor only)
router.delete('/:id', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if the instructor owns the course
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own courses.' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;