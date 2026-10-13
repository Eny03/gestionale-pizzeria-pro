import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../../shared/types';
import {
  UtensilsCrossed,
  LayoutGrid,
  Flame,
  ChefHat,
  Wine,
  ShoppingBag,
  CalendarDays,
  ShieldCheck,
  Wifi,
  WifiOff,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, staff, isConnected, orders } = useApp();

  const activeOrdersCount = orders.filter(o => o.status === 'ATTIVO' || o.status === 'IN_CORSO').length;

  const roles: { role: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { role: 'CAMERIERE', label: 'Cameriere', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'hover:bg-amber-600/30' },
    { role: 'CAPO_SALA', label: 'Capo Sala', icon: <LayoutGrid className="w-4 h-4" />, color: 'hover:bg-sky-600/30' },
    { role: 'PIZZERIA', label: 'Pizzeria', icon: <Flame className="w-4 h-4" />, color: 'hover:bg-red-600/30' },
    { role: 'CUCINA', label: 'Cucina', icon: <ChefHat className="w-4 h-4" />, color: 'hover:bg-emerald-600/30' },
    { role: 'BAR', label: 'Bar', icon: <Wine className="w-4 h-4" />, color: 'hover:bg-purple-600/30' },
    { role: 'ASPORTO', label: 'Asporto', icon: <ShoppingBag className="w-4 h-4" />, color: 'hover:bg-indigo-600/30' },
    { role: 'TURNI', label: 'Turni HR', icon: <CalendarDays className="w-4 h-4" />, color: 'hover:bg-cyan-600/30' },
    { role: 'ADMIN', label: 'Admin / Cassa', icon: <ShieldCheck className="w-4 h-4" />, color: 'hover:bg-rose-600/30' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 select-none shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Connection */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-xl">
              🍕
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-orange-400 via-amber-200 to-white bg-clip-text text-transparent">
                  Pizzeria Smart Pro
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  REAL-TIME RBAC
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span className="flex items-center space-x-1">
                  {isConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-emerald-400 font-medium">Live Sync</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span className="text-rose-400 font-medium">Offline</span>
                    </>
                  )}
                </span>
                <span>•</span>
                <span>{activeOrdersCount} comande attive</span>
              </div>
            </div>
          </div>

          {/* Active Waiter / Staff Switcher */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <UserCheck className="w-4 h-4 text-orange-400" />
            <span className="text-slate-400">Operatore:</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = staff.find(s => s.id === e.target.value);
                if (selected) {
                  setCurrentUser({
                    id: selected.id,
                    name: selected.name,
                    role: currentRole
                  });
                }
              }}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name} ({s.role})
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher Pill Ribbon */}
          <nav className="flex items-center space-x-1 overflow-x-auto py-1 max-w-[55vw] lg:max-w-none">
            {roles.map((r) => {
              const isActive = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setCurrentRole(r.role)}
                  className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 ring-1 ring-orange-400'
                      : `text-slate-400 bg-slate-800/60 hover:text-slate-200 ${r.color} border border-slate-700/40`
                  }`}
                  title={`Passa alla vista ${r.label}`}
                >
                  {r.icon}
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
