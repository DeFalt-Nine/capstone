import React, { useEffect } from 'react';

interface AlertModalProps {
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

const AlertModal: React.FC<AlertModalProps> = ({
  title,
  message,
  buttonLabel = 'Got it',
  onClose,
  variant = 'info'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'success': return 'bg-lt-moss hover:bg-green-600 shadow-green-200';
      case 'warning': return 'bg-lt-orange hover:bg-orange-600 shadow-orange-200';
      case 'error': return 'bg-lt-red hover:bg-red-600 shadow-red-200';
      case 'info': return 'bg-lt-blue hover:bg-blue-600 shadow-blue-200';
      default: return 'bg-slate-800 hover:bg-slate-900 shadow-slate-200';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success': return <i className="fas fa-check-circle text-lt-moss"></i>;
      case 'warning': return <i className="fas fa-exclamation-triangle text-lt-orange"></i>;
      case 'error': return <i className="fas fa-times-circle text-lt-red"></i>;
      case 'info': return <i className="fas fa-info-circle text-lt-blue"></i>;
      default: return <i className="fas fa-info-circle text-slate-400"></i>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner border border-slate-100">
            {getIcon()}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onClose}
            className={`w-full py-3 rounded-xl text-sm font-bold text-white transition-all ${getVariantClasses()}`}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
