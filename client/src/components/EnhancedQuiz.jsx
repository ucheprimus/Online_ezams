// components/EnhancedQuiz.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, ProgressBar, Badge, Spinner } from 'react-bootstrap';

const EnhancedQuiz = ({ quiz, onSubmit, onQuizComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // For multiple choice: {0: "2", 1: "0"}
  const [textAnswers, setTextAnswers] = useState({}); // For text answers: {2: "My answer"}
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer for time spent and time limit
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = async () => {
    if (!isSubmitted && !submitting) {
      await handleSubmit();
    }
  };

  const handleAnswerSelect = (value) => {
    const currentQ = quiz.questions[currentQuestion];
    
    if (currentQ.type === 'multiple_choice') {
      setSelectedAnswers(prev => ({
        ...prev,
        [currentQuestion]: value.toString() // Store as string "0", "1", "2", "3"
      }));
    } else {
      setTextAnswers(prev => ({
        ...prev,
        [currentQuestion]: value // Store just the text
      }));
    }
  };

const handleSubmit = async () => {
  // Create raw answers from current student selections
  const rawAnswers = quiz.questions.map((question, index) => {
    if (question.type === 'multiple_choice') {
      return {
        questionIndex: index,
        selectedOption: selectedAnswers[index] || '' // Just the selected option
      };
    } else {
      return {
        questionIndex: index,
        textAnswer: textAnswers[index] || '' // Just the text answer
      };
    }
  });

  console.log('📤 Sending raw answers to backend:', rawAnswers);
  console.log('📤 Raw answers type:', typeof rawAnswers);
  console.log('📤 Raw answers stringified:', JSON.stringify(rawAnswers));

  // Check if all questions are answered
  const allAnswered = rawAnswers.every(answer => {
    if (quiz.questions[answer.questionIndex].type === 'multiple_choice') {
      return answer.selectedOption !== '';
    } else {
      return answer.textAnswer !== '';
    }
  });

  if (!allAnswered) {
    alert('Please answer all questions before submitting.');
    return;
  }

  setSubmitting(true);
  try {
    // Send RAW answers to backend - ensure it's a proper array
    const result = await onSubmit(rawAnswers, timeSpent);
    setResults(result);
    setIsSubmitted(true);
    
    // Auto-complete lesson if quiz passed
    if (result.passed && onQuizComplete) {
      onQuizComplete(result);
    }
  } catch (error) {
    alert('Error submitting quiz: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).length : 0;
  };

  // Helper to check if a question is answered
  const isQuestionAnswered = (index) => {
    const question = quiz.questions[index];
    if (question.type === 'multiple_choice') {
      return selectedAnswers[index] !== undefined && selectedAnswers[index] !== '';
    } else {
      return textAnswers[index] !== undefined && textAnswers[index] !== '';
    }
  };

  // Show loading state
  if (submitting) {
    return (
      <Card className="text-center py-4">
        <Card.Body>
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Submitting your quiz...</p>
        </Card.Body>
      </Card>
    );
  }

  // Show results after submission
  if (isSubmitted && results) {
    return (
      <Card className="quiz-results">
        <Card.Header className={`text-white ${results.passed ? 'bg-success' : 'bg-danger'}`}>
          <h4 className="mb-0">
            {results.passed ? '🎉 Quiz Passed!' : '❌ Quiz Failed'}
          </h4>
        </Card.Header>
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className={results.passed ? 'text-success' : 'text-danger'}>
              {results.score.toFixed(1)}%
            </h2>
            <p>
              <strong>Correct Answers:</strong> {results.correctAnswers} / {results.totalQuestions}
            </p>
            <p>
              <strong>Points:</strong> {results.earnedPoints} / {results.totalPoints}
            </p>
            <p>
              <strong>Attempt:</strong> {results.attemptNumber} of {results.maxAttempts}
            </p>
            <p>
              <strong>Time Spent:</strong> {formatTime(timeSpent)}
            </p>
            
            {results.passed ? (
              <Alert variant="success" className="mt-3">
                <strong>Congratulations!</strong> You passed the quiz and completed this lesson.
              </Alert>
            ) : (
              <Alert variant="warning" className="mt-3">
                <strong>Need {quiz.passingScore}% to pass.</strong>{' '}
                {results.attemptNumber < results.maxAttempts 
                  ? 'You can try again!' 
                  : 'Maximum attempts reached.'
                }
              </Alert>
            )}
          </div>

          <div className="answers-review">
            <h5>Answer Review</h5>
            {quiz.questions.map((question, index) => {
              const answer = results.evaluatedAnswers?.[index];
              const isCorrect = answer?.isCorrect;
              
              return (
                <Card key={index} className="mb-3 border">
                  <Card.Header className={`bg-${isCorrect ? 'success' : 'danger'} text-white`}>
                    <strong>Question {index + 1}</strong> 
                    <Badge bg="light" text="dark" className="ms-2">
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </Card.Header>
                  <Card.Body>
                    <p><strong>{question.question}</strong></p>
                    
                    <div className={isCorrect ? 'text-success' : 'text-danger'}>
                      <strong>Your answer:</strong>{' '}
                      {question.type === 'multiple_choice' 
                        ? question.options[answer?.selectedOption]
                        : answer?.textAnswer || 'No answer provided'
                      }
                    </div>

                    {!isCorrect && (
                      <div className="text-success mt-2">
                        <strong>Correct answer:</strong>{' '}
                        {question.type === 'multiple_choice'
                          ? question.options[question.correctAnswer]
                          : question.correctAnswer
                        }
                      </div>
                    )}

                    {question.explanation && (
                      <Alert variant="info" className="mt-2 mb-0">
                        <strong>Explanation:</strong> {question.explanation}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Show active quiz
  const currentQuestionData = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;
  const allQuestionsAnswered = quiz.questions.every((_, index) => isQuestionAnswered(index));

  return (
    <Card className="quiz-container">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-1">{quiz.title}</h5>
          {quiz.description && (
            <small className="text-muted">{quiz.description}</small>
          )}
        </div>
        <div className="text-end">
          <Badge bg={timeLeft < 60 ? 'danger' : 'primary'} className="me-2">
            Time Left: {formatTime(timeLeft)}
          </Badge>
          <Badge bg="secondary">
            {currentQuestion + 1}/{quiz.questions.length}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Progress Bar */}
        <ProgressBar 
          now={((currentQuestion + 1) / quiz.questions.length) * 100} 
          className="mb-3" 
        />

        {/* Current Question */}
        <div className="question-section">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h6 className="mb-0 flex-grow-1">{currentQuestionData.question}</h6>
            <Badge bg="outline-primary">
              {currentQuestionData.points || 1} point{currentQuestionData.points !== 1 ? 's' : ''}
            </Badge>
          </div>

          {currentQuestionData.type === 'multiple_choice' ? (
            <div className="options-section">
              {currentQuestionData.options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  name={`question-${currentQuestion}`}
                  label={option}
                  checked={selectedAnswers[currentQuestion] === index.toString()}
                  onChange={() => handleAnswerSelect(index)}
                  className="mb-2 p-2 border rounded option-item"
                />
              ))}
            </div>
          ) : (
            <Form.Group>
              <Form.Label>
                Your Answer {currentQuestionData.minWords > 0 && 
                  `(Minimum ${currentQuestionData.minWords} words)`
                }
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={textAnswers[currentQuestion] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                placeholder="Type your detailed answer here..."
                className="answer-textarea"
              />
              {currentQuestionData.minWords > 0 && (
                <Form.Text className="text-muted">
                  Word count: {getWordCount(textAnswers[currentQuestion] || '')} / {currentQuestionData.minWords}
                </Form.Text>
              )}
              {currentQuestionData.caseSensitive && (
                <Form.Text className="text-warning">
                  * Case sensitive
                </Form.Text>
              )}
            </Form.Group>
          )}
        </div>

        {/* Navigation */}
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="outline-primary"
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              variant={allQuestionsAnswered ? "success" : "secondary"}
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Next Question
            </Button>
          )}
        </div>

        {/* Question Progress Dots */}
        <div className="d-flex justify-content-center mt-3 flex-wrap">
          {quiz.questions.map((_, index) => (
            <div
              key={index}
              className={`progress-dot mx-1 ${index === currentQuestion ? 'active' : ''} ${isQuestionAnswered(index) ? 'answered' : ''}`}
              onClick={() => setCurrentQuestion(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: index === currentQuestion ? '#007bff' : 
                                isQuestionAnswered(index) ? '#28a745' : '#dee2e6',
                cursor: 'pointer'
              }}
            />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default EnhancedQuiz;