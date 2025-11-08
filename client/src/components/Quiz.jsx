// components/Quiz.jsx
import React, { useState, useEffect } from 'react';

const Quiz = ({ quiz, onSubmit, userAttempts }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionIndex: currentQuestion,
      selectedOption: optionIndex
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== quiz.questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    try {
      const result = await onSubmit(answers, timeSpent);
      setResults(result);
      setIsSubmitted(true);
    } catch (error) {
      alert('Error submitting quiz: ' + error.message);
    }
  };

  const currentQuestionData = quiz.questions[currentQuestion];

  if (isSubmitted && results) {
    return (
      <div className="quiz-results">
        <h3>Quiz Results</h3>
        <div className={`result-card ${results.passed ? 'passed' : 'failed'}`}>
          <h4>{results.passed ? '🎉 Congratulations!' : '😞 Try Again'}</h4>
          <p>Score: {results.score.toFixed(1)}%</p>
          <p>Correct: {results.correctAnswers} out of {results.totalQuestions}</p>
          <p>Time Spent: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</p>
          {results.passed ? (
            <p>You passed the quiz!</p>
          ) : (
            <p>You need {quiz.passingScore}% to pass. Keep practicing!</p>
          )}
        </div>
        
        <div className="answers-review">
          <h4>Answer Review</h4>
          {quiz.questions.map((question, index) => (
            <div key={index} className="question-review">
              <p><strong>Q{index + 1}:</strong> {question.question}</p>
              <p className={answers[index]?.selectedOption === question.correctAnswer ? 'correct' : 'incorrect'}>
                Your answer: {question.options[answers[index]?.selectedOption]}
                {answers[index]?.selectedOption !== question.correctAnswer && (
                  <span> (Correct: {question.options[question.correctAnswer]})</span>
                )}
              </p>
              {question.explanation && (
                <p className="explanation">Explanation: {question.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h3>{quiz.title}</h3>
        <div className="quiz-info">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>Time: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
        </div>
      </div>

      <div className="question-card">
        <h4>{currentQuestionData.question}</h4>
        <div className="options-list">
          {currentQuestionData.options.map((option, index) => (
            <div
              key={index}
              className={`option ${answers[currentQuestion]?.selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-marker">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="quiz-navigation">
        <button onClick={handlePrevious} disabled={currentQuestion === 0}>
          Previous
        </button>
        
        {currentQuestion === quiz.questions.length - 1 ? (
          <button 
            onClick={handleSubmit}
            className="submit-btn"
            disabled={answers.length !== quiz.questions.length}
          >
            Submit Quiz
          </button>
        ) : (
          <button onClick={handleNext}>
            Next
          </button>
        )}
      </div>

      <div className="progress-indicator">
        {quiz.questions.map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index === currentQuestion ? 'active' : ''} ${answers[index] ? 'answered' : ''}`}
            onClick={() => setCurrentQuestion(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Quiz;