const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress'); // ADD THIS IMPORT
const router = express.Router();

// Create payment intent for course enrollment
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Validate course ID
    if (!courseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Course ID is required' 
      });
    }
    
    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot enroll in unpublished course' 
      });
    }

    // Check if user is already enrolled
    if (course.studentsEnrolled.includes(req.user.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'You are already enrolled in this course' 
      });
    }

    // For free courses, enroll directly
    if (course.price === 0) {
      // Enroll student immediately for free courses
      course.studentsEnrolled.push(req.user.id);
      await course.save();

      // Create progress record
      const progress = new Progress({
        studentId: req.user.id,
        courseId: course._id,
        progressPercentage: 0,
        completedLessons: [],
        totalTimeSpent: 0
      });
      await progress.save();

      // Add course to user's enrolled courses
      await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { enrolledCourses: courseId }
      });

      return res.json({ 
        success: true,
        freeCourse: true,
        message: 'Successfully enrolled in free course',
        course: {
          _id: course._id,
          title: course.title,
          description: course.description
        }
      });
    }

    // Validate Stripe secret key
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Stripe configuration error'
      });
    }

    // Create payment intent for paid courses
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: courseId.toString(),
        userId: req.user.id.toString(),
        courseTitle: course.title
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: course.price,
      courseTitle: course.title,
      courseId: course._id
    });
  } catch (err) {
    console.error('Create payment intent error:', err);
    
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment request' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Payment processing error' 
    });
  }
});

// Handle successful payment and enroll student
router.post('/confirm-enrollment', auth, async (req, res) => {
  try {
    const { courseId, paymentIntentId } = req.body;

    // Validate input
    if (!courseId) {
      return res.status(400).json({ 
        success: false,
        message: 'Course ID is required' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found' 
      });
    }

    // For paid courses, verify payment with Stripe
    if (course.price > 0) {
      if (!paymentIntentId) {
        return res.status(400).json({ 
          success: false,
          message: 'Payment intent ID is required for paid courses' 
        });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ 
          success: false,
          message: 'Payment not completed' 
        });
      }

      // Verify the payment is for the correct course and user
      if (paymentIntent.metadata.courseId !== courseId.toString() ||
          paymentIntent.metadata.userId !== req.user.id.toString()) {
        return res.status(400).json({ 
          success: false,
          message: 'Payment verification failed' 
        });
      }
    }

    // Enroll student if not already enrolled
    if (!course.studentsEnrolled.includes(req.user.id)) {
      course.studentsEnrolled.push(req.user.id);
      await course.save();

      // Create progress record
      const progress = new Progress({
        studentId: req.user.id,
        courseId: course._id,
        progressPercentage: 0,
        completedLessons: [],
        totalTimeSpent: 0
      });
      await progress.save();
    }

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: courseId }
    });

    res.json({ 
      success: true, 
      message: 'Successfully enrolled in the course!',
      course: {
        _id: course._id,
        title: course.title,
        description: course.description
      }
    });
  } catch (err) {
    console.error('Confirm enrollment error:', err);
    
    if (err.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment intent' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Enrollment failed' 
    });
  }
});

// Get payment history for user
router.get('/payment-history', auth, async (req, res) => {
  try {
    // In a production app, you should store payment records in your database
    // This Stripe API call will only work for payments made through your Stripe account
    
    const payments = await stripe.paymentIntents.list({
      limit: 10,
    });

    // Filter payments for the current user
    const userPayments = payments.data.filter(payment => 
      payment.metadata.userId === req.user.id
    );

    res.json({ 
      success: true,
      payments: userPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100, // Convert back to dollars
        currency: payment.currency,
        status: payment.status,
        created: new Date(payment.created * 1000),
        courseTitle: payment.metadata.courseTitle,
        courseId: payment.metadata.courseId
      }))
    });
  } catch (err) {
    console.error('Get payment history error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch payment history' 
    });
  }
});

// Webhook endpoint for Stripe (for production)
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Here you can update your database, send email, etc.
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({received: true});
});

module.exports = router;