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
  const { currentRole, setCurrentRole, currentUser, isConnected, orders } = useApp();

  const activeOrdersCount = orders.filter(o => o.status === 'ATTIVO' || o.status === 'IN_CORSO').length;

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'CAMERIERE', label: 'Cameriere', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { role: 'CAPO_SALA', label: 'Tavoli', icon: <LayoutGrid className="w-4 h-4" /> },
    { role: 'PIZZERIA', label: 'Pizzeria', icon: <Flame className="w-4 h-4" /> },
    { role: 'CUCINA', label: 'Cucina', icon: <ChefHat className="w-4 h-4" /> },
    { role: 'BAR', label: 'Bar', icon: <Wine className="w-4 h-4" /> },
    { role: 'ASPORTO', label: 'Asporto', icon: <ShoppingBag className="w-4 h-4" /> },
    { role: 'ADMIN', label: 'Cassa', icon: <ShieldCheck className="w-4 h-4" /> },
    { role: 'TURNI', label: 'Turni', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Header Minimal */}
      <header className="bg-zinc-950 border-b border-zinc-800/80 sticky top-0 z-40 select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo Minimale */}
            <div className="flex items-center space-x-2">
              <span className="text-lg">🍕</span>
              <span className="font-bold text-sm tracking-tight text-white">
                Pizzeria Pro
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                title={isConnected ? 'Connesso' : 'Offline'}
              />
              {activeOrdersCount > 0 && (
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {activeOrdersCount} attivi
                </span>
              )}
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {roles.map((r) => {
                const isActive = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setCurrentRole(r.role)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Operatore Attivo */}
            <div className="text-xs text-zinc-400 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
              <span className="truncate max-w-[100px] text-zinc-300 font-medium">
                {currentUser.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar: Thumb-Friendly POS Switcher */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-50 flex items-center overflow-x-auto px-1 py-1 pb-safe gap-1 select-none">
        {roles.map((r) => {
          const isActive = currentRole === r.role;
          return (
            <button
              key={r.role}
              onClick={() => setCurrentRole(r.role)}
              className={`flex flex-col items-center justify-center min-w-[52px] flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-orange-400 bg-orange-500/10 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="p-0.5">
                {r.icon}
              </span>
              <span className="text-[10px] tracking-tight whitespace-nowrap mt-0.5">
                {r.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
