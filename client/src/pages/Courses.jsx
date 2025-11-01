// client/src/pages/Courses.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    level: '',
    sort: 'newest'
  });

  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Design',
    'Business',
    'Marketing',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.level) params.append('level', filters.level);
      if (filters.sort) params.append('sort', filters.sort);

      const response = await axios.get(`http://localhost:5000/api/courses?${params.toString()}`);
      setCourses(response.data);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      level: '',
      sort: 'newest'
    });
  };

  return (
    <Container fluid className="courses-container">
      {/* Hero Section */}
      <div className="courses-hero">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h1 className="hero-title">Explore Our Courses</h1>
              <p className="hero-subtitle">
                Discover thousands of courses from expert instructors and start your learning journey today
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Filters Section */}
      <Container className="py-4">
        <Card className="filter-card border-0 mb-4">
          <Card.Body className="p-4">
            <Row className="g-3">
              {/* Search */}
              <Col lg={4}>
                <InputGroup>
                  <InputGroup.Text className="search-icon">
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search courses..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="search-input"
                  />
                </InputGroup>
              </Col>

              {/* Category */}
              <Col lg={3} md={6}>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Level */}
              <Col lg={2} md={6}>
                <Form.Select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Form.Select>
              </Col>

              {/* Sort */}
              <Col lg={2} md={6}>
                <Form.Select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="filter-select"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              {/* Clear Button */}
              <Col lg={1} md={6}>
                <Button
                  variant="outline-secondary"
                  onClick={clearFilters}
                  className="w-100 clear-btn"
                  title="Clear filters"
                >
                  <i className="bi bi-x-circle"></i>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Results Count */}
        <div className="results-info mb-3">
          <span className="results-count">
            {loading ? 'Loading...' : `${courses.length} course${courses.length !== 1 ? 's' : ''} found`}
          </span>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <Card className="empty-card border-0">
            <Card.Body className="text-center py-5">
              <div className="empty-icon mb-3">🔍</div>
              <h4 className="empty-title">No courses found</h4>
              <p className="empty-description">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            {courses.map((course) => (
              <Col key={course._id} md={6} lg={4} xl={3} className="mb-4">
                <Card className="course-card h-100 border-0">
                  <div className="course-thumbnail">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x225?text=Course';
                      }}
                    />
                    <div className="course-price-badge">
                      {course.price === 0 ? 'Free' : `$${course.price}`}
                    </div>
                  </div>
                  
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge className="category-badge">
                        {course.category}
                      </Badge>
                      <Badge bg="secondary" className="level-badge">
                        {course.level}
                      </Badge>
                    </div>

                    <h6 className="course-title">{course.title}</h6>
                    <p className="course-instructor">
                      <i className="bi bi-person-circle me-1"></i>
                      {course.instructor?.name || 'Unknown'}
                    </p>

                    <div className="course-stats mb-3">
                      <div className="stat-item">
                        <i className="bi bi-people"></i>
                        <span>{course.enrolledStudents?.length || 0}</span>
                      </div>
                      <div className="stat-item">
                        <i className="bi bi-star-fill"></i>
                        <span>{course.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      {course.duration > 0 && (
                        <div className="stat-item">
                          <i className="bi bi-clock"></i>
                          <span>{course.duration}h</span>
                        </div>
                      )}
                    </div>

                    <Button
                      as={Link}
                      to={`/course/${course._id}`}
                      className="enroll-btn w-100"
                    >
                      View Course
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Custom Styles */}
      <style>{`
        .courses-container {
          background: #f8fafc;
          min-height: 100vh;
          padding: 0;
        }

        .courses-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0;
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 0;
        }

        .filter-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .search-input, .filter-select {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
        }

        .search-input:focus, .filter-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .search-icon {
          background: white;
          border: 2px solid #e2e8f0;
          border-right: none;
          border-radius: 10px 0 0 10px;
          color: #718096;
        }

        .clear-btn {
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          color: #718096;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          border-color: #e53e3e;
          color: #e53e3e;
          background: rgba(229, 62, 62, 0.1);
        }

        .results-info {
          color: #718096;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .results-count {
          color: #2d3748;
          font-weight: 600;
        }

        .empty-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .empty-icon {
          font-size: 4rem;
          opacity: 0.5;
        }

        .empty-title {
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .clear-filters-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          padding: 0.6rem 1.5rem;
          font-weight: 600;
        }

        .course-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }

        .course-thumbnail {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #f7fafc;
        }

        .course-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .course-price-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          color: #667eea;
          font-size: 0.9rem;
        }

        .category-badge {
          font-size: 0.7rem;
          padding: 0.3rem 0.6rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          font-weight: 600;
          border-radius: 6px;
        }

        .level-badge {
          font-size: 0.7rem;
          padding: 0.3rem 0.6rem;
          font-weight: 600;
          border-radius: 6px;
        }

        .course-title {
          color: #2d3748;
          font-weight: 700;
          font-size: 1rem;
          margin: 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 2.5rem;
        }

        .course-instructor {
          color: #718096;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
        }

        .course-stats {
          display: flex;
          gap: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: #718096;
          font-size: 0.8rem;
        }

        .stat-item i {
          color: #667eea;
          font-size: 0.9rem;
        }

        .enroll-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 0.6rem;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .enroll-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 992px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 768px) {
          .courses-hero {
            padding: 3rem 0;
          }

          .hero-title {
            font-size: 2rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .filter-card .card-body {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default Courses;