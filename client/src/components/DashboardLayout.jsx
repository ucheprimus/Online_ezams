// client/src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Nav, Badge, Button, Modal } from 'react-bootstrap';

const DashboardLayout = () => {
  const { user, isInstructor, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const instructorLinks = [
    { path: '/dashboard', icon: '📊', label: 'Overview', badge: null },
    { path: '/dashboard/my-courses', icon: '📚', label: 'My Courses', badge: '5' },
    { path: '/dashboard/create-course', icon: '➕', label: 'Create Course', badge: null },
    { path: '/dashboard/students', icon: '👥', label: 'Students', badge: '12' },
      { path: '/dashboard/quiz-analytics', icon: '📊', label: 'Analytics', badge: null },

    { path: '/dashboard/messages', icon: '💬', label: 'Messages', badge: '3' }
  ];

// In your DashboardLayout.jsx - make sure studentLinks looks like this:
const studentLinks = [
  { path: '/dashboard', icon: '📊', label: 'Overview', badge: null },
  { path: '/dashboard/my-courses', icon: '📖', label: 'My Courses', badge: '4' },
  { path: '/dashboard/browse', icon: '🔍', label: 'Browse Courses', badge: null }, // ← This should point to dashboard/browse
  { path: '/dashboard/progress', icon: '✅', label: 'Progress', badge: '2' },
  { path: '/dashboard/certificates', icon: '🏆', label: 'Certificates', badge: '1' },
  { path: '/dashboard/wishlist', icon: '❤️', label: 'Wishlist', badge: '3' }
];

  const commonLinks = [
    { path: '/dashboard/profile', icon: '👤', label: 'Profile', badge: null },
    { path: '/dashboard/settings', icon: '⚙️', label: 'Settings', badge: null }
  ];

  const links = isInstructor ? instructorLinks : studentLinks;

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="dashboard-layout-container">
      {/* Logout Confirmation Modal */}
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to logout?</p>
          <p className="text-muted small">You'll need to login again to access your dashboard.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mobile Header */}
      <div className="mobile-header d-lg-none">
        <div className="mobile-header-content">
          <Button
            variant="outline-primary"
            className="sidebar-toggle-mobile"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <i className="bi bi-list"></i>
          </Button>
          <div className="mobile-brand">
            <span className="brand-icon">🎓</span>
            <span className="brand-text">LearnHub</span>
          </div>
          <div className="mobile-user">
            <div className="user-avatar-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="sidebar-overlay d-lg-none"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Container fluid className="p-0">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col 
            lg={collapsed ? 1 : 2} 
            className="sidebar-column d-none d-lg-block"
          >
            <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
              {/* Brand Logo (Desktop) */}
              <div className="sidebar-brand">
                {!collapsed ? (
                  <>
                    <span className="brand-icon">🎓</span>
                    <span className="brand-text">LearnHub</span>
                  </>
                ) : (
                  <span className="brand-icon-collapsed">🎓</span>
                )}
              </div>

              {/* Sidebar Header */}
              <div className="sidebar-header">
                {!collapsed ? (
                  <div className="user-info">
                    <div className="user-avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <h6 className="user-name">{user?.name}</h6>
                      <Badge className="user-role-badge">
                        {user?.role}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="user-avatar-collapsed">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <Nav className="sidebar-nav flex-column">
                {links.map((link) => (
                  <Nav.Link
                    key={link.path}
                    as={Link}
                    to={link.path}
                    className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                  >
                    <div className="nav-icon">
                      {link.icon}
                    </div>
                    {!collapsed && (
                      <div className="nav-content">
                        <span className="nav-label">{link.label}</span>
                        {link.badge && (
                          <span className="nav-badge">{link.badge}</span>
                        )}
                      </div>
                    )}
                    {collapsed && link.badge && (
                      <span className="nav-badge-collapsed">{link.badge}</span>
                    )}
                  </Nav.Link>
                ))}
              </Nav>

              {/* Common Links */}
              {!collapsed && (
                <div className="sidebar-section">
                  <div className="section-label">Account</div>
                  <Nav className="sidebar-nav flex-column">
                    {commonLinks.map((link) => (
                      <Nav.Link
                        key={link.path}
                        as={Link}
                        to={link.path}
                        className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                      >
                        <div className="nav-icon">
                          {link.icon}
                        </div>
                        <div className="nav-content">
                          <span className="nav-label">{link.label}</span>
                        </div>
                      </Nav.Link>
                    ))}
                  </Nav>
                </div>
              )}

              {/* Logout Button */}
              <div className="sidebar-section">
                {!collapsed && <div className="section-label">Actions</div>}
                <Nav className="sidebar-nav flex-column">
                  <Nav.Link
                    className={`nav-item logout-item ${collapsed ? 'collapsed' : ''}`}
                    onClick={handleLogoutClick}
                  >
                    <div className="nav-icon">
                      <i className="bi bi-box-arrow-right"></i>
                    </div>
                    {!collapsed && (
                      <div className="nav-content">
                        <span className="nav-label">Logout</span>
                      </div>
                    )}
                  </Nav.Link>
                </Nav>
              </div>

              {/* Toggle Button */}
              <div className="sidebar-footer">
                <button
                  className="toggle-btn"
                  onClick={() => setCollapsed(!collapsed)}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <i className={`bi bi-chevron-${collapsed ? 'right' : 'left'}`}></i>
                  {!collapsed && <span>Collapse</span>}
                </button>
              </div>
            </div>
          </Col>

          {/* Mobile Sidebar */}
          <div className={`mobile-sidebar d-lg-none ${mobileOpen ? 'open' : ''}`}>
            <div className="mobile-sidebar-content">
              {/* Mobile Sidebar Header */}
              <div className="sidebar-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <h6 className="user-name">{user?.name}</h6>
                    <Badge className="user-role-badge">
                      {user?.role}
                    </Badge>
                  </div>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="close-sidebar"
                    onClick={() => setMobileOpen(false)}
                  >
                    <i className="bi bi-x"></i>
                  </Button>
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <Nav className="sidebar-nav flex-column">
                {links.map((link) => (
                  <Nav.Link
                    key={link.path}
                    as={Link}
                    to={link.path}
                    className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="nav-icon">
                      {link.icon}
                    </div>
                    <div className="nav-content">
                      <span className="nav-label">{link.label}</span>
                      {link.badge && (
                        <span className="nav-badge">{link.badge}</span>
                      )}
                    </div>
                  </Nav.Link>
                ))}
              </Nav>

              {/* Mobile Common Links */}
              <div className="sidebar-section">
                <div className="section-label">Account</div>
                <Nav className="sidebar-nav flex-column">
                  {commonLinks.map((link) => (
                    <Nav.Link
                      key={link.path}
                      as={Link}
                      to={link.path}
                      className={`nav-item ${isActive(link.path) ? 'active' : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <div className="nav-icon">
                        {link.icon}
                      </div>
                      <div className="nav-content">
                        <span className="nav-label">{link.label}</span>
                      </div>
                    </Nav.Link>
                  ))}
                </Nav>
              </div>

              {/* Mobile Logout Button */}
              <div className="sidebar-section">
                <div className="section-label">Actions</div>
                <Nav className="sidebar-nav flex-column">
                  <Nav.Link
                    className="nav-item logout-item"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogoutClick();
                    }}
                  >
                    <div className="nav-icon">
                      <i className="bi bi-box-arrow-right"></i>
                    </div>
                    <div className="nav-content">
                      <span className="nav-label">Logout</span>
                    </div>
                  </Nav.Link>
                </Nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Col 
            lg={collapsed ? 11 : 10} 
            className="main-content"
          >
            <div className="content-wrapper">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>

      {/* Custom Styles */}
      <style>{`
        .dashboard-layout-container {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Mobile Header */
        .mobile-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 500;
        }

        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
        }

        .sidebar-toggle-mobile {
          border: none;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .sidebar-toggle-mobile:hover {
          background: rgba(102, 126, 234, 0.15);
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .brand-icon {
          margin-right: 0.5rem;
          font-size: 1.5rem;
        }

        .brand-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-avatar-sm {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Mobile Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 998;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Mobile Sidebar */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 280px;
          height: 100vh;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-right: 1px solid #e2e8f0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          z-index: 999;
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow-y: auto;
        }

        .mobile-sidebar.open {
          left: 0;
        }

        .mobile-sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .mobile-sidebar .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          background: white;
        }

        .mobile-sidebar .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .close-sidebar {
          margin-left: auto;
          border: none;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .close-sidebar:hover {
          background: rgba(102, 126, 234, 0.2);
        }

        /* Desktop Sidebar */
        .sidebar-column {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-right: 1px solid #e2e8f0;
          box-shadow: 2px 0 20px rgba(0, 0, 0, 0.05);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .sidebar.collapsed {
          min-width: 70px;
        }

        /* Sidebar Brand */
        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 700;
          font-size: 1.5rem;
          gap: 0.5rem;
        }

        .brand-icon-collapsed {
          font-size: 1.8rem;
        }

        /* Sidebar Header */
        .sidebar-header {
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.1rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .user-avatar-collapsed {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          margin: 0 auto;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .user-role-badge {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          border: none;
          font-size: 0.7rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        /* Navigation */
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          gap: 0.25rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: #64748b;
          transition: all 0.3s ease;
          position: relative;
          margin-bottom: 0.25rem;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateX(4px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transform: translateX(0);
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .nav-item:hover .nav-icon {
          transform: scale(1.1);
        }

        .nav-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-left: 0.75rem;
        }

        .nav-label {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .nav-badge {
          background: #e53e3e;
          color: white;
          border-radius: 10px;
          padding: 0.2rem 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .nav-badge-collapsed {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #e53e3e;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        .nav-item.active .nav-badge,
        .nav-item.active .nav-badge-collapsed {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        /* Logout Item */
        .logout-item {
          color: #e53e3e !important;
        }

        .logout-item:hover {
          background: rgba(229, 62, 62, 0.1) !important;
          color: #e53e3e !important;
        }

        .logout-item .nav-icon {
          color: inherit;
        }

        /* Sidebar Sections */
        .sidebar-section {
          padding: 1rem 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .section-label {
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
          padding: 0 1rem;
        }

        /* Sidebar Footer */
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #f1f5f9;
        }

        .toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(102, 126, 234, 0.1);
          border: none;
          border-radius: 10px;
          color: #667eea;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .toggle-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }

        /* Main Content */
        .main-content {
          background: #f8fafc;
          min-height: 100vh;
          margin-left: 0;
        }

        .content-wrapper {
          padding: 0;
          max-width: 100%;
          margin: 0;
        }

        /* Collapsed State */
        .sidebar.collapsed .sidebar-brand {
          padding: 1rem 0.5rem;
        }

        .sidebar.collapsed .sidebar-header {
          padding: 1rem 0.5rem;
        }

        .sidebar.collapsed .nav-item {
          padding: 0.75rem;
          justify-content: center;
        }

        .sidebar.collapsed .sidebar-section {
          display: none;
        }

        .sidebar.collapsed .toggle-btn span {
          display: none;
        }

        /* Responsive Design */
        @media (max-width: 991.98px) {
          .main-content {
            width: 100%;
          }
          
          .content-wrapper {
            padding: 0;
          }
        }

        @media (max-width: 576px) {
          .mobile-sidebar {
            width: 100vw;
          }
          
          .content-wrapper {
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;