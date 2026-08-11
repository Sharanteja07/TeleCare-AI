import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const TOAST_STYLES = {
  success: {
    border: 'rgba(0,230,118,0.3)',
    glow: 'rgba(0,230,118,0.12)',
    icon: <CheckCircle size={16} style={{ color: '#00E676' }} />,
    accent: '#00E676',
  },
  error: {
    border: 'rgba(255,82,82,0.3)',
    glow: 'rgba(255,82,82,0.12)',
    icon: <XCircle size={16} style={{ color: '#FF5252' }} />,
    accent: '#FF5252',
  },
  warning: {
    border: 'rgba(255,193,7,0.3)',
    glow: 'rgba(255,193,7,0.12)',
    icon: <AlertTriangle size={16} style={{ color: '#FFC107' }} />,
    accent: '#FFC107',
  },
  info: {
    border: 'rgba(59,183,255,0.3)',
    glow: 'rgba(59,183,255,0.12)',
    icon: <Info size={16} style={{ color: '#3BB7FF' }} />,
    accent: '#3BB7FF',
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '360px',
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const ts = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
          return (
            <div
              key={toast.id}
              className="toast-enter"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(13,18,36,0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${ts.border}`,
                boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 20px ${ts.glow}`,
                borderLeft: `3px solid ${ts.accent}`,
              }}
            >
              <span style={{ flexShrink: 0 }}>{ts.icon}</span>
              <p style={{ flex: 1, margin: 0, fontSize: '13px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: 1.4 }}>
                {toast.message}
              </p>
              <button
                onClick={() => remove(toast.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#A8B3CF',
                  display: 'flex',
                  padding: '2px',
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#A8B3CF'}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
