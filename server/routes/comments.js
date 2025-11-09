const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');


// GET /api/courses/:courseId/comments - Get comments for a course
router.get('/courses/:courseId/comments', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEnrolled = course.studentsEnrolled.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to view comments' });
    }

    const comments = await Comment.find({ courseId: req.params.courseId, parentComment: null })
      .populate('user', 'name avatar')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'name avatar' },
          { 
            path: 'replies', // NESTED REPLIES
            populate: { path: 'user', select: 'name avatar' }
          }
        ]
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:courseId/comments - Add comment to course
router.post('/courses/:courseId/comments', auth, async (req, res) => {
  try {
    const { text, lessonId } = req.body;
    
    // Check if user is enrolled in the course
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify user is enrolled
    const isEnrolled = course.studentsEnrolled.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to comment' });
    }

    const comment = new Comment({
      text,
      courseId: req.params.courseId,
      lessonId,
      user: req.user.id
    });
    
    await comment.save();
    await comment.populate('user', 'name avatar');
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:courseId/comments/:commentId/replies - Add reply to comment
router.post('/courses/:courseId/comments/:commentId/replies', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Check enrollment
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEnrolled = course.studentsEnrolled.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to reply' });
    }

    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    const reply = new Comment({
      text,
      courseId: req.params.courseId,
      user: req.user.id,
      parentComment: req.params.commentId
    });
    
    await reply.save();
    await reply.populate('user', 'name avatar');
    
    parentComment.replies.push(reply._id);
    await parentComment.save();
    
    res.json({ success: true, reply });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:courseId/comments/:commentId/like - Like a comment
router.post('/courses/:courseId/comments/:commentId/like', auth, async (req, res) => {
  try {
    // Check enrollment
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEnrolled = course.studentsEnrolled.includes(req.user.id);
    if (!isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to like comments' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    const likeIndex = comment.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1); // Unlike
    } else {
      comment.likes.push(req.user.id); // Like
    }
    
    await comment.save();
    res.json({ success: true, likes: comment.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:courseId/comments/:commentId - Delete a comment
router.delete('/courses/:courseId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }
    
    await Comment.deleteOne({ _id: req.params.commentId });
    
    // Also delete any replies
    await Comment.deleteMany({ parentComment: req.params.commentId });
    
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;