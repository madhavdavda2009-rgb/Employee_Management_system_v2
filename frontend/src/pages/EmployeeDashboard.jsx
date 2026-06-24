import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, ScanFace, UserCircle2, Mail, BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileResponse, attendanceResponse] = await Promise.all([
        api.get('/employees/me'),
        api.get('/attendance/me')
      ]);

      setProfile(profileResponse.data);
      setAttendance(attendanceResponse.data);
    } catch (error) {
      console.error('Failed to load employee dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const total = attendance.length;
  const present = attendance.filter(record => record.status === 'Present').length;
  const late = attendance.filter(record => record.status === 'Late').length;

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const latestRecords = attendance.slice(0, 5);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3"
      >
        <h1 className="page-title">Employee Dashboard</h1>
        <p className="text-slate-400 max-w-2xl">
          Your profile, attendance scanner, and your own attendance history.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 flex items-center justify-center text-indigo-300">
              <UserCircle2 size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Profile</p>
              <p className="text-white font-medium">{profile?.name || user?.name}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">{profile?.designation || 'Employee'}</p>
          <p className="text-xs text-slate-500 mt-2">{profile?.department || 'Internal'}</p>
        </div>

        <div className="stat-card rounded-xl">
          <div className="stat-inner p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Records</p>
                <p className="text-2xl font-bold text-white mt-2">{total}</p>
              </div>
              <BadgeCheck className="text-emerald-400" size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card rounded-xl">
          <div className="stat-inner p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Attendance Mix</p>
                <p className="text-2xl font-bold text-white mt-2">{present}/{late}</p>
              </div>
              <Clock3 className="text-amber-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6 lg:col-span-1"
        >
          <h2 className="section-title">Profile</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Employee ID</p>
              <p className="text-white">{profile?.employeeId}</p>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-white">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ScanFace size={16} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Account Status</p>
                <p className="text-white">{profile?.isActive ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link to="/attendance" className="btn-primary inline-flex items-center gap-2">
                <ScanFace size={18} />
                Scanner: {profile?.employeeId || user?.employeeId}
              </Link>
              <Link to="/history" className="btn-secondary inline-flex items-center gap-2">
                History
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 lg:col-span-2"
        >
          <h2 className="section-title">Recent Attendance</h2>
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/90">Date</th>
                  <th className="text-left py-3 px-4 text-white/90">Check In</th>
                  <th className="text-left py-3 px-4 text-white/90">Status</th>
                </tr>
              </thead>
              <tbody>
                {latestRecords.map((record) => (
                  <tr key={record._id} className="border-b border-white/10 hover:bg-white/8 transition-colors duration-200">
                    <td className="py-3 px-4 text-white" data-label="Date">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-white" data-label="Check In">
                      {record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4" data-label="Status">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'Present' ? 'bg-green-500/20 text-green-200' :
                        record.status === 'Late' ? 'bg-yellow-500/20 text-yellow-200' :
                        'bg-red-500/20 text-red-200'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!latestRecords.length && (
                  <tr>
                    <td className="table-no-data" colSpan={3}>No attendance history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
