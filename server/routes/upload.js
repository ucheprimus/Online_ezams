const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/videos';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// FIXED: Configure multer with proper storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Preserve original file extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage, // Use the storage configuration
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'), false);
    }
  }
});

// Upload video endpoint - WITH AUTH
router.post('/video', auth, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const videoData = {
      _id: req.file.filename, // Use filename as ID for deletion
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `http://localhost:5000/uploads/videos/${req.file.filename}`, // FIXED: Use full URL
      lessonId: req.body.lessonId,
      courseId: req.body.courseId,
      uploadedBy: req.user.id,
      uploadedAt: new Date()
    };

    console.log('Video uploaded successfully:', videoData); // Debug log

    res.json({
      success: true,
      message: 'Video uploaded successfully',
      video: videoData
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading video: ' + error.message
    });
  }
});

// Delete video endpoint - WITH AUTH
router.delete('/video/:id', auth, (req, res) => {
  try {
    const filename = req.params.id;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Video deleted:', filename);
    }

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting video'
    });
  }
});

module.exports = router;