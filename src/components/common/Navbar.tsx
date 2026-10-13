import React, { useState } from 'react';
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
  ChevronDown,
  UserCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRole, setCurrentRole, currentUser, setCurrentUser, staff, isConnected, orders } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status === 'ATTIVO' || o.status === 'IN_CORSO').length;

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'CAMERIERE', label: 'Cameriere', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { role: 'CAPO_SALA', label: 'Capo Sala', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { role: 'PIZZERIA', label: 'Pizzeria', icon: <Flame className="w-3.5 h-3.5" /> },
    { role: 'CUCINA', label: 'Cucina', icon: <ChefHat className="w-3.5 h-3.5" /> },
    { role: 'BAR', label: 'Bar', icon: <Wine className="w-3.5 h-3.5" /> },
    { role: 'ASPORTO', label: 'Asporto', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { role: 'TURNI', label: 'Turni HR', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { role: 'ADMIN', label: 'Cassa / Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const currentRoleObj = roles.find(r => r.role === currentRole) || roles[0];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Minimale & Sync */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-base">
              🍕
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  Pizzeria Pro
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  v2.0
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                  title={isConnected ? 'Sincronizzato' : 'Offline'}
                />
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5">
                {activeOrdersCount} comande attive
              </div>
            </div>
          </div>

          {/* Selettore Ruolo Mobile (Compatto Dropdown) */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 active:scale-95 transition-transform"
            >
              <span className="text-orange-400">{currentRoleObj.icon}</span>
              <span>{currentRoleObj.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-11 w-44 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-50 divide-y divide-slate-800/40">
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setCurrentRole(r.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      currentRole === r.role
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop / Tablet Segments Menu (Pulito e Minimale) */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            {roles.map((r) => {
              const isActive = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setCurrentRole(r.role)}
                  className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Operatore (Minimale) */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
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
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
