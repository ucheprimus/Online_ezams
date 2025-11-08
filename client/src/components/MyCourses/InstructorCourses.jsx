// client/src/components/MyCourses/InstructorCourses.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { CourseBuilder } from '../Instructor/CourseBuilder';

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
  Spinner,
  Container,
  Form,
  Tabs, // ✅ ADD THIS
  Tab, // ✅ ADD THIS
  Collapse,
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

  // Curriculum editing states
  const [showCourseBuilder, setShowCourseBuilder] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCurriculum, setSavingCurriculum] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 6,
  });

  // Default thumbnails for fallback
  const defaultThumbnails = {
    "web-dev":
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop",
    "data-science":
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    "mobile-dev":
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=225&fit=crop",
    design:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    business:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    marketing:
      "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=225&fit=crop",
    music:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop",
    photography:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=225&fit=crop",
    default:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=400&h=225&fit=crop",
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
          limit: pagination.limit,
        });
      } else {
        // Response is just an array of courses
        const allCourses = response.data;
        const startIndex = (pagination.currentPage - 1) * pagination.limit;
        const endIndex = startIndex + pagination.limit;
        const paginatedCourses = allCourses.slice(startIndex, endIndex);

        setCourses(paginatedCourses);
        setPagination((prev) => ({
          ...prev,
          total: allCourses.length,
          totalPages: Math.ceil(allCourses.length / pagination.limit),
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
    setPagination((prev) => ({ ...prev, currentPage: page }));
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
      console.error("Error sharing course:", err);
      try {
        const courseUrl = `${window.location.origin}/courses/${course._id}`;
        await navigator.clipboard.writeText(courseUrl);
        setCopiedCourseTitle(course.title);
        setShowShareToast(true);
      } catch (clipboardErr) {
        setError("Failed to share course link");
      }
    }
  };

  // ADD THIS MISSING FUNCTION - Curriculum editing handler
  const handleEditCurriculum = (course) => {
    console.log("Editing curriculum for course:", course);
    setEditingCourse(course);
    setShowCourseBuilder(true);
  };

const handleSaveCurriculum = async (saveData) => {
  if (!editingCourse) {
    throw new Error("No course selected for editing");
  }

  setSavingCurriculum(true);
  try {
    const token = localStorage.getItem("token");
    
    console.log("📤 Save data received:", saveData);

    // Handle different save types from the new CourseBuilder
    if (saveData.type === 'lesson') {
      // Individual lesson save - use granular endpoint
      const response = await axios.put(
        `http://localhost:5000/api/courses/${editingCourse._id}/sections/${saveData.sectionId}/lessons/${saveData.lessonId}`,
        saveData.data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Lesson save response:", response.data);
      return response.data;

    } else if (saveData.type === 'section') {
      // Individual section save - use granular endpoint
      const response = await axios.put(
        `http://localhost:5000/api/courses/${editingCourse._id}/sections/${saveData.sectionId}`,
        saveData.data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Section save response:", response.data);
      return response.data;

    } else if (saveData.curriculum) {
      // Bulk curriculum save (fallback for old format)
      const validatedCurriculum = saveData.curriculum.map(
        (section, sectionIndex) => ({
          ...section,
          order: sectionIndex,
          lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
            ...lesson,
            order: lessonIndex,
            duration: parseInt(lesson.duration) || 0,
            videoId: lesson.videoId ? lesson.videoId.trim() : "",
          })),
        })
      );

      console.log("📤 Sending curriculum data:", validatedCurriculum);

      const response = await axios.put(
        `http://localhost:5000/api/courses/${editingCourse._id}/curriculum`,
        { curriculum: validatedCurriculum },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Curriculum save response:", response.data);

      if (response.data.success) {
        setEditingCourse(prev => ({
          ...prev,
          curriculum: response.data.curriculum
        }));
        fetchMyCourses();
        setError("");
        return {
          success: true,
          curriculum: response.data.curriculum
        };
      } else {
        const errorMsg = response.data.message || "Unknown error";
        setError("Failed to save: " + errorMsg);
        throw new Error(errorMsg);
      }
    } else {
      throw new Error("Invalid save data format");
    }

  } catch (error) {
    console.error("❌ Save error:", error);
    const errorMessage = error.response?.data?.message || error.message;
    setError("Failed to save: " + errorMessage);
    throw error;
  } finally {
    setSavingCurriculum(false);
  }
};

  const handleCloseCourseBuilder = () => {
    if (savingCurriculum) return; // Prevent closing while saving

    setShowCourseBuilder(false);
    setEditingCourse(null);
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      "web-dev": "Web Development",
      "data-science": "Data Science",
      "mobile-dev": "Mobile Development",
      design: "Design",
      business: "Business",
      marketing: "Marketing",
      music: "Music",
      photography: "Photography",
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

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
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
          <h1 className="h2 fw-bold">My Courses</h1>
          <p className="text-muted">Manage and track your course content</p>
        </Col>
        <Col md={4} className="text-md-end mt-3 mt-md-0">
          <Button
            as={Link}
            to="/dashboard/create-course"
            variant="primary"
            className="px-4"
          >
            <i className="bi bi-plus-circle me-2"></i>
            Create New Course
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="display-1 text-muted mb-3">📚</div>
            <h4 className="mb-3">No courses created yet</h4>
            <p className="text-muted mb-4">
              Start sharing your knowledge by creating your first course
            </p>
            <Button
              as={Link}
              to="/dashboard/create-course"
              variant="primary"
              size="lg"
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
                <Card className="h-100 shadow-sm">
                  <div className="position-relative">
                    <Card.Img
                      variant="top"
                      src={
                        course.thumbnail && course.thumbnail.trim() !== ""
                          ? course.thumbnail
                          : defaultThumbnails[course.category] ||
                            defaultThumbnails.default
                      }
                      alt={course.title}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          defaultThumbnails[course.category] ||
                          defaultThumbnails.default;
                      }}
                    />
                    <Badge
                      bg={course.isPublished ? "success" : "secondary"}
                      className="position-absolute top-0 end-0 m-2"
                    >
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Badge bg="primary" className="mb-1">
                        {getCategoryDisplayName(course.category)}
                      </Badge>
                      <Badge bg="outline-secondary" text="dark">
                        {course.level}
                      </Badge>
                    </div>

                    <Card.Title className="h5">{course.title}</Card.Title>
                    <Card.Text className="text-muted flex-grow-1">
                      {course.description.length > 100
                        ? course.description.substring(0, 100) + "..."
                        : course.description}
                    </Card.Text>

                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span>
                        <i className="bi bi-people me-1"></i>
                        {course.studentsEnrolled?.length || 0}
                      </span>
                      <span>
                        <i className="bi bi-star-fill text-warning me-1"></i>
                        {course.averageRating || "0.0"}
                      </span>
                      <span>
                        <i className="bi bi-currency-dollar me-1"></i>
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </span>
                    </div>

                    <div className="d-grid gap-2 d-md-flex">
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
                        className="flex-fill"
                      >
                        <i
                          className={`bi bi-${
                            course.isPublished ? "eye-slash" : "eye"
                          } me-1`}
                        ></i>
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to={`/dashboard/edit-course/${course._id}`}
                        className="flex-fill"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit
                      </Button>

                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleEditCurriculum(course)}
                        className="flex-fill"
                      >
                        <i className="bi bi-journals me-1"></i>
                        Curriculum
                      </Button>
                    </div>

                    <div className="d-grid gap-2 d-md-flex mt-2">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleShareCourse(course)}
                        className="flex-fill"
                      >
                        <i className="bi bi-share me-1"></i>
                        Share
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClick(course)}
                        className="flex-fill"
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
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
        onHide={() => !deleteLoading && setShowDeleteModal(false)}
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
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Course"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Course Builder Modal */}
      <Modal
        show={showCourseBuilder}
        onHide={handleCloseCourseBuilder}
        size="xl"
        scrollable
        backdrop={savingCurriculum ? "static" : true}
      >
        <Modal.Header closeButton={!savingCurriculum} className="bg-light">
          <Modal.Title>
            <i className="bi bi-journals me-2"></i>
            Course Curriculum: {editingCourse?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <CourseBuilder
            course={editingCourse}
            onSave={handleSaveCurriculum}
            onClose={handleCloseCourseBuilder}
            saving={savingCurriculum}
          />
        </Modal.Body>
      </Modal>

      {/* Share Success Toast */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showShareToast}
          onClose={() => setShowShareToast(false)}
          delay={4000}
          autohide
          bg="success"
        >
          <Toast.Header className="bg-success text-white">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong className="me-auto text-white">Link Copied!</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Course link for "<strong>{copiedCourseTitle}</strong>" copied to
            clipboard!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default InstructorCourses;
