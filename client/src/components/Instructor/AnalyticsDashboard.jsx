// client/src/components/Instructor/AnalyticsDashboard.jsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Spinner, Tabs, Tab, Container } from 'react-bootstrap';
import OverviewCards from './analytics/OverviewCards';
import QuizAnalytics from './analytics/QuizAnalytics'; // FIXED: Changed from IndividualQuizAnalytics to QuizAnalytics
import StudentProgress from './analytics/StudentProgress';
import EnrollmentTrends from './analytics/EnrollmentTrends';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch all analytics data in parallel
      const [overviewRes, quizzesRes, progressRes, trendsRes] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/overview', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/analytics/quizzes', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/analytics/student-progress', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/analytics/enrollment-trends', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [overviewData, quizzesData, progressData, trendsData] = await Promise.all([
        overviewRes.json(),
        quizzesRes.json(),
        progressRes.json(),
        trendsRes.json()
      ]);

      setDashboardData({
        overview: overviewData,
        quizzes: quizzesData,
        progress: progressData,
        trends: trendsData
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3 text-muted">Loading your analytics dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 fw-bold text-dark">Analytics Dashboard</h1>
          <p className="text-muted mb-0">
            Comprehensive insights into your courses and student performance
          </p>
        </div>
        <div className="text-end">
          <small className="text-muted">Last updated: Just now</small>
        </div>
      </div>

      {/* Overview Cards - Always Visible */}
      {dashboardData?.overview && (
        <OverviewCards data={dashboardData.overview} />
      )}

      {/* Tabbed Content */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={(tab) => setActiveTab(tab)}
            className="px-3 pt-3"
            fill
          >
            <Tab eventKey="overview" title={
              <span>
                <i className="bi bi-speedometer2 me-2"></i>
                Overview
              </span>
            }>
              <div className="p-3">
                {dashboardData?.trends && (
                  <EnrollmentTrends data={dashboardData.trends} />
                )}
              </div>
            </Tab>

            <Tab eventKey="quizzes" title={
              <span>
                <i className="bi bi-patch-question me-2"></i>
                Quiz Performance
                {dashboardData?.quizzes?.totalQuizzes > 0 && (
                  <span className="badge bg-primary ms-2">
                    {dashboardData.quizzes.totalQuizzes}
                  </span>
                )}
              </span>
            }>
              <div className="p-3">
                {dashboardData?.quizzes && (
                  <QuizAnalytics data={dashboardData.quizzes} />
                )}
              </div>
            </Tab>

            <Tab eventKey="progress" title={
              <span>
                <i className="bi bi-graph-up me-2"></i>
                Student Progress
              </span>
            }>
              <div className="p-3">
                {dashboardData?.progress && (
                  <StudentProgress data={dashboardData.progress} />
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      <style>{`
        .analytics-dashboard {
          background: #f8f9fa;
          min-height: 100vh;
        }
        .nav-tabs .nav-link {
          border: none;
          color: #6c757d;
          font-weight: 500;
          padding: 1rem 1.5rem;
        }
        .nav-tabs .nav-link.active {
          color: #495057;
          background: transparent;
          border-bottom: 3px solid #0d6efd;
        }
        .nav-tabs .nav-link:hover {
          border: none;
          color: #495057;
        }
      `}</style>
    </Container>
  );
};

export default AnalyticsDashboard;