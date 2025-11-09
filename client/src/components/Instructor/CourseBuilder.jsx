// client/src/components/Instructor/CourseBuilder.jsx
import { useState, useEffect } from "react";
import VideoUpload from "./VideoUpload"; // ADD THIS IMPORT
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Alert,
  Spinner,
  Modal,
  Accordion,
} from "react-bootstrap";
import axios from "axios";
import QuizQuestionEditor from "./QuizQuestionEditor"; // ADD THIS IMPORT

export const CourseBuilder = ({ course, onSave }) => {
  const [curriculum, setCurriculum] = useState([]);
  const [savingSection, setSavingSection] = useState({});
  const [savingLesson, setSavingLesson] = useState({});

  // ========== ADD QUIZ STATES HERE ==========
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: [],
    passingScore: 70,
    maxAttempts: 3,
    timeLimit: 30,
    isMandatory: true,
  });
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [lessonQuizzes, setLessonQuizzes] = useState({});

  // Initialize curriculum from course prop
  useEffect(() => {
    if (course?.curriculum && Array.isArray(course.curriculum)) {
      const initializedCurriculum = course.curriculum.map(
        (section, sectionIndex) => ({
          ...section,
          _id: section._id || `section-${Date.now()}-${sectionIndex}`,
          order: sectionIndex,
          lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
            ...lesson,
            _id:
              lesson._id ||
              `lesson-${Date.now()}-${sectionIndex}-${lessonIndex}`,
            order: lessonIndex,
            duration: parseInt(lesson.duration) || 0,
            videoId: lesson.videoId || "",
            videoType: lesson.videoType || "youtube",
              videoFile: lesson.videoFile || null, // ADD THIS

            description: lesson.description || "",
            title: lesson.title || "New Lesson",
            isPreview: lesson.isPreview || false,
            content: lesson.content || "",
            resources: lesson.resources || [],
          })),
        })
      );
      setCurriculum(initializedCurriculum);
    } else {
      setCurriculum([]);
    }
  }, [course]);

  // ========== ADD QUIZ FUNCTIONS HERE ==========
  // Fetch existing quizzes for lessons
  useEffect(() => {
    if (course?._id) {
      fetchCourseQuizzes();
    }
  }, [course?._id]);

  // Add this debug effect to see state changes
  useEffect(() => {
    console.log("🔄 lessonQuizzes state updated:", lessonQuizzes);
  }, [lessonQuizzes]);

  // Also add this to see when curriculum loads
  useEffect(() => {
    console.log(
      "📚 Curriculum loaded:",
      curriculum.map((s) => ({
        section: s.title,
        lessons: s.lessons?.map((l) => ({ id: l._id, title: l.title })),
      }))
    );
  }, [curriculum]);

  // Add this debug effect
  useEffect(() => {
    console.log("🔍 Current lessonQuizzes state:", lessonQuizzes);
    console.log(
      "🔍 Current curriculum lessons:",
      curriculum.flatMap((s) =>
        s.lessons?.map((l) => ({ id: l._id, title: l.title }))
      )
    );
  }, [lessonQuizzes, curriculum]);

  const fetchCourseQuizzes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/quizzes/course/${course._id}`,
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      console.log("✅ Quizzes fetched:", response.data);

      // Organize quizzes by lessonId
      const quizzesByLesson = {};
      response.data.forEach((quiz) => {
        quizzesByLesson[quiz.lessonId] = quiz;
        console.log(`📝 Quiz found for lesson ${quiz.lessonId}:`, quiz.title);
      });
      setLessonQuizzes(quizzesByLesson);
      console.log("🎯 Final lessonQuizzes state:", quizzesByLesson);
    } catch (error) {
      console.log("No quizzes found or error fetching:", error.message);
      setLessonQuizzes({});
    }
  };

  // Open quiz modal for a lesson - FIXED VERSION
  const handleShowQuizModal = async (section, lesson) => {
    setCurrentSection(section);
    setCurrentLesson(lesson);

    setShowQuizModal(true); // Show modal immediately for better UX

    try {
      console.log("🔍 Checking for quiz for lesson:", lesson._id);
      const token = localStorage.getItem("token");

      // Always fetch the latest quiz data from backend
      const response = await axios.get(
        `http://localhost:5000/api/quizzes/lesson/${lesson._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );

      console.log("📊 Quiz fetch response:", response.data);

      if (response.data.success !== false && response.data._id) {
        // Quiz exists - use the fetched data
        const existingQuiz = response.data;
        console.log("✅ Found existing quiz:", existingQuiz.title);

        setQuizData({
          title: existingQuiz.title,
          description: existingQuiz.description,
          questions: existingQuiz.questions || [],
          passingScore: existingQuiz.passingScore || 70,
          maxAttempts: existingQuiz.maxAttempts || 3,
          timeLimit: existingQuiz.timeLimit || 30,
          isMandatory: existingQuiz.isMandatory !== false,
        });

        // Update local state to keep it in sync
        setLessonQuizzes((prev) => ({
          ...prev,
          [lesson._id]: existingQuiz,
        }));
      } else {
        // No quiz exists - set default data
        console.log("📝 No quiz found, creating new one");
        setQuizData({
          title: `Quiz: ${lesson.title}`,
          description: `Test your knowledge of ${lesson.title}`,
          questions: [],
          passingScore: 70,
          maxAttempts: 3,
          timeLimit: 30,
          isMandatory: true,
        });
      }
    } catch (error) {
      // If error (like 404), assume no quiz exists
      console.log("❌ Error fetching quiz, creating new:", error.message);
      setQuizData({
        title: `Quiz: ${lesson.title}`,
        description: `Test your knowledge of ${lesson.title}`,
        questions: [],
        passingScore: 70,
        maxAttempts: 3,
        timeLimit: 30,
        isMandatory: true,
      });
    }
  };
  // Save quiz to backend
  const handleSaveQuiz = async () => {
    if (!currentLesson || !course) return;

    setSavingQuiz(true);
    try {
      const token = localStorage.getItem("token");
      const quizPayload = {
        ...quizData,
        lessonId: currentLesson._id,
        courseId: course._id,
      };

      const existingQuiz = lessonQuizzes[currentLesson._id];
      let response;

      if (existingQuiz) {
        // Update existing quiz
        response = await axios.put(
          `http://localhost:5000/api/quizzes/${existingQuiz._id}`,
          quizPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new quiz
        response = await axios.post(
          "http://localhost:5000/api/quizzes",
          quizPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Update local state
      setLessonQuizzes((prev) => ({
        ...prev,
        [currentLesson._id]: response.data,
      }));

      setShowQuizModal(false);
      alert("Quiz saved successfully!");
    } catch (error) {
      console.error("Error saving quiz:", error);
      alert(
        "Failed to save quiz: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSavingQuiz(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (lessonId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const token = localStorage.getItem("token");
      const quiz = lessonQuizzes[lessonId];

      if (quiz?._id) {
        await axios.delete(`http://localhost:5000/api/quizzes/${quiz._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Update local state
        setLessonQuizzes((prev) => {
          const updated = { ...prev };
          delete updated[lessonId];
          return updated;
        });

        alert("Quiz deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      alert(
        "Failed to delete quiz: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // ========== ADD QUIZ QUESTION MANAGEMENT FUNCTIONS HERE ==========
  const addQuestion = (type = "multiple_choice") => {
    const newQuestion = {
      type,
      question: "",
      options: type === "multiple_choice" ? ["", "", "", ""] : [],
      correctAnswer: "",
      points: 1,
      explanation: "",
      expectedKeywords: type === "theory" ? [] : undefined,
      minWords: type === "theory" ? 50 : undefined,
      caseSensitive: false,
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (index, field, value) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const deleteQuestion = (index) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const moveQuestion = (index, direction) => {
    const newQuestions = [...quizData.questions];
    if (direction === "up" && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [
        newQuestions[index - 1],
        newQuestions[index],
      ];
    } else if (direction === "down" && index < newQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ];
    }
    setQuizData((prev) => ({ ...prev, questions: newQuestions }));
  };

  // Your existing functions (saveSection, saveLesson, addSection, etc.) remain the same
  const saveSection = async (sectionId) => {
    const section = curriculum.find((s) => s._id === sectionId);
    if (!section) return;

    setSavingSection((prev) => ({ ...prev, [sectionId]: true }));

    try {
      const isRealSectionId =
        section._id && !section._id.toString().startsWith("section-");

      if (isRealSectionId) {
        await onSave({
          type: "section",
          sectionId: section._id,
          data: {
            title: section.title,
            description: section.description,
            order: section.order,
          },
        });
      } else {
        console.log("Using bulk save for new section");
        await onSave({ curriculum });
      }
    } catch (error) {
      console.error("Failed to save section:", error);
      alert("Failed to save section: " + error.message);
    } finally {
      setSavingSection((prev) => ({ ...prev, [sectionId]: false }));
    }
  };

  const saveLesson = async (sectionId, lessonId) => {
    const section = curriculum.find((s) => s._id === sectionId);
    const lesson = section?.lessons.find((l) => l._id === lessonId);
    if (!lesson) return;

    const saveKey = `${sectionId}-${lessonId}`;
    setSavingLesson((prev) => ({ ...prev, [saveKey]: true }));

    try {
      let videoUrl = "";
      if (lesson.videoType === "youtube" && lesson.videoId) {
        videoUrl = `https://www.youtube.com/watch?v=${lesson.videoId}`;
      }

      const isRealSectionId =
        section._id && !section._id.toString().startsWith("section-");
      const isRealLessonId =
        lesson._id && !lesson._id.toString().startsWith("lesson-");

      if (isRealSectionId && isRealLessonId) {
        await onSave({
          type: "lesson",
          sectionId: section._id,
          lessonId: lesson._id,
          data: {
            title: lesson.title,
            description: lesson.description,
            duration: lesson.duration,
            videoUrl: videoUrl,
            videoType: lesson.videoType,
            isPreview: lesson.isPreview,
            content: lesson.content,
            resources: lesson.resources,
            order: lesson.order,
          },
        });
      } else {
        console.log("Using bulk save for new lesson/section");
        await onSave({ curriculum });
      }
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson: " + error.message);
    } finally {
      setSavingLesson((prev) => ({ ...prev, [saveKey]: false }));
    }
  };

  const addSection = () => {
    const newSection = {
      _id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: "New Section",
      description: "",
      order: curriculum.length,
      lessons: [],
    };
    const updatedCurriculum = [...curriculum, newSection];
    setCurriculum(updatedCurriculum);
  };

  const updateSection = (sectionId, fieldOrUpdates, value) => {
    const updatedCurriculum = curriculum.map((section) => {
      if (section._id === sectionId) {
        if (typeof fieldOrUpdates === "object") {
          return { ...section, ...fieldOrUpdates };
        } else {
          return { ...section, [fieldOrUpdates]: value };
        }
      }
      return section;
    });
    setCurriculum(updatedCurriculum);
  };

  const deleteSection = (sectionId) => {
    if (window.confirm("Delete this section and all its lessons?")) {
      const updatedCurriculum = curriculum.filter(
        (section) => section._id !== sectionId
      );
      setCurriculum(updatedCurriculum);
    }
  };

  const addLesson = (sectionId) => {
    const newLesson = {
      _id: `lesson-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: "New Lesson",
      description: "",
      videoType: "youtube",
      videoId: "",
      duration: 5,
      order: 0,
      isPreview: false,
      content: "",
      resources: [],
    };

    const updatedCurriculum = curriculum.map((section) => {
      if (section._id === sectionId) {
        const currentLessons = section.lessons || [];
        return {
          ...section,
          lessons: [
            ...currentLessons,
            { ...newLesson, order: currentLessons.length },
          ],
        };
      }
      return section;
    });

    setCurriculum(updatedCurriculum);
  };

  const updateLesson = (sectionId, lessonId, fieldOrUpdates, value) => {
    const updatedCurriculum = curriculum.map((section) => {
      if (section._id === sectionId) {
        return {
          ...section,
          lessons: section.lessons.map((lesson) => {
            if (lesson._id === lessonId) {
              if (typeof fieldOrUpdates === "object") {
                return { ...lesson, ...fieldOrUpdates };
              } else {
                return { ...lesson, [fieldOrUpdates]: value };
              }
            }
            return lesson;
          }),
        };
      }
      return section;
    });

    setCurriculum(updatedCurriculum);
  };

  const deleteLesson = (sectionId, lessonId) => {
    if (window.confirm("Delete this lesson?")) {
      const updatedCurriculum = curriculum.map((section) => {
        if (section._id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.filter(
              (lesson) => lesson._id !== lessonId
            ),
          };
        }
        return section;
      });

      setCurriculum(updatedCurriculum);
    }
  };

  const getTotalLessons = () => {
    return curriculum.reduce(
      (total, section) => total + (section.lessons?.length || 0),
      0
    );
  };

  const extractYouTubeId = (input) => {
    if (!input) return "";

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return input;
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4>Course Curriculum Builder</h4>
              <p className="text-muted mb-0">
                Build your course content - save each section and lesson
                individually
              </p>
            </div>
            <div className="d-flex align-items-center gap-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={fetchCourseQuizzes}
                title="Refresh quizzes"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh Quizzes
              </Button>
              <Badge bg="primary" className="fs-6">
                {getTotalLessons()}{" "}
                {getTotalLessons() === 1 ? "Lesson" : "Lessons"}
              </Badge>
            </div>
          </div>
          {curriculum.length === 0 && (
            <Alert variant="info" className="text-center">
              <i className="bi bi-info-circle me-2"></i>
              Start by adding sections to organize your course content
            </Alert>
          )}

          {curriculum.map((section, sectionIndex) => (
            <Card key={section._id} className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="flex-grow-1 me-3">
                    <Form.Control
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(section._id, "title", e.target.value)
                      }
                      placeholder="Section Title"
                      className="border-0 fs-5 fw-bold bg-transparent"
                    />
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={section.description}
                      onChange={(e) =>
                        updateSection(
                          section._id,
                          "description",
                          e.target.value
                        )
                      }
                      placeholder="What will students learn in this section?"
                      className="mt-2 border-0 bg-transparent"
                    />
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <Badge bg="secondary">
                      {section.lessons?.length || 0} lessons
                    </Badge>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveSection(section._id)}
                      disabled={savingSection[section._id]}
                    >
                      {savingSection[section._id] ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-1"
                        />
                      ) : (
                        <i className="bi bi-save me-1"></i>
                      )}
                      {savingSection[section._id] ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteSection(section._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </div>
                </div>
              </Card.Header>

              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Lessons in this section</h6>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => addLesson(section._id)}
                  >
                    <i className="bi bi-plus me-1"></i>
                    Add Lesson
                  </Button>
                </div>

                {section.lessons?.length === 0 ? (
                  <Alert variant="light" className="text-center">
                    <i className="bi bi-journals me-2"></i>
                    No lessons yet. Add your first lesson to this section.
                  </Alert>
                ) : (
                  <div className="lessons-list">
                    {section.lessons?.map((lesson, lessonIndex) => (
                      <Card key={lesson._id} className="mb-3 border">
                        <Card.Body>
                          {/* ========== MODIFIED: ADD QUIZ BADGE HERE ========== */}
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="primary" pill>
                                {lessonIndex + 1}
                              </Badge>
                              <span className="fw-bold">{lesson.title}</span>
                              {lessonQuizzes[lesson._id] && (
                                <Badge bg="info" className="ms-2">
                                  <i className="bi bi-patch-question me-1"></i>
                                  Quiz
                                </Badge>
                              )}
                            </div>
                            {/* ========== MODIFIED: ADD QUIZ BUTTON HERE ========== */}
                            <div className="d-flex gap-1">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() =>
                                  saveLesson(section._id, lesson._id)
                                }
                                disabled={
                                  savingLesson[`${section._id}-${lesson._id}`]
                                }
                              >
                                {savingLesson[
                                  `${section._id}-${lesson._id}`
                                ] ? (
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                    className="me-1"
                                  />
                                ) : (
                                  <i className="bi bi-save me-1"></i>
                                )}
                                {savingLesson[`${section._id}-${lesson._id}`]
                                  ? "Saving..."
                                  : "Save"}
                              </Button>

                              {/* In your lesson button section */}
                              <Button
                                variant={
                                  lessonQuizzes[lesson._id]
                                    ? "warning"
                                    : "outline-primary"
                                }
                                size="sm"
                                onClick={() =>
                                  handleShowQuizModal(section, lesson)
                                }
                                disabled={
                                  savingLesson[`${section._id}-${lesson._id}`]
                                }
                              >
                                <i className="bi bi-patch-question me-1"></i>
                                {lessonQuizzes[lesson._id]
                                  ? "Edit Quiz"
                                  : "Add Quiz"}
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  deleteLesson(section._id, lesson._id)
                                }
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </div>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Lesson Title *</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(
                                      section._id,
                                      lesson._id,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., Introduction to React"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Duration (min) *</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="1"
                                  value={lesson.duration}
                                  onChange={(e) =>
                                    updateLesson(
                                      section._id,
                                      lesson._id,
                                      "duration",
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  placeholder="15"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={3}>
                              <Form.Group className="mb-3">
                                <Form.Label>Video Type</Form.Label>
                                <Form.Select
                                  value={lesson.videoType}
                                  onChange={(e) =>
                                    updateLesson(
                                      section._id,
                                      lesson._id,
                                      "videoType",
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="youtube">YouTube</option>
                                  <option value="upload">Upload</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                      {lesson.videoType === "youtube" && (
  <Form.Group className="mb-3">
    <Form.Label>YouTube Video ID or URL</Form.Label>
    <Form.Control
      type="text"
      value={lesson.videoId}
      onChange={(e) => {
        const cleanId = extractYouTubeId(e.target.value);
        updateLesson(section._id, lesson._id, "videoId", cleanId);
      }}
      placeholder="dQw4w9WgXcQ or https://youtube.com/watch?v=..."
    />
    <Form.Text className="text-muted">
      Paste full YouTube URL or just the video ID
    </Form.Text>
    {lesson.videoId && (
      <div className="mt-3">
        <div className="ratio ratio-16x9">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.videoId}`}
            title="YouTube video preview"
            allowFullScreen
            style={{
              border: "1px solid #dee2e6",
              borderRadius: "0.375rem",
            }}
          />
        </div>
        <small className="text-muted">
          Preview: {lesson.videoId}
        </small>
      </div>
    )}
  </Form.Group>
)}

{lesson.videoType === "upload" && (
  <Form.Group className="mb-3">
    <Form.Label>Upload Video</Form.Label>
    <VideoUpload
      sectionId={section._id}
      lessonId={lesson._id}
      courseId={course._id}
      currentVideo={lesson.videoFile}
      onVideoUploaded={(videoData) => {
        updateLesson(section._id, lesson._id, {
          videoFile: videoData,
          videoId: videoData.url
        });
      }}
      onVideoDeleted={() => {
        updateLesson(section._id, lesson._id, {
          videoFile: null,
          videoId: ""
        });
      }}
    />
  </Form.Group>
)}

                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={lesson.description}
                              onChange={(e) =>
                                updateLesson(
                                  section._id,
                                  lesson._id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="What will students learn in this lesson?"
                            />
                          </Form.Group>

                          <Form.Check
                            type="checkbox"
                            label="Preview Lesson (students can watch without enrolling)"
                            checked={lesson.isPreview}
                            onChange={(e) =>
                              updateLesson(
                                section._id,
                                lesson._id,
                                "isPreview",
                                e.target.checked
                              )
                            }
                          />
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}

          <div className="text-center mb-4">
            <Button onClick={addSection} variant="outline-primary" size="lg">
              <i className="bi bi-plus-circle me-2"></i>
              Add Section
            </Button>
          </div>
        </Col>
      </Row>

      {/* ========== ADD QUIZ MODAL HERE (AT THE END) ========== */}
      <Modal
        show={showQuizModal}
        onHide={() => setShowQuizModal(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-patch-question me-2"></i>
            {lessonQuizzes[currentLesson?._id]
              ? "Edit Quiz"
              : "Create Quiz"}{" "}
            for {currentLesson?.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Quiz Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={quizData.title}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter quiz title"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Time Limit (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quizData.timeLimit}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        timeLimit: parseInt(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={quizData.description}
                onChange={(e) =>
                  setQuizData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter quiz description"
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Passing Score (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={quizData.passingScore}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        passingScore: parseInt(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Max Attempts</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    value={quizData.maxAttempts}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        maxAttempts: parseInt(e.target.value),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Mandatory"
                    checked={quizData.isMandatory}
                    onChange={(e) =>
                      setQuizData((prev) => ({
                        ...prev,
                        isMandatory: e.target.checked,
                      }))
                    }
                    className="mt-4"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Questions Section */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Questions ({quizData.questions.length})</h5>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => addQuestion("multiple_choice")}
                    className="me-2"
                  >
                    + Multiple Choice
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => addQuestion("theory")}
                  >
                    + Theory Question
                  </Button>
                </div>
              </div>

              {quizData.questions.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  No questions yet. Add your first question to this quiz.
                </Alert>
              ) : (
                <Accordion defaultActiveKey="0">
                  {quizData.questions.map((question, index) => (
                    <Accordion.Item key={index} eventKey={index.toString()}>
                      <Accordion.Header>
                        <div className="d-flex justify-content-between align-items-center w-100 me-3">
                          <span>
                            Q{index + 1}: {question.question || "New Question"}
                            <Badge bg="secondary" className="ms-2">
                              {question.type === "multiple_choice"
                                ? "Multiple Choice"
                                : "Theory"}
                            </Badge>
                            <Badge bg="primary" className="ms-1">
                              {question.points} pt
                              {question.points !== 1 ? "s" : ""}
                            </Badge>
                          </span>
                          <div className="d-flex gap-1">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(index, "up");
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveQuestion(index, "down");
                              }}
                              disabled={index === quizData.questions.length - 1}
                            >
                              ↓
                            </Button>
                          </div>
                        </div>
                      </Accordion.Header>
                      <Accordion.Body>
                        <QuizQuestionEditor
                          question={question}
                          index={index}
                          onChange={updateQuestion}
                          onDelete={() => deleteQuestion(index)}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {currentLesson && lessonQuizzes[currentLesson._id] && (
            <Button
              variant="outline-danger"
              onClick={() => handleDeleteQuiz(currentLesson._id)}
              className="me-auto"
            >
              <i className="bi bi-trash me-1"></i>
              Delete Quiz
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowQuizModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveQuiz}
            disabled={savingQuiz || quizData.questions.length === 0}
          >
            {savingQuiz ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Quiz"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
