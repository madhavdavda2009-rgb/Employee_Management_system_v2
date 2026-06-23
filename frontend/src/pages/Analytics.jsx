import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [daily, monthly, department] = await Promise.all([
        api.get('/analytics/daily?days=7'),
        api.get('/analytics/monthly?months=6'),
        api.get('/analytics/department')
      ]);

      setDailyData(daily.data);
      setMonthlyData(monthly.data);

      const deptArray = Object.entries(department.data).map(([name, stats]) => ({
        name,
        ...stats
      }));
      setDepartmentData(deptArray);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="page-title">Analytics</h1>
        <p className="text-slate-400">Attendance trends and department insights</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Daily Attendance (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="_id" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="_id" stroke="rgba(255,255,255,0.7)" />
              <YAxis stroke="rgba(255,255,255,0.7)" />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" />
              <Line type="monotone" dataKey="late" stroke="#f59e0b" name="Late" />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6 lg:col-span-2"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Department Attendance</h2>
          <div className="table-responsive">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/90">Department</th>
                  <th className="text-center py-3 px-4 text-white/90">Total</th>
                  <th className="text-center py-3 px-4 text-white/90">Present</th>
                  <th className="text-center py-3 px-4 text-white/90">Late</th>
                  <th className="text-center py-3 px-4 text-white/90">Absent</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.name} className="border-b border-white/10 hover:bg-white/8 transition-colors duration-200">
                    <td className="py-3 px-4 text-white" data-label="Department">{dept.name}</td>
                    <td className="py-3 px-4 text-white text-center" data-label="Total">{dept.total}</td>
                    <td className="py-3 px-4 text-green-400 text-center" data-label="Present">{dept.present}</td>
                    <td className="py-3 px-4 text-yellow-400 text-center" data-label="Late">{dept.late}</td>
                    <td className="py-3 px-4 text-red-400 text-center" data-label="Absent">{dept.absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
