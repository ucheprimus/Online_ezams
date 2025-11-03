// client/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isInstructor } = useAuth();

  // Stats data - you can replace with actual data later
  const instructorStats = [
    { title: 'Total Courses', value: 0, icon: '📚', color: 'primary' },
    { title: 'Total Students', value: 0, icon: '👥', color: 'success' },
    { title: 'Total Revenue', value: '$0', icon: '💰', color: 'warning' },
    { title: 'Avg Rating', value: '0.0', icon: '⭐', color: 'info' }
  ];

  const studentStats = [
    { title: 'Enrolled Courses', value: 0, icon: '📖', color: 'primary' },
    { title: 'Completed', value: 0, icon: '✅', color: 'success' },
    { title: 'In Progress', value: 0, icon: '🎯', color: 'warning' },
    { title: 'Certificates', value: 0, icon: '🏆', color: 'info' }
  ];

  const stats = isInstructor ? instructorStats : studentStats;

  return (
    <Container fluid className="dashboard-container px-2 px-md-4 py-3 py-md-4">
      {/* Welcome Section */}
      <Row className="mb-3 mb-md-4">
        <Col>
          <Card className="welcome-card border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4 p-lg-5">
              <Row className="align-items-center">
                <Col xs={12} md={8} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="welcome-avatar me-3 mb-2 mb-md-0">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-grow-1">
                      <h1 className="welcome-title mb-1">Welcome back, {user?.name || 'User'}! 👋</h1>
                      <p className="welcome-subtitle mb-0">
                        {isInstructor 
                          ? 'Ready to inspire your next students?' 
                          : 'Continue your learning journey today.'}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={4} className="text-md-end">
                  <div className="date-display">
                    <span className="current-date">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Grid */}
      <Row className="mb-3 mb-md-4 g-2 g-md-3">
        {stats.map((stat, index) => (
          <Col xs={6} sm={6} lg={3} className="mb-2 mb-md-3" key={index}>
            <Card className={`stat-card h-100 border-0 shadow-sm stat-card-${stat.color}`}>
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <p className="stat-title mb-2">{stat.title}</p>
                    <h2 className="stat-value mb-0">{stat.value}</h2>
                  </div>
                  <div className={`stat-icon stat-icon-${stat.color}`}>
                    <span className="stat-icon-emoji">{stat.icon}</span>
                  </div>
                </div>
                <div className="stat-progress mt-3">
                  <div className="progress-bar-bg">
                    <div 
                      className={`progress-bar-fill progress-bar-${stat.color}`}
                      style={{ width: '0%' }}
                    ></div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row className="mb-3 mb-md-4">
        <Col>
          <Card className="action-card border-0 shadow-sm">
            <Card.Body className="p-3 p-md-4 p-lg-5">
              <Row className="align-items-center">
                <Col xs={12} md={8} className="mb-3 mb-md-0">
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="action-icon me-3 me-md-4 mb-2 mb-md-0">
                      {isInstructor ? '🎓' : '🚀'}
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="action-title mb-2">
                        {isInstructor 
                          ? 'Ready to create your first course?' 
                          : 'Start learning today!'}
                      </h4>
                      <p className="action-description mb-0">
                        {isInstructor 
                          ? 'Share your knowledge with students around the world. Create engaging courses today.'
                          : 'Explore thousands of courses from expert instructors. Start your learning journey now.'}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={4} className="text-md-end">
                  <Button 
                    as={Link} 
                    to={isInstructor ? '/dashboard/create-course' : '/dashboard/browse'}
                    className="action-button fw-bold"
                    size="lg"
                  >
                    {isInstructor ? 'Create Course' : 'Browse Courses'}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity & Quick Links */}
      <Row className="g-2 g-md-3">
        <Col xs={12} lg={8} className="mb-3 mb-md-4">
          <Card className="activity-card border-0 shadow-sm h-100">
            <Card.Body className="p-3 p-md-4">
              <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4">
                <h5 className="card-section-title mb-0">Recent Activity</h5>
                <Button variant="outline-primary" size="sm">
                  View All
                </Button>
              </div>
              <div className="empty-state text-center py-4 py-md-5">
                <div className="empty-icon mb-3">📊</div>
                <h6 className="empty-title mb-2">No recent activity yet</h6>
                <p className="empty-description text-muted mb-0">
                  {isInstructor 
                    ? 'Your course creation and student engagement will appear here.'
                    : 'Your learning progress and course activity will appear here.'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4} className="mb-3 mb-md-4">
          <Card className="quick-links-card border-0 shadow-sm h-100">
            <Card.Body className="p-3 p-md-4">
              <h5 className="card-section-title mb-3 mb-md-4">Quick Links</h5>
              <div className="quick-links">
                <Link to="/dashboard/profile" className="quick-link-item">
                  <div className="quick-link-icon">👤</div>
                  <div className="quick-link-text">
                    <div className="quick-link-title">Profile Settings</div>
                    <div className="quick-link-desc">Update your information</div>
                  </div>
                  <i className="bi bi-chevron-right quick-link-arrow"></i>
                </Link>

                <Link to="/dashboard/my-courses" className="quick-link-item">
                  <div className="quick-link-icon">
                    {isInstructor ? '📚' : '📖'}
                  </div>
                  <div className="quick-link-text">
                    <div className="quick-link-title">
                      {isInstructor ? 'My Courses' : 'My Learning'}
                    </div>
                    <div className="quick-link-desc">
                      {isInstructor ? 'Manage your courses' : 'Continue learning'}
                    </div>
                  </div>
                  <i className="bi bi-chevron-right quick-link-arrow"></i>
                </Link>

                {isInstructor && (
                  <Link to="/dashboard/create-course" className="quick-link-item">
                    <div className="quick-link-icon">➕</div>
                    <div className="quick-link-text">
                      <div className="quick-link-title">Create Course</div>
                      <div className="quick-link-desc">Share your knowledge</div>
                    </div>
                    <i className="bi bi-chevron-right quick-link-arrow"></i>
                  </Link>
                )}

                <Link to="/dashboard/settings" className="quick-link-item">
                  <div className="quick-link-icon">⚙️</div>
                  <div className="quick-link-text">
                    <div className="quick-link-title">Settings</div>
                    <div className="quick-link-desc">Preferences & notifications</div>
                  </div>
                  <i className="bi bi-chevron-right quick-link-arrow"></i>
                </Link>

                <Link to="/dashboard/browse" className="quick-link-item">
                  <div className="quick-link-icon">🔍</div>
                  <div className="quick-link-text">
                    <div className="quick-link-title">Browse Courses</div>
                    <div className="quick-link-desc">Find new courses</div>
                  </div>
                  <i className="bi bi-chevron-right quick-link-arrow"></i>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;