// client/src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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
    { path: '/dashboard/analytics', icon: '📈', label: 'Analytics', badge: null },
    { path: '/dashboard/messages', icon: '💬', label: 'Messages', badge: '3' }
  ];

  const studentLinks = [
    { path: '/dashboard', icon: '📊', label: 'Overview', badge: null },
    { path: '/dashboard/my-courses', icon: '📖', label: 'My Courses', badge: '4' },
    { path: '/dashboard/browse', icon: '🔍', label: 'Browse Courses', badge: null },
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
    <div className="dashboard-layout">
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
      <div className="dashboard-mobile-header d-lg-none">
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

      <Container fluid className="dashboard-container">
        <Row className="g-0">
          {/* Desktop Sidebar */}
          <Col 
            lg={collapsed ? 1 : 2} 
            className="sidebar-column d-none d-lg-block"
          >
            <div className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`}>
              {/* Brand Logo */}
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

              {/* User Info */}
              <div className="sidebar-header">
                {!collapsed ? (
                  <div className="user-info">
                    <div className="user-avatar">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <h6 className="user-name">{user?.name || 'User'}</h6>
                      <Badge bg="primary" className="user-role-badge">
                        {user?.role || 'Student'}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="user-avatar-collapsed">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Main Navigation */}
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

              {/* Account Links */}
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
              <div className="sidebar-footer">
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

                {/* Toggle Button */}
                <button
                  className="sidebar-toggle-btn"
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
              <div className="sidebar-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <h6 className="user-name">{user?.name || 'User'}</h6>
                    <Badge bg="primary" className="user-role-badge">
                      {user?.role || 'Student'}
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

          {/* Main Content Area */}
          <Col 
            lg={collapsed ? 11 : 10} 
            className="main-content-column"
          >
            <div className="main-content-wrapper">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>

      {/* CSS Styles */}
      <style>{`
        .dashboard-layout {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', 'Segoe UI', sans-serif;
        }

        /* Mobile Header */
        .dashboard-mobile-header {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
        }

        .sidebar-toggle-mobile {
          border: none;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-brand {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.25rem;
          color: #1f2937;
        }

        .brand-icon {
          margin-right: 0.5rem;
          font-size: 1.5rem;
        }

        .brand-text {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-avatar-sm {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Desktop Sidebar */
        .dashboard-sidebar {
          background: white;
          border-right: 1px solid #e2e8f0;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: sticky;
          top: 0;
        }

        .dashboard-sidebar.collapsed {
          min-width: 70px;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          padding: 1.5rem 1.25rem;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 700;
          font-size: 1.25rem;
          gap: 0.5rem;
        }

        .brand-icon-collapsed {
          font-size: 1.5rem;
        }

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
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .user-avatar-collapsed {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          border-radius: 8px;
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
          color: #1f2937;
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .user-role-badge {
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
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
          border-radius: 8px;
          text-decoration: none;
          color: #64748b;
          transition: all 0.2s ease;
          position: relative;
          margin-bottom: 0.25rem;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover {
          background: rgba(79, 70, 229, 0.08);
          color: #4f46e5;
          transform: translateX(2px);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .nav-icon {
          font-size: 1.2rem;
          width: 24px;
          text-align: center;
          transition: transform 0.2s ease;
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
          font-size: 0.875rem;
        }

        .nav-badge {
          background: #ef4444;
          color: white;
          border-radius: 6px;
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
          background: #ef4444;
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
          color: #ef4444 !important;
        }

        .logout-item:hover {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #ef4444 !important;
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
          padding: 1rem 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .sidebar-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: rgba(79, 70, 229, 0.08);
          border: none;
          border-radius: 8px;
          color: #4f46e5;
          font-weight: 500;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .sidebar-toggle-btn:hover {
          background: #4f46e5;
          color: white;
          transform: translateY(-1px);
        }

        /* Mobile Sidebar */
        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 280px;
          height: 100vh;
          background: white;
          border-right: 1px solid #e2e8f0;
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          transition: left 0.3s ease;
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

        .close-sidebar {
          margin-left: auto;
          border: none;
          background: rgba(79, 70, 229, 0.1);
          color: #4f46e5;
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        /* Main Content */
        .main-content-column {
          background: #f8fafc;
          min-height: 100vh;
        }

        .main-content-wrapper {
          padding: 2rem;
          max-width: 100%;
          margin: 0;
        }

        /* Collapsed State */
        .dashboard-sidebar.collapsed .sidebar-brand {
          padding: 1rem 0.5rem;
          justify-content: center;
        }

        .dashboard-sidebar.collapsed .sidebar-header {
          padding: 1rem 0.5rem;
        }

        .dashboard-sidebar.collapsed .nav-item {
          padding: 0.75rem;
          justify-content: center;
        }

        .dashboard-sidebar.collapsed .sidebar-section {
          display: none;
        }

        .dashboard-sidebar.collapsed .sidebar-toggle-btn span {
          display: none;
        }

        /* Responsive */
        @media (max-width: 991.98px) {
          .main-content-column {
            width: 100%;
          }
          
          .main-content-wrapper {
            padding: 1rem;
          }
        }

        @media (max-width: 576px) {
          .mobile-sidebar {
            width: 100vw;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;