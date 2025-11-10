// routes/quizzes.js
const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const { auth } = require("../middleware/auth");
const axios = require("axios"); // ADD THIS FOR PROGRESS INTEGRATION


// FIXED: Enhanced Auto-grading function with proper field handling
const evaluateQuiz = (submittedAnswers, quizQuestions) => {
  console.log("🔍 Starting evaluation...");
  console.log("📝 Submitted answers:", submittedAnswers);
  console.log("❓ Quiz questions count:", quizQuestions.length);

  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const evaluatedAnswers = submittedAnswers.map((answer, index) => {
    console.log(`📊 Evaluating question ${index}...`);
    const question = quizQuestions[index];
    totalPoints += question.points || 1;

    let isCorrect = false;

    if (question.type === "multiple_choice") {
      console.log(
        `🔍 Multiple choice - selected: ${answer.selectedOption}, correct: ${question.correctAnswer}`
      );
      isCorrect = answer.selectedOption === question.correctAnswer;
    } else {
      console.log(`🔍 Theory question - evaluating text`);
      const studentAnswer = (answer.textAnswer || "").trim().toLowerCase();
      const correctAnswer = (question.correctAnswer || "").trim().toLowerCase();
      isCorrect = studentAnswer === correctAnswer;
    }

    if (isCorrect) {
      correctAnswers++;
      earnedPoints += question.points || 1;
    }

    console.log(
      `✅ Question ${index} result: ${isCorrect ? "Correct" : "Incorrect"}`
    );

    // FIXED: Ensure all required fields are explicitly set
    return {
      questionIndex: index, // Explicitly set questionIndex
      selectedOption: answer.selectedOption || '',
      textAnswer: answer.textAnswer || '',
      isCorrect,
      correctAnswer: question.correctAnswer || '', // Ensure this is never undefined
      explanation: question.explanation || ''
    };
  });

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

  console.log("✅ Evaluation completed - Score:", score);
  return {
    evaluatedAnswers,
    score: Math.round(score * 10) / 10,
    correctAnswers,
    totalQuestions: quizQuestions.length,
    earnedPoints,
    totalPoints,
  };
};

// FIXED: Quiz attempt route with better validation
router.post("/:id/attempt", auth, async (req, res) => {
  console.log("⏰ Quiz submission started at:", new Date().toISOString());

  try {
    console.log("🎯 Backend received quiz attempt for:", req.params.id);
    console.log("👤 User:", req.user.id);

    let { answers, timeSpent, lessonId } = req.body;
    console.log("📦 Request data:", {
      answersCount: answers?.length,
      timeSpent,
      lessonId,
    });

    // Find the quiz
    console.log("🔍 Finding quiz...");
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      console.log("❌ Quiz not found");
      return res.status(404).json({ message: "Quiz not found" });
    }
    console.log("✅ Quiz found:", quiz.title);

    // Validate answers
    console.log("🔍 Validating answers...");
    if (
      !answers ||
      !Array.isArray(answers) ||
      answers.length !== quiz.questions.length
    ) {
      console.log("❌ Invalid answers format");
      return res.status(400).json({
        message: `Please answer all ${quiz.questions.length} questions`,
      });
    }
    console.log("✅ Answers validated");

    // Auto-grade the quiz
    console.log("📊 Starting auto-grading...");
    const evaluation = evaluateQuiz(answers, quiz.questions);
    console.log("✅ Auto-grading completed");

    const passed = evaluation.score >= quiz.passingScore;
    console.log("📈 Quiz result:", {
      score: evaluation.score,
      passed,
      correctAnswers: evaluation.correctAnswers,
      totalQuestions: evaluation.totalQuestions,
    });

    // Get attempt number
    console.log("🔍 Getting attempt number...");
    const previousAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: req.user.id,
    });
    const attemptNumber = previousAttempts + 1;
    console.log("✅ Attempt number:", attemptNumber);

    if (attemptNumber > quiz.maxAttempts) {
      console.log("❌ Max attempts exceeded");
      return res.status(400).json({
        message: `Maximum attempts (${quiz.maxAttempts}) exceeded`,
      });
    }

    // Save attempt
    console.log("💾 Saving quiz attempt...");

    // FIXED: Better validation before saving
    const formattedAnswers = evaluation.evaluatedAnswers.map((answer, index) => {
      // Validate that all required fields are present
      const validatedAnswer = {
        questionIndex: answer.questionIndex !== undefined ? answer.questionIndex : index,
        selectedOption: answer.selectedOption || '',
        textAnswer: answer.textAnswer || '',
        isCorrect: Boolean(answer.isCorrect),
        correctAnswer: answer.correctAnswer || '', // Ensure this is never undefined
        explanation: answer.explanation || ''
      };

      // Debug log for any missing fields
      if (!validatedAnswer.correctAnswer) {
        console.warn(`⚠️ Question ${index} has empty correctAnswer`);
      }

      return validatedAnswer;
    });

    console.log('📝 Formatted answers for saving:', formattedAnswers);

    // Final validation check
    const hasInvalidAnswers = formattedAnswers.some(answer => 
      answer.correctAnswer === undefined || 
      answer.questionIndex === undefined
    );

    if (hasInvalidAnswers) {
      console.error('❌ Invalid answers detected:', formattedAnswers);
      return res.status(400).json({
        message: 'Quiz configuration error: Some answers are missing required fields'
      });
    }

    const attempt = new QuizAttempt({
      studentId: req.user.id,
      quizId: quiz._id,
      lessonId: lessonId || quiz.lessonId,
      answers: formattedAnswers,
      score: evaluation.score,
      passed,
      timeSpent: timeSpent || 0,
      attemptNumber
    });

    await attempt.save();
    console.log("✅ Quiz attempt saved");

    // Auto-complete lesson if passed
    let progressUpdate = null;
    if (passed && quiz.isMandatory !== false) {
      console.log("🚀 Auto-completing lesson...");
      try {
        const progressResponse = await axios.post(
          `http://localhost:5000/api/progress/${quiz.courseId}/complete-lesson`,
          { lessonId: lessonId || quiz.lessonId },
          {
            headers: { Authorization: req.headers.authorization },
            timeout: 5000,
          }
        );
        progressUpdate = progressResponse.data;
        console.log("✅ Lesson auto-completed");
      } catch (progressError) {
        console.log(
          "⚠️ Could not auto-complete lesson:",
          progressError.message
        );
      }
    }

    console.log("⏰ Quiz submission completed at:", new Date().toISOString());

    res.json({
      success: true,
      score: evaluation.score,
      passed,
      correctAnswers: evaluation.correctAnswers,
      totalQuestions: evaluation.totalQuestions,
      earnedPoints: evaluation.earnedPoints,
      totalPoints: evaluation.totalPoints,
      attemptId: attempt._id,
      attemptNumber,
      maxAttempts: quiz.maxAttempts,
      evaluatedAnswers: evaluation.evaluatedAnswers,
      progressUpdate,
    });
  } catch (error) {
    console.error("❌ Quiz attempt error:", error);
    console.error("❌ Error stack:", error.stack);
    
    // More specific error messages
    let errorMessage = error.message;
    if (error.name === 'ValidationError') {
      errorMessage = 'Quiz validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ');
    }
    
    res.status(400).json({ 
      success: false,
      message: errorMessage 
    });
  }
});


