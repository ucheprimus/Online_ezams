// client/src/components/instructor/QuizAnalytics.jsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, ListGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const QuizAnalytics = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    fetchInstructorQuizzes();
  }, []);

  const fetchInstructorQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes/instructor/my-quizzes');
      const data = await response.json();
      if (response.ok) {
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  return (
    <div className="quiz-analytics">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quiz Analytics</h2>
        <Button variant="primary" as={Link} to="/dashboard/create-quiz">
          Create New Quiz
        </Button>
      </div>

      <Row>
        {quizzes.map(quiz => (
          <Col md={6} lg={4} key={quiz._id} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{quiz.title}</Card.Title>
                <Card.Text className="text-muted">
                  {quiz.course?.title || 'No Course'}
                </Card.Text>
                
                <div className="mb-3">
                  <Badge bg="primary" className="me-2">
                    {quiz.questions?.length || 0} Questions
                  </Badge>
                  <Badge bg="success">
                    {quiz.totalPoints} Points
                  </Badge>
                </div>

                <ListGroup variant="flush" className="mb-3">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Submissions:</span>
                    <Badge bg="info">{quiz.submissionCount || 0}</Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Avg Score:</span>
                    <Badge bg="warning">{quiz.averageScore || 0}%</Badge>
                  </ListGroup.Item>
                </ListGroup>

                <Button 
                  as={Link} 
                  to={`/dashboard/quiz-stats/${quiz._id}`}
                  variant="outline-primary" 
                  className="w-100"
                >
                  View Detailed Statistics
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {quizzes.length === 0 && (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No quizzes created yet</h5>
            <p className="text-muted">Create your first quiz to see analytics</p>
            <Button as={Link} to="/dashboard/create-quiz" variant="primary">
              Create Quiz
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default QuizAnalytics;