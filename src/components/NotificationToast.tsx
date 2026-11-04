import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface NotificationToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-sm animate-slideDown">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between backdrop-blur-xl ${
        type === 'success' 
          ? 'bg-neutral-900/95 border-emerald-500/40 text-white' 
          : type === 'error'
          ? 'bg-neutral-900/95 border-red-500/40 text-white'
          : 'bg-neutral-900/95 border-neutral-700 text-white'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{type === 'success' ? 'Opération validée' : 'Information'}</p>
            <p className="text-[11px] text-neutral-300 line-clamp-2">{message}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
