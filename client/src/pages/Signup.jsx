import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  Spinner
} from 'react-bootstrap';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center signup-container py-4">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="border-0 signup-card">
            <Card.Body className="p-4 p-md-5">
              {/* Header with calming icon */}
              <div className="text-center mb-4">
                <div className="signup-icon-wrapper mb-4">
                  <i className="bi bi-person-plus signup-icon"></i>
                </div>
                <h2 className="signup-title mb-2">Join LearnHub</h2>
                <p className="signup-subtitle">Start your learning journey today</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert 
                  variant="light" 
                  className="border-0 alert-custom"
                  dismissible 
                  onClose={() => setError('')}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  {error}
                </Alert>
              )}

              {/* Signup Form */}
              <Form onSubmit={handleSubmit} className="mt-4">
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    Full Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className="form-control-custom py-3"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="form-control-custom py-3"
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label-custom">
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    required
                    className="form-control-custom py-3"
                    disabled={loading}
                  />
                  <Form.Text className="password-hint">
                    Must be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-custom">
                    I want to join as a
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="form-control-custom py-3"
                    disabled={loading}
                  >
                    <option value="student">🎓 Student</option>
                    <option value="instructor">👨‍🏫 Instructor</option>
                  </Form.Select>
                  <Form.Text className="role-hint">
                    {formData.role === 'student' 
                      ? 'Explore courses and start learning' 
                      : 'Create and share your knowledge'}
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 signup-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Creating Your Account...
                    </>
                  ) : (
                    'Create My Account'
                  )}
                </Button>
              </Form>

              {/* Divider */}
              <div className="position-relative text-center my-4">
                <hr className="divider-line" />
                <span className="divider-text">or</span>
              </div>

              {/* Alternative Options */}
              <div className="text-center">
                <Button 
                  variant="outline-secondary" 
                  className="w-100 py-2 alternative-button mb-3"
                  disabled={loading}
                >
                  <i className="bi bi-google me-2"></i>
                  Sign up with Google
                </Button>
              </div>

              {/* Login Link */}
              <div className="text-center mt-4 pt-3">
                <p className="login-text mb-0">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="login-link"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Terms Notice */}
              <div className="text-center mt-3">
                <p className="terms-text">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="terms-link">Terms</Link> and{' '}
                  <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Custom Styles */}
      <style>{`
        .signup-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .signup-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .signup-card:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.08);
        }
        
        .signup-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        
        .signup-icon {
          font-size: 2rem;
          color: #667eea;
        }
        
        .signup-title {
          color: #2d3748;
          font-weight: 600;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .signup-subtitle {
          color: #718096;
          font-size: 1rem;
          margin: 0;
        }
        
        .form-label-custom {
          color: #4a5568;
          font-weight: 500;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .form-control-custom {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.3s ease;
          font-size: 1rem;
        }
        
        .form-control-custom:focus {
          border-color: #a8edea;
          box-shadow: 0 0 0 3px rgba(168, 237, 234, 0.2);
          background: white;
        }
        
        .password-hint, .role-hint {
          color: #a0aec0;
          font-size: 0.85rem;
          margin-top: 0.25rem;
          display: block;
        }
        
        .signup-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .signup-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .signup-button:disabled {
          opacity: 0.7;
        }
        
        .alternative-button {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #4a5568;
          transition: all 0.3s ease;
        }
        
        .alternative-button:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-1px);
        }
        
        .login-text {
          color: #718096;
          font-size: 0.95rem;
        }
        
        .login-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .login-link:hover {
          color: #5a67d8;
        }
        
        .terms-text {
          color: #a0aec0;
          font-size: 0.8rem;
          margin: 0;
        }
        
        .terms-link {
          color: #667eea;
          text-decoration: none;
        }
        
        .terms-link:hover {
          text-decoration: underline;
        }
        
        .alert-custom {
          background: rgba(254, 215, 215, 0.3);
          color: #e53e3e;
          border-radius: 12px;
        }
        
        .divider-line {
          border-color: #e2e8f0;
          margin: 1.5rem 0;
        }
        
        .divider-text {
          background: white;
          padding: 0 1rem;
          color: #a0aec0;
          font-size: 0.9rem;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        /* Role-specific styling */
        select option {
          padding: 10px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .signup-card .card-body {
            padding: 2rem !important;
          }
          
          .signup-icon-wrapper {
            width: 70px;
            height: 70px;
          }
          
          .signup-icon {
            font-size: 1.75rem;
          }
          
          .signup-title {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 576px) {
          .signup-card .card-body {
            padding: 1.5rem !important;
          }
          
          .form-control-custom {
            padding: 0.75rem 1rem;
          }
          
          .signup-title {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 360px) {
          .signup-card .card-body {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default Signup;