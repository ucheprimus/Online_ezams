// client/src/pages/LearnCourse.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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
  Nav,
    OverlayTrigger, // ADD THIS
  Tooltip // ADD THIS
} from "react-bootstrap";
import axios from "axios";
import YouTubePlayer from "../components/YouTubePlayer";
import EnhancedQuiz from "../components/EnhancedQuiz";
import CourseComments from "../components/CourseComments";

const LearnCourse = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [videoLoading, setVideoLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("content");

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
      setError("");
      const token = localStorage.getItem("token");

      // Fetch course with full curriculum and lessons
      const courseResponse = await axios.get(
        `http://localhost:5000/api/courses/${id}/learn`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(courseResponse.data);

      // ✅ IMPROVED: Fetch progress with better error handling
      try {
        const progressResponse = await axios.get(
          `http://localhost:5000/api/progress/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000, // Add timeout
          }
        );

        console.log("📊 Progress loaded:", progressResponse.data);

        if (progressResponse.data.progress) {
          setProgress(progressResponse.data.progress);

          // ✅ FIXED: Handle both lessonId formats (ObjectId and string)
          if (progressResponse.data.progress.completedLessons) {
            const completed = new Set(
              progressResponse.data.progress.completedLessons.map(
                (cl) => cl.lessonId.toString() // Ensure string format
              )
            );
            setCompletedLessons(completed);
            console.log("✅ Completed lessons:", Array.from(completed));
          }
        }
      } catch (progressError) {
        console.log(
          "⚠️ Progress fetch failed, will initialize on first completion:",
          progressError.message
        );
        // Initialize empty progress state
        setProgress({ progressPercentage: 0, completedLessons: [] });
        setCompletedLessons(new Set());
      }

      // Set first lesson as current
      if (
        courseResponse.data.curriculum?.length > 0 &&
        courseResponse.data.curriculum[0].lessons?.length > 0
      ) {
        const firstLesson = courseResponse.data.curriculum[0].lessons[0];
        setCurrentLesson(firstLesson);
        await fetchQuizForLesson(firstLesson._id);
      }
    } catch (err) {
      console.error("Learn course error:", err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        setError("You are not enrolled in this course or it does not exist.");
      } else {
        setError("Failed to load course content. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizForLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/quizzes/lesson/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 3000, // Shorter timeout
        }
      );

      if (response.data.success === false) {
        console.log("No quiz available for this lesson");
        setCurrentQuiz(null);
        return;
      }

      setCurrentQuiz(response.data);
      console.log("✅ Quiz loaded:", response.data.title);
    } catch (error) {
      // Silently handle 404 - it's normal if no quiz exists
      if (error.response?.status === 404) {
        console.log("No quiz available for this lesson");
      } else {
        console.error("Error fetching quiz:", error);
      }
      setCurrentQuiz(null);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      console.log("📝 Marking lesson complete:", lessonId);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/progress/${id}/complete-lesson`,
        { lessonId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log("✅ Lesson marked complete response:", response.data);

      // Update local state with response data
      if (response.data.progress) {
        setProgress(response.data.progress);

        // Update completed lessons set
        const completed = new Set(
          response.data.progress.completedLessons.map((cl) =>
            cl.lessonId.toString()
          )
        );
        setCompletedLessons(completed);

        console.log("🔄 Updated completed lessons:", Array.from(completed));
        console.log(
          "📈 New progress percentage:",
          response.data.progress.progressPercentage + "%"
        );
      }

      return response.data;
    } catch (err) {
      console.error("❌ Mark lesson complete error:", err);
      console.error("Error details:", err.response?.data);

      let errorMessage = "Failed to update progress. Please try again.";

      if (err.response?.status === 500) {
        errorMessage = "Server error while updating progress.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please check your connection.";
      }

      setError(errorMessage);
      throw err;
    }
  };

  const markLessonIncomplete = async (lessonId) => {
    try {
      console.log("📝 Marking lesson incomplete:", lessonId);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/progress/${id}/uncomplete-lesson`,
        { lessonId },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log("✅ Lesson marked incomplete response:", response.data);

      // Update local state
      if (response.data.progress) {
        setProgress(response.data.progress);

        const completed = new Set(
          response.data.progress.completedLessons.map((cl) =>
            cl.lessonId.toString()
          )
        );
        setCompletedLessons(completed);
      }

      return response.data;
    } catch (err) {
      console.error("❌ Mark lesson incomplete error:", err);
      setError("Failed to update progress. Please try again.");
      throw err;
    }
  };

  const handleLessonSelect = async (lesson) => {
    setCurrentLesson(lesson);
    setShowQuiz(false);
    setQuizResults(null);
    setVideoLoading(true);

    // Fetch quiz for selected lesson
    await fetchQuizForLesson(lesson._id);

    // Simulate video loading
    setTimeout(() => {
      setVideoLoading(false);
    }, 500);
  };


  const handleMarkComplete = async () => {
    try {
      if (!currentLesson) return;

      // Check if lesson already completed
      if (completedLessons.has(currentLesson._id.toString())) {
        await markLessonIncomplete(currentLesson._id);
        return;
      }

      // VALIDATION: Check if quiz exists and hasn't been passed
      if (currentQuiz && !hasPassedQuizForCurrentLesson()) {
        setError(
          "Please complete the quiz first to mark this lesson as complete."
        );
        setShowQuiz(true); // Show quiz if not completed
        return;
      }

      // VALIDATION: Check if video was watched (for quiz lessons)
      if (currentQuiz && !hasVideoBeenWatched()) {
        setError(
          "Please watch the video completely before attempting the quiz."
        );
        return;
      }

      // All validations passed - mark complete
      await markLessonComplete(currentLesson._id);
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      setError("Failed to update lesson status.");
    }
  };

  // Helper function to check if user passed quiz for current lesson
  const hasPassedQuizForCurrentLesson = () => {
    if (!currentQuiz) return true; // No quiz means "passed"

    // Check if there's a passed attempt for this quiz
    // You might want to fetch this from your backend or maintain state
    return quizResults?.passed || false;
  };

  // Helper function to track video completion
  const [videoCompleted, setVideoCompleted] = useState(false);

  const handleVideoEnd = () => {
    setVideoCompleted(true);

    if (currentQuiz) {
      setShowQuiz(true);
      // Enable quiz but don't auto-complete
    } else {
      // No quiz - auto-complete after video
      markLessonComplete(currentLesson._id);
    }
  };

  const hasVideoBeenWatched = () => {
    return videoCompleted;
  };

  // Update the mark complete button
  const renderCompletionButton = () => {
    const isCompleted = completedLessons.has(currentLesson._id.toString());

    if (isCompleted) {
      return (
        <Button
          variant="success"
          onClick={() => markLessonIncomplete(currentLesson._id)}
        >
          <i className="bi bi-check-circle me-1"></i>
          Completed
        </Button>
      );
    }

    let buttonVariant = "primary";
    let buttonText = "Mark Complete";
    let disabled = false;
    let tooltip = "";

    // Check conditions for completion
    if (currentQuiz && !hasPassedQuizForCurrentLesson()) {
      buttonVariant = "outline-secondary";
      buttonText = "Complete Quiz First";
      disabled = true;
      tooltip = "You must pass the quiz to complete this lesson";
    } else if (currentQuiz && !hasVideoBeenWatched()) {
      buttonVariant = "outline-secondary";
      buttonText = "Watch Video First";
      disabled = true;
      tooltip = "Please watch the complete video before marking as complete";
    }

    return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
        <span>
          <Button
            variant={buttonVariant}
            onClick={handleMarkComplete}
            disabled={disabled || !currentLesson}
          >
            <i className="bi bi-check-circle me-1"></i>
            {buttonText}
          </Button>
        </span>
      </OverlayTrigger>
    );
  };

  const handleQuizSubmit = async (answers, timeSpent) => {
    try {
      console.log("🔍 handleQuizSubmit called with:", answers);

      const token = localStorage.getItem("token");

      if (!Array.isArray(answers)) {
        throw new Error("Invalid answers format");
      }

      const response = await axios.post(
        `http://localhost:5000/api/quizzes/${currentQuiz._id}/attempt`,
        {
          answers,
          timeSpent,
          lessonId: currentLesson._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      const result = response.data;
      console.log("✅ Quiz submission successful:", result);
      setQuizResults(result);
      setShowQuiz(false);

      // AUTO-COMPLETE if passed and video was watched
      if (result.passed && videoCompleted) {
        console.log(
          "🎉 Quiz passed and video watched - auto-completing lesson"
        );
        await markLessonComplete(currentLesson._id);
      } else if (result.passed && !videoCompleted) {
        setError("Quiz passed! Please watch the video to complete the lesson.");
      }

      return result;
    } catch (error) {
      console.error("❌ Quiz submission error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit quiz";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleNextLesson = () => {
    if (!course?.curriculum) return;

    let foundCurrent = false;

    for (const section of course.curriculum) {
      for (let i = 0; i < section.lessons.length; i++) {
        const lesson = section.lessons[i];

        if (foundCurrent && i < section.lessons.length - 1) {
          handleLessonSelect(section.lessons[i + 1]);
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
          handleLessonSelect(previousLesson);
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
    return course.curriculum.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    );
  };

  // ✅ NEW: Get current lesson completion status
  const isCurrentLessonCompleted = () => {
    return currentLesson
      ? completedLessons.has(currentLesson._id.toString())
      : false;
  };

  const getCompletedLessonsCount = () => {
    return completedLessons.size;
  };

  // In LearnCourse.jsx - update renderVideoPlayer function
  const renderVideoPlayer = () => {
    if (!currentLesson) return null;

    if (videoLoading) {
      return (
        <div className="video-placeholder d-flex align-items-center justify-content-center bg-dark text-white">
          <div className="text-center">
            <Spinner animation="border" variant="light" />
            <p className="mt-3 mb-0">Loading video...</p>
          </div>
        </div>
      );
    }

    // Extract YouTube ID from videoUrl if it's a YouTube URL
    const extractYouTubeId = (url) => {
      if (!url) return null;
      const regex =
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    };

    const youtubeId = extractYouTubeId(currentLesson.videoUrl);

    if (youtubeId) {
      return (
        <div className="video-player-container">
          <YouTubePlayer videoId={youtubeId} onVideoEnd={handleVideoEnd} />
        </div>
      );
    } else if (currentLesson.videoUrl) {
      return (
        <video
          controls
          className="w-100"
          style={{ maxHeight: "500px", borderRadius: "8px" }}
          poster={course.thumbnail}
          onEnded={handleVideoEnd}
        >
          <source src={currentLesson.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    } else {
      return (
        <div className="video-placeholder d-flex align-items-center justify-content-center bg-light">
          <div className="text-center text-muted py-5">
            <i className="bi bi-play-circle display-1 mb-3"></i>
            <h5>Video Content</h5>
            <p>No video available for this lesson</p>
          </div>
        </div>
      );
    }
  };

  // Render the tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <>
            <h5 className="fw-bold mb-3">Course Content</h5>
            {course?.curriculum && course.curriculum.length > 0 ? (
              <Accordion defaultActiveKey="0" flush>
                {course.curriculum.map((section, sectionIndex) => (
                  <Accordion.Item
                    key={section._id || sectionIndex}
                    eventKey={sectionIndex.toString()}
                  >
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
                              currentLesson?._id === lesson._id
                                ? "bg-primary text-white"
                                : ""
                            } ${
                              completedLessons.has(lesson._id)
                                ? "completed-lesson"
                                : ""
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
                                <span
                                  className={
                                    currentLesson?._id === lesson._id
                                      ? "fw-bold"
                                      : ""
                                  }
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="text-muted small">
                                {lesson.duration || "10"} min
                                {lesson.quiz && (
                                  <i className="bi bi-patch-question ms-1"></i>
                                )}
                              </div>
                            </div>
                            {lesson.description && (
                              <small
                                className={`d-block mt-1 ${
                                  currentLesson?._id === lesson._id
                                    ? "text-light"
                                    : "text-muted"
                                }`}
                              >
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
          </>
        );

      case "comments":
        return (
          <CourseComments
            courseId={id}
            currentLesson={currentLesson}
            user={user}
          />
        );

      default:
        return null;
    }
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
          <Button
            onClick={() => navigate("/courses")}
            variant="primary"
            className="mt-3"
          >
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
              <>
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body className="p-0">
                    {/* Video Player */}
                    <div className="video-player-container">
                      {renderVideoPlayer()}
                    </div>

                    {/* Lesson Info */}
                    <div className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h4 className="fw-bold mb-2">
                            {currentLesson.title}
                          </h4>
                          <p className="text-muted mb-0">
                            {currentLesson.description}
                          </p>
                        </div>
                        <div className="text-end">
                          <Badge bg="secondary" className="fs-6">
                            {currentLesson.duration || "10"} min
                          </Badge>
                        </div>
                      </div>

                      {/* Lesson Actions - Updated with validation */}
                      <div className="d-flex gap-2 mb-3">
                        <Button
                          variant="outline-primary"
                          onClick={handlePreviousLesson}
                          disabled={!currentLesson}
                        >
                          <i className="bi bi-chevron-left me-1"></i>
                          Previous
                        </Button>

                        {/* Updated completion button */}
                        {renderCompletionButton()}

                        <Button
                          variant="outline-primary"
                          onClick={handleNextLesson}
                          disabled={!currentLesson}
                        >
                          Next
                          <i className="bi bi-chevron-right ms-1"></i>
                        </Button>
                      </div>

                      {/* Quiz Status Display */}
                      {currentQuiz && (
                        <div className="quiz-status-alert mb-3">
                          {!hasPassedQuizForCurrentLesson() ? (
                            <Alert variant="info" className="py-2">
                              <i className="bi bi-info-circle me-2"></i>
                              <strong>Quiz Required:</strong> You must pass the
                              quiz to complete this lesson.
                              {!videoCompleted &&
                                " Watch the video first to unlock the quiz."}
                            </Alert>
                          ) : (
                            <Alert variant="success" className="py-2">
                              <i className="bi bi-check-circle me-2"></i>
                              <strong>Quiz Passed!</strong>{" "}
                              {!videoCompleted
                                ? "Watch the video to complete the lesson."
                                : "You can now mark the lesson as complete."}
                            </Alert>
                          )}
                        </div>
                      )}

                      {/* Progress for current lesson */}
                      <div className="progress-section">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-medium">Course Progress</span>
                          <span className="text-muted">
                            {getCompletedLessonsCount()} of {getTotalLessons()}{" "}
                            lessons
                          </span>
                        </div>
                        <ProgressBar
                          now={getProgressPercentage()}
                          variant={
                            getProgressPercentage() === 100
                              ? "success"
                              : "primary"
                          }
                          className="mb-3"
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Quiz Section */}
                {showQuiz && currentQuiz && !quizResults && (
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h4 className="mb-3">Quiz: Test Your Knowledge</h4>
                      <EnhancedQuiz
                        quiz={currentQuiz}
                        onSubmit={handleQuizSubmit}
                      />
                    </Card.Body>
                  </Card>
                )}

                {/* Quiz Results */}
                {quizResults && (
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div
                        className={`text-center p-4 rounded ${
                          quizResults.passed
                            ? "bg-success text-white"
                            : "bg-warning"
                        }`}
                      >
                        <h4>
                          {quizResults.passed
                            ? "🎉 Quiz Passed!"
                            : "😞 Quiz Failed"}
                        </h4>
                        <p className="mb-2">
                          Score: {quizResults.score.toFixed(1)}%
                        </p>
                        <p>
                          Correct: {quizResults.correctAnswers} out of{" "}
                          {quizResults.totalQuestions}
                        </p>
                        {quizResults.passed ? (
                          <p>Congratulations! You've completed this lesson.</p>
                        ) : (
                          <p>
                            Don't worry! You can review the material and try
                            again.
                          </p>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Quiz Prompt */}
                {currentQuiz &&
                  !showQuiz &&
                  !quizResults &&
                  !completedLessons.has(currentLesson._id.toString()) && (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center">
                        <h5>📝 Quiz Available</h5>
                        <p className="text-muted mb-3">
                          Complete the video to unlock the quiz and test your
                          knowledge.
                        </p>
                        <Button
                          variant="primary"
                          onClick={() => setShowQuiz(true)}
                          disabled={!currentLesson}
                        >
                          Start Quiz
                        </Button>
                      </Card.Body>
                    </Card>
                  )}
              </>
            ) : (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <i className="bi bi-play-circle display-1 text-muted mb-3"></i>
                  <h5 className="fw-bold">Select a Lesson</h5>
                  <p className="text-muted">
                    Choose a lesson from the curriculum to start learning
                  </p>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>

        {/* Sidebar with Tabs */}
        <Col lg={4}>
          <div
            className="sidebar-content bg-light p-3 p-md-4"
            style={{ height: "100vh", overflowY: "auto" }}
          >
            {/* Tabs Navigation */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-row">
                  <Nav.Item className="flex-fill">
                    <Nav.Link
                      active={activeTab === "content"}
                      onClick={() => setActiveTab("content")}
                      className="text-center py-2"
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      Content
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="flex-fill">
                    <Nav.Link
                      active={activeTab === "comments"}
                      onClick={() => setActiveTab("comments")}
                      className="text-center py-2"
                    >
                      <i className="bi bi-chat-dots me-2"></i>
                      Comments
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>

            {/* Tab Content */}
            <div className="tab-content-area">{renderTabContent()}</div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LearnCourse;
