import { useEffect, useState } from "react";
import axios from "axios";

// Real API with proper configuration
const API = {
  get: async (url) => {
    const token = localStorage.getItem("token");
    // You can simplify to:
    return axios.get(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },

  // Student-specific APIs
  getStudentStats: async () => {
    const token = localStorage.getItem("token");
    return axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/student/stats`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      withCredentials: true, // ADDED THIS
    });
  },

  getStudentCourses: async () => {
    const token = localStorage.getItem("token");
    return axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/student/courses`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true, // ADDED THIS
      }
    );
  },

  // Instructor-specific APIs
  getInstructorStats: async () => {
    const token = localStorage.getItem("token");
    return axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/instructor/stats`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true, // ADDED THIS
      }
    );
  },

  getInstructorCourses: async () => {
    const token = localStorage.getItem("token");
    return axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/instructor/courses`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true, // ADDED THIS
      }
    );
  },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Token exists?", !!token);
      console.log(
        "API URL:",
        `${import.meta.env.VITE_API_BASE_URL}/api/profile`
      );

      const response = await API.get("/api/profile");
      console.log("Profile data:", response.data);
      setUser(response.data);
    } catch (err) {
      console.error("Full error:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Failed to load profile");

      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-light"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white mt-3">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="text-center text-white">
          <h4>Error Loading Dashboard</h4>
          <p>{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="btn btn-light mt-3"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div className="text-center text-white">
          <h4>No User Data</h4>
          <p>Unable to load user information</p>
          <button onClick={logout} className="btn btn-light mt-3">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const studentNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "courses", label: "My Courses", icon: "book" },
    { id: "browse", label: "Browse Courses", icon: "search" },
    { id: "certificates", label: "Certificates", icon: "award" },
    { id: "profile", label: "Profile", icon: "user" },
  ];

  const instructorNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "courses", label: "My Courses", icon: "book" },
    { id: "create", label: "Create Course", icon: "plus" },
    { id: "students", label: "Students", icon: "users" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "profile", label: "Profile", icon: "user" },
  ];

  const navItems =
    user.role === "instructor" ? instructorNavItems : studentNavItems;

  const getIcon = (iconName) => {
    const icons = {
      home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>,
      book: (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </>
      ),
      search: (
        <>
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </>
      ),
      award: (
        <>
          <circle cx="12" cy="8" r="7"></circle>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        </>
      ),
      user: (
        <>
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </>
      ),
      plus: (
        <>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </>
      ),
      users: (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </>
      ),
      chart: (
        <>
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </>
      ),
    };
    return icons[iconName] || icons.home;
  };

  const handleNavigation = (navId) => {
    setActiveNav(navId);
    // Add actual navigation logic here
    console.log(`Navigating to: ${navId}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .stat-card {
          transition: transform 0.3s, box-shadow 0.3s;
          animation: fadeIn 0.5s ease-out;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }

        .quick-action-btn {
          transition: all 0.3s;
        }

        .quick-action-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .nav-item {
          transition: all 0.3s;
          cursor: pointer;
          border-radius: 10px;
          margin-bottom: 5px;
        }

        .nav-item:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sidebar {
          transition: all 0.3s ease;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            z-index: 1000;
            height: 100vh;
          }
          .sidebar.closed {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`sidebar ${!sidebarOpen ? "closed" : ""}`}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: sidebarOpen ? "260px" : "80px",
          height: "100vh",
          background: "white",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.05)",
          padding: "20px",
          overflowY: "auto",
          zIndex: 100,
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "white",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            L
          </div>
          {sidebarOpen && (
            <h5 style={{ margin: 0, fontWeight: "700", fontSize: "20px" }}>
              LearnHub
            </h5>
          )}
        </div>

        {/* Navigation Items */}
        <div style={{ marginBottom: "30px" }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${activeNav === item.id ? "active" : ""}`}
              onClick={() => handleNavigation(item.id)}
              style={{
                padding: "12px 15px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: activeNav === item.id ? "white" : "#6c757d",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                {getIcon(item.icon)}
              </svg>
              {sidebarOpen && (
                <span style={{ fontWeight: "500", fontSize: "15px" }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* User Section */}
        {sidebarOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              right: "20px",
              padding: "15px",
              background: "#f8f9fa",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "white",
                  fontSize: "14px",
                  flexShrink: 0,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.name || "Loading..."}
                </div>
                <small className="text-muted" style={{ fontSize: "12px" }}>
                  {user?.role || "Fetching role..."}
                </small>
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-outline-danger btn-sm w-100"
              style={{ borderRadius: "8px", fontSize: "13px" }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            top: "20px",
            right: "-15px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "white",
            border: "1px solid #dee2e6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6c757d"
            strokeWidth="2"
          >
            <polyline
              points={sidebarOpen ? "15 18 9 12 15 6" : "9 18 15 12 9 6"}
            ></polyline>
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: sidebarOpen ? "260px" : "80px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Top Navigation Bar */}
        <nav
          style={{
            background: "white",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
            padding: "1rem 0",
          }}
        >
          <div className="container-fluid px-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 style={{ margin: 0, fontWeight: "600" }}>
                  {user.role === "instructor"
                    ? "Instructor Portal"
                    : "Student Portal"}
                </h5>
                <small className="text-muted">{user.email}</small>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <button
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6c757d"
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container-fluid px-4 py-5">
          {/* Welcome Section */}
          <div className="mb-5">
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
              }}
            >
              Welcome back, {user.name}! 👋
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#6c757d" }}>
              {user.role === "instructor"
                ? "Manage your courses and track student progress"
                : "Continue your learning journey"}
            </p>
          </div>

          {user.role === "instructor" ? (
            <InstructorDashboard user={user} updateUser={updateUser} />
          ) : (
            <StudentDashboard user={user} updateUser={updateUser} />
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ user, updateUser }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [statsResponse, coursesResponse] = await Promise.all([
        API.getStudentStats(),
        API.getStudentCourses(),
      ]);

      setStats(statsResponse.data);
      setCourses(coursesResponse.data);
    } catch (err) {
      console.error("Error loading student data:", err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  // Use real data from API or fallback to user data
  const studentStats = stats ||
    user.studentData || {
      enrolledCourses: 0,
      completedCourses: 0,
      hoursLearned: 0,
      progress: 0,
    };

  return (
    <>
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Enrolled Courses
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {studentStats.enrolledCourses}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-success mb-0" style={{ fontSize: "14px" }}>
                <span style={{ fontWeight: "600" }}>
                  +{studentStats.progress || 0}%
                </span>{" "}
                from last month
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Completed
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {studentStats.completedCourses}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>
              <p className="text-success mb-0" style={{ fontSize: "14px" }}>
                <span style={{ fontWeight: "600" }}>
                  {studentStats.completionRate ||
                    Math.round(
                      (studentStats.completedCourses /
                        studentStats.enrolledCourses) *
                        100
                    ) ||
                    0}
                  % completion rate
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Hours Learned
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {studentStats.hoursLearned}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                {studentStats.hoursGrowth || 0}% growth this month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h4 style={{ fontWeight: "600", marginBottom: "1.5rem" }}>
          Quick Actions
        </h4>
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/courses")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                Browse Courses
              </h6>
              <small className="text-muted">Find new courses to learn</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/my-courses")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                Continue Learning
              </h6>
              <small className="text-muted">Resume where you left off</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/certificates")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                My Certificates
              </h6>
              <small className="text-muted">View earned certificates</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/profile")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                My Profile
              </h6>
              <small className="text-muted">Update your information</small>
            </button>
          </div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: "600", margin: 0 }}>
            Your Learning Journey
          </h4>
          <a
            href="/my-courses"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            See All Courses →
          </a>
        </div>

        {Array.isArray(courses) && courses.length > 0 ? (
          <div className="row g-4">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id || course._id || `course-${Math.random()}`}
                className="col-md-4"
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderRadius: "15px", overflow: "hidden" }}
                >
                  <div
                    style={{
                      height: "140px",
                      background: `linear-gradient(135deg, ${
                        course.color || "#667eea"
                      } 0%, #764ba2 100%)`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "15px",
                        right: "15px",
                      }}
                    >
                      <div
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#667eea",
                            }}
                          >
                            PROGRESS
                          </small>
                          <small
                            style={{
                              fontSize: "13px",
                              fontWeight: "700",
                              color: "#333",
                            }}
                          >
                            {course.progress || 0}%
                          </small>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "#e9ecef",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${course.progress || 0}%`,
                              height: "100%",
                              background:
                                "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                              transition: "width 0.3s ease",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6
                        style={{
                          fontWeight: "600",
                          flex: 1,
                          marginBottom: "0",
                        }}
                      >
                        {course.title || "Untitled Course"}
                      </h6>
                      <span
                        style={{
                          background: "#e7f3ff",
                          color: "#0066cc",
                          fontSize: "11px",
                          fontWeight: "600",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          marginLeft: "8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {course.lessonsCompleted || 0}/
                        {course.totalLessons || 10}
                      </span>
                    </div>
                    <p
                      className="text-muted small mb-3"
                      style={{ fontSize: "13px" }}
                    >
                      {course.instructor || "Expert Instructor"}
                    </p>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6c757d"
                          strokeWidth="2"
                          style={{ marginRight: "8px" }}
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <small className="text-muted">
                          {course.timeRemaining || "2 hours"} remaining
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#6c757d"
                          strokeWidth="2"
                          style={{ marginRight: "8px" }}
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <small className="text-muted">
                          Last activity: {course.lastActivity || "2 days ago"}
                        </small>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        (window.location.href = `/course/${
                          course.id || course._id
                        }`)
                      }
                      className="btn btn-sm w-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                        padding: "10px",
                      }}
                    >
                      {course.progress === 0
                        ? "Start Learning"
                        : "Continue Learning"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "15px",
              background: "linear-gradient(135deg, #fff5f5 0%, #ffe8f0 100%)",
            }}
          >
            <div className="card-body p-5 text-center">
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 25px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                }}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f5576c"
                  strokeWidth="2"
                >
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h4
                style={{
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Begin Your Learning Adventure
              </h4>
              <p
                className="text-muted mb-4"
                style={{ maxWidth: "500px", margin: "0 auto 25px" }}
              >
                Discover thousands of courses across technology, business,
                design, and more. Start learning today and unlock your
                potential.
              </p>
              <a
                href="/courses"
                className="btn btn-primary btn-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 40px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(245, 87, 108, 0.3)",
                }}
              >
                Explore Courses
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Learning Insights */}
      <div>
        <h4 style={{ fontWeight: "600", marginBottom: "1.5rem" }}>
          Learning Insights
        </h4>
        <div className="row g-4">
          <div className="col-md-8">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <h6 style={{ fontWeight: "600", marginBottom: "20px" }}>
                  Recent Activity
                </h6>
                {stats?.recentActivity?.length > 0 ? (
                  <div>
                    {stats.recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-start py-3"
                        style={{
                          borderBottom:
                            index < stats.recentActivity.length - 1
                              ? "1px solid #e9ecef"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="flex-grow-1">
                          <p
                            className="mb-1"
                            style={{ fontSize: "14px", fontWeight: "500" }}
                          >
                            {activity.message}
                          </p>
                          <small
                            className="text-muted"
                            style={{ fontSize: "12px" }}
                          >
                            {activity.timestamp}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dee2e6"
                      strokeWidth="2"
                      style={{ margin: "0 auto 15px" }}
                    >
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <p className="text-muted mb-0">No recent activity yet</p>
                    <small className="text-muted">
                      Start learning to see your progress here
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card border-0 shadow-sm"
              style={{ borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <h6 style={{ fontWeight: "600", marginBottom: "20px" }}>
                  Learning Streak
                </h6>
                <div className="text-center mb-3">
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 15px",
                      boxShadow: "0 4px 15px rgba(250, 112, 154, 0.3)",
                    }}
                  >
                    <div style={{ textAlign: "center", color: "white" }}>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "700",
                          lineHeight: "1",
                        }}
                      >
                        {studentStats.streak || 0}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          marginTop: "4px",
                        }}
                      >
                        DAYS
                      </div>
                    </div>
                  </div>
                  <p
                    className="mb-2"
                    style={{ fontWeight: "600", fontSize: "14px" }}
                  >
                    Keep it up!
                  </p>
                  <small className="text-muted">
                    {studentStats.streak > 0
                      ? `You've been learning for ${studentStats.streak} days straight`
                      : "Start learning today to begin your streak"}
                  </small>
                </div>
              </div>
            </div>

            <div
              className="card border-0 shadow-sm mt-4"
              style={{
                borderRadius: "15px",
                background: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
              }}
            >
              <div className="card-body p-4 text-center">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00838f"
                  strokeWidth="2"
                  style={{ marginBottom: "12px" }}
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <h6
                  style={{
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#00838f",
                  }}
                >
                  Earn Certificates
                </h6>
                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Complete courses to earn verified certificates
                </p>
                <button
                  onClick={() => (window.location.href = "/certificates")}
                  className="btn btn-sm"
                  style={{
                    background: "#00838f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  View Certificates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InstructorDashboard({ user, updateUser }) {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      const [statsResponse, coursesResponse] = await Promise.all([
        API.getInstructorStats(),
        API.getInstructorCourses(),
      ]);

      setStats(statsResponse.data);
      setCourses(coursesResponse.data);
    } catch (err) {
      console.error("Error loading instructor data:", err);
      setError("Failed to load instructor data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading your data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  // Use real data from API or fallback to user data
  const instructorStats = stats ||
    user.instructorData || {
      totalCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      avgRating: 0,
    };

  return (
    <>
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Total Courses
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {instructorStats.totalCourses}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Active courses
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Total Students
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {instructorStats.totalStudents}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Enrolled learners
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Total Revenue
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    ${instructorStats.totalRevenue}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                This month
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className="stat-card card border-0 shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <p className="text-muted mb-1" style={{ fontSize: "14px" }}>
                    Avg. Rating
                  </p>
                  <h2 style={{ fontWeight: "700", margin: 0 }}>
                    {instructorStats.avgRating}
                  </h2>
                </div>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </div>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Course ratings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h4 style={{ fontWeight: "600", marginBottom: "1.5rem" }}>
          Quick Actions
        </h4>
        <div className="row g-3">
          <div className="col-md-6 col-lg-3">
            <button
              onClick={() =>
                (window.location.href = "/instructor/courses/create")
              }
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                Create Course
              </h6>
              <small className="text-muted">Add a new course</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/instructor/courses")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                My Courses
              </h6>
              <small className="text-muted">Manage your courses</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/instructor/students")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                Students
              </h6>
              <small className="text-muted">View all students</small>
            </button>
          </div>

          <div className="col-md-6 col-lg-3">
            <button
              onClick={() => (window.location.href = "/instructor/analytics")}
              className="quick-action-btn btn w-100 border-0 shadow-sm p-4"
              style={{
                background: "white",
                borderRadius: "15px",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "15px",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h6 style={{ fontWeight: "600", marginBottom: "5px" }}>
                Analytics
              </h6>
              <small className="text-muted">View performance</small>
            </button>
          </div>
        </div>
      </div>

      {/* Course Performance Overview */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 style={{ fontWeight: "600", margin: 0 }}>Course Performance</h4>
          <button
            onClick={() => (window.location.href = "/instructor/courses")}
            className="btn btn-outline-primary"
            style={{
              borderRadius: "10px",
              padding: "8px 20px",
              fontWeight: "600",
              borderColor: "#667eea",
              color: "#667eea",
            }}
          >
            View All Courses →
          </button>
        </div>

        {Array.isArray(courses) && courses.length > 0 ? (
          <div className="row g-4">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course.id || course._id || `course-${Math.random()}`}
                className="col-md-4"
              >
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderRadius: "15px", overflow: "hidden" }}
                >
                  <div
                    style={{
                      height: "120px",
                      background: `linear-gradient(135deg, ${
                        course.color || "#667eea"
                      } 0%, #764ba2 100%)`,
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        textAlign: "center",
                        padding: "15px",
                      }}
                    >
                      <div style={{ fontSize: "32px", fontWeight: "700" }}>
                        {course.rating || "4.5"}⭐
                      </div>
                      <small style={{ opacity: 0.9 }}>Course Rating</small>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 style={{ fontWeight: "600", marginBottom: "8px" }}>
                      {course.title || "Untitled Course"}
                    </h6>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Enrollment</small>
                        <small style={{ fontWeight: "600", color: "#667eea" }}>
                          {course.students || 0} students
                        </small>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-muted">Revenue</small>
                        <small style={{ fontWeight: "600", color: "#28a745" }}>
                          ${course.revenue || 0}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">Completion Rate</small>
                        <small style={{ fontWeight: "600", color: "#17a2b8" }}>
                          {course.completionRate || 0}%
                        </small>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        (window.location.href = `/instructor/courses/${
                          course.id || course._id
                        }`)
                      }
                      className="btn btn-sm w-100"
                      style={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        border: "none",
                        borderRadius: "8px",
                        color: "white",
                        fontWeight: "600",
                        padding: "10px",
                      }}
                    >
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "15px",
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            }}
          >
            <div className="card-body p-5 text-center">
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 25px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                }}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#667eea"
                  strokeWidth="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <h4
                style={{
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#333",
                }}
              >
                Ready to Share Your Expertise?
              </h4>
              <p
                className="text-muted mb-4"
                style={{ maxWidth: "500px", margin: "0 auto 25px" }}
              >
                Create engaging courses and build your teaching portfolio.
                Impact thousands of learners worldwide and earn revenue from
                your knowledge.
              </p>
              <button
                onClick={() =>
                  (window.location.href = "/instructor/courses/create")
                }
                className="btn btn-primary btn-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 40px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                Create Your First Course
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h4 style={{ fontWeight: "600", marginBottom: "1.5rem" }}>
          Recent Activity
        </h4>
        <div
          className="card border-0 shadow-sm"
          style={{ borderRadius: "15px" }}
        >
          <div className="card-body p-4">
            {stats?.recentActivity?.length > 0 ? (
              <div>
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center py-2 border-bottom"
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#667eea",
                        marginRight: "15px",
                      }}
                    ></div>
                    <div className="flex-grow-1">
                      <p className="mb-1" style={{ fontSize: "14px" }}>
                        {activity.message}
                      </p>
                      <small className="text-muted">{activity.timestamp}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dee2e6"
                  strokeWidth="2"
                  style={{ margin: "0 auto 15px" }}
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <p className="text-muted mb-0">No recent activity to show</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Add these exports at the end of the file
export { StudentDashboard, InstructorDashboard };