// Create quiz (Instructor only)
router.post("/", auth, async (req, res) => {
  try {
    // Check if user is instructor
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can create quizzes" });
    }

    const quiz = new Quiz({
      ...req.body,
      instructorId: req.user.id,
    });

    await quiz.save();

    console.log("✅ Quiz created:", quiz.title);
    res.status(201).json(quiz);
  } catch (error) {
    console.error("❌ Create quiz error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/lesson/:lessonId", auth, async (req, res) => {
  try {
    console.log("🔍 Fetching quiz for lesson:", req.params.lessonId);
    console.log("👤 User ID:", req.user.id);

    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });

    if (!quiz) {
      console.log("❌ No quiz found for lesson:", req.params.lessonId);
      return res.status(200).json({
        success: false,
        exists: false,
        message: "No quiz available for this lesson",
      });
    }

    // Check if user has remaining attempts
    const previousAttempts = await QuizAttempt.countDocuments({
      quizId: quiz._id,
      studentId: req.user.id,
    });

    const remainingAttempts = Math.max(0, quiz.maxAttempts - previousAttempts);

    console.log("✅ Quiz found:", quiz.title);
    res.json({
      success: true,
      exists: true,
      ...quiz.toObject(),
      userAttempts: {
        previous: previousAttempts,
        remaining: remainingAttempts,
        canAttempt: remainingAttempts > 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// Get quiz attempts for student
router.get("/:id/attempts", auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      quizId: req.params.id,
      studentId: req.user.id,
    }).sort("-createdAt");

    res.json(attempts);
  } catch (error) {
    console.error("❌ Error fetching quiz attempts:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get student's best attempt for a quiz
router.get("/:id/best-attempt", auth, async (req, res) => {
  try {
    const bestAttempt = await QuizAttempt.findOne({
      quizId: req.params.id,
      studentId: req.user.id,
    }).sort("-score");

    res.json(bestAttempt);
  } catch (error) {
    console.error("Error fetching best attempt:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all quizzes for a course (instructor only)
router.get("/course/:courseId", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can access course quizzes" });
    }

    const quizzes = await Quiz.find({ courseId: req.params.courseId })
      .populate("lessonId", "title order")
      .sort("createdAt");

    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching course quizzes:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get single quiz by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("lessonId", "title")
      .populate("courseId", "title");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update quiz (instructor only)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can update quizzes" });
    }

    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    console.log("✅ Quiz updated:", quiz.title);
    res.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(400).json({ message: error.message });
  }
});

// Delete quiz (instructor only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can delete quizzes" });
    }

    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId: req.params.id });

    console.log("✅ Quiz deleted:", quiz.title);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get quiz statistics (instructor only)
router.get("/:id/statistics", auth, async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ message: "Only instructors can view statistics" });
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const attempts = await QuizAttempt.find({ quizId: req.params.id });

    const stats = {
      totalAttempts: attempts.length,
      averageScore:
        attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          attempts.length || 0,
      passRate:
        (attempts.filter((a) => a.passed).length / attempts.length) * 100 || 0,
      questionStats: quiz.questions.map((question, index) => {
        const correctCount = attempts.filter(
          (attempt) => attempt.answers[index]?.isCorrect
        ).length;
        return {
          question: question.question,
          correctRate: (correctCount / attempts.length) * 100 || 0,
          correctCount,
          totalAttempts: attempts.length,
        };
      }),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching quiz statistics:", error);
    res.status(500).json({ message: error.message });
  }
});

// Test route to verify quizzes API is working
router.get("/test/status", (req, res) => {
  console.log("✅ Quizzes API test route called");
  res.json({
    message: "✅ Quizzes API is working!",
    timestamp: new Date(),
    status: "OK",
    features: [
      "Multiple Choice Questions",
      "Theory/Text Questions",
      "Auto-grading",
      "Time Limits",
      "Attempt Limits",
      "Mandatory Lesson Completion",
      "Progress Integration",
    ],
  });
});

module.exports = router;
