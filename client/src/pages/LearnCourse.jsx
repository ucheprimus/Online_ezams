// client/src/pages/LearnCourse.jsx
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
  ProgressBar,
  Modal
} from 'react-bootstrap';
import axios from 'axios';

const LearnCourse = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/learn/${id}`);
      return;
    }
    fetchCourseData();
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      // Fetch course details
      const courseResponse = await axios.get(
        `http://localhost:5000/api/courses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(courseResponse.data);

      // Fetch progress
      const progressResponse = await axios.get(
        `http://localhost:5000/api/progress/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(progressResponse.data.progress);

      // Mark completed lessons
      if (progressResponse.data.progress.completedLessons) {
        const completed = new Set(
          progressResponse.data.progress.completedLessons.map(cl => cl.lessonId.toString())
        );
        setCompletedLessons(completed);
      }

      // Set first lesson as current if no progress
      if (courseResponse.data.curriculum?.length > 0 && 
          courseResponse.data.curriculum[0].lessons?.length > 0) {
        setCurrentLesson(courseResponse.data.curriculum[0].lessons[0]);
      }

    } catch (err) {
      console.error('Learn course error:', err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        setError('You are not enrolled in this course or it does not exist.');
      } else {
        setError('Failed to load course content. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/progress/${id}/complete-lesson`,
        { lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      
      // Refresh progress
      const progressResponse = await axios.get(
        `http://localhost:5000/api/progress/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(progressResponse.data.progress);

    } catch (err) {
      console.error('Mark lesson complete error:', err);
      setError('Failed to update progress');
    }
  };

  const markLessonIncomplete = async (lessonId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/progress/${id}/uncomplete-lesson`,
        { lessonId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCompletedLessons(prev => {
        const newSet = new Set(prev);
        newSet.delete(lessonId);
        return newSet;
      });
      
      // Refresh progress
      const progressResponse = await axios.get(
        `http://localhost:5000/api/progress/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(progressResponse.data.progress);

    } catch (err) {
      console.error('Mark lesson incomplete error:', err);
      setError('Failed to update progress');
    }
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setVideoLoading(true);
    
    // Simulate video loading
    setTimeout(() => {
      setVideoLoading(false);
    }, 1000);
  };

  const handleNextLesson = () => {
    if (!course?.curriculum) return;

    let foundCurrent = false;
    
    for (const section of course.curriculum) {
      for (let i = 0; i < section.lessons.length; i++) {
        const lesson = section.lessons[i];
        
        if (foundCurrent && i < section.lessons.length - 1) {
          setCurrentLesson(section.lessons[i + 1]);
          setVideoLoading(true);
          setTimeout(() => setVideoLoading(false), 1000);
          return;
        }
        
        if (lesson._id === currentLesson?._id) {
          foundCurrent = true;
        }
      }
    }
  };

  const handlePreviousLesson = () => {
    if (!course?.curriculum) return;

    let previousLesson = null;
    
    for (const section of course.curriculum) {
      for (let i = 0; i < section.lessons.length; i++) {
        const lesson = section.lessons[i];
        
        if (lesson._id === currentLesson?._id && previousLesson) {
          setCurrentLesson(previousLesson);
          setVideoLoading(true);
          setTimeout(() => setVideoLoading(false), 1000);
          return;
        }
        
        previousLesson = lesson;
      }
    }
  };

  const getProgressPercentage = () => {
    return progress?.progressPercentage || 0;
  };

  const getTotalLessons = () => {
    if (!course?.curriculum) return 0;
    return course.curriculum.reduce((total, section) => 
      total + (section.lessons?.length || 0), 0
    );
  };

  const getCompletedLessonsCount = () => {
    return completedLessons.size;
  };

  if (loading) {
    return (
      <Container fluid className="learn-course-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course content...</p>
        </div>
      </Container>
    );
  }

  if (error && !course) {
    return (
      <Container fluid className="learn-course-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
          <Button onClick={() => navigate('/courses')} variant="primary" className="mt-3">
            Browse Courses
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="learn-course-container px-0">
      {/* Header */}
      <div className="course-header bg-dark text-white py-3 px-3 px-md-4">
        <Row className="align-items-center">
          <Col>
            <h4 className="mb-1 fw-bold">{course?.title}</h4>
            <p className="mb-0 text-light">by {course?.instructor?.name}</p>
          </Col>
          <Col xs="auto">
            <Badge bg="primary" className="fs-6">
              {getProgressPercentage()}% Complete
            </Badge>
          </Col>
        </Row>
      </div>

      <Row className="g-0">
        {/* Video Player Section */}
        <Col lg={8}>
          <div className="video-section p-3 p-md-4">
            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {currentLesson ? (
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  {/* Video Player */}
                  <div className="video-player-container">
                    {videoLoading ? (
                      <div className="video-placeholder d-flex align-items-center justify-content-center bg-dark text-white">
                        <div className="text-center">
                          <Spinner animation="border" variant="light" />
                          <p className="mt-3 mb-0">Loading video...</p>
                        </div>
                      </div>
                    ) : currentLesson.videoUrl ? (
                      <video
                        controls
                        className="w-100"
                        style={{ maxHeight: '500px' }}
                        poster={course.thumbnail}
                      >
                        <source src={currentLesson.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="video-placeholder d-flex align-items-center justify-content-center bg-light">
                        <div className="text-center text-muted py-5">
                          <i className="bi bi-play-circle display-1 mb-3"></i>
                          <h5>Video Content</h5>
                          <p>Video will be available here</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h4 className="fw-bold mb-2">{currentLesson.title}</h4>
                        <p className="text-muted mb-0">{currentLesson.description}</p>
                      </div>
                      <div className="text-end">
                        <Badge bg="secondary" className="fs-6">
                          {currentLesson.duration || '10'} min
                        </Badge>
                      </div>
                    </div>

                    {/* Lesson Actions */}
                    <div className="d-flex gap-2 mb-3">
                      <Button
                        variant="outline-primary"
                        onClick={handlePreviousLesson}
                        disabled={!currentLesson}
                      >
                        <i className="bi bi-chevron-left me-1"></i>
                        Previous
                      </Button>
                      
                      {completedLessons.has(currentLesson._id) ? (
                        <Button
                          variant="success"
                          onClick={() => markLessonIncomplete(currentLesson._id)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Completed
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => markLessonComplete(currentLesson._id)}
                        >
                          <i className="bi bi-check-circle me-1"></i>
                          Mark Complete
                        </Button>
                      )}
                      
                      <Button
                        variant="outline-primary"
                        onClick={handleNextLesson}
                        disabled={!currentLesson}
                      >
                        Next
                        <i className="bi bi-chevron-right ms-1"></i>
                      </Button>
                    </div>

                    {/* Progress for current lesson */}
                    <div className="progress-section">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-medium">Course Progress</span>
                        <span className="text-muted">
                          {getCompletedLessonsCount()} of {getTotalLessons()} lessons
                        </span>
                      </div>
                      <ProgressBar 
                        now={getProgressPercentage()} 
                        variant={getProgressPercentage() === 100 ? "success" : "primary"}
                        className="mb-3"
                      />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <i className="bi bi-play-circle display-1 text-muted mb-3"></i>
                  <h5 className="fw-bold">Select a Lesson</h5>
                  <p className="text-muted">Choose a lesson from the curriculum to start learning</p>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>

        {/* Curriculum Sidebar */}
        <Col lg={4}>
          <div className="curriculum-sidebar bg-light p-3 p-md-4" style={{ height: '100vh', overflowY: 'auto' }}>
            <h5 className="fw-bold mb-3">Course Content</h5>
            
            {course?.curriculum && course.curriculum.length > 0 ? (
              <Accordion defaultActiveKey="0" flush>
                {course.curriculum.map((section, sectionIndex) => (
                  <Accordion.Item key={section._id || sectionIndex} eventKey={sectionIndex.toString()}>
                    <Accordion.Header>
                      <div className="d-flex justify-content-between align-items-center w-100 me-3">
                        <span className="fw-medium">{section.title}</span>
                        <Badge bg="secondary" className="ms-2">
                          {section.lessons?.length || 0}
                        </Badge>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body className="p-0">
                      <div className="lessons-list">
                        {section.lessons?.map((lesson, lessonIndex) => (
                          <div
                            key={lesson._id || lessonIndex}
                            className={`lesson-item p-3 border-bottom cursor-pointer ${
                              currentLesson?._id === lesson._id ? 'bg-primary text-white' : ''
                            } ${
                              completedLessons.has(lesson._id) ? 'completed-lesson' : ''
                            }`}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                {completedLessons.has(lesson._id) ? (
                                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                                ) : (
                                  <i className="bi bi-play-circle me-2"></i>
                                )}
                                <span className={currentLesson?._id === lesson._id ? 'fw-bold' : ''}>
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="text-muted small">
                                {lesson.duration || '10'} min
                              </div>
                            </div>
                            {lesson.description && (
                              <small className={`d-block mt-1 ${
                                currentLesson?._id === lesson._id ? 'text-light' : 'text-muted'
                              }`}>
                                {lesson.description}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                No curriculum available for this course yet.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LearnCourse;