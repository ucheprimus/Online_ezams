// client/src/components/MyCourses/StudentCourses.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Toast,
  ToastContainer,
  Pagination,
  ProgressBar,
  Spinner
} from "react-bootstrap";
import axios from "axios";

const StudentCourses = ({ error, setError }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareToast, setShowShareToast] = useState(false);
  const [copiedCourseTitle, setCopiedCourseTitle] = useState("");
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 6
  });

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

  useEffect(() => {
    fetchEnrolledCourses();
  }, [pagination.currentPage]);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("🔍 Fetching enrolled courses with progress...");
      
      // Use the new endpoint that includes progress
      const response = await axios.get(
        `http://localhost:5000/api/courses/student/enrolled-courses?page=${pagination.currentPage}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const enrolledCourses = response.data.courses || [];
        console.log("🎯 Enrolled courses with progress:", enrolledCourses);

        setCourses(enrolledCourses);
        setPagination(prev => ({
          ...prev,
          total: enrolledCourses.length,
          totalPages: Math.ceil(enrolledCourses.length / pagination.limit)
        }));
      } else {
        throw new Error(response.data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error("❌ Student courses error:", err);
      setError(err.response?.data?.message || "Failed to load your enrolled courses. Please try again.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleShareCourse = async (course) => {
    try {
      const courseUrl = `${window.location.origin}/courses/${course._id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: course.title,
          text: course.description,
          url: courseUrl,
        });
      } else {
        await navigator.clipboard.writeText(courseUrl);
        setCopiedCourseTitle(course.title);
        setShowShareToast(true);
      }
    } catch (err) {
      console.error('Error sharing course:', err);
      // Fallback to clipboard
      try {
        const courseUrl = `${window.location.origin}/courses/${course._id}`;
        await navigator.clipboard.writeText(courseUrl);
        setCopiedCourseTitle(course.title);
        setShowShareToast(true);
      } catch (clipboardErr) {
        setError('Failed to share course link');
      }
    }
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

  const getProgressVariant = (progress) => {
    if (progress === 100) return "success";
    if (progress >= 50) return "primary";
    if (progress >= 25) return "warning";
    return "danger";
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
      <div className="pagination-container">
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

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading your courses...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Row className="mb-4">
        <Col md={8}>
          <h1 className="page-title">My Learning</h1>
          <p className="page-subtitle">Track your progress and continue learning</p>
        </Col>
        {courses.length > 0 && (
          <Col md={4} className="text-md-end mt-3 mt-md-0">
            <Button
              as={Link}
              to="/courses"
              variant="outline-primary"
            >
              <i className="bi bi-search me-2"></i>
              Browse More Courses
            </Button>
          </Col>
        )}
      </Row>

      {courses.length === 0 ? (
        <Card className="empty-card border-0">
          <Card.Body className="text-center py-5">
            <div className="empty-icon mb-3">🎓</div>
            <h4 className="empty-title">No enrolled courses</h4>
            <p className="empty-description">
              Enroll in courses to start your learning journey and track your progress here
            </p>
            <Button
              as={Link}
              to="/courses"
              className="create-btn mt-3"
            >
              Browse Courses
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {courses.map((course) => (
              <Col key={course._id} lg={6} xl={4} className="mb-4">
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
                    <div className="progress-overlay">
                      <Badge className="progress-badge">
                        {course.progressPercentage || 0}% Complete
                      </Badge>
                    </div>
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

                    {/* Progress Bar */}
                    <div className="progress-section mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">Your Progress</small>
                        <small className="text-muted">{course.progressPercentage || 0}%</small>
                      </div>
                      <ProgressBar 
                        now={course.progressPercentage || 0} 
                        variant={getProgressVariant(course.progressPercentage || 0)}
                        className="course-progress"
                      />
                    </div>

                    <div className="course-stats mb-3">
                      <div className="stat-item">
                        <i className="bi bi-clock"></i>
                        <span>{course.totalHours || '10'} hours</span>
                      </div>
                      <div className="stat-item">
                        <i className="bi bi-bar-chart"></i>
                        <span className="text-capitalize">{course.level}</span>
                      </div>
                      <div className="stat-item">
                        <i className="bi bi-person"></i>
                        <span>{course.instructor?.name || 'Instructor'}</span>
                      </div>
                    </div>

                    <div className="course-actions three-buttons">
                      <Button
                        variant="primary"
                        size="sm"
                        as={Link}
                        to={`/learn/${course._id}`}
                        className="action-btn continue-btn"
                      >
                        <i className="bi bi-play-circle me-1"></i>
                        <span>{(course.progressPercentage || 0) > 0 ? "Continue" : "Start Learning"}</span>
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="sm"
                        as={Link}
                        to={`/courses/${course._id}`}
                        className="action-btn"
                      >
                        <i className="bi bi-info-circle me-1"></i>
                        <span>Details</span>
                      </Button>

                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleShareCourse(course)}
                        className="action-btn"
                        title="Share course"
                      >
                        <i className="bi bi-share me-1"></i>
                        <span>Share</span>
                      </Button>
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

      {/* Share Success Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showShareToast} 
          onClose={() => setShowShareToast(false)}
          delay={3000}
          autohide
          className="toast-success"
        >
          <Toast.Header>
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            <strong className="me-auto">Link Copied!</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Course link for "{copiedCourseTitle}" copied to clipboard!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default StudentCourses;