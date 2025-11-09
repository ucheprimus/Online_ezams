const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth'); // FIXED IMPORT

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/videos';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer
const upload = multer({
  dest: uploadsDir,
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
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/videos/${req.file.filename}`,
      lessonId: req.body.lessonId,
      courseId: req.body.courseId,
      uploadedBy: req.user.id
    };

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