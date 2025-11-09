// client/src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import './Checkout.css';

// Initialize Stripe - FIXED for Vite
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

// Payment Form Component - FIXED VERSION
const CheckoutForm = ({ course, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Don't use return_url - handle everything manually
          // return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message);
        setProcessing(false);
        return;
      }

      // If we get here, payment was successful
      // Call the success handler to complete enrollment
      await onSuccess();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-summary mb-4 p-3 bg-light rounded">
        <h6 className="fw-bold">Order Summary</h6>
        <div className="d-flex justify-content-between mb-2">
          <span>Course: {course.title}</span>
          <span>${course.price}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span>${course.price}</span>
        </div>
      </div>

      <div className="payment-section mb-4">
        <h6 className="fw-bold mb-3">Payment Details</h6>
        <PaymentElement />
      </div>
      
      {error && (
        <Alert variant="danger" className="mt-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <div className="d-flex gap-2 mt-4">
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          className="flex-fill"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={!stripe || processing}
          className="flex-fill"
        >
          {processing ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Processing...
            </>
          ) : (
            `Pay $${course.price}`
          )}
        </Button>
      </div>
    </form>
  );
};

// Main Checkout Component
const Checkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/checkout/${id}`);
      return;
    }
    fetchCourse();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get course details
      const courseResponse = await axios.get(
        `http://localhost:5000/api/courses/${id}`
      );
      setCourse(courseResponse.data);

      // Create payment intent for paid courses
      if (courseResponse.data.price > 0) {
        const token = localStorage.getItem('token');
        const paymentResponse = await axios.post(
          'http://localhost:5000/api/payments/create-payment-intent',
          { courseId: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.data.success) {
          setClientSecret(paymentResponse.data.clientSecret);
        } else {
          setError(paymentResponse.data.message || 'Payment setup failed');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to load checkout page');
    } finally {
      setLoading(false);
    }
  };

const handlePaymentSuccess = async (paymentIntentId = 'manual') => {
  try {
    setPaymentLoading(true);
    const token = localStorage.getItem('token');
    
    // For both paid and free courses, confirm enrollment first
    const enrollmentResponse = await axios.post(
      'http://localhost:5000/api/payments/confirm-enrollment',
      { 
        courseId: id,
        paymentIntentId: course.price > 0 ? paymentIntentId : 'free_course'
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (enrollmentResponse.data.success) {
      // Redirect to success page with course ID
      navigate(`/payment-success?course_id=${id}&payment_intent=${paymentIntentId}`);
    } else {
      setError(enrollmentResponse.data.message || 'Enrollment failed');
    }
    
  } catch (err) {
    console.error('Enrollment confirmation error:', err);
    setError(err.response?.data?.message || 'Payment successful but enrollment failed. Please contact support.');
  } finally {
    setPaymentLoading(false);
  }
};

  const handleCancel = () => {
    navigate(`/courses/${id}`);
  };

  if (loading) {
    return (
      <Container fluid className="checkout-container px-3 px-md-4 py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading checkout...</p>
        </div>
      </Container>
    );
  }

  if (error && !course) {
    return (
      <Container fluid className="checkout-container px-3 px-md-4 py-4">
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
    <Container fluid className="checkout-container px-2 px-md-4 py-3 py-md-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white py-3">
              <h4 className="mb-0 fw-bold">
                <i className="bi bi-credit-card me-2"></i>
                Checkout
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {course && (
                <>
                  {/* Course Summary */}
                  <div className="course-summary mb-4 p-3 bg-light rounded">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=100&h=100&fit=crop'}
                        alt={course.title}
                        className="course-thumbnail me-3 rounded"
                        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="fw-bold mb-1">{course.title}</h6>
                        <p className="text-muted mb-0 small">{course.instructor?.name}</p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-medium">Total Amount:</span>
                      <span className="h5 mb-0 text-primary fw-bold">${course.price}</span>
                    </div>
                  </div>

                  {/* Payment Form */}
                  {course.price > 0 ? (
                    clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm 
                          course={course}
                          onSuccess={handlePaymentSuccess}
                          onCancel={handleCancel}
                        />
                      </Elements>
                    ) : (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Setting up payment...</p>
                      </div>
                    )
                  ) : (
                    // Free course enrollment
                    <div className="text-center py-4">
                      <div className="success-icon mb-3">
                        <i className="bi bi-gift-fill text-success" style={{ fontSize: '3rem' }}></i>
                      </div>
                      <h5 className="fw-bold text-success mb-3">Free Course Enrollment</h5>
                      <p className="text-muted mb-4">
                        This course is completely free! Click the button below to enroll immediately.
                      </p>
                      <div className="d-grid gap-2">
                        <Button 
                          variant="success" 
                          size="lg"
                          onClick={handlePaymentSuccess}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Enroll for Free
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary"
                          onClick={handleCancel}
                          disabled={paymentLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          {/* Security Notice */}
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body className="p-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-shield-check text-success me-3 fs-4"></i>
                <div>
                  <h6 className="fw-bold mb-1">Secure Payment</h6>
                  <p className="text-muted mb-0 small">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Success Modal */}
      <Modal show={showSuccessModal} centered>
        <Modal.Body className="text-center p-4">
          <div className="success-icon mb-3">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h4 className="fw-bold text-success mb-3">Enrollment Successful!</h4>
          <p className="text-muted mb-4">
            You have successfully enrolled in <strong>{course?.title}</strong>. 
            Redirecting to learning page...
          </p>
          <Spinner animation="border" variant="success" />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Checkout;