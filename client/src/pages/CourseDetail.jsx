// client/src/pages/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Alert, 
  Spinner,
  Accordion,
  Tab,
  Tabs,
  Modal
} from 'react-bootstrap';
import axios from 'axios';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  // Default thumbnails for fallback
  const defaultThumbnails = {
    'web-dev': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
    'data-science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    'mobile-dev': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
    'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    'marketing': 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop',
    'music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop',
    'photography': 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop',
    'default': 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop'
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'web-dev': 'Web Development',
      'data-science': 'Data Science',
      'mobile-dev': 'Mobile Development',
      'design': 'Design',
      'business': 'Business',
      'marketing': 'Marketing',
      'music': 'Music',
      'photography': 'Photography'
    };
    return categoryMap[category] || category;
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(
        `http://localhost:5000/api/courses/${id}`
      );
      
      setCourse(response.data);
    } catch (err) {
      console.error('Full fetch error:', err);
      
      if (err.response?.status === 404) {
        setError('Course not found. It may be unpublished or deleted.');
      } else {
        setError('Failed to load course. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    // Check if already enrolled
    const isEnrolled = course?.studentsEnrolled?.some(student => 
      student._id === user.id || student === user.id
    );
    
    if (isEnrolled) {
      navigate(`/learn/${course._id}`);
      return;
    }

    // Only students can enroll
    if (!isStudent) {
      setError('Only students can enroll in courses');
      return;
    }

    // Show enrollment modal for free courses, redirect to payment for paid courses
    if (course.price === 0) {
      setShowEnrollmentModal(true);
    } else {
      // For paid courses, redirect to payment page
      navigate(`/checkout/${course._id}`);
    }
  };

  const handleFreeEnrollment = async () => {
    try {
      setEnrollLoading(true);
      const token = localStorage.getItem("token");
      
      // Use the direct enrollment endpoint
      const response = await axios.post(
        `http://localhost:5000/api/courses/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state to show enrolled
        setCourse(prev => ({
          ...prev,
          studentsEnrolled: [...(prev.studentsEnrolled || []), user.id],
          enrolledCount: (prev.enrolledCount || prev.studentsEnrolled?.length || 0) + 1
        }));

        setShowEnrollmentModal(false);
        navigate(`/learn/${course._id}`);
      }
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrollLoading(false);
    }
  };

  // Check if user is enrolled
  const isEnrolled = course?.studentsEnrolled?.some(student => 
    student._id === user?.id || student === user?.id
  );

  // Get enrollment button text
  const getEnrollmentButtonText = () => {
    if (!course?.isPublished) return 'Course Not Published';
    if (isEnrolled) return 'Go to Course';
    if (!user) return 'Sign Up to Enroll';
    if (!isStudent) return 'Instructors Cannot Enroll';
    
    return course.price === 0 ? 'Enroll for Free' : `Enroll for $${course.price}`;
  };

  // Check if enrollment button should be disabled
  const isEnrollmentDisabled = !course?.isPublished || !user || !isStudent || isEnrolled;

  if (loading) {
    return (
      <Container fluid className="course-detail-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course...</p>
        </div>
      </Container>
    );
  }

  if (error && !course) {
    return (
      <Container fluid className="course-detail-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
          <Button onClick={() => navigate('/courses')} variant="primary" className="mt-3">
            Browse All Courses
          </Button>
        </div>
      </Container>
    );
  }

  // If course exists but is unpublished and user is not owner, show not found
  if (course && !course.isPublished && (!user || user.id !== course.instructor?._id)) {
    return (
      <Container fluid className="course-detail-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Alert variant="warning">
            <i className="bi bi-eye-slash me-2"></i>
            This course is not published yet.
          </Alert>
          <Button onClick={() => navigate('/courses')} variant="primary" className="mt-3">
            Browse Published Courses
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="course-detail-container px-2 px-md-4 py-3 py-md-4">
        {/* Header Section */}
        <Row className="g-3 g-md-4">
          <Col xs={12}>
            <div className="course-header mb-3 mb-md-4 p-3 p-md-4 rounded bg-light">
              {!course.isPublished && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-eye-slash me-2"></i>
                  This course is unpublished. Only you can see this page.
                </Alert>
              )}
              
              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Badge bg="primary" className="fs-6">
                  {getCategoryDisplayName(course.category)}
                </Badge>
                <Badge bg={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'} className="fs-6 text-capitalize">
                  {course.level}
                </Badge>
                {isEnrolled && (
                  <Badge bg="success" className="fs-6">
                    <i className="bi bi-check-circle me-1"></i>
                    Enrolled
                  </Badge>
                )}
                {course.price === 0 && (
                  <Badge bg="info" className="fs-6">
                    <i className="bi bi-gift me-1"></i>
                    Free
                  </Badge>
                )}
              </div>
              
              <h1 className="course-title h2 h1-md fw-bold mb-3">{course.title}</h1>
              <p className="course-description lead fs-6 fs-md-5 mb-4">{course.description}</p>
              
              <div className="course-meta d-flex flex-wrap gap-3 gap-md-4 mb-3">
                <div className="meta-item d-flex align-items-center">
                  <i className="bi bi-person me-2 fs-5"></i>
                  <span className="fw-medium">Instructor: {course.instructor?.name || 'Unknown'}</span>
                </div>
                <div className="meta-item d-flex align-items-center">
                  <i className="bi bi-people me-2 fs-5"></i>
                  <span className="fw-medium">{course.enrolledCount || course.studentsEnrolled?.length || 0} students</span>
                </div>
                <div className="meta-item d-flex align-items-center">
                  <i className="bi bi-star-fill me-2 text-warning fs-5"></i>
                  <span className="fw-medium">{course.averageRating || 'Not rated'}</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-3 g-md-4">
          {/* Main Content */}
          <Col lg={8}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="p-0">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="course-tabs px-3 px-md-4 pt-3"
                  fill
                >
                  <Tab eventKey="overview" title="Overview">
                    <div className="p-3 p-md-4">
                      <div className="what-youll-learn mb-4">
                        <h4 className="fw-bold mb-3">What you'll learn</h4>
                        <Row>
                          <Col md={6}>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Comprehensive understanding of {getCategoryDisplayName(course.category)}
                              </li>
                              <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Practical skills and real-world applications
                              </li>
                            </ul>
                          </Col>
                          <Col md={6}>
                            <ul className="list-unstyled">
                              <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Expert guidance from experienced instructor
                              </li>
                              <li className="mb-2">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                Hands-on projects and exercises
                              </li>
                            </ul>
                          </Col>
                        </Row>
                      </div>

                      <div className="course-content">
                        <h4 className="fw-bold mb-3">Course Content</h4>
                        {course.curriculum && course.curriculum.length > 0 ? (
                          <Accordion flush>
                            {course.curriculum.map((section, index) => (
                              <Accordion.Item key={section._id || index} eventKey={index.toString()}>
                                <Accordion.Header>
                                  <div className="d-flex justify-content-between align-items-center w-100 me-3">
                                    <span className="fw-medium">{section.title}</span>
                                    <Badge bg="secondary" className="ms-2">
                                      {section.lessons?.length || 0} lessons
                                    </Badge>
                                  </div>
                                </Accordion.Header>
                                <Accordion.Body>
                                  <ul className="list-unstyled mb-0">
                                    {section.lessons?.map((lesson, lessonIndex) => (
                                      <li key={lesson._id || lessonIndex} className="py-2 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                          <span>
                                            <i className={`bi ${lesson.isPreview ? 'bi-eye' : 'bi-play-circle'} me-2 ${lesson.isPreview ? 'text-warning' : 'text-primary'}`}></i>
                                            {lesson.title}
                                            {lesson.isPreview && (
                                              <Badge bg="warning" className="ms-2" text="dark">
                                                Preview
                                              </Badge>
                                            )}
                                          </span>
                                          <small className="text-muted">{lesson.duration || '10 min'}</small>
                                        </div>
                                        {lesson.description && (
                                          <small className="text-muted d-block mt-1">
                                            {lesson.description}
                                          </small>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </Accordion.Body>
                              </Accordion.Item>
                            ))}
                          </Accordion>
                        ) : (
                          <Alert variant="info">
                            <i className="bi bi-info-circle me-2"></i>
                            Course content is being prepared by the instructor.
                          </Alert>
                        )}
                      </div>
                    </div>
                  </Tab>

                  <Tab eventKey="reviews" title="Reviews">
                    <div className="p-3 p-md-4">
                      <div className="reviews-summary mb-4 text-center">
                        <h2 className="fw-bold text-primary mb-2">{course.averageRating || '0.0'}</h2>
                        <div className="mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`bi bi-star${star <= Math.floor(course.averageRating || 0) ? '-fill' : ''} text-warning me-1`}
                            ></i>
                          ))}
                        </div>
                        <p className="text-muted">
                          Based on {course.reviews?.length || 0} reviews
                        </p>
                      </div>

                      <div className="reviews-list">
                        {(course.reviews || []).map((review, index) => (
                          <Card key={review._id || index} className="mb-3 border-0 bg-light">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="fw-bold mb-1">{review.user?.name || 'Anonymous'}</h6>
                                  <div>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <i
                                        key={star}
                                        className={`bi bi-star${star <= review.rating ? '-fill' : ''} text-warning me-1`}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                              <p className="mb-0">{review.comment}</p>
                            </Card.Body>
                          </Card>
                        ))}

                        {(!course.reviews?.length) && (
                          <div className="text-center py-4">
                            <i className="bi bi-chat-quote display-4 text-muted mb-3"></i>
                            <p className="text-muted">No reviews yet. Be the first to review this course!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <div className="sticky-sidebar">
              <Card className="enrollment-card border-0 shadow-sm mb-3">
                <Card.Img 
                  variant="top" 
                  src={course.thumbnail || defaultThumbnails[course.category] || defaultThumbnails.default}
                  className="enrollment-thumbnail"
                  onError={(e) => {
                    e.target.src = defaultThumbnails[course.category] || defaultThumbnails.default;
                  }}
                />
                <Card.Body className="p-3 p-md-4">
                  <div className="price-section text-center mb-3">
                    <h3 className={`price fw-bold mb-2 ${course.price === 0 ? 'text-success' : 'text-primary'}`}>
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </h3>
                    {!course.isPublished && (
                      <Badge bg="warning" className="mt-1">
                        <i className="bi bi-eye-slash me-1"></i>
                        Unpublished
                      </Badge>
                    )}
                    {isEnrolled && (
                      <Badge bg="success" className="mt-1">
                        <i className="bi bi-check-circle me-1"></i>
                        Enrolled
                      </Badge>
                    )}
                    {course.price === 0 && !isEnrolled && (
                      <Badge bg="info" className="mt-1">
                        <i className="bi bi-gift me-1"></i>
                        Free Forever
                      </Badge>
                    )}
                  </div>
                  
                  {/* Enrollment Button */}
                  <Button 
                    variant={isEnrolled ? "success" : course.price === 0 ? "info" : "primary"}
                    size="lg" 
                    className="w-100 mb-3 fw-bold py-2"
                    onClick={isEnrolled ? () => navigate(`/learn/${course._id}`) : handleEnrollClick}
                    disabled={isEnrollmentDisabled || enrollLoading}
                  >
                    {enrollLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Enrolling...
                      </>
                    ) : (
                      getEnrollmentButtonText()
                    )}
                  </Button>

                  <div className="course-features">
                    <div className="feature-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-bar-chart me-2 text-primary"></i>
                        Level
                      </span>
                      <Badge bg={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'} className="text-capitalize">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="feature-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-clock me-2 text-primary"></i>
                        Duration
                      </span>
                      <span className="fw-medium">{course.totalHours || '10'} hours</span>
                    </div>
                    <div className="feature-item d-flex justify-content-between align-items-center py-2 border-bottom">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-people me-2 text-primary"></i>
                        Students
                      </span>
                      <span className="fw-medium">{course.enrolledCount || course.studentsEnrolled?.length || 0}</span>
                    </div>
                    <div className="feature-item d-flex justify-content-between align-items-center py-2">
                      <span className="d-flex align-items-center">
                        <i className="bi bi-star me-2 text-primary"></i>
                        Rating
                      </span>
                      <span className="fw-medium">{course.averageRating || 'Not rated'}</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Instructor Card */}
              <Card className="instructor-card border-0 shadow-sm">
                <Card.Body className="p-3">
                  <h5 className="fw-bold mb-3">About the Instructor</h5>
                  <div className="d-flex align-items-start">
                    <img
                      src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
                      alt={course.instructor?.name}
                      className="instructor-avatar rounded-circle me-3"
                    />
                    <div>
                      <h6 className="fw-bold mb-1">{course.instructor?.name || 'Unknown Instructor'}</h6>
                      <p className="text-muted small mb-2">
                        {course.instructor?.bio || 'Experienced instructor in this field'}
                      </p>
                      <div className="d-flex text-muted small">
                        <span className="me-3">
                          <i className="bi bi-people me-1"></i>
                          {course.instructor?.studentsCount || '100+'} students
                        </span>
                        <span>
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          {course.instructor?.averageRating || '4.5'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Free Enrollment Modal */}
      <Modal show={showEnrollmentModal} onHide={() => setShowEnrollmentModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enroll in {course?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <div className="success-icon mb-3">
            <i className="bi bi-gift-fill text-success" style={{ fontSize: '3rem' }}></i>
          </div>
          <h5 className="fw-bold text-success mb-3">Free Course Enrollment</h5>
          <p className="text-muted mb-4">
            This course is completely free! Click the button below to enroll immediately 
            and start learning right away.
          </p>
          
          {error && (
            <Alert variant="danger" className="mb-3">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          <div className="d-grid gap-2">
            <Button 
              variant="success" 
              size="lg"
              onClick={handleFreeEnrollment}
              disabled={enrollLoading}
            >
              {enrollLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enrolling...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Enroll for Free
                </>
              )}
            </Button>
            <Button 
              variant="outline-secondary"
              onClick={() => setShowEnrollmentModal(false)}
              disabled={enrollLoading}
            >
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CourseDetail;