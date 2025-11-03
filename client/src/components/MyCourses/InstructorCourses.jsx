// client/src/components/MyCourses/InstructorCourses.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Modal,
  Toast,
  ToastContainer,
  Pagination,
  Spinner
} from "react-bootstrap";
import axios from "axios";

const InstructorCourses = ({ error, setError }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
    fetchMyCourses();
  }, [pagination.currentPage]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5000/api/courses/instructor/my-courses?page=${pagination.currentPage}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Handle both response formats
      if (response.data.courses) {
        // Response has pagination structure
        setCourses(response.data.courses || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          total: response.data.total || 0,
          limit: pagination.limit
        });
      } else {
        // Response is just an array of courses
        const allCourses = response.data;
        const startIndex = (pagination.currentPage - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedCourses = allCourses.slice(startIndex, endIndex);
        
        setCourses(paginatedCourses);
        setPagination(prev => ({
          ...prev,
          total: allCourses.length,
          totalPages: Math.ceil(allCourses.length / pagination.limit)
        }));
      }
    } catch (err) {
      console.error("❌ Fetch courses error:", err);
      setError(err.response?.data?.message || "Failed to fetch your courses");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handlePublishToggle = async (courseId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/courses/${courseId}`,
        { isPublished: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCourses(
        courses.map((course) =>
          course._id === courseId
            ? { ...course, isPublished: !currentStatus }
            : course
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/courses/${courseToDelete._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourses(courses.filter((c) => c._id !== courseToDelete._id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
      
      // Refresh the courses list
      fetchMyCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
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
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Manage and track your course content</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button
            as={Link}
            to="/dashboard/create-course"
            className="create-btn"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Course
          </Button>
        </Col>
      </Row>

      {courses.length === 0 ? (
        <Card className="empty-card border-0">
          <Card.Body className="text-center py-5">
            <div className="empty-icon mb-3">📚</div>
            <h4 className="empty-title">No courses created yet</h4>
            <p className="empty-description">
              Start sharing your knowledge by creating your first course
            </p>
            <Button
              as={Link}
              to="/dashboard/create-course"
              className="create-btn mt-3"
            >
              Create Your First Course
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
                    <div className="course-overlay">
                      <Badge
                        className={`status-badge ${course.isPublished ? 'published' : 'draft'}`}
                      >
                        {course.isPublished ? "Published" : "Draft"}
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

                    <div className="course-stats mb-3">
                      <div className="stat-item">
                        <i className="bi bi-people"></i>
                        <span>
                          {course.studentsEnrolled?.length || 0} students
                        </span>
                      </div>
                      <div className="stat-item">
                        <i className="bi bi-star-fill"></i>
                        <span>{course.averageRating || "0.0"}</span>
                      </div>
                      <div className="stat-item">
                        <i className="bi bi-currency-dollar"></i>
                        <span>
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </span>
                      </div>
                    </div>

                    <div className="course-actions four-buttons">
                      <Button
                        variant={
                          course.isPublished
                            ? "outline-warning"
                            : "outline-success"
                        }
                        size="sm"
                        onClick={() =>
                          handlePublishToggle(course._id, course.isPublished)
                        }
                        className="action-btn"
                      >
                        <i
                          className={`bi bi-${
                            course.isPublished ? "eye-slash" : "eye"
                          } me-1`}
                        ></i>
                        <span>{course.isPublished ? "Unpublish" : "Publish"}</span>
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to={`/dashboard/edit-course/${course._id}`}
                        className="action-btn"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        <span>Edit</span>
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

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(course)}
                        className="action-btn"
                      >
                        <i className="bi bi-trash me-1"></i>
                        <span>Delete</span>
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

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete{" "}
            <strong>{courseToDelete?.title}</strong>?
          </p>
          <p className="text-danger mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
            className={deleteLoading ? "loading" : ""}
          >
            {deleteLoading ? (
              <>
                <span>Deleting...</span>
              </>
            ) : (
              "Delete Course"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

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

export default InstructorCourses;