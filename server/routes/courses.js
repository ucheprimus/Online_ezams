const express = require("express");
const Course = require("../models/Course");
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Progress = require("../models/Progress");
const { auth } = require("../middleware/auth");
const { calculateAndUpdateProgress } = require("../utils/progressCalculator");
const router = express.Router();
// Add this helper function at the top of your routes file
const fs = require('fs');
const path = require('path');


// ===== ADD THIS AS THE VERY FIRST ROUTE =====
// Simple test route to verify API is working
router.get('/test', (req, res) => {
  console.log('✅ Test route called');
  res.json({ 
    message: '✅ Courses API is working!', 
    timestamp: new Date(),
    status: 'OK'
  });
});

// GET /api/courses - Get all PUBLISHED courses (public - for students/browsing)
router.get("/", async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;

    // ONLY show published courses to public
    let query = { isPublished: true };

    // Filter by category
    if (category && category !== "all") {
      query.category = category;
    }

    // Filter by level
    if (level && level !== "all") {
      query.level = level;
    }

    // Search in title and description
    if (search) {
      query.$text = { $search: search };
    }

    const courses = await Course.find(query)
      .populate("instructor", "name email avatar")
      .populate("studentsEnrolled", "name")
      .select("-curriculum") // Hide curriculum for public listing
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Course.countDocuments(query);

    // Add enrolled count to each course
    const coursesWithCount = courses.map((course) => ({
      ...course.toObject(),
      enrolledCount: course.studentsEnrolled.length,
    }));

    res.json({
      courses: coursesWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (err) {
    console.error("Get courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses/:id - Get single course (public access for published courses)
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching course with ID:", req.params.id);

    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar bio")
      .populate("studentsEnrolled", "name");

    if (!course) {
      console.log("Course not found in database");
      return res.status(404).json({ message: "Course not found" });
    }

    const isInstructor = req.user && req.user.role === "instructor";
    const isCourseOwner =
      req.user && course.instructor._id.toString() === req.user.id;
    const isEnrolled =
      req.user &&
      course.studentsEnrolled.some(
        (student) => student._id.toString() === req.user.id
      );

    console.log("Course access check:", {
      isPublished: course.isPublished,
      isInstructor,
      isCourseOwner,
      isEnrolled,
      hasUser: !!req.user,
    });

    // ACCESS RULES:
    // 1. Published courses: Anyone can view (public access)
    // 2. Unpublished courses: Only course owner can view
    if (!course.isPublished && !isCourseOwner) {
      console.log("Access denied: Course is unpublished and user is not owner");
      return res.status(404).json({ message: "Course not found" });
    }

    // Prepare course data for response
    const responseCourse = course.toObject();

    // Hide sensitive data based on user role
    if (!isCourseOwner && !isEnrolled) {
      // For non-enrolled users, hide curriculum details
      responseCourse.curriculum = responseCourse.curriculum.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) => ({
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
          isPreview: lesson.isPreview,
          // Hide videoUrl and content for non-enrolled users
          videoUrl: lesson.isPreview ? lesson.videoUrl : undefined,
          content: lesson.isPreview ? lesson.content : undefined,
        })),
      }));
    }

    // Add enrolled count
    responseCourse.enrolledCount = responseCourse.studentsEnrolled?.length || 0;

    // Hide student list from non-owners
    if (!isCourseOwner) {
      responseCourse.studentsEnrolled = [];
    }

    console.log("Sending course data to client");
    res.json(responseCourse);
  } catch (err) {
    console.error("Get course error:", err);

    if (err.name === "CastError") {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses/student/enrolled-courses - Get student's enrolled courses with progress
router.get("/student/enrolled-courses", auth, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Only students can access this
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can access enrolled courses",
      });
    }

    const courses = await Course.find({
      studentsEnrolled: studentId,
      isPublished: true,
    })
      .populate("instructor", "name avatar")
      .select("-curriculum") // Hide full curriculum for listing
      .sort({ createdAt: -1 });

    // Get progress for each course
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await Progress.findOne({
          studentId: studentId,
          courseId: course._id,
        });

        const courseObj = course.toObject();

        return {
          ...courseObj,
          progressPercentage: progress ? progress.progressPercentage : 0,
          lastAccessed: progress ? progress.lastAccessed : null,
          enrolledCount: course.studentsEnrolled.length,
        };
      })
    );

    res.json({
      success: true,
      courses: coursesWithProgress,
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses",
    });
  }
});

