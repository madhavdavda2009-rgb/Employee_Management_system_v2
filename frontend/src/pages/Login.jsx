import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.300 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full">
              <Lock size={40} className="text-white" />
            </div>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.250, delay: 0.1 }}
            className="page-title text-center"
          >
            Admin Login
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.250, delay: 0.15 }}
            className="text-slate-400 text-center mb-8"
          >
            EMS Pro - Enterprise Management System
          </motion.p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Email</label>
              <input
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field bg-white/10 text-white placeholder-white/60"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field bg-white/10 text-white placeholder-white/60"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary disabled:opacity-60 disabled:scale-100 mt-6"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
