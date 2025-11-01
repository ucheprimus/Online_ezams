import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-primary text-white py-5" style={{ minHeight: '80vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h1 className="display-3 fw-bold mb-4">Welcome to LearnHub</h1>
            <p className="lead mb-4">Your gateway to unlimited learning opportunities</p>
            
            <div className="d-flex justify-content-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Button as={Link} to="/signup" variant="light" size="lg">
                    Get Started
                  </Button>
                  <Button as={Link} to="/login" variant="outline-light" size="lg">
                    Login
                  </Button>
                </>
              ) : (
                <Button as={Link} to="/dashboard" variant="light" size="lg">
                  Go to Dashboard
                </Button>
              )}
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <Card className="bg-white bg-opacity-10 text-white border-0 h-100">
              <Card.Body>
                <h3>📚 Rich Content</h3>
                <p>Access thousands of courses from expert instructors</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="bg-white bg-opacity-10 text-white border-0 h-100">
              <Card.Body>
                <h3>🎯 Track Progress</h3>
                <p>Monitor your learning journey with detailed analytics</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="bg-white bg-opacity-10 text-white border-0 h-100">
              <Card.Body>
                <h3>🏆 Get Certified</h3>
                <p>Earn certificates upon course completion</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;