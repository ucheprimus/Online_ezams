// client/src/pages/Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isInstructor } = useAuth();

  // Stats data - you can replace with actual data later
  const instructorStats = [
    { title: 'Total Courses', value: 0, icon: '📚', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Total Students', value: 0, icon: '👥', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Total Revenue', value: '$0', icon: '💰', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Avg Rating', value: '0.0', icon: '⭐', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  ];

  const studentStats = [
    { title: 'Enrolled Courses', value: 0, icon: '📖', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Completed', value: 0, icon: '✅', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'In Progress', value: 0, icon: '🎯', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { title: 'Certificates', value: 0, icon: '🏆', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }
  ];

  const stats = isInstructor ? instructorStats : studentStats;

  return (
    <Container fluid className="dashboard-container px-3 px-md-4 py-4">
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="welcome-card border-0">
            <Card.Body className="p-4 p-md-5">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center mb-3">
                    <div className="welcome-avatar me-3">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h1 className="welcome-title mb-1">Welcome back, {user?.name}! 👋</h1>
                      <p className="welcome-subtitle mb-0">
                        {isInstructor 
                          ? 'Ready to inspire your next students?' 
                          : 'Continue your learning journey today.'}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
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
      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} lg={3} className="mb-3" key={index}>
            <Card className="stat-card h-100 border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="stat-title mb-2">{stat.title}</p>
                    <h2 className="stat-value mb-0">{stat.value}</h2>
                  </div>
                  <div 
                    className="stat-icon"
                    style={{ background: stat.color }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <div className="stat-progress mt-3">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill" 
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
      <Row className="mb-4">
        <Col>
          <Card className="action-card border-0">
            <Card.Body className="p-4 p-md-5">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    <div className="action-icon me-4">
                      {isInstructor ? '🎓' : '🚀'}
                    </div>
                    <div>
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
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Button 
                    as={Link} 
                    to={isInstructor ? '/dashboard/create-course' : '/courses'}
                    className="action-button"
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
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="activity-card border-0 h-100">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-section-title mb-0">Recent Activity</h5>
                <Button variant="outline-primary" size="sm">
                  View All
                </Button>
              </div>
              <div className="empty-state text-center py-5">
                <div className="empty-icon mb-3">📊</div>
                <h6 className="empty-title">No recent activity yet</h6>
                <p className="empty-description text-muted">
                  {isInstructor 
                    ? 'Your course creation and student engagement will appear here.'
                    : 'Your learning progress and course activity will appear here.'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4} className="mb-4">
          <Card className="quick-links-card border-0 h-100">
            <Card.Body className="p-4">
              <h5 className="card-section-title mb-4">Quick Links</h5>
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
                      {isInstructor ? 'My Courses' : 'My Courses'}
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
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Custom Styles */}
      <style>{`
        .dashboard-container {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Welcome Card */
        .welcome-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 20px;
        }

        .welcome-avatar {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .welcome-title {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .welcome-subtitle {
          opacity: 0.9;
          font-size: 1rem;
        }

        .current-date {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Stat Cards */
        .stat-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }

        .stat-title {
          color: #718096;
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          color: #2d3748;
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        /* Action Card */
        .action-card {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border-radius: 20px;
        }

        .action-icon {
          font-size: 3rem;
        }

        .action-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .action-description {
          opacity: 0.9;
          font-size: 0.95rem;
        }

        .action-button {
          background: white;
          color: #2d3748;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        /* Activity & Quick Links */
        .activity-card, .quick-links-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .card-section-title {
          color: #2d3748;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .empty-state {
          color: #718096;
        }

        .empty-icon {
          font-size: 3rem;
          opacity: 0.5;
        }

        .empty-title {
          color: #4a5568;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          font-size: 0.9rem;
        }

        /* Quick Links */
        .quick-link-item {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
          text-decoration: none;
          color: inherit;
          transition: background-color 0.2s ease;
        }

        .quick-link-item:last-child {
          border-bottom: none;
        }

        .quick-link-item:hover {
          background-color: #f8fafc;
          border-radius: 8px;
          margin: 0 -1rem;
          padding: 1rem;
        }

        .quick-link-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          width: 40px;
          text-align: center;
        }

        .quick-link-text {
          flex: 1;
        }

        .quick-link-title {
          color: #2d3748;
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }

        .quick-link-desc {
          color: #718096;
          font-size: 0.8rem;
        }

        .quick-link-arrow {
          color: #cbd5e0;
          font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .welcome-card .card-body {
            padding: 2rem !important;
          }
          
          .welcome-title {
            font-size: 1.5rem;
          }
          
          .stat-value {
            font-size: 1.75rem;
          }
          
          .action-card .card-body {
            padding: 2rem !important;
          }
          
          .action-icon {
            font-size: 2.5rem;
            margin-right: 1rem;
          }
        }

        @media (max-width: 576px) {
          .dashboard-container {
            padding: 1rem !important;
          }
          
          .welcome-avatar {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }
          
          .welcome-title {
            font-size: 1.4rem;
          }
          
          .stat-card .card-body {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default Dashboard;