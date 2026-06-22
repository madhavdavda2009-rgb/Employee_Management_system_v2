import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card border-b border-slate-800/50 px-6 py-4 sticky top-0 z-10"
    >
      <div className="flex justify-between items-center">
        <div className="flex-1" />

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={logout}
            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors duration-200"
            title="Logout"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
