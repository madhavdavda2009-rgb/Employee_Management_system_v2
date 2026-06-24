import { useAuth } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';
import EmployeeDashboard from '../pages/EmployeeDashboard';

const RoleHome = () => {
  const { user } = useAuth();

  if (user?.role === 'employee') {
    return <EmployeeDashboard />;
  }

  return <Dashboard />;
};

export default RoleHome;
