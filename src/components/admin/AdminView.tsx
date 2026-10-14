import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, DollarSign, Plus, Trash2, Edit2, Split, X, CheckCircle, Package } from 'lucide-react';
import { MenuItem, Order, MenuCategory, Ingredient, StationTarget, IngredientCategory } from '../../../shared/types';

export const AdminView: React.FC = () => {
  const {
    orders,
    menuItems,
    ingredients,
    payOrder,
    saveMenuItem,
    deleteMenuItem,
    updateIngredient,
    deleteIngredient
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CASSA' | 'MENU' | 'INGREDIENTI'>('CASSA');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [splitGuests, setSplitGuests] = useState(2);

  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('pizze_classiche');
  const [formPrice, setFormPrice] = useState(8.50);
  const [formDept, setFormDept] = useState<'pizzeria' | 'cucina' | 'bar'>('pizzeria');

  // Ingredient Modal State
  const [showIngModal, setShowIngModal] = useState(false);
  const [editingIng, setEditingIng] = useState<Ingredient | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingStation, setIngStation] = useState<StationTarget>('pizzeria');
  const [ingTiming, setIngTiming] = useState<'PRE_BAKE' | 'POST_BAKE' | 'CLARIFICATION'>('PRE_BAKE');
  const [ingCategory, setIngCategory] = useState<IngredientCategory>('condimenti');
  const [ingExtraPrice, setIngExtraPrice] = useState(1.50);
  const [ingStock, setIngStock] = useState(10);
  const [ingUnit, setIngUnit] = useState<'kg' | 'g' | 'pz' | 'l'>('kg');
  const [ingFilterStation, setIngFilterStation] = useState<'ALL' | StationTarget>('ALL');

  const unpaidOrders = orders.filter(o => !o.isPaid && o.status !== 'ANNULLATO');

  // Menu handlers
  const handleOpenEditMenu = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormPrice(item.price);
      setFormDept(item.targetDepartment);
    } else {
      setEditingMenuItem(null);
      setFormName('');
      setFormCategory('pizze_classiche');
      setFormPrice(8.50);
      setFormDept('pizzeria');
    }
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    saveMenuItem({
      id: editingMenuItem ? editingMenuItem.id : `m-${Date.now()}`,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      description: '',
      targetDepartment: formDept,
      prepTimeMinutes: 10,
      available: true,
      recipe: []
    });
    setShowMenuModal(false);
  };

  // Ingredient handlers
  const handleOpenEditIng = (ing?: Ingredient) => {
    if (ing) {
      setEditingIng(ing);
      setIngName(ing.name);
      setIngStation(ing.stationTarget);
      if (ing.requiresClarification) {
        setIngTiming('CLARIFICATION');
      } else if (ing.isPreBake) {
        setIngTiming('PRE_BAKE');
      } else {
        setIngTiming('POST_BAKE');
      }
      setIngCategory(ing.category);
      setIngExtraPrice(ing.extraPrice);
      setIngStock(ing.currentStock);
      setIngUnit(ing.unit as any);
    } else {
      setEditingIng(null);
      setIngName('');
      setIngStation('pizzeria');
      setIngTiming('PRE_BAKE');
      setIngCategory('condimenti');
      setIngExtraPrice(1.50);
      setIngStock(10);
      setIngUnit('kg');
    }
    setShowIngModal(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    const isPreBake = ingTiming === 'PRE_BAKE';
    const requiresClarification = ingTiming === 'CLARIFICATION';

    const saved: Ingredient = {
      id: editingIng ? editingIng.id : `ing-${Date.now()}`,
      name: ingName.trim(),
      stationTarget: ingStation,
      category: ingCategory,
      isPreBake,
      requiresClarification,
      extraPrice: Number(ingExtraPrice),
      currentStock: Number(ingStock),
      unit: ingUnit,
      minThreshold: 2,
      costPerUnit: 1.0,
      expiryDate: '2026-12-31',
      lotNumber: `LOT-${Date.now().toString().slice(-6)}`
    };

    updateIngredient(saved);
    setShowIngModal(false);
  };

  const handlePay = (method: 'CONTANTI' | 'CARTA' | 'DIVISO') => {
    if (!selectedOrder) return;
    payOrder(selectedOrder.id, method);
    setSelectedOrder(null);
  };

  const filteredIngredients = ingredients.filter(i => {
    if (ingFilterStation === 'ALL') return true;
    return i.stationTarget === ingFilterStation;
  });

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal Tabs */}
      <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Cassa & Gestione</span>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('CASSA')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'CASSA' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Cassa / Conti</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {unpaidOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'MENU' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Listino Menu</span>
          </button>

          <button
            onClick={() => setActiveTab('INGREDIENTI')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'INGREDIENTI' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Ingredienti</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {ingredients.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {/* CASSA & PAGAMENTI TAVOLI */}
        {activeTab === 'CASSA' && (
          <div className="max-w-5xl mx-auto space-y-4">
            {unpaidOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <CheckCircle className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Tutti i conti sono stati saldati</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {unpaidOrders.map(order => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setSplitGuests(order.guestsCount || 2);
                    }}
                    className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] shadow-lg ${
                      selectedOrder?.id === order.id ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
                        <span className="font-extrabold text-sm text-white">{order.tableName}</span>
                        <span className="font-mono text-xs text-zinc-400">{order.code}</span>
                      </div>
                      <div className="text-xs text-zinc-400 space-y-0.5">
                        <div>{order.items.length} articoli ordinati</div>
                        {order.guestsCount && <div>{order.guestsCount} coperti</div>}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400">Totale Conto</span>
                      <span className="font-mono text-base font-black text-emerald-400">
                        € {order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LISTINO MENU */}
        {activeTab === 'MENU' && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Listino Prezzi ({menuItems.length} voci)
              </span>
              <button
                onClick={() => handleOpenEditMenu()}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuovo Piatto</span>
              </button>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden shadow-xl">
              {menuItems.map(item => (
                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-zinc-800/40">
                  <div>
                    <span className="font-bold text-xs text-white block">{item.name}</span>
                    <span className="text-[11px] text-zinc-400 uppercase font-semibold">
                      {item.category.replace('_', ' ')} • {item.targetDepartment}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-black text-xs text-emerald-400">
                      € {item.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleOpenEditMenu(item)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GESTIONE INGREDIENTI (AGGIUNGI / ELIMINA / REPARTO) */}
        {activeTab === 'INGREDIENTI' && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  onClick={() => setIngFilterStation('ALL')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    ingFilterStation === 'ALL' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Tutti ({ingredients.length})
                </button>
                <button
                  onClick={() => setIngFilterStation('pizzeria')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    ingFilterStation === 'pizzeria' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🍕 Pizzeria ({ingredients.filter(i => i.stationTarget === 'pizzeria').length})
                </button>
                <button
                  onClick={() => setIngFilterStation('cucina')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    ingFilterStation === 'cucina' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🍳 Cucina ({ingredients.filter(i => i.stationTarget === 'cucina').length})
                </button>
                <button
                  onClick={() => setIngFilterStation('bar')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    ingFilterStation === 'bar' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  🍸 Bar ({ingredients.filter(i => i.stationTarget === 'bar').length})
                </button>
              </div>

              <button
                onClick={() => handleOpenEditIng()}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-1 shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nuovo Ingrediente</span>
              </button>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden shadow-xl">
              {filteredIngredients.map(ing => {
                let stationBadge = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
                if (ing.stationTarget === 'cucina') stationBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                if (ing.stationTarget === 'bar') stationBadge = 'bg-purple-500/15 text-purple-400 border-purple-500/30';

                return (
                  <div key={ing.id} className="p-3 flex items-center justify-between hover:bg-zinc-800/40">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-white">{ing.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${stationBadge}`}>
                          {ing.stationTarget}
                        </span>
                        {ing.requiresClarification ? (
                          <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Da Chiedere
                          </span>
                        ) : ing.isPreBake ? (
                          <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded border border-zinc-700">
                            In Cottura
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-sky-500/15 text-sky-400 px-1.5 py-0.2 rounded border border-sky-500/30">
                            Dopo Cottura
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Disponibili: {ing.currentStock} {ing.unit} • Extra: € {ing.extraPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-emerald-400 mr-2">
                        +€ {ing.extraPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleOpenEditIng(ing)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="Modifica"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Eliminare l'ingrediente "${ing.name}"?`)) {
                            deleteIngredient(ing.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                        title="Elimina"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODALE NUOVO / MODIFICA INGREDIENTE */}
      {showIngModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <form onSubmit={handleSaveIngredient} className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-2xl max-h-[90dvh] overflow-y-auto pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-white">
                {editingIng ? 'Modifica Ingrediente' : 'Nuovo Ingrediente'}
              </h3>
              <button type="button" onClick={() => setShowIngModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* SELEZIONE REPARTO DI PROVENIENZA (OBBLIGATORIO) */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Reparto di Provenienza (Obbligatorio):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIngStation('pizzeria')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    ingStation === 'pizzeria'
                      ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  🍕 Pizzeria
                </button>
                <button
                  type="button"
                  onClick={() => setIngStation('cucina')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    ingStation === 'cucina'
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  🍳 Cucina
                </button>
                <button
                  type="button"
                  onClick={() => setIngStation('bar')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    ingStation === 'bar'
                      ? 'bg-purple-500 text-white border-purple-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  🍸 Bar
                </button>
              </div>
            </div>

            {/* NOME INGREDIENTE */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Nome Ingrediente:</label>
              <input
                type="text"
                required
                placeholder="Es. Fiordilatte, Burrata, Salsiccia, Gin..."
                value={ingName}
                onChange={(e) => setIngName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            {/* APPLICAZIONE / FASE */}
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Tipo / Fase di Applicazione:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIngTiming('PRE_BAKE')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    ingTiming === 'PRE_BAKE'
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  🔥 In Cottura
                </button>
                <button
                  type="button"
                  onClick={() => setIngTiming('POST_BAKE')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    ingTiming === 'POST_BAKE'
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  🌿 Dopo Cottura
                </button>
                <button
                  type="button"
                  onClick={() => setIngTiming('CLARIFICATION')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    ingTiming === 'CLARIFICATION'
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  ❓ Da Chiedere
                </button>
              </div>
            </div>

            {/* PREZZO EXTRA E SCORTA */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Extra (€):</label>
                <input
                  type="number"
                  step="0.50"
                  value={ingExtraPrice}
                  onChange={(e) => setIngExtraPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Scorta Iniziale:</label>
                <input
                  type="number"
                  step="1"
                  value={ingStock}
                  onChange={(e) => setIngStock(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Unità:</label>
                <select
                  value={ingUnit}
                  onChange={(e: any) => setIngUnit(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="pz">pz</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg mt-2"
            >
              SALVA INGREDIENTE
            </button>
          </form>
        </div>
      )}

      {/* MODALE CASSA (SALDA CONTO - Mobile Bottom Sheet) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-extrabold text-base text-white">{selectedOrder.tableName}</h3>
                <span className="text-xs font-mono text-zinc-400">{selectedOrder.code}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voci conto */}
            <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
              {selectedOrder.items.map(it => (
                <div key={it.id} className="flex justify-between text-zinc-300">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-mono text-zinc-400">€ {it.subtotal.toFixed(2)}</span>
                </div>
              ))}
              {selectedOrder.coverCharge > 0 && (
                <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800">
                  <span>Coperti ({selectedOrder.guestsCount}x)</span>
                  <span className="font-mono">€ {selectedOrder.coverCharge.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Totale */}
            <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-sm font-bold text-white">Totale da Saldare</span>
              <span className="font-mono text-xl font-black text-emerald-400">
                € {selectedOrder.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Split Bill Calculator */}
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <Split className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-300">Dividi in:</span>
                <button
                  type="button"
                  onClick={() => setSplitGuests(Math.max(2, splitGuests - 1))}
                  className="w-5 h-5 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="font-bold text-white w-4 text-center">{splitGuests}</span>
                <button
                  type="button"
                  onClick={() => setSplitGuests(splitGuests + 1)}
                  className="w-5 h-5 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
              <span className="font-mono font-black text-orange-400 text-xs">
                € {(selectedOrder.totalAmount / splitGuests).toFixed(2)} cad.
              </span>
            </div>

            {/* Pulsanti Pagamento */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handlePay('CONTANTI')}
                className="py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg"
              >
                <DollarSign className="w-4 h-4" />
                <span>CONTANTI</span>
              </button>
              <button
                onClick={() => handlePay('CARTA')}
                className="py-3 px-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>POS / CARTA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE NUOVO / MODIFICA PIATTO */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <form onSubmit={handleSaveMenuItem} className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-sm text-white">{editingMenuItem ? 'Modifica Piatto' : 'Nuovo Piatto'}</h3>
              <button type="button" onClick={() => setShowMenuModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Nome:</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Prezzo (€):</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Reparto:</label>
                <select
                  value={formDept}
                  onChange={(e: any) => setFormDept(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="pizzeria">Pizzeria</option>
                  <option value="cucina">Cucina</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl">
              Salva Piatto
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
