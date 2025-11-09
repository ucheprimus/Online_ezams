// client/src/components/instructor/QuizStatistics.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Table, ProgressBar, Badge, Alert, Spinner } from 'react-bootstrap';

const QuizStatistics = () => {
  const { quizId } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizStats();
  }, [quizId]);

  const fetchQuizStats = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/stats`);
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load quiz statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading statistics...</span>
      </Spinner>
    </div>
  );

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!stats) return <Alert variant="info">No statistics available</Alert>;

  return (
    <div className="quiz-statistics">
      <h2 className="mb-4">Quiz Statistics</h2>
      
      {/* Overview Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="text-primary">{stats.totalSubmissions}</h3>
              <p className="text-muted mb-0">Total Submissions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.averagePercentage}%</h3>
              <p className="text-muted mb-0">Average Score</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.passRate}%</h3>
              <p className="text-muted mb-0">Pass Rate</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body className="text-center">
              <h3 className="text-info">
                {stats.questionStats.filter(q => q.difficulty === 'Hard').length}
              </h3>
              <p className="text-muted mb-0">Hard Questions</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Score Distribution */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Score Distribution</h5>
        </Card.Header>
        <Card.Body>
          {stats.scoreDistribution.map((range, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>{range.range}%</span>
                <span>{range.count} students</span>
              </div>
              <ProgressBar 
                now={(range.count / stats.totalSubmissions) * 100} 
                variant={
                  range.range === '90-100' ? 'success' :
                  range.range === '80-89' ? 'info' :
                  range.range === '70-79' ? 'warning' :
                  range.range === '60-69' ? 'primary' : 'danger'
                }
              />
            </div>
          ))}
        </Card.Body>
      </Card>

      {/* Question Analysis */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Question Analysis</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Question</th>
                <th>Accuracy</th>
                <th>Correct Answers</th>
                <th>Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {stats.questionStats.map((question, index) => (
                <tr key={index}>
                  <td>Q{question.questionIndex + 1}: {question.questionText}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        now={question.accuracy} 
                        style={{ width: '80px' }}
                        className="me-2"
                        variant={
                          question.accuracy >= 80 ? 'success' :
                          question.accuracy >= 60 ? 'warning' : 'danger'
                        }
                      />
                      {Math.round(question.accuracy)}%
                    </div>
                  </td>
                  <td>{question.correctAnswers}/{stats.totalSubmissions}</td>
                  <td>
                    <Badge 
                      bg={
                        question.difficulty === 'Easy' ? 'success' :
                        question.difficulty === 'Medium' ? 'warning' : 'danger'
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Student Submissions */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Student Submissions</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {stats.submissions.map((submission, index) => (
                <tr key={index}>
                  <td>{submission.studentName}</td>
                  <td>{submission.score}/{submission.totalPoints}</td>
                  <td>
                    <Badge 
                      bg={
                        submission.percentage >= 90 ? 'success' :
                        submission.percentage >= 70 ? 'primary' :
                        submission.percentage >= 60 ? 'warning' : 'danger'
                      }
                    >
                      {submission.percentage}%
                    </Badge>
                  </td>
                  <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <style>{`
        .quiz-statistics {
          padding: 2rem;
        }
        .stat-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        @media (max-width: 768px) {
          .quiz-statistics {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizStatistics;