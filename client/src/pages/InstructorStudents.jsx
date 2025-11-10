// client/src/pages/InstructorStudents.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const InstructorStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data - moved outside useEffect to ensure it's always available
  const mockStudents = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      courseName: 'React Fundamentals',
      enrolledDate: '2024-01-10',
      progress: 75,
      lastActivity: '2 days ago'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      courseName: 'Advanced JavaScript',
      enrolledDate: '2024-01-08',
      progress: 90,
      lastActivity: '1 day ago'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      courseName: 'React Fundamentals',
      enrolledDate: '2024-01-12',
      progress: 45,
      lastActivity: '1 week ago'
    },
    { 
      id: 4, 
      name: 'Sarah Wilson', 
      email: 'sarah@example.com', 
      courseName: 'Advanced JavaScript',
      enrolledDate: '2024-01-05',
      progress: 100,
      lastActivity: 'Today'
    },
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // Try to fetch from API
      const response = await axios.get(
        'http://localhost:5000/api/instructor/students',
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout
        }
      );

      if (response.data && response.data.students) {
        setStudents(response.data.students);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.log('API not available, using mock data:', err.message);
      setError('Connected with demo data. Real data will load when backend is ready.');
      setStudents(mockStudents); // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchStudents();
  };

  const handleUseDemoData = () => {
    setStudents(mockStudents);
    setError('Using demonstration data');
    setLoading(false);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary" />
              <p className="mt-3 text-muted">Loading your students...</p>
              <Button variant="outline-primary" onClick={handleUseDemoData} className="mt-2">
                Use Demo Data Instead
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          {error && (
            <Alert variant="info" className="mb-4">
              <Alert.Heading>Demo Mode</Alert.Heading>
              {error}
              <div className="mt-2">
                <Button variant="outline-primary" size="sm" onClick={handleRetry}>
                  Retry API Connection
                </Button>
              </div>
            </Alert>
          )}

          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="h3 mb-1">My Students</h2>
              <p className="text-muted mb-0">
                Students enrolled in your courses 
                <Badge bg="primary" className="ms-2">{students.length} students</Badge>
              </p>
            </div>
            <Button variant="outline-primary" onClick={handleUseDemoData}>
              Refresh Data
            </Button>
          </div>

          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Student Enrollments</h5>
              <Badge bg="light" text="dark">
                {students.length} records
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {students.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bi bi-people" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  </div>
                  <h5>No Students Found</h5>
                  <p className="text-muted mb-3">You don't have any students enrolled in your courses yet.</p>
                  <Button variant="primary" onClick={handleUseDemoData}>
                    Load Demo Data
                  </Button>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Enrolled Date</th>
                      <th>Progress</th>
                      <th>Last Activity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="avatar-sm rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ 
                                backgroundColor: `hsl(${student.id * 60}, 70%, 50%)` 
                              }}
                            >
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fw-semibold">{student.name}</div>
                              <small className="text-muted">{student.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{student.courseName}</span>
                        </td>
                        <td>{student.enrolledDate}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <small className="text-muted">{student.progress}%</small>
                          </div>
                        </td>
                        <td>
                          <small className={
                            student.lastActivity === 'Today' ? 'text-success fw-medium' : 
                            student.lastActivity === '1 day ago' ? 'text-primary' : 'text-muted'
                          }>
                            {student.lastActivity}
                          </small>
                        </td>
                        <td>
                          <Badge 
                            bg={
                              student.progress === 100 ? 'success' :
                              student.progress >= 50 ? 'primary' :
                              student.progress > 0 ? 'warning' : 'secondary'
                            }
                          >
                            {student.progress === 100 ? 'Completed' :
                             student.progress >= 50 ? 'In Progress' :
                             student.progress > 0 ? 'Started' : 'Not Started'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Quick Stats */}
          {students.length > 0 && (
            <Row className="mt-4">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-primary">{students.filter(s => s.progress === 100).length}</h4>
                    <p className="text-muted mb-0">Completed</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-primary">{students.filter(s => s.progress >= 50 && s.progress < 100).length}</h4>
                    <p className="text-muted mb-0">In Progress</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-warning">{students.filter(s => s.progress > 0 && s.progress < 50).length}</h4>
                    <p className="text-muted mb-0">Just Started</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <h4 className="text-success">{students.length}</h4>
                    <p className="text-muted mb-0">Total Students</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      <style>{`
        .avatar-sm {
          width: 40px;
          height: 40px;
          font-size: 1rem;
        }
        .progress {
          background-color: #e9ecef;
          border-radius: 0.375rem;
        }
        .progress-bar {
          background-color: #4f46e5;
          border-radius: 0.375rem;
          transition: width 0.6s ease;
        }
      `}</style>
    </Container>
  );
};

export default InstructorStudents;