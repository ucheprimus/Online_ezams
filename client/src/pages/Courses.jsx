import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Form, 
  Spinner,
  InputGroup,
  Alert,
  Pagination
} from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Courses.css';

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 12
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sort: 'newest'
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'web-dev', label: 'Web Development' },
    { value: 'data-science', label: 'Data Science' },
    { value: 'mobile-dev', label: 'Mobile Development' },
    { value: 'design', label: 'Design' },
    { value: 'business', label: 'Business' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'music', label: 'Music' },
    { value: 'photography', label: 'Photography' }
  ];

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters, pagination.currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', pagination.currentPage);
      params.append('limit', pagination.limit);

      const response = await axios.get(`http://localhost:5000/api/courses?${params.toString()}`);
      
      // Your backend already filters published courses, but let's double-check
      const publishedCourses = (response.data.courses || response.data || []).filter(course => 
        course.isPublished !== false // Ensure only published courses are shown
      );
      
      setCourses(publishedCourses);
      
      // Update pagination from backend response
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages || 1,
        total: response.data.total || publishedCourses.length
      }));
      
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchCourses();
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
      }

      await axios.post(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state to show enrolled
      setCourses(prev => prev.map(course => 
        course._id === courseId 
          ? { ...course, isEnrolled: true, enrolledCount: (course.enrolledCount || 0) + 1 }
          : course
      ));

      setError('');
      
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      sort: 'newest'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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

  const getLevelVariant = (level) => {
    const variants = {
      'beginner': 'success',
      'intermediate': 'warning',
      'advanced': 'danger'
    };
    return variants[level] || 'secondary';
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= pagination.totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === pagination.currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev 
            disabled={pagination.currentPage === 1}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          />
          {items}
          <Pagination.Next 
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  // Loading state
  if (loading && courses.length === 0) {
    return (
      <Container fluid className="courses-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading courses...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="courses-container px-3 px-md-4 py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="page-title h2 fw-bold">Browse Courses</h1>
          <p className="page-subtitle text-muted mb-0">Discover your next learning journey</p>
        </Col>
      </Row>

      {/* Filters Section */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-3 p-md-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-2 g-md-3 align-items-end">
              {/* Search */}
              <Col xs={12} md={6} lg={3}>
                <Form.Label className="form-label-sm fw-medium">Search</Form.Label>
                <InputGroup size="sm">
                  <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="border-end-0"
                  />
                  <Button 
                    variant="outline-primary" 
                    type="submit"
                    className="border-start-0"
                  >
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Col>

              {/* Category Filter */}
              <Col xs={6} md={3} lg={2}>
                <Form.Label className="form-label-sm fw-medium">Category</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Level Filter */}
              <Col xs={6} md={3} lg={2}>
                <Form.Label className="form-label-sm fw-medium">Level</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Sort Filter */}
              <Col xs={6} md={3} lg={2}>
                <Form.Label className="form-label-sm fw-medium">Sort By</Form.Label>
                <Form.Select
                  size="sm"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {sortOptions.map(sort => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Clear Filters Button */}
              <Col xs={6} md={3} lg={2}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={clearFilters}
                  className="w-100"
                >
                  Clear Filters
                </Button>
              </Col>

              {/* Submit Button for mobile */}
              <Col xs={12} className="d-md-none">
                <Button variant="primary" type="submit" className="w-100">
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Results Count */}
      <div className="results-count mb-3">
        <p className="text-muted">
          Showing {courses.length} of {pagination.total} courses
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 && !loading ? (
        <Card className="empty-card border-0 text-center py-5 shadow-sm">
          <Card.Body className="py-5">
            <div className="empty-icon mb-3" style={{ fontSize: '4rem' }}>📚</div>
            <h4 className="empty-title h5 fw-bold mb-2">No courses found</h4>
            <p className="empty-description text-muted mb-4">
              Try adjusting your search filters or browse all categories.
            </p>
            <Button 
              variant="primary" 
              onClick={clearFilters}
            >
              Clear All Filters
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row className="g-3 g-md-4">
            {courses.map((course) => (
              <Col 
                key={course._id} 
                xs={12} 
                sm={6} 
                lg={4} 
                xl={3}
                className="mb-3 mb-md-4"
              >
                <Card className="course-card h-100 border-0 shadow-sm hover-shadow">
                  <div className="course-thumbnail position-relative">
                    <img
                      src={course.thumbnail || `https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop`}
                      alt={course.title}
                      className="course-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop';
                      }}
                    />
                    <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                      <Badge bg="primary" className="category-badge">
                        {getCategoryDisplayName(course.category)}
                      </Badge>
                    </div>
                    
                    {/* Enrolled Badge */}
                    {course.isEnrolled && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Badge bg="success" className="enrolled-badge">
                          <i className="bi bi-check-circle me-1"></i>
                          Enrolled
                        </Badge>
                      </div>
                    )}
                  </div>

                  <Card.Body className="p-3 d-flex flex-column">
                    <div className="mb-2">
                      <Badge 
                        bg={getLevelVariant(course.level)} 
                        className="level-badge"
                      >
                        {course.level}
                      </Badge>
                    </div>

                    <h5 className="course-title h6 fw-bold mb-2 line-clamp-2">
                      {course.title}
                    </h5>
                    
                    <p className="course-description text-muted small mb-3 line-clamp-2 flex-grow-1">
                      {course.description?.length > 80
                        ? course.description.substring(0, 80) + "..."
                        : course.description}
                    </p>

                    <div className="course-instructor mb-2">
                      <small className="text-muted">
                        By {course.instructor?.name || course.instructorName || 'Unknown Instructor'}
                      </small>
                    </div>

                    <div className="course-stats d-flex justify-content-between align-items-center mt-auto pt-2">
                      <div className="course-price">
                        <strong className={course.price === 0 ? 'text-success' : 'text-dark'}>
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </strong>
                      </div>
                      <div className="course-rating d-flex align-items-center">
                        <i className="bi bi-star-fill text-warning me-1 small"></i>
                        <small className="text-muted">
                          {course.averageRating ? course.averageRating.toFixed(1) : '0.0'}
                          {course.enrolledCount && (
                            <span className="text-muted ms-1">
                              ({course.enrolledCount})
                            </span>
                          )}
                        </small>
                      </div>
                    </div>

                    <div className="course-actions mt-3">
                      {course.isEnrolled ? (
                        <Button
                          as={Link}
                          to={`/learn/${course._id}`}
                          variant="success"
                          className="w-100"
                          size="sm"
                        >
                          <i className="bi bi-play-circle me-2"></i>
                          Continue Learning
                        </Button>
                      ) : user ? (
                        <Button
                          variant="primary"
                          onClick={() => handleEnroll(course._id)}
                          disabled={enrolling === course._id}
                          className="w-100"
                          size="sm"
                        >
                          {enrolling === course._id ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle me-2"></i>
                              Enroll Now
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          as={Link}
                          to={`/courses/${course._id}`}
                          variant="outline-primary"
                          className="w-100"
                          size="sm"
                        >
                          View Details
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
  );
};

export default Courses;