// client/src/pages/MyCourses.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Container, Alert, Spinner } from "react-bootstrap";
import InstructorCourses from "../components/MyCourses/InstructorCourses";
import StudentCourses from "../components/MyCourses/StudentCourses";
import "./MyCourses.css";

const MyCourses = () => {
  const { user, isInstructor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Container fluid className="my-courses-container px-3 px-md-4 py-4">
        <div className="loading-spinner">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading your courses...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="my-courses-container px-3 px-md-4 py-4">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="error-alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {isInstructor ? (
        <InstructorCourses error={error} setError={setError} />
      ) : (
        <StudentCourses error={error} setError={setError} />
      )}
    </Container>
  );
};

export default MyCourses;