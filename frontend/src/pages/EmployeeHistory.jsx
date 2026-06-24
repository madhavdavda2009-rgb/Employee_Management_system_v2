import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const EmployeeHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/attendance/me');
      setAttendance(data);
    } catch (error) {
      console.error('Failed to fetch attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">Attendance History</h1>
        <p className="text-slate-400">Your own attendance records only</p>
      </motion.div>

      <div className="glass rounded-xl p-6">
        <div className="table-responsive">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-white/90">Date</th>
                <th className="text-left py-3 px-4 text-white/90">Check In</th>
                <th className="text-left py-3 px-4 text-white/90">Status</th>
                <th className="text-left py-3 px-4 text-white/90">Marked By</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
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
                  <td className="py-3 px-4 text-white" data-label="Marked By">{record.markedBy || 'System'}</td>
                </tr>
              ))}
              {!attendance.length && (
                <tr>
                  <td className="table-no-data" colSpan={4}>No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHistory;
