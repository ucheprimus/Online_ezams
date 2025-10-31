import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setMsg(null);
    setLoading(true);

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Form data:', form);

    try {
      console.log('Sending request...');
      const res = await API.post("/api/auth/login", form);

      
      console.log('Response received:', res.data);

      const { token, user } = res.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      console.log('Saving token and user role...');
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      
      console.log('Token saved successfully');
      console.log('Navigating to dashboard...');
      
      // Use navigate instead of window.location
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error:', err);
      console.error('Response:', err.response?.data);
      
      setMsg(err.response?.data?.error || err.response?.data?.message || err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

        .login-card {
          animation: slideIn 0.6s ease-out;
        }

        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }

        .btn-login {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          background: linear-gradient(135deg, #5568d3 0%, #6941a0 100%);
        }

        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
            <div className="col-sm-12 col-md-8 col-lg-5">
              <div className="card login-card" style={{
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h2 style={{ 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      marginBottom: '8px'
                    }}>Welcome Back</h2>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>
                      Sign in to continue your learning journey
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
                      <label htmlFor="email" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        Email Address
                      </label>
                      <input 
                        id="email"
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
                        onChange={(e) => setForm({...form, email: e.target.value})} 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="password" style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                        Password
                      </label>
                      <input 
                        id="password"
                        className="form-control" 
                        placeholder="Enter your password" 
                        type="password"
                        value={form.password}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          fontSize: '14px'
                        }}
                        onChange={(e) => setForm({...form, password: e.target.value})} 
                        required 
                        disabled={loading}
                      />
                    </div>

                    <button 
                      type="submit"
                      className="btn btn-login text-white w-100 mb-3" 
                      style={{
                        padding: '14px',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '15px'
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-4">
                    <p style={{ fontSize: '14px', color: '#6c757d', margin: 0 }}>
                      Don't have an account?{' '}
                      <a href="/signup" style={{
                        color: '#667eea',
                        fontWeight: '600',
                        textDecoration: 'none'
                      }}>
                        Sign up
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="text-center mt-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  🔒 Secure and encrypted connection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}