// server/routes/quizStats.js
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');

// Get quiz statistics for instructors
router.get('/:quizId/stats', async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get all submissions for this quiz
    const submissions = await QuizSubmission.find({ quiz: quizId })
      .populate('student', 'name email')
      .populate('quiz', 'title totalPoints');
    
    if (submissions.length === 0) {
      return res.json({
        totalSubmissions: 0,
        averageScore: 0,
        passRate: 0,
        questionStats: [],
        scoreDistribution: []
      });
    }

    // Calculate basic stats
    const totalSubmissions = submissions.length;
    const averageScore = submissions.reduce((sum, sub) => sum + sub.score, 0) / totalSubmissions;
    const passRate = (submissions.filter(sub => sub.score >= 70).length / totalSubmissions) * 100;

    // Calculate question-level statistics
    const questionStats = [];
    if (submissions[0].quiz.questions) {
      submissions[0].quiz.questions.forEach((question, qIndex) => {
        const correctAnswers = submissions.filter(sub => 
          sub.answers[qIndex]?.isCorrect
        ).length;
        
        questionStats.push({
          questionIndex: qIndex,
          questionText: question.questionText.substring(0, 50) + '...',
          correctAnswers,
          accuracy: (correctAnswers / totalSubmissions) * 100,
          difficulty: correctAnswers / totalSubmissions >= 0.8 ? 'Easy' : 
                     correctAnswers / totalSubmissions >= 0.6 ? 'Medium' : 'Hard'
        });
      });
    }

    // Score distribution
    const scoreRanges = [
      { range: '90-100', min: 90, max: 100, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '70-79', min: 70, max: 79, count: 0 },
      { range: '60-69', min: 60, max: 69, count: 0 },
      { range: '0-59', min: 0, max: 59, count: 0 }
    ];

    submissions.forEach(sub => {
      const percentage = (sub.score / sub.quiz.totalPoints) * 100;
      const range = scoreRanges.find(r => percentage >= r.min && percentage <= r.max);
      if (range) range.count++;
    });

    res.json({
      totalSubmissions,
      averageScore: Math.round(averageScore),
      averagePercentage: Math.round((averageScore / submissions[0].quiz.totalPoints) * 100),
      passRate: Math.round(passRate),
      questionStats,
      scoreDistribution: scoreRanges,
      submissions: submissions.map(sub => ({
        studentName: sub.student.name,
        score: sub.score,
        totalPoints: sub.quiz.totalPoints,
        percentage: Math.round((sub.score / sub.quiz.totalPoints) * 100),
        submittedAt: sub.submittedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;