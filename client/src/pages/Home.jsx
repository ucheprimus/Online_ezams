export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
      <div className="text-center">
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Online Learning Platform</h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#6c757d' }}>Sign in or sign up to continue.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <a href="/login" className="btn btn-primary btn-lg px-4">Login</a>
          <a href="/signup" className="btn btn-outline-secondary btn-lg px-4">Sign up</a>
        </div>
      </div>
    </div>
  );
}