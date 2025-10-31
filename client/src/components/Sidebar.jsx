// src/components/Sidebar.js
import { useNavigate } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();

  const menuItems =
    user.role === "instructor"
      ? [
          { label: "Dashboard", icon: "🏠", path: "/dashboard" },
          { label: "My Courses", icon: "📚", path: "/courses" },
          { label: "Students", icon: "👩‍🎓", path: "/students" },
          { label: "Analytics", icon: "📈", path: "/analytics" },
        ]
      : [
          { label: "Dashboard", icon: "🏠", path: "/dashboard" },
          { label: "Browse Courses", icon: "🔍", path: "/courses" },
          { label: "My Learning", icon: "🎯", path: "/my-courses" },
          { label: "Certificates", icon: "🏅", path: "/certificates" },
        ];

  return (
    <aside
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      <div>
        <div
          style={{
            fontSize: "1.3rem",
            fontWeight: "700",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          {user.role === "instructor" ? "Instructor" : "Student"} Portal
        </div>

        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              border: "none",
              color: "white",
              width: "100%",
              textAlign: "left",
              padding: "10px 15px",
              borderRadius: "8px",
              marginBottom: "8px",
              cursor: "pointer",
              transition: "background 0.3s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "1.2rem" }}>{item.icon}</span>
            <span style={{ fontWeight: "500" }}>{item.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onLogout}
        style={{
          background: "rgba(255,255,255,0.15)",
          border: "none",
          padding: "10px 15px",
          color: "white",
          borderRadius: "8px",
          fontWeight: "500",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        🚪 Logout
      </button>
    </aside>
  );
}
