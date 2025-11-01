// client/src/pages/EditCourse.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInstructor } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: 'beginner',
    thumbnail: '',
    isPublished: false
  });

  const categories = [
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
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    if (!isInstructor) {
      navigate('/dashboard/my-courses');
      return;
    }
    fetchCourse();
  }, [id, isInstructor, navigate]);

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/courses/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setFormData({
        title: response.data.title,
        description: response.data.description,
        price: response.data.price,
        category: response.data.category,
        level: response.data.level,
        thumbnail: response.data.thumbnail || '',
        isPublished: response.data.isPublished
      });
    } catch (err) {
      setError('Failed to fetch course details');
      console.error('Fetch course error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/courses/${id}`,
        {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          level: formData.level,
          thumbnail: formData.thumbnail,
          isPublished: formData.isPublished
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Course updated successfully!');
      setTimeout(() => {
        navigate('/dashboard/my-courses');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update course');
      console.error('Update course error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="create-course-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading course...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="create-course-container px-3 px-md-4 py-4">
      <Row className="justify-content-center">
        <Col xs={12} xl={10} xxl={8}>
          <div className="text-center mb-4">
            <h1 className="page-title mb-2">Edit Course</h1>
            <p className="page-subtitle">
              Update your course information
            </p>
          </div>

          <Card className="form-card border-0">
            <Card.Body className="p-4 p-lg-5">
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert variant="success" className="mb-4">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Course Title *</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Description *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Category *</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      >
                        <option value="">Select category...</option>
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Level *</Form.Label>
                      <Form.Select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        required
                        className="form-control-custom"
                      >
                        {levels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Price (USD) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="form-label">Thumbnail URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="thumbnail"
                        value={formData.thumbnail}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="form-control-custom"
                      />
                    </Form.Group>
                  </Col>

                  <Col lg={12}>
                    <Form.Group className="mb-4">
                      <Form.Check
                        type="checkbox"
                        name="isPublished"
                        label="Publish course (make it publicly visible)"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({
                          ...formData,
                          isPublished: e.target.checked
                        })}
                        className="form-check-custom"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 justify-content-end pt-4 border-top">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/dashboard/my-courses')}
                    className="action-btn cancel-btn"
                    disabled={updating}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="action-btn submit-btn"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating Course...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update Course
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditCourse;