import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, CheckCircle2, Info, X, Bell } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-14 right-3 sm:right-4 left-3 sm:left-auto z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none select-none">
      {notifications.map((n) => {
        let borderClass = 'border-blue-500/30 bg-slate-900/95';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

        if (n.type === 'success') {
          borderClass = 'border-emerald-500/40 bg-slate-900/95';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (n.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-slate-900/95 glow-urgent';
          icon = <Bell className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (n.type === 'error') {
          borderClass = 'border-rose-500/50 bg-slate-900/95';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start space-x-3 transition-all duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-100">{n.title}</h4>
                <span className="text-[10px] text-slate-400">{n.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">{n.message}</p>
            </div>
            <button
              onClick={() => dismissNotification(n.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
