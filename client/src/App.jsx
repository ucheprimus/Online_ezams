// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CreateCourse from './pages/CreateCourse';
import MyCourses from './pages/MyCourses';
import EditCourse from './pages/EditCourse'; // ← ADD THIS IMPORT

// Layout wrapper for public pages (with Navbar)
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes - WITH Navbar */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/signup" element={<PublicLayout><Signup /></PublicLayout>} />
          
          {/* Future public routes can be added here */}
          {/* <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} /> */}
          {/* <Route path="/about" element={<PublicLayout><About /></PublicLayout>} /> */}
          
          {/* Protected Dashboard Routes - WITHOUT Navbar (has its own sidebar) */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard Overview - renders at /dashboard */}
            <Route index element={<Dashboard />} />
            
            {/* Dashboard Routes */}
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="edit-course/:id" element={<EditCourse />} /> {/* ← FIXED THIS LINE */}
            {/* <Route path="students" element={<Students />} /> */}
            {/* <Route path="analytics" element={<Analytics />} /> */}
            {/* <Route path="browse" element={<BrowseCourses />} /> */}
            {/* <Route path="progress" element={<Progress />} /> */}
            {/* <Route path="settings" element={<Settings />} /> */}
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;