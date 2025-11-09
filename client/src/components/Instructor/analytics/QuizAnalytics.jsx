// client/src/components/Instructor/analytics/QuizAnalytics.jsx
import { Card, Row, Col, Table, Badge, ProgressBar, Alert } from 'react-bootstrap';

const QuizAnalytics = ({ data }) => {
  const { quizStats = [], questionStats = [], totalAttempts, totalQuizzes } = data;

  const getScoreVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getDifficulty = (accuracy) => {
    if (accuracy >= 80) return { text: 'Easy', variant: 'success' };
    if (accuracy >= 60) return { text: 'Medium', variant: 'warning' };
    return { text: 'Hard', variant: 'danger' };
  };

  return (
    <Row className="g-4">
      {/* Quiz Performance Overview */}
      <Col lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Header className="bg-white border-0">
            <h6 className="mb-0">
              <i className="bi bi-patch-question me-2 text-primary"></i>
              Quiz Performance
            </h6>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-4">
              <div className="display-4 fw-bold text-primary">{totalQuizzes || 0}</div>
              <p className="text-muted mb-0">Total Quizzes</p>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Total Attempts:</span>
              <strong>{totalAttempts || 0}</strong>
            </div>
            
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Avg Pass Rate:</span>
              <strong>
                {quizStats.length > 0 
                  ? Math.round(quizStats.reduce((sum, quiz) => sum + quiz.passRate, 0) / quizStats.length) 
                  : 0
                }%
              </strong>
            </div>
            
            <div className="d-flex justify-content-between">
              <span className="text-muted">Avg Score:</span>
              <strong>
                {quizStats.length > 0 
                  ? Math.round(quizStats.reduce((sum, quiz) => sum + quiz.averageScore, 0) / quizStats.length) 
                  : 0
                }%
              </strong>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Quiz Statistics Table */}
      <Col lg={8}>
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h6 className="mb-0">
              <i className="bi bi-list-check me-2 text-primary"></i>
              Quiz Statistics
            </h6>
          </Card.Header>
          <Card.Body>
            {quizStats.length > 0 ? (
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th>Pass Rate</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizStats.map((quiz, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-patch-question text-primary me-2"></i>
                            <span className="fw-medium">{quiz.title}</span>
                          </div>
                        </td>
                        <td>
                          <Badge bg="secondary">{quiz.totalAttempts}</Badge>
                        </td>
                        <td>
                          <Badge bg={getScoreVariant(quiz.averageScore)}>
                            {quiz.averageScore}%
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={getScoreVariant(quiz.passRate)}>
                            {quiz.passRate}%
                          </Badge>
                        </td>
                        <td style={{ width: '120px' }}>
                          <ProgressBar 
                            now={quiz.passRate} 
                            variant={getScoreVariant(quiz.passRate)}
                            style={{ height: '6px' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="info" className="text-center mb-0">
                <i className="bi bi-info-circle me-2"></i>
                {totalQuizzes === 0 ? 'No quizzes created yet.' : 'No quiz data available yet.'}
              </Alert>
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Question Difficulty Analysis */}
      {questionStats.length > 0 && (
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h6 className="mb-0">
                <i className="bi bi-bar-chart me-2 text-primary"></i>
                Question Difficulty Analysis
              </h6>
            </Card.Header>
            <Card.Body>
              <Row>
                {questionStats.map((question, index) => {
                  const difficulty = getDifficulty(question.accuracy);
                  return (
                    <Col key={index} md={6} lg={4} className="mb-3">
                      <Card className="border h-100">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">Q{question.questionIndex + 1}</h6>
                            <Badge bg={difficulty.variant}>
                              {difficulty.text}
                            </Badge>
                          </div>
                          
                          <div className="mb-2">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <span>Accuracy</span>
                              <span>{question.accuracy}%</span>
                            </div>
                            <ProgressBar 
                              now={question.accuracy} 
                              variant={difficulty.variant}
                              style={{ height: '4px' }}
                            />
                          </div>
                          
                          <div className="d-flex justify-content-between small text-muted">
                            <span>
                              {question.correctAnswers}/{question.totalAttempts} correct
                            </span>
                            <span>
                              {Math.round((question.correctAnswers / question.totalAttempts) * 100)}%
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      )}

      <style>{`
        .table th {
          border-top: none;
          font-weight: 600;
          color: #6c757d;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .progress {
          background-color: #e9ecef;
          border-radius: 4px;
        }
      `}</style>
    </Row>
  );
};

export default QuizAnalytics;