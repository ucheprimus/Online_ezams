// routes/profile.js
const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile (protected)
router.get("/profile", auth, async (req, res) => {
  try {
    console.log('✅ Profile route accessed by:', req.user.name);
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;