// POST /api/courses - Create new course (instructor only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can create courses" });
    }

    const {
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      curriculum,
    } = req.body;

    const course = new Course({
      title,
      description,
      price,
      category,
      level,
      thumbnail,
      curriculum: curriculum || [],
      instructor: req.user.id,
    });

    // Calculate total hours from curriculum
    course.calculateTotalHours();

    await course.save();
    await course.populate("instructor", "name email avatar");

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (err) {
    console.error("Create course error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Server error" });
  }
});


// ===== SINGLE /learn ROUTE (REMOVED DUPLICATE) =====
router.get("/:id/learn", auth, async (req, res) => {
  console.log('=== START /learn ROUTE ===');
  
  try {
    console.log('1. Request received for course ID:', req.params.id);
    console.log('2. Authenticated user ID:', req.user.id);

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid course ID format');
      return res.status(400).json({ message: "Invalid course ID format" });
    }

    console.log('3. Searching for course...');
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email avatar"
    );

    console.log('4. Course found:', course ? `Yes - ${course.title}` : 'No');
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    console.log('5. Course instructor populated:', course.instructor ? 'Yes' : 'No');

    // Check enrollment
    console.log('6. Checking enrollment...');
    const isEnrolled = course.studentsEnrolled.some(
      studentId => studentId.toString() === req.user.id.toString()
    );
    const isInstructor = course.instructor._id.toString() === req.user.id.toString();

    console.log('7. Enrollment status:', { isEnrolled, isInstructor });

    if (!isEnrolled && !isInstructor) {
      console.log('❌ User not enrolled and not instructor');
      return res.status(403).json({ 
        message: "You are not enrolled in this course" 
      });
    }

    console.log('8. User authorized, processing curriculum...');

    // Process the curriculum with embedded lessons
    let curriculumWithLessons = [];
    
    if (course.curriculum && course.curriculum.length > 0) {
      console.log('9. Processing curriculum sections:', course.curriculum.length);
      
      curriculumWithLessons = course.curriculum.map((section, sectionIndex) => {
        console.log(`Section ${sectionIndex}: "${section.title}" with ${section.lessons?.length || 0} lessons`);
        
        // Process each lesson in the section
        const processedLessons = (section.lessons || []).map((lesson, lessonIndex) => {
          // Extract YouTube ID if videoUrl is a YouTube URL (for frontend compatibility)
          const extractYouTubeId = (url) => {
            if (!url) return '';
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : '';
          };

          const youtubeId = extractYouTubeId(lesson.videoUrl);

          return {
            _id: lesson._id || `lesson-${sectionIndex}-${lessonIndex}`,
            title: lesson.title || `Lesson ${lessonIndex + 1}`,
            description: lesson.description || '',
            videoUrl: lesson.videoUrl,
            duration: lesson.duration || 0,
            order: lesson.order || lessonIndex,
            isPreview: lesson.isPreview || false,
            content: lesson.content || '',
            resources: lesson.resources || [],
            // Add fields that your frontend expects - but make them optional
            videoType: youtubeId ? 'youtube' : (lesson.videoUrl ? 'upload' : ''),
            videoId: youtubeId || ''
          };
        });

        return {
          _id: section._id || `section-${sectionIndex}`,
          title: section.title,
          description: section.description,
          order: section.order || sectionIndex,
          lessons: processedLessons
        };
      });
    } else {
      console.log('9. No curriculum found');
      curriculumWithLessons = [];
    }

    console.log('10. Final curriculum sections:', curriculumWithLessons.length);

    // Prepare response
    const response = {
      _id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      curriculum: curriculumWithLessons,
      totalHours: course.totalHours || 0,
      // Add course access info for frontend
      accessInfo: {
        isEnrolled,
        isInstructor,
        canEdit: isInstructor
      }
    };

    console.log('11. Sending successful response');
    console.log('=== END /learn ROUTE (SUCCESS) ===');
    
    res.json(response);

  } catch (error) {
    console.error('❌ ERROR in /learn route:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('=== END /learn ROUTE (ERROR) ===');
    
    res.status(500).json({ 
      message: "Failed to load course content", 
      error: error.message
    });
  }
});

// PUT /api/courses/:id - Update course (instructor only - owner)
router.put("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this course" });
    }

    const {
      title,
      description,
      price,
      category,
      level,
      isPublished,
      thumbnail,
      curriculum,
    } = req.body;

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
    await course.populate("instructor", "name email avatar");

    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (err) {
    console.error("Update course error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/courses/:id - Delete course (instructor only - owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    // Also delete progress records for this course
    await Progress.deleteMany({ courseId: req.params.id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses/instructor/my-courses - Get instructor's ALL courses (published + unpublished)
router.get("/instructor/my-courses", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can access this" });
    }

    // Show ALL courses for the instructor (both published and unpublished)
    const courses = await Course.find({ instructor: req.user.id })
      .populate("instructor", "name email avatar")
      .populate("studentsEnrolled", "name")
      .sort({ createdAt: -1 });

    // Add enrolled count to each course
    const coursesWithCount = courses.map((course) => ({
      ...course.toObject(),
      enrolledCount: course.studentsEnrolled.length,
    }));

    res.json(coursesWithCount);
  } catch (err) {
    console.error("Get instructor courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/courses/:id/enroll - Enroll in a course (student only)
router.post("/:id/enroll", auth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can enroll in courses" });
    }

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res
        .status(400)
        .json({ message: "Cannot enroll in unpublished course" });
    }

    // Check if already enrolled
    if (course.studentsEnrolled.includes(req.user.id)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
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
      totalTimeSpent: 0,
    });
    await progress.save();

    res.json({
      message: "Successfully enrolled in course",
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        instructor: course.instructor,
        thumbnail: course.thumbnail,
      },
    });
  } catch (err) {
    console.error("Enrollment error:", err);

    if (err.name === "CastError") {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/courses/instructor/course/:id - Get course for editing (instructor only)
router.get("/instructor/course/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can access this" });
    }

    console.log("Fetching course for editing:", req.params.id);

    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar")
      .populate("studentsEnrolled", "name");

    if (!course) {
      console.log("Course not found for editing");
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is the course instructor
    if (course.instructor._id.toString() !== req.user.id) {
      console.log("User not authorized to edit this course");
      return res
        .status(403)
        .json({ message: "Not authorized to access this course" });
    }

    console.log("Sending course data for editing");
    res.json(course);
  } catch (err) {
    console.error("Get instructor course error:", err);

    if (err.name === "CastError") {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(500).json({ message: "Server error" });
  }
});


// ===== UPDATED CURRICULUM ROUTE =====
router.put('/:id/curriculum', auth, async (req, res) => {
  try {
    console.log('🎯 Curriculum save request received');
    console.log('Course ID:', req.params.id);

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    const { curriculum } = req.body;

    console.log('📦 Curriculum data received:', JSON.stringify(curriculum, null, 2));

    // Basic validation
    if (!curriculum || !Array.isArray(curriculum)) {
      return res.status(400).json({ message: 'Invalid curriculum data' });
    }

    // Transform data to match your Course model
    // IMPORTANT: Remove temporary _id fields so MongoDB generates new ones
const transformedCurriculum = curriculum.map((section, sectionIndex) => {
  const transformedSection = {
    title: section.title || 'Untitled Section',
    description: section.description || '',
    order: section.order !== undefined ? section.order : sectionIndex,
    lessons: (section.lessons || []).map((lesson, lessonIndex) => {
      // Build videoUrl from videoId if using YouTube - MAKE IT OPTIONAL
      let videoUrl = '';
      if (lesson.videoType === 'youtube' && lesson.videoId) {
        videoUrl = `https://www.youtube.com/watch?v=${lesson.videoId}`;
      } else if (lesson.videoUrl) {
        videoUrl = lesson.videoUrl;
      }
      // If no video data, leave videoUrl empty - THIS IS VALID

      return {
        title: lesson.title || 'Untitled Lesson',
        description: lesson.description || '',
        videoUrl: videoUrl, // Can be empty string for new lessons
        duration: parseInt(lesson.duration) || 0, // Ensure it's a number
        order: lesson.order !== undefined ? lesson.order : lessonIndex,
        isPreview: Boolean(lesson.isPreview), // Ensure boolean
        content: lesson.content || '',
        resources: lesson.resources || []
      };
    })
  };

  // Only include _id if it's a valid MongoDB ObjectId (not a temporary one)
  if (section._id && mongoose.Types.ObjectId.isValid(section._id) && !section._id.toString().startsWith('section-')) {
    transformedSection._id = section._id;
  }

  return transformedSection;
});

    console.log('🔄 Transformed curriculum:', JSON.stringify(transformedCurriculum, null, 2));

    // Update course
    course.curriculum = transformedCurriculum;
    
    // Recalculate total hours
    course.calculateTotalHours();
    
    // Save course
    await course.save();

    // Reload the course to get the new MongoDB-generated _ids
    await course.populate('instructor', 'name email avatar');

    console.log('✅ Curriculum saved successfully for course:', course.title);
    console.log('📋 Saved curriculum with IDs:', JSON.stringify(course.curriculum, null, 2));

    res.json({ 
      success: true,
      message: 'Curriculum saved successfully',
      curriculum: course.curriculum // Return the curriculum with real MongoDB IDs
    });

  } catch (error) {
    console.error('❌ Error saving curriculum:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to save curriculum', 
      error: error.message
    });
  }
});


// ===== GRANULAR CURRICULUM ENDPOINTS =====

// POST /api/courses/:id/sections - Create new section
router.post('/:id/sections', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    const newSection = course.addSection(req.body);
    course.calculateTotalHours();
    await course.save();

    res.json({
      success: true,
      message: 'Section created successfully',
      section: newSection
    });

  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create section', 
      error: error.message 
    });
  }
});

// PUT /api/courses/:id/sections/:sectionId - Update section
router.put('/:id/sections/:sectionId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    const updatedSection = course.updateSection(req.params.sectionId, req.body);
    await course.save();

    res.json({
      success: true,
      message: 'Section updated successfully',
      section: updatedSection
    });

  } catch (error) {
    console.error('Update section error:', error);
    
    if (error.message === 'Section not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Section not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update section', 
      error: error.message 
    });
  }
});

// DELETE /api/courses/:id/sections/:sectionId - Delete section
router.delete('/:id/sections/:sectionId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    course.deleteSection(req.params.sectionId);
    course.calculateTotalHours();
    await course.save();

    res.json({
      success: true,
      message: 'Section deleted successfully'
    });

  } catch (error) {
    console.error('Delete section error:', error);
    
    if (error.message === 'Section not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Section not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete section', 
      error: error.message 
    });
  }
});

// POST /api/courses/:id/sections/:sectionId/lessons - Add lesson to section
router.post('/:id/sections/:sectionId/lessons', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    // Validate lesson data
    const validationErrors = course.validateLesson(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Lesson validation failed',
        errors: validationErrors
      });
    }

    // Transform video data for your model
    const lessonData = { ...req.body };
    
    // Build videoUrl from videoId if provided
    if (req.body.videoType === 'youtube' && req.body.videoId) {
      lessonData.videoUrl = `https://www.youtube.com/watch?v=${req.body.videoId}`;
    }

    const newLesson = course.addLesson(req.params.sectionId, lessonData);
    course.calculateTotalHours();
    await course.save();

    res.json({
      success: true,
      message: 'Lesson created successfully',
      lesson: newLesson
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    
    if (error.message === 'Section not found') {
      return res.status(404).json({ 
        success: false,
        message: 'Section not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create lesson', 
      error: error.message 
    });
  }
});



const deleteVideoFile = (videoFile) => {
  if (!videoFile?.filename) return;
  
  try {
    const uploadsDir = 'uploads/videos';
    const filePath = path.join(uploadsDir, videoFile.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('✅ Deleted old video file:', videoFile.filename);
    }
  } catch (error) {
    console.error('❌ Error deleting video file:', error);
  }
};

// PUT /api/courses/:id/sections/:sectionId/lessons/:lessonId - Update specific lesson
router.put('/:id/sections/:sectionId/lessons/:lessonId', auth, async (req, res) => {
  try {
    console.log('📥 Updating lesson:', req.params.lessonId);
    console.log('📦 Update data received:', req.body);

    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    // Get the existing lesson data BEFORE updating
    const section = course.curriculum.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    const oldLesson = section.lessons.id(req.params.lessonId);
    if (!oldLesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    console.log('📋 Old lesson data:', {
      videoType: oldLesson.videoType,
      videoId: oldLesson.videoId,
      videoUrl: oldLesson.videoUrl,
      hasVideoFile: !!oldLesson.videoFile
    });

    // 🔥 NEW: Check if we need to delete old video
    const newVideoType = req.body.videoType;
    const oldVideoType = oldLesson.videoType;

    // Case 1: Switching from upload to YouTube - delete old video
    if (oldVideoType === 'upload' && newVideoType === 'youtube' && oldLesson.videoFile) {
      console.log('🗑️ Switching to YouTube, deleting old uploaded video');
      deleteVideoFile(oldLesson.videoFile);
    }

    // Case 2: Replacing an uploaded video with a different upload
    if (oldVideoType === 'upload' && newVideoType === 'upload') {
      const oldFilename = oldLesson.videoFile?.filename;
      const newFilename = req.body.videoFile?.filename;
      
      if (oldFilename && newFilename && oldFilename !== newFilename) {
        console.log('🗑️ Replacing uploaded video, deleting old one');
        deleteVideoFile(oldLesson.videoFile);
      }
    }

    // Validate lesson data
    const validationErrors = course.validateLesson(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Lesson validation failed',
        errors: validationErrors
      });
    }

    // Prepare update data
    const updates = {
      title: req.body.title,
      description: req.body.description,
      duration: req.body.duration,
      videoType: req.body.videoType,
      videoId: req.body.videoId || '',
      videoUrl: req.body.videoUrl || '',
      videoFile: req.body.videoFile || null,
      isPreview: req.body.isPreview,
      content: req.body.content,
      resources: req.body.resources,
      order: req.body.order
    };

    console.log('📤 Applying updates:', updates);

    // Update the lesson
    const updatedLesson = course.updateLesson(
      req.params.sectionId, 
      req.params.lessonId, 
      updates
    );

    // Recalculate total hours
    course.calculateTotalHours();
    
    // Save course
    await course.save();

    console.log('✅ Lesson updated successfully');
    console.log('🔍 Updated lesson videoUrl:', updatedLesson.videoUrl);

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });

  } catch (error) {
    console.error('❌ Update lesson error:', error);
    
    if (error.message === 'Section not found' || error.message === 'Lesson not found') {
      return res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update lesson', 
      error: error.message 
    });
  }
});

// DELETE /api/courses/:id/sections/:sectionId/lessons/:lessonId - Delete specific lesson
router.delete('/:id/sections/:sectionId/lessons/:lessonId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    course.deleteLesson(req.params.sectionId, req.params.lessonId);
    course.calculateTotalHours();
    await course.save();

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    
    if (error.message === 'Section not found' || error.message === 'Lesson not found') {
      return res.status(404).json({ 
        success: false,
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete lesson', 
      error: error.message 
    });
  }
});

// MOVE endpoints for reordering
router.put('/:id/sections/:sectionId/move', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    const { direction } = req.body; // 'up' or 'down'
    course.moveSection(req.params.sectionId, direction);
    await course.save();

    res.json({
      success: true,
      message: `Section moved ${direction} successfully`
    });

  } catch (error) {
    console.error('Move section error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to move section', 
      error: error.message 
    });
  }
});

router.put('/:id/sections/:sectionId/lessons/:lessonId/move', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this course' });
    }

    const { direction } = req.body; // 'up' or 'down'
    course.moveLesson(req.params.sectionId, req.params.lessonId, direction);
    await course.save();

    res.json({
      success: true,
      message: `Lesson moved ${direction} successfully`
    });

  } catch (error) {
    console.error('Move lesson error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to move lesson', 
      error: error.message 
    });
  }
});

module.exports = router;