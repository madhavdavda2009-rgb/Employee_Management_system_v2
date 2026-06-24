import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToastContext } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Layout from './components/Layout';
import RoleHome from './components/RoleHome';
import EmployeeHistory from './pages/EmployeeHistory';

function AppContent() {
  const { toasts, dismissToast } = useToastContext();

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<RoleHome />} />
            <Route path="employees" element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard"><Employees /></ProtectedRoute>} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="history" element={<ProtectedRoute allowedRoles={['employee']} redirectTo="/dashboard"><EmployeeHistory /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard"><Reports /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin']} redirectTo="/dashboard"><Analytics /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
