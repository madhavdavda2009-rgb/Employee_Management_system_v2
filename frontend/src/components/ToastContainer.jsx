import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastIcons = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`toast toast-${toast.type} ${toast.exit ? 'exit' : ''}`}
        >
          {toastIcons[toast.type] || toastIcons.info}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <X size={18} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default ToastContainer;
