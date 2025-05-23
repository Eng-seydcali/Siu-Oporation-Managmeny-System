import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import Budgets from './pages/user/Budgets';
import Requests from './pages/user/Requests';
import Emergencies from './pages/user/Emergencies';
import Reports from './pages/user/Reports';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AcademicYears from './pages/admin/AcademicYears';
import Departments from './pages/admin/Departments';
import AllBudgets from './pages/admin/AllBudgets';
import AllRequests from './pages/admin/AllRequests';
import AllEmergencies from './pages/admin/AllEmergencies';
import AllUsers from './pages/admin/AllUsers';
import AdminReports from './pages/admin/Reports';

// Auth Routes
import PrivateRoute from './components/routes/PrivateRoute';
import AdminRoute from './components/routes/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* User Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/emergencies" element={<Emergencies />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/academic-years" element={<AcademicYears />} />
              <Route path="/admin/departments" element={<Departments />} />
              <Route path="/admin/budgets" element={<AllBudgets />} />
              <Route path="/admin/requests" element={<AllRequests />} />
              <Route path="/admin/emergencies" element={<AllEmergencies />} />
              <Route path="/admin/users" element={<AllUsers />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;