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
  UserCheck,
  MoreHorizontal,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentRole, setCurrentRole, currentUser, isConnected, orders } = useApp();
  const [showRoleSheet, setShowRoleSheet] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status === 'ATTIVO' || o.status === 'IN_CORSO').length;

  const allRoles: { role: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    { role: 'CAMERIERE', label: 'Cameriere', desc: 'Prendi comande ai tavoli e varianti pizze', icon: <UtensilsCrossed className="w-5 h-5" /> },
    { role: 'CAPO_SALA', label: 'Tavoli', desc: 'Mappa sala, stato tavoli e prenotazioni', icon: <LayoutGrid className="w-5 h-5" /> },
    { role: 'PIZZERIA', label: 'Pizzeria KDS', desc: 'Forno, pre-cottura e uscite forno', icon: <Flame className="w-5 h-5" /> },
    { role: 'CUCINA', label: 'Cucina KDS', desc: 'Antipasti, fritti e piatti caldi', icon: <ChefHat className="w-5 h-5" /> },
    { role: 'BAR', label: 'Bar', desc: 'Bevande, birre e caffetteria', icon: <Wine className="w-5 h-5" /> },
    { role: 'ASPORTO', label: 'Asporto', desc: 'Comande da asporto e orari ritiro', icon: <ShoppingBag className="w-5 h-5" /> },
    { role: 'ADMIN', label: 'Cassa & Admin', desc: 'Conti, pagamenti, ingredienti e menu', icon: <ShieldCheck className="w-5 h-5" /> },
    { role: 'TURNI', label: 'Turni', desc: 'Orari e disponibilità del personale', icon: <CalendarDays className="w-5 h-5" /> },
  ];

  const currentRoleInfo = allRoles.find(r => r.role === currentRole) || allRoles[0];

  // Ruoli principali nella barra inferiore mobile (max 4 + Altro)
  const mobilePrimaryRoles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'CAMERIERE', label: 'Comande', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { role: 'CAPO_SALA', label: 'Tavoli', icon: <LayoutGrid className="w-4 h-4" /> },
    { role: 'PIZZERIA', label: 'Pizzeria', icon: <Flame className="w-4 h-4" /> },
    { role: 'ADMIN', label: 'Cassa', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const isCurrentInPrimary = mobilePrimaryRoles.some(r => r.role === currentRole);

  const selectRole = (role: UserRole) => {
    setCurrentRole(role);
    setShowRoleSheet(false);
  };

  return (
    <>
      {/* Top Header Minimal & Mobile-Optimized */}
      <header className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-40 select-none pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-13 sm:h-14">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-2">
              <span className="text-xl">🍕</span>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">
                    Il Gallo
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-rose-500'
                    }`}
                    title={isConnected ? 'Connesso a Render Cloud' : 'Offline'}
                  />
                </div>
              </div>

              {activeOrdersCount > 0 && (
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                  {activeOrdersCount} comande
                </span>
              )}
            </div>

            {/* Desktop Navigation Pills */}
            <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              {allRoles.map((r) => {
                const isActive = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setCurrentRole(r.role)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    {r.icon}
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Role Switcher Pill + Operator info */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRoleSheet(true)}
                className="md:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold text-orange-400 active:scale-95 transition-all shadow-sm"
              >
                <span>{currentRoleInfo.icon}</span>
                <span className="truncate max-w-[85px]">{currentRoleInfo.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              <div className="hidden sm:flex text-xs text-zinc-400 items-center space-x-1 bg-zinc-900/80 px-2.5 py-1 rounded-xl border border-zinc-800/80">
                <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                <span className="truncate max-w-[100px] text-zinc-300 font-medium">
                  {currentUser.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar: Ergonomic 5-Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 z-40 flex items-center justify-around px-2 py-1 pb-safe shadow-2xl select-none h-[calc(3.5rem+env(safe-area-inset-bottom,0px))]">
        {mobilePrimaryRoles.map((r) => {
          const isActive = currentRole === r.role;
          return (
            <button
              key={r.role}
              onClick={() => selectRole(r.role)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'text-orange-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-orange-500/15' : ''}`}>
                {r.icon}
              </div>
              <span className={`text-[10px] tracking-tight whitespace-nowrap mt-0.5 ${isActive ? 'font-black text-orange-400' : 'font-medium'}`}>
                {r.label}
              </span>
            </button>
          );
        })}

        {/* Pulsante "Altro" per accedere a Cucina, Bar, Asporto, Turni */}
        <button
          onClick={() => setShowRoleSheet(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
            !isCurrentInPrimary
              ? 'text-orange-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${!isCurrentInPrimary ? 'bg-orange-500/15' : ''}`}>
            <MoreHorizontal className="w-4 h-4" />
          </div>
          <span className={`text-[10px] tracking-tight whitespace-nowrap mt-0.5 ${!isCurrentInPrimary ? 'font-black text-orange-400' : 'font-medium'}`}>
            {!isCurrentInPrimary ? currentRoleInfo.label : 'Altro'}
          </span>
        </button>
      </nav>

      {/* Mobile iOS-style Role Switcher Bottom Sheet */}
      {showRoleSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl max-h-[85dvh] flex flex-col pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle on mobile */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">Seleziona Schermata</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Operatore: <span className="text-white font-bold">{currentUser.name}</span></p>
              </div>
              <button
                onClick={() => setShowRoleSheet(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of all roles */}
            <div className="flex-1 overflow-y-auto space-y-2 py-1 pr-1">
              {allRoles.map((r) => {
                const isActive = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => selectRole(r.role)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center space-x-3.5 active:scale-[0.98] ${
                      isActive
                        ? 'bg-orange-500/15 border-orange-500/80 text-white shadow-md'
                        : 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isActive ? 'text-orange-400' : 'text-white'}`}>
                          {r.label}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                            Attivo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
                        {r.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Cloud Status Footer */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center space-x-1.5">
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Render Cloud Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400 font-medium">Disconnesso</span>
                  </>
                )}
              </div>
              <span className="font-mono text-[11px] text-zinc-500">v1.2 Mobile-Pro</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
