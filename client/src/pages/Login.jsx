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

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center login-container py-4">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5} xl={4}>
          <Card className="border-0 login-card">
            <Card.Body className="p-4 p-md-5">
              {/* Header with calming icon */}
              <div className="text-center mb-4">
                <div className="login-icon-wrapper mb-4">
                  <i className="bi bi-flower1 login-icon"></i>
                </div>
                <h2 className="login-title mb-2">Welcome Back</h2>
                <p className="login-subtitle">Continue your learning journey</p>
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

              {/* Login Form */}
              <Form onSubmit={handleSubmit} className="mt-4">
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

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-custom">
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="form-control-custom py-3"
                    disabled={loading}
                  />
                  <div className="text-end mt-2">
                    <Link 
                      to="/forgot-password" 
                      className="forgot-password-link"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 login-button"
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
                      Signing In...
                    </>
                  ) : (
                    'Sign In to Your Account'
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
                  Continue with Google
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-4 pt-3">
                <p className="signup-text mb-0">
                  New to LearnHub?{' '}
                  <Link 
                    to="/signup" 
                    className="signup-link"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Custom Styles */}
      <style>{`
        .login-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          box-shadow: 
            0 10px 30px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.08);
        }
        
        .login-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          border-radius: 50%;
          margin-bottom: 1rem;
        }
        
        .login-icon {
          font-size: 2rem;
          color: #667eea;
        }
        
        .login-title {
          color: #2d3748;
          font-weight: 600;
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        
        .login-subtitle {
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
        
        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        .login-button:disabled {
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
        
        .forgot-password-link {
          color: #718096;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }
        
        .forgot-password-link:hover {
          color: #667eea;
        }
        
        .signup-text {
          color: #718096;
          font-size: 0.95rem;
        }
        
        .signup-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }
        
        .signup-link:hover {
          color: #5a67d8;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .login-card .card-body {
            padding: 2rem !important;
          }
          
          .login-icon-wrapper {
            width: 70px;
            height: 70px;
          }
          
          .login-icon {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 576px) {
          .login-card .card-body {
            padding: 1.5rem !important;
          }
          
          .login-title {
            font-size: 1.5rem;
          }
          
          .form-control-custom {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default Login;