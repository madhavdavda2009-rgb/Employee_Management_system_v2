import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exit: true } : t)));
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);
    }

    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exit: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const success = useCallback((message, duration = 4000) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration = 4000) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message, duration = 4000) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message, duration = 4000) => showToast(message, 'warning', duration), [showToast]);

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    info,
    warning,
  };
};
