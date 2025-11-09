// client/src/pages/PaymentSuccess.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [course, setCourse] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState('processing');

  const paymentIntentId = searchParams.get('payment_intent');
  const courseId = searchParams.get('course_id');

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/payment-success${window.location.search}`);
      return;
    }
    processPaymentSuccess();
  }, [paymentIntentId, courseId, user]);

const processPaymentSuccess = async () => {
  try {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    
    // Always try to confirm enrollment if we have a course ID
    if (courseId) {
      const response = await axios.post(
        'http://localhost:5000/api/payments/confirm-enrollment',
        { 
          courseId,
          paymentIntentId: paymentIntentId || 'free_course'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setEnrollmentStatus('success');
        
        // Fetch course details for display
        const courseResponse = await axios.get(
          `http://localhost:5000/api/courses/${courseId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCourse(courseResponse.data);
      } else {
        setEnrollmentStatus('failed');
        setError(response.data.message || 'Enrollment failed');
      }
    } else {
      // No course ID - just show success
      setEnrollmentStatus('success');
    }

  } catch (err) {
    console.error('Payment success processing error:', err);
    setEnrollmentStatus('failed');
    setError(err.response?.data?.message || 'Failed to process enrollment');
  } finally {
    setLoading(false);
  }
};

  const handleStartLearning = () => {
    if (courseId) {
      navigate(`/learn/${courseId}`);
    } else {
      navigate('/dashboard/my-courses');
    }
  };

  const handleBrowseCourses = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <Container fluid className="payment-success-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-4 fw-bold text-primary">Processing Your Enrollment</h4>
          <p className="text-muted mt-3">
            Please wait while we confirm your payment and enroll you in the course...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="payment-success-container px-2 px-md-4 py-3 py-md-4">
      <Row className="justify-content-center">
        <Col lg={6} md={8}>
          <Card className="border-0 shadow-sm success-card">
            <Card.Body className="text-center p-4 p-md-5">
              
              {enrollmentStatus === 'success' ? (
                <>
                  {/* Success Icon */}
                  <div className="success-icon mb-4">
                    <div className="success-circle">
                      <i className="bi bi-check-lg"></i>
                    </div>
                  </div>

                  {/* Success Message */}
                  <h2 className="fw-bold text-success mb-3">Payment Successful!</h2>
                  <p className="lead text-muted mb-4">
                    Thank you for your purchase. You have been successfully enrolled in the course.
                  </p>

                  {/* Course Details */}
                  {course && (
                    <Card className="border-success bg-light mb-4">
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center">
                          <img
                            src={course.thumbnail || 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=80&h=80&fit=crop'}
                            alt={course.title}
                            className="course-thumbnail me-3 rounded"
                            style={{ width: '60px', height: '45px', objectFit: 'cover' }}
                          />
                          <div className="text-start">
                            <h6 className="fw-bold mb-1">{course.title}</h6>
                            <p className="text-muted mb-0 small">by {course.instructor?.name}</p>
                            <div className="mt-1">
                              <span className="badge bg-primary me-2">{course.level}</span>
                              <span className="badge bg-secondary">{course.totalHours || '10'} hours</span>
                            </div>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  )}

                  {/* Action Buttons */}
                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <Button 
                      variant="success" 
                      size="lg"
                      onClick={handleStartLearning}
                      className="px-4"
                    >
                      <i className="bi bi-play-circle me-2"></i>
                      Start Learning Now
                    </Button>
                    <Button 
                      variant="outline-primary" 
                      size="lg"
                      onClick={handleBrowseCourses}
                      className="px-4"
                    >
                      <i className="bi bi-search me-2"></i>
                      Browse More Courses
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-5 pt-3 border-top">
                    <h6 className="fw-bold mb-3">What's Next?</h6>
                    <Row className="text-start">
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-play-btn-fill text-primary me-3 mt-1"></i>
                          <div>
                            <h6 className="fw-bold mb-1">Access Course Content</h6>
                            <p className="text-muted small mb-0">
                              Start watching videos and complete lessons at your own pace.
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-download text-primary me-3 mt-1"></i>
                          <div>
                            <h6 className="fw-bold mb-1">Download Resources</h6>
                            <p className="text-muted small mb-0">
                              Access downloadable materials and resources for each lesson.
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-chat-dots text-primary me-3 mt-1"></i>
                          <div>
                            <h6 className="fw-bold mb-1">Join Community</h6>
                            <p className="text-muted small mb-0">
                              Participate in discussions and connect with other students.
                            </p>
                          </div>
                        </div>
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-award text-primary me-3 mt-1"></i>
                          <div>
                            <h6 className="fw-bold mb-1">Get Certificate</h6>
                            <p className="text-muted small mb-0">
                              Complete the course to receive your certificate of completion.
                            </p>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </>
              ) : (
                <>
                  {/* Error State */}
                  <div className="error-icon mb-4">
                    <div className="error-circle">
                      <i className="bi bi-x-lg"></i>
                    </div>
                  </div>

                  <h2 className="fw-bold text-danger mb-3">Enrollment Failed</h2>
                  
                  {error && (
                    <Alert variant="danger" className="mb-4">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <p className="text-muted mb-4">
                    We encountered an issue while processing your enrollment. 
                    Please try again or contact support if the problem persists.
                  </p>

                  <div className="d-grid gap-2 d-md-flex justify-content-center">
                    <Button 
                      variant="primary" 
                      size="lg"
                      onClick={() => navigate(-1)}
                      className="px-4"
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Go Back
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="lg"
                      onClick={() => navigate('/courses')}
                      className="px-4"
                    >
                      <i className="bi bi-search me-2"></i>
                      Browse Courses
                    </Button>
                  </div>

                  {/* Support Information */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold mb-2">Need Help?</h6>
                    <p className="text-muted small mb-2">
                      If you continue to experience issues, please contact our support team.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      <Button variant="outline-primary" size="sm" as={Link} to="/contact">
                        <i className="bi bi-envelope me-1"></i>
                        Contact Support
                      </Button>
                      <Button variant="outline-info" size="sm" as={Link} to="/help">
                        <i className="bi bi-question-circle me-1"></i>
                        Help Center
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Receipt Information */}
              {enrollmentStatus === 'success' && paymentIntentId && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold mb-2">Payment Receipt</h6>
                  <p className="text-muted small mb-0">
                    Payment ID: <code>{paymentIntentId}</code>
                  </p>
                  <p className="text-muted small mb-0">
                    A receipt has been sent to your email address.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Quick Access Cards */}
          {enrollmentStatus === 'success' && (
            <Row className="mt-4">
              <Col md={4} className="mb-3">
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-3">
                    <i className="bi bi-collection-play display-6 text-primary mb-3"></i>
                    <h6 className="fw-bold">My Courses</h6>
                    <p className="text-muted small mb-2">
                      Access all your enrolled courses
                    </p>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      as={Link} 
                      to="/dashboard/my-courses"
                    >
                      View Courses
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-3">
                    <i className="bi bi-download display-6 text-success mb-3"></i>
                    <h6 className="fw-bold">Resources</h6>
                    <p className="text-muted small mb-2">
                      Download course materials
                    </p>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      as={Link} 
                      to="/dashboard/resources"
                    >
                      Get Resources
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="border-0 shadow-sm h-100 text-center">
                  <Card.Body className="p-3">
                    <i className="bi bi-share display-6 text-info mb-3"></i>
                    <h6 className="fw-bold">Share</h6>
                    <p className="text-muted small mb-2">
                      Share this course with friends
                    </p>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => {
                        const courseUrl = `${window.location.origin}/courses/${courseId}`;
                        navigator.clipboard.writeText(courseUrl);
                        alert('Course link copied to clipboard!');
                      }}
                    >
                      Share Course
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentSuccess;