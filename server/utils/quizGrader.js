// utils/quizGrader.js - NEW FILE
const evaluateMultipleChoice = (studentAnswer, correctAnswer, question) => {
  return studentAnswer.selectedOption === correctAnswer;
};

const evaluateTheory = (studentAnswer, correctAnswer, question) => {
  const studentText = (studentAnswer.textAnswer || '').trim().toLowerCase();
  const expectedText = (correctAnswer || '').trim().toLowerCase();
  
  // Basic keyword matching for theory questions
  let keywordMatches = 0;
  if (question.expectedKeywords && question.expectedKeywords.length > 0) {
    question.expectedKeywords.forEach(keyword => {
      if (studentText.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    });
    
    const keywordScore = keywordMatches / question.expectedKeywords.length;
    return keywordScore >= 0.6; // 60% keyword match passes
  }
  
  // Fallback: exact match (case insensitive)
  return studentText === expectedText;
};

const evaluateQuiz = (submittedAnswers, quizQuestions) => {
  console.log('🔍 Starting evaluation...');
  console.log('📝 Submitted answers:', submittedAnswers);
  console.log('❓ Quiz questions count:', quizQuestions.length);
  
  let correctAnswers = 0;
  let totalPoints = 0;
  let earnedPoints = 0;

  const evaluatedAnswers = submittedAnswers.map((answer, index) => {
    console.log(`📊 Evaluating question ${index}...`);
    const question = quizQuestions[index];
    totalPoints += question.points || 1;
    
    let isCorrect = false;
    
    if (question.type === 'multiple_choice') {
      console.log(`🔍 Multiple choice - selected: ${answer.selectedOption}, correct: ${question.correctAnswer}`);
      isCorrect = answer.selectedOption === question.correctAnswer;
    } else {
      console.log(`🔍 Theory question - evaluating text`);
      const studentAnswer = (answer.textAnswer || '').trim().toLowerCase();
      const correctAnswer = (question.correctAnswer || '').trim().toLowerCase();
      isCorrect = studentAnswer === correctAnswer;
    }
    
    if (isCorrect) {
      correctAnswers++;
      earnedPoints += question.points || 1;
    }
    
    console.log(`✅ Question ${index} result: ${isCorrect ? 'Correct' : 'Incorrect'}`);
    
    return {
      ...answer,
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation
    };
  });

  const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  
  console.log('✅ Evaluation completed - Score:', score);
  return {
    evaluatedAnswers,
    score: Math.round(score * 10) / 10,
    correctAnswers,
    totalQuestions: quizQuestions.length,
    earnedPoints,
    totalPoints
  };
};

module.exports = { evaluateQuiz, evaluateMultipleChoice, evaluateTheory };