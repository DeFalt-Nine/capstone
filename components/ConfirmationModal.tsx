import React, { useEffect } from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onCancel]);

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger': return 'bg-lt-red hover:bg-red-600 shadow-red-200';
      case 'warning': return 'bg-lt-orange hover:bg-orange-600 shadow-orange-200';
      case 'info': return 'bg-lt-blue hover:bg-blue-600 shadow-blue-200';
      default: return 'bg-slate-800 hover:bg-slate-900 shadow-slate-200';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger': return <i className="fas fa-exclamation-circle text-lt-red"></i>;
      case 'warning': return <i className="fas fa-exclamation-triangle text-lt-orange"></i>;
      case 'info': return <i className="fas fa-info-circle text-lt-blue"></i>;
      default: return <i className="fas fa-question-circle text-slate-400"></i>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
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
        
        <div className="flex border-t border-slate-100">
          <button 
            onClick={onCancel}
            className="flex-1 px-6 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 text-sm font-bold text-white transition-all ${getVariantClasses()}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
