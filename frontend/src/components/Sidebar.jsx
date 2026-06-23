import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ScanFace, FileText, BarChart3, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Scanner', icon: ScanFace },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 }
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const renderHeader = () => (
    <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
          <ScanFace size={22} className="text-white" />
        </div>
        <div className={`${collapsed ? 'hidden md:block group-hover:block' : ''}`}>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">EMS Pro</h1>
          <p className="text-xs text-slate-500">Enterprise</p>
        </div>
      </div>

      <button
        onClick={() => {
          if (typeof setMobileOpen === 'function') setMobileOpen(false);
          setCollapsed(!collapsed);
        }}
        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200"
      >
        {collapsed ? <Menu size={20} className="text-slate-400" /> : <X size={20} className="text-slate-400" />}
      </button>
    </div>
  );

  const renderNav = () => (
    <nav className="flex-1 p-4 space-y-2">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className={({ isActive }) =>
            isActive
              ? 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-white ring-1 ring-indigo-500/30'
              : 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group text-slate-400 hover:text-white hover:bg-slate-800/50'
          }
        >
          <Icon size={20} className="text-current" />
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
            className={`font-medium ${collapsed ? 'hidden md:block group-hover:block' : ''}`}
          >
            {label}
          </motion.span>
          <div className="ml-auto" aria-hidden>
            {!collapsed && <div className="w-1.5 h-1.5 rounded-full bg-transparent" />}
          </div>
        </NavLink>
      ))}
    </nav>
  );

  const renderFooter = () => (
    <div className="p-4 border-t border-slate-800/50">
      <div className={`glass rounded-lg p-4 ${collapsed ? 'text-center' : ''}`}>
        <div className={`${collapsed ? 'mx-auto' : ''}`}>
          <p className={`text-sm font-medium text-slate-300 ${collapsed ? 'hidden md:block group-hover:block' : ''}`}>System Status</p>
          {!collapsed && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-xs text-slate-500">All systems operational</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity md:hidden ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen && setMobileOpen(false)}
      />

      {isMobile ? (
        <motion.aside
          initial={{ x: -320 }}
          animate={{ x: mobileOpen ? 0 : -320 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className={`glass-card border-r border-slate-800/50 flex flex-col fixed z-40 top-0 left-0 h-full w-72`}
        >
          {renderHeader()}
          {renderNav()}
          {renderFooter()}
        </motion.aside>
      ) : (
        <aside className={`glass-card border-r border-slate-800/50 flex flex-col relative z-10 top-0 left-0 h-full ${collapsed ? 'w-20' : 'w-72'} group md:hover:w-72 transition-all duration-200`}>
          {renderHeader()}
          {renderNav()}
          {renderFooter()}
        </aside>
      )}
    </>
  );
};

export default Sidebar;
