// routes/lessons.js
const express = require('express');
const router = express.Router();
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

// Get lesson with quiz
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const quiz = await Quiz.findOne({ lessonId: req.params.id });
    
    res.json({
      lesson,
      quiz: quiz || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create lesson (Instructor only)
router.post('/', async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get lessons for course
router.get('/course/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .sort('order')
      .select('title duration order description videoType videoId');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;