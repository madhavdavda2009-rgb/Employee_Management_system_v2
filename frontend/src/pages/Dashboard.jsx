import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { useSpring, animated } from '@react-spring/web';

const AnimatedNumber = ({ value }) => {
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 }
  });
  return <animated.span>{number.to(n => n.toFixed(0))}</animated.span>;
};

const StatCard = ({ title, value, icon: Icon, gradient, index, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
    className="stat-card rounded-2xl card-hover group"
  >
    <div className="gradient-edge" />
    <div className="glow" />
    <div className="stat-inner p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${gradient} ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-bold text-white">
            <AnimatedNumber value={value} />
          </span>
          {subtext && (
            <span className="text-xs text-emerald-400 font-medium mt-1">
              {subtext}
            </span>
          )}
        </div>
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/attendance/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card rounded-2xl p-6">
              <div className="skeleton h-12 w-12 rounded-xl mb-4" />
              <div className="skeleton h-8 w-20 rounded mb-2" />
              <div className="skeleton h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-title"
        >
          Dashboard Overview
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400"
        >
          Real-time attendance metrics and system status
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          gradient="bg-gradient-to-br from-indigo-600 to-indigo-800"
          index={0}
        />
        <StatCard
          title="Present Today"
          value={stats?.present || 0}
          icon={UserCheck}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-800"
          index={1}
        />
        <StatCard
          title="Late Today"
          value={stats?.late || 0}
          icon={Clock}
          gradient="bg-gradient-to-br from-amber-600 to-amber-800"
          index={2}
        />
        <StatCard
          title="Absent Today"
          value={stats?.absent || 0}
          icon={UserX}
          gradient="bg-gradient-to-br from-red-600 to-red-800"
          index={3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gradient-border rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Attendance Rate</h2>
            <p className="text-slate-400 text-sm">Today's performance metrics</p>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp size={20} />
            <span className="text-2xl font-bold">{stats?.percentage || 0}%</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span className="text-white font-medium">{stats?.present + stats?.late || 0} / {stats?.totalEmployees || 0}</span>
          </div>
          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats?.percentage || 0}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="absolute h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats?.present || 0}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{stats?.late || 0}</p>
              <p className="text-xs text-slate-500">Late</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{stats?.absent || 0}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default Dashboard;
