import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar as BSNavbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavLinkClass = (path) => {
    return location.pathname === path ? 'nav-link active' : 'nav-link';
  };

  return (
    <BSNavbar expand="lg" sticky="top" className="custom-navbar">
      <Container fluid="xxl">
        {/* Brand Logo */}
        <BSNavbar.Brand as={Link} to="/" className="brand-logo">
          <div className="brand-icon">🎓</div>
          <span className="brand-text">LearnHub</span>
        </BSNavbar.Brand>
        
        {/* Mobile Toggle */}
        <BSNavbar.Toggle aria-controls="navbar-nav" className="navbar-toggle">
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </BSNavbar.Toggle>
        
        {/* Navigation Links */}
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="navbar-nav-main mx-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={getNavLinkClass('/')}
            >
              <i className="bi bi-house me-2"></i>
              Home
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/courses" 
              className={getNavLinkClass('/courses')}
            >
              <i className="bi bi-book me-2"></i>
              Courses
            </Nav.Link>
            
            {isAuthenticated && (
              <Nav.Link 
                as={Link} 
                to="/dashboard" 
                className={getNavLinkClass('/dashboard')}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Nav.Link>
            )}
          </Nav>

          {/* User Section */}
          <Nav className="navbar-nav-user">
            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <div className="d-none d-lg-flex align-items-center">
                  {/* Notifications */}
                  <div className="nav-icon-wrapper me-3">
                    <i className="bi bi-bell"></i>
                    <span className="notification-badge">3</span>
                  </div>
                  
                  {/* User Profile */}
                  <NavDropdown 
                    title={
                      <div className="user-profile">
                        <div className="user-avatar">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user?.name}</div>
                          <div className="user-role">{user?.role}</div>
                        </div>
                        <i className="bi bi-chevron-down dropdown-arrow"></i>
                      </div>
                    } 
                    align="end"
                    className="user-dropdown"
                  >
                    <NavDropdown.Item as={Link} to="/dashboard/profile" className="dropdown-item">
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item as={Link} to="/dashboard/settings" className="dropdown-item">
                      <i className="bi bi-gear me-2"></i>
                      Settings
                    </NavDropdown.Item>

                    {user?.role === 'instructor' && (
                      <>
                        <NavDropdown.Divider />
                        <NavDropdown.Item as={Link} to="/dashboard/create-course" className="dropdown-item">
                          <i className="bi bi-plus-circle me-2"></i>
                          Create Course
                        </NavDropdown.Item>
                      </>
                    )}
                    
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="dropdown-item logout-item">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>

                {/* Mobile User Menu */}
                <div className="d-lg-none">
                  <div className="mobile-user-info">
                    <div className="user-avatar-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="user-name-sm">{user?.name}</span>
                  </div>
                  
                  <NavDropdown 
                    title="" 
                    align="end"
                    className="mobile-dropdown"
                  >
                    <NavDropdown.Item as={Link} to="/dashboard/profile">
                      <i className="bi bi-person me-2"></i>
                      My Profile
                    </NavDropdown.Item>
                    
                    <NavDropdown.Item as={Link} to="/dashboard/settings">
                      <i className="bi bi-gear me-2"></i>
                      Settings
                    </NavDropdown.Item>

                    <NavDropdown.Item as={Link} to="/courses">
                      <i className="bi bi-book me-2"></i>
                      Browse Courses
                    </NavDropdown.Item>

                    {user?.role === 'instructor' && (
                      <NavDropdown.Item as={Link} to="/dashboard/create-course">
                        <i className="bi bi-plus-circle me-2"></i>
                        Create Course
                      </NavDropdown.Item>
                    )}
                    
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                </div>
              </>
            ) : (
              /* Guest User Actions */
              <div className="auth-buttons">
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="login-btn me-2"
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/signup" 
                  variant="primary" 
                  className="signup-btn"
                >
                  Get Started
                </Button>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>

      {/* Custom Styles */}
      <style>{`
        .custom-navbar {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          padding: 0.5rem 0;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        /* Brand Logo */
        .brand-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #2d3748;
          font-weight: 700;
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .brand-logo:hover {
          transform: translateY(-1px);
        }

        .brand-icon {
          font-size: 1.75rem;
          margin-right: 0.5rem;
        }

        .brand-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Toggle Button */
        .navbar-toggle {
          border: none;
          padding: 0.25rem;
          background: transparent;
        }

        .navbar-toggle:focus {
          box-shadow: none;
        }

        .toggle-bar {
          display: block;
          width: 25px;
          height: 2px;
          margin: 5px 0;
          background: #4a5568;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .navbar-toggle[aria-expanded="true"] .toggle-bar:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .navbar-toggle[aria-expanded="true"] .toggle-bar:nth-child(2) {
          opacity: 0;
        }

        .navbar-toggle[aria-expanded="true"] .toggle-bar:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }

        /* Navigation Links */
        .navbar-nav-main .nav-link {
          color: #4a5568 !important;
          font-weight: 500;
          padding: 0.75rem 1.25rem !important;
          border-radius: 12px;
          margin: 0 0.25rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .navbar-nav-main .nav-link:hover {
          color: #667eea !important;
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-1px);
        }

        .navbar-nav-main .nav-link.active {
          color: #667eea !important;
          background: rgba(102, 126, 234, 0.1);
          font-weight: 600;
        }

        .navbar-nav-main .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 2px;
          background: #667eea;
          border-radius: 1px;
        }

        /* User Section */
        .navbar-nav-user {
          display: flex;
          align-items: center;
        }

        /* Notifications */
        .nav-icon-wrapper {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #f7fafc;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #4a5568;
        }

        .nav-icon-wrapper:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }

        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #e53e3e;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }

        /* User Profile */
        .user-profile {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
        }

        .user-profile:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          margin-right: 0.75rem;
        }

        .user-info {
          line-height: 1.2;
        }

        .user-name {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.9rem;
        }

        .user-role {
          font-size: 0.75rem;
          color: #718096;
          text-transform: capitalize;
        }

        .dropdown-arrow {
          color: #a0aec0;
          font-size: 0.8rem;
          margin-left: 0.5rem;
          transition: transform 0.3s ease;
        }

        .user-dropdown.show .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Dropdown Menu */
        .dropdown-menu {
          border: none;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          padding: 0.5rem;
          margin-top: 0.5rem;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .dropdown-item {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #4a5568;
          font-weight: 500;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .dropdown-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateX(2px);
        }

        .logout-item {
          color: #e53e3e;
        }

        .logout-item:hover {
          background: rgba(229, 62, 62, 0.1);
          color: #e53e3e;
        }

        /* Mobile Styles */
        .mobile-user-info {
          display: flex;
          align-items: center;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 12px;
          margin: 0.5rem 0;
        }

        .user-avatar-sm {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          margin-right: 0.75rem;
        }

        .user-name-sm {
          font-weight: 600;
          color: #2d3748;
        }

        .mobile-dropdown .dropdown-toggle::after {
          display: none;
        }

        /* Auth Buttons */
        .auth-buttons {
          display: flex;
          align-items: center;
        }

        .login-btn {
          border-radius: 10px;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          border: 2px solid #667eea;
          color: #667eea;
          transition: all 0.3s ease;
        }

        .login-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }

        .signup-btn {
          border-radius: 10px;
          padding: 0.5rem 1.25rem;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .signup-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Responsive Design */
        @media (max-width: 991.98px) {
          .navbar-nav-main {
            margin: 1rem 0;
          }
          
          .navbar-nav-main .nav-link {
            padding: 1rem !important;
            margin: 0.25rem 0;
          }
          
          .auth-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
            margin-top: 1rem;
          }
          
          .auth-buttons .btn {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .brand-logo {
            font-size: 1.25rem;
          }
          
          .brand-icon {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </BSNavbar>
  );
};

export default Navbar;