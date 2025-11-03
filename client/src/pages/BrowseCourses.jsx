// client/src/pages/BrowseCourses.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Form, 
  InputGroup,
  Pagination,
  Spinner,
  Alert,
  Modal
} from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./BrowseCourses.css";

// Payment Modal Component for Paid Courses
const PaymentModal = ({ show, onHide, course, onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Add null check for course
  if (!course) {
    return null; // Or return a loading state
  }

  const handleFreeEnrollment = async () => {
    try {
      setProcessing(true);
      setError('');
      const token = localStorage.getItem("token");
      
      await axios.post(
        `http://localhost:5000/api/courses/${course._id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess();
      onHide();
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaidEnrollment = () => {
    // For now, we'll redirect to course details page where payment is handled
    // In a real app, you'd integrate Stripe payment flow here
    window.location.href = `/courses/${course._id}`;
  };

  return (
    <Modal show={show && course} onHide={onHide} centered> {/* Added course check */}
      <Modal.Header closeButton>
        <Modal.Title>Enroll in {course.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="enrollment-icon mb-3">
          {course.price === 0 ? (
            <i className="bi bi-gift-fill text-success" style={{ fontSize: '3rem' }}></i>
          ) : (
            <i className="bi bi-credit-card text-primary" style={{ fontSize: '3rem' }}></i>
          )}
        </div>
        
        <h5 className="fw-bold mb-3">
          {course.price === 0 ? 'Free Enrollment' : `Enroll for $${course.price}`}
        </h5>
        
        <p className="text-muted mb-4">
          {course.price === 0 
            ? 'This course is completely free! Click below to enroll immediately.'
            : 'Complete the payment process to enroll in this course.'}
        </p>

        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="d-grid gap-2">
          {course.price === 0 ? (
            <Button 
              variant="success" 
              size="lg"
              onClick={handleFreeEnrollment}
              disabled={processing}
            >
              {processing ? (
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
          ) : (
            <Button 
              variant="primary" 
              size="lg"
              onClick={handlePaidEnrollment}
            >
              <i className="bi bi-credit-card me-2"></i>
              Proceed to Payment
            </Button>
          )}
          
          <Button 
            variant="outline-secondary"
            onClick={onHide}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

const BrowseCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Filter and search state
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: '',
    sort: 'newest'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 9
  });

  // Available categories and levels
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web-dev', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-dev', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Default thumbnails
  const defaultThumbnails = {
    'web-dev': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop',
    'data-science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
    'mobile-dev': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop',
    'design': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop',
    'business': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
    'marketing': 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop',
    'default': 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop'
  };

  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      });

      // Remove empty values to avoid sending 'undefined'
      if (!filters.search) params.delete('search');
      if (!filters.category) params.delete('category');
      if (!filters.level) params.delete('level');
      if (!filters.sort) params.delete('sort');

      const response = await axios.get(`http://localhost:5000/api/courses?${params}`);
      
      setCourses(response.data.courses || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || 0,
        limit: pagination.limit
      });
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnrollClick = (course) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate(`/login?redirect=/dashboard/browse`);
      return;
    }

    // Check if already enrolled
    const isEnrolled = course?.studentsEnrolled?.some(student => 
      student._id === user.id || student === user.id
    );
    
    if (isEnrolled) {
      setError('You are already enrolled in this course!');
      return;
    }

    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  const handleEnrollmentSuccess = () => {
    // Update local state to show enrolled
    if (selectedCourse) {
      setCourses(prev => prev.map(course => 
        course._id === selectedCourse._id 
          ? { ...course, isEnrolled: true }
          : course
      ));
    }
    setSelectedCourse(null);
    setShowPaymentModal(false);
    setError('');
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'web-dev': 'Web Development',
      'data-science': 'Data Science',
      'mobile-dev': 'Mobile Development',
      'design': 'Design',
      'business': 'Business',
      'marketing': 'Marketing'
    };
    return categoryMap[category] || category;
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      level: '',
      search: '',
      sort: 'newest'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= pagination.totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pagination.currentPage}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: number }))}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <div className="pagination-container">
        <Pagination>
          <Pagination.Prev
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          />
          {items}
          <Pagination.Next
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          />
        </Pagination>
      </div>
    );
  };

  if (loading && courses.length === 0) {
    return (
      <Container fluid className="browse-courses-container px-3 px-md-4 py-4">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="browse-courses-container px-3 px-md-4 py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="page-title">Browse Courses</h1>
            <p className="page-subtitle">
              Discover and enroll in courses from expert instructors
            </p>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError("")} className="error-alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Filters and Search */}
        <Card className="filter-card mb-4 border-0">
          <Card.Body className="p-4">
            <Row className="g-3">
              {/* Search */}
              <Col md={4}>
                <Form onSubmit={handleSearch}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Search courses..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      <i className="bi bi-search"></i>
                    </Button>
                  </InputGroup>
                </Form>
              </Col>

              {/* Category Filter */}
              <Col md={3}>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* Level Filter */}
              <Col md={2}>
                <Form.Select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* Sort Options */}
              <Col md={3}>
                <Form.Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Results Count */}
        <div className="results-count mb-3">
          <p className="text-muted">
            Showing {courses.length} of {pagination.total} courses
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="empty-card border-0">
            <Card.Body className="text-center py-5">
              <div className="empty-icon mb-3">🔍</div>
              <h4 className="empty-title">No courses found</h4>
              <p className="empty-description">
                Try adjusting your filters or search terms to find more courses.
              </p>
              <Button
                variant="outline-primary"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Row>
              {courses.map((course) => (
                <Col key={course._id} lg={4} md={6} className="mb-4">
                  <Card className="course-card h-100 border-0">
                    <div className="course-thumbnail">
                      <img
                        src={
                          course.thumbnail && course.thumbnail.trim() !== '' 
                            ? course.thumbnail 
                            : (defaultThumbnails[course.category] || defaultThumbnails.default)
                        }
                        alt={course.title}
                        className={!course.thumbnail ? "fallback-image" : ""}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultThumbnails[course.category] || defaultThumbnails.default;
                          e.target.className = "fallback-image";
                        }}
                      />
                      {course.isEnrolled && (
                        <div className="enrolled-overlay">
                          <Badge className="enrolled-badge">
                            <i className="bi bi-check-circle me-1"></i>
                            Enrolled
                          </Badge>
                        </div>
                      )}
                    </div>

                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg="primary" className="category-badge">
                          {getCategoryDisplayName(course.category)}
                        </Badge>
                        <Badge bg="secondary" className="level-badge">
                          {course.level}
                        </Badge>
                      </div>

                      <h5 className="course-title">{course.title}</h5>
                      <p className="course-description">
                        {course.description.length > 100
                          ? course.description.substring(0, 100) + "..."
                          : course.description}
                      </p>

                      <div className="course-instructor mb-3">
                        <i className="bi bi-person me-2 text-muted"></i>
                        <small className="text-muted">
                          By {course.instructor?.name || 'Instructor'}
                        </small>
                      </div>

                      <div className="course-stats mb-3">
                        <div className="stat-item">
                          <i className="bi bi-star-fill text-warning"></i>
                          <span>{course.averageRating || "4.5"}</span>
                        </div>
                        <div className="stat-item">
                          <i className="bi bi-people text-muted"></i>
                          <span>{course.enrolledCount || '0'} students</span>
                        </div>
                        <div className="stat-item">
                          <i className="bi bi-clock text-muted"></i>
                          <span>{course.totalHours || '10'} hours</span>
                        </div>
                      </div>

                      <div className="course-footer d-flex justify-content-between align-items-center">
                        <div className="course-price">
                          {course.price === 0 ? (
                            <span className="text-success fw-bold">Free</span>
                          ) : (
                            <span className="fw-bold">${course.price}</span>
                          )}
                        </div>
                        
                        {course.isEnrolled ? (
                          <Button
                            variant="success"
                            size="sm"
                            as={Link}
                            to={`/learn/${course._id}`}
                            className="enrolled-btn"
                          >
                            <i className="bi bi-play-circle me-1"></i>
                            Continue
                          </Button>
                        ) : (
                          <Button
                            variant={course.price === 0 ? "success" : "primary"}
                            size="sm"
                            onClick={() => handleEnrollClick(course)}
                            className="enroll-btn"
                          >
                            {course.price === 0 ? (
                              <>
                                <i className="bi bi-gift me-1"></i>
                                Enroll Free
                              </>
                            ) : (
                              <>
                                <i className="bi bi-credit-card me-1"></i>
                                Enroll Now
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </Container>

      {/* Payment/Enrollment Modal - Only render if selectedCourse exists */}
      {selectedCourse && (
        <PaymentModal
          show={showPaymentModal}
          onHide={() => setShowPaymentModal(false)}
          course={selectedCourse}
          onSuccess={handleEnrollmentSuccess}
        />
      )}
    </>
  );
};

export default BrowseCourses;