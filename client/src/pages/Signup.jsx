import { useState } from "react";
import API from "../lib/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
const res = await API.post("/api/auth/signup", form);
      
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setMsg(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-30px) translateX(30px);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .signup-card {
          animation: slideIn 0.6s ease-out;
        }

        .form-control:focus, .form-select:focus {
          border-color: #f5576c !important;
          box-shadow: 0 0 0 0.2rem rgba(245, 87, 108, 0.25) !important;
        }

        .btn-signup {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-signup:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #e082ea 0%, #e4465b 100%);
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        padding: '20px'
      }}>
        <div className="container">
          <div className="row justify-content-center">
<div className="col-sm-12 col-md-8 col-lg-6">
              <div className="card signup-card" style={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.95)'
              }}>
                <div className="card-body p-5">
                  {/* Logo/Icon */}
                  <div className="text-center mb-4">
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 10px 25px rgba(245, 87, 108, 0.3)'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                    </div>
                    <h2 style={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '8px'
                    }}>Create Account</h2>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>
                      Join us and start learning today
                    </p>
                  </div>

                  {msg && (
                    <div className="alert alert-danger" style={{
                      borderRadius: '12px',
                      border: 'none',
                      background: 'rgba(220, 53, 69, 0.1)',
                      color: '#dc3545'
                    }}>
                      {msg}
                    </div>
                  )}

                  <form onSubmit={submit}>
                    <div className="mb-3">
                      <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        Full Name
                      </label>
                      <input 
                        className="form-control" 
                        placeholder="Enter your full name" 
                        value={form.name}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          fontSize: '14px'
                        }}
                        onChange={(e)=>setForm({...form, name: e.target.value})} 
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        Email Address
                      </label>
                      <input 
                        className="form-control" 
                        placeholder="Enter your email" 
                        type="email" 
                        value={form.email}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          fontSize: '14px'
                        }}
                        onChange={(e)=>setForm({...form, email: e.target.value})} 
                        required 
                      />
                    </div>

                    <div className="mb-3">
                      <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        Password
                      </label>
                      <input 
                        className="form-control" 
                        placeholder="Create a password" 
                        type="password" 
                        value={form.password}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          fontSize: '14px'
                        }}
                        onChange={(e)=>setForm({...form, password: e.target.value})} 
                        required 
                      />
                    </div>

                    <div className="mb-4">
                      <label style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        I am a
                      </label>
                      <select 
                        className="form-select" 
                        value={form.role}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          fontSize: '14px'
                        }}
                        onChange={(e)=>setForm({...form, role: e.target.value})}>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                      </select>
                    </div>

                    <button 
                      className="btn btn-signup text-white w-100 mb-3" 
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '15px'
                      }}
                    >
                      Create Account
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
                      Already have an account?{' '}
                      <a href="/login" style={{
                        color: '#f5576c',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}>
                        Sign in
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="text-center mt-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  🔒 Your data is safe with us
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}