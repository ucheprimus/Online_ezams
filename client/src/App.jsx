// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx'; // Added .jsx
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import BrowseCourses from './pages/BrowseCourses';
import CreateCourse from './pages/CreateCourse';
import MyCourses from './pages/MyCourses';
import EditCourse from './pages/EditCourse';
import CourseDetail from './pages/CourseDetail';
import Checkout from './pages/Checkout';
import LearnCourse from './pages/LearnCourse';
import PaymentSuccess from './pages/PaymentSuccess';
// CORRECTED IMPORT PATH:
import AnalyticsDashboard from './components/Instructor/AnalyticsDashboard'; // Capital I

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
          
          {/* Public Course Routes */}
          <Route path="/courses/:id" element={<PublicLayout><CourseDetail /></PublicLayout>} />
          <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
          
          {/* Checkout Route */}
          <Route path="/checkout/:id" element={<PublicLayout><Checkout /></PublicLayout>} />
          
          {/* Payment Success Route */}
          <Route path="/payment-success" element={<PublicLayout><PaymentSuccess /></PublicLayout>} />
          
          {/* Learn Course Route */}
          <Route 
            path="/learn/:id" 
            element={
              <ProtectedRoute>
                <PublicLayout>
                  <LearnCourse />
                </PublicLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Dashboard Routes - WITH Sidebar */}
          <Route 
            path="/dashboard/*" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="create-course" element={<CreateCourse />} />
            <Route path="edit-course/:id" element={<EditCourse />} />
            <Route path="browse" element={<BrowseCourses />} />
            {/* Analytics Route */}
            <Route path="analytics" element={<AnalyticsDashboard />} />
          </Route>

          {/* Catch all route - 404 */}
          <Route path="*" element={
            <PublicLayout>
              <div className="container text-center py-5">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" className="btn btn-primary">Go Home</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;