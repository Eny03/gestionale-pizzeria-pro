import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  DollarSign,
  Utensils,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
  Split,
  Calendar,
  Lock
} from 'lucide-react';
import { MenuItem, Order, StaffRole, MenuCategory, ShiftAssignment } from '../../../shared/types';

export const AdminView: React.FC = () => {
  const {
    tables,
    orders,
    menuItems,
    ingredients,
    shiftAssignments,
    staff,
    requirements,
    payOrder,
    saveMenuItem,
    deleteMenuItem,
    overrideShift
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CASSA' | 'MENU' | 'OVERRIDE'>('CASSA');
  const [selectedTableOrder, setSelectedTableOrder] = useState<Order | null>(null);
  const [splitGuests, setSplitGuests] = useState(2);

  // Menu Form Modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('pizze_classiche');
  const [formPrice, setFormPrice] = useState(9.00);
  const [formDesc, setFormDesc] = useState('');
  const [formDept, setFormDept] = useState<'pizzeria' | 'cucina' | 'bar'>('pizzeria');
  const [formPrepTime, setFormPrepTime] = useState(12);

  // Override Form Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideDate, setOverrideDate] = useState('2026-10-16');
  const [overrideShiftType, setOverrideShiftType] = useState<any>('CENA');
  const [overrideStaffId, setOverrideStaffId] = useState(staff[0]?.id || 'st-1');

  // Ordini attivi con tavolo o asporto
  const unpaidOrders = orders.filter(o => !o.isPaid && o.status !== 'ANNULLATO');

  const handleOpenEditMenu = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormPrice(item.price);
      setFormDesc(item.description);
      setFormDept(item.targetDepartment);
      setFormPrepTime(item.prepTimeMinutes);
    } else {
      setEditingMenuItem(null);
      setFormName('');
      setFormCategory('pizze_classiche');
      setFormPrice(9.00);
      setFormDesc('');
      setFormDept('pizzeria');
      setFormPrepTime(12);
    }
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToSave: MenuItem = {
      id: editingMenuItem ? editingMenuItem.id : `m-${Date.now()}`,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      description: formDesc,
      targetDepartment: formDept,
      prepTimeMinutes: Number(formPrepTime),
      available: true,
      recipe: editingMenuItem ? editingMenuItem.recipe : [
        { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
        { ingredientId: 'ing-5', ingredientName: 'Pomodoro San Marzano', quantity: 0.09, unit: 'kg', isPreBake: true },
        { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.10, unit: 'kg', isPreBake: true }
      ]
    };

    saveMenuItem(itemToSave);
    setShowMenuModal(false);
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenStaff = staff.find(s => s.id === overrideStaffId);
    if (!chosenStaff) return;

    const assignment: ShiftAssignment = {
      id: `override-${overrideDate}-${overrideShiftType}-${chosenStaff.id}-${Date.now().toString().slice(-4)}`,
      date: overrideDate,
      shiftType: overrideShiftType,
      staffId: chosenStaff.id,
      staffName: chosenStaff.name,
      role: chosenStaff.role,
      isManualOverride: true,
      locked: true
    };

    overrideShift(assignment);
    setShowOverrideModal(false);
  };

  const handleCheckout = (method: 'CONTANTI' | 'CARTA' | 'DIVISO') => {
    if (!selectedTableOrder) return;
    payOrder(selectedTableOrder.id, method);
    setSelectedTableOrder(null);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* HEADER AMMINISTRAZIONE */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>Frontend Proprietario & Admin</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                FULL ACCESS
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Cassa veloce con scontrino in tempo reale, Gestione Menu & Override manuale turni
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('CASSA')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'CASSA'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>1. CASSA VELOCE (POS)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-white font-mono text-[11px]">
              {unpaidOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'MENU'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>2. GESTIONE MENU</span>
          </button>

          <button
            onClick={() => setActiveTab('OVERRIDE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'OVERRIDE'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>3. OVERRIDE TURNI</span>
          </button>
        </div>
      </div>

      {/* CONTENUTO */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* TAB 1: CASSA VELOCE (CONTO TAVOLI IN TEMPO REALE) */}
        {activeTab === 'CASSA' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Lista Tavoli & Ordini da Incassare */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-extrabold text-white">Tavoli con Conto Aperto</h2>
                  <p className="text-xs text-slate-400">
                    Importi totali pre-calcolati e sincronizzati in tempo reale inclusivi di ogni aggiunta/modifica.
                  </p>
                </div>
              </div>

              {unpaidOrders.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                  <CreditCard className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                  <p className="text-base font-bold">Nessun conto in sospeso</p>
                  <p className="text-xs text-slate-500 mt-1">Tutti i tavoli e gli asporti risultano pagati o liberi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {unpaidOrders.map(order => {
                    const isSelected = selectedTableOrder?.id === order.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedTableOrder(order)}
                        className={`bg-slate-900 rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between shadow-lg ${
                          isSelected
                            ? 'border-rose-500 ring-2 ring-rose-500/40 bg-slate-850'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-black text-xs text-rose-400">{order.code}</span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {order.tableName || 'Asporto'}
                            </span>
                          </div>

                          <div className="text-sm font-extrabold text-white">
                            {order.tableName}
                          </div>
                          <span className="text-xs text-slate-400 block mt-0.5">
                            Cameriere: {order.waiterName} • {order.items.length} articoli
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-semibold">Totale da Incassare:</span>
                          <span className="font-mono font-black text-lg text-emerald-400">
                            € {order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dettaglio Scontrino & Pagamento Rapido POS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl">
              {selectedTableOrder ? (
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-black text-base text-white">Dettaglio Conto {selectedTableOrder.tableName}</h3>
                        <p className="text-xs text-slate-400 font-mono">Codice: {selectedTableOrder.code}</p>
                      </div>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                        In Attesa Pagamento
                      </span>
                    </div>

                    {/* Voci Scontrino */}
                    <div className="max-h-60 overflow-y-auto py-3 space-y-2 text-xs divide-y divide-slate-800/60">
                      {selectedTableOrder.items.map(item => (
                        <div key={item.id} className="pt-2 first:pt-0 flex justify-between">
                          <div>
                            <div className="font-bold text-white">
                              {item.quantity}x {item.name}
                            </div>
                            {item.customization.addedIngredients.map(add => (
                              <div key={add.ingredientId} className="text-[11px] text-emerald-400">
                                + {add.name} (+€{add.priceDelta.toFixed(2)})
                              </div>
                            ))}
                            {item.customization.removedIngredients.map(rem => (
                              <div key={rem.ingredientId} className="text-[11px] text-rose-400 line-through">
                                - {rem.name}
                              </div>
                            ))}
                          </div>
                          <span className="font-mono font-bold text-slate-200">
                            € {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {selectedTableOrder.coverCharge > 0 && (
                        <div className="pt-2 flex justify-between text-slate-400">
                          <span>Coperto ({selectedTableOrder.guestsCount || 2} pers.)</span>
                          <span className="font-mono text-slate-200">
                            € {selectedTableOrder.coverCharge.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Totale & Azioni Pagamento */}
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-300">TOTALE COMPLESSIVO:</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        € {selectedTableOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Opzione Conto Diviso */}
                    <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-1.5 text-slate-300 font-semibold">
                        <Split className="w-4 h-4 text-sky-400" />
                        <span>Alla Romana ({splitGuests} pers):</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min={2}
                          max={20}
                          value={splitGuests}
                          onChange={(e) => setSplitGuests(Math.max(2, Number(e.target.value)))}
                          className="w-12 bg-slate-900 border border-slate-700 text-center rounded p-1 text-white font-mono"
                        />
                        <span className="font-mono font-bold text-emerald-400">
                          € {(selectedTableOrder.totalAmount / splitGuests).toFixed(2)} cad.
                        </span>
                      </div>
                    </div>

                    {/* Pulsanti Pagamento */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleCheckout('CONTANTI')}
                        className="py-3 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/20"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span>CONTANTI</span>
                      </button>

                      <button
                        onClick={() => handleCheckout('CARTA')}
                        className="py-3 px-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-sky-600/20"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>POS / CARTA</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <CreditCard className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                  <p className="text-sm font-semibold">Seleziona un tavolo dal riquadro a sinistra</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Visualizzerai lo scontrino completo con il calcolo automatico per incassare immediatamente.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GESTIONE MENU & INGREDIENTI */}
        {activeTab === 'MENU' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Catalogo Menu & Ricette</h2>
                <p className="text-xs text-slate-400">
                  Aggiungi, modifica o rimuovi piatti, pizze, varianti e tempi di preparazione.
                </p>
              </div>
              <button
                onClick={() => handleOpenEditMenu()}
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Nuovo Piatto / Pizza</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm text-white">{item.name}</h3>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        € {item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.targetDepartment}
                      </span>
                      <span className="text-[10px] text-slate-400">Tempo prep: {item.prepTimeMinutes}m</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEditMenu(item)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Modifica</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Sei sicuro di voler eliminare ${item.name}?`)) {
                          deleteMenuItem(item.id);
                        }
                      }}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title="Elimina dal menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OVERRIDE MANUALE TURNI */}
        {activeTab === 'OVERRIDE' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Override & Modifica Manuale Turni</h2>
                <p className="text-xs text-slate-400">
                  L'amministratore può modificare o forzare l'assegnazione di un turno: l'algoritmo non sovrascriverà questi slot.
                </p>
              </div>
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-amber-500/20"
              >
                <Lock className="w-4 h-4" />
                <span>Nuovo Override Manuale</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-750">
                  <tr>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5">Turno</th>
                    <th className="p-3.5">Dipendente Assegnato</th>
                    <th className="p-3.5">Ruolo</th>
                    <th className="p-3.5 text-center">Tipo Assegnazione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {shiftAssignments.map(shift => (
                    <tr key={shift.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-mono font-bold text-white">{shift.date}</td>
                      <td className="p-3.5">{shift.shiftType}</td>
                      <td className="p-3.5 font-bold text-white">{shift.staffName}</td>
                      <td className="p-3.5 uppercase text-slate-400">{shift.role}</td>
                      <td className="p-3.5 text-center">
                        {shift.isManualOverride ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-[10px] border border-amber-500/30">
                            MANUALE (BLOCCATO)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold border border-cyan-500/20">
                            Algoritmo Equo
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALE EDIT MENU */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSaveMenuItem} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">
              {editingMenuItem ? 'Modifica Voce Menu' : 'Nuova Voce Menu'}
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nome:</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Categoria:</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="pizze_classiche">Pizze Classiche</option>
                  <option value="pizze_speciali">Pizze Speciali</option>
                  <option value="antipasti_cucina">Cucina & Antipasti</option>
                  <option value="fritti">Fritti</option>
                  <option value="bevande">Bevande</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Prezzo (€):</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Reparto di Competenza:</label>
                <select
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="pizzeria">Pizzeria</option>
                  <option value="cucina">Cucina</option>
                  <option value="bar">Bar</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Tempo Prep. (min):</label>
                <input
                  type="number"
                  min={1}
                  value={formPrepTime}
                  onChange={(e) => setFormPrepTime(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Descrizione & Ingredienti:</label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
              >
                Salva Voce Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALE OVERRIDE TURNI */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleApplyOverride} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Override Manuale Turno</h3>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Data:</label>
                <input
                  type="date"
                  value={overrideDate}
                  onChange={(e) => setOverrideDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Turno:</label>
                <select
                  value={overrideShiftType}
                  onChange={(e) => setOverrideShiftType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="PRANZO">Pranzo</option>
                  <option value="CENA">Cena</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Dipendente da Assegnare:</label>
              <select
                value={overrideStaffId}
                onChange={(e) => setOverrideStaffId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
              >
                Blocca Assegnazione Manuale
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
