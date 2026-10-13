import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditCard, DollarSign, Plus, Trash2, Edit2, Split, X, CheckCircle } from 'lucide-react';
import { MenuItem, Order, MenuCategory } from '../../../shared/types';

export const AdminView: React.FC = () => {
  const {
    orders,
    menuItems,
    payOrder,
    saveMenuItem,
    deleteMenuItem
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CASSA' | 'MENU'>('CASSA');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [splitGuests, setSplitGuests] = useState(2);

  // Menu Modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('pizze_classiche');
  const [formPrice, setFormPrice] = useState(8.50);
  const [formDept, setFormDept] = useState<'pizzeria' | 'cucina' | 'bar'>('pizzeria');

  const unpaidOrders = orders.filter(o => !o.isPaid && o.status !== 'ANNULLATO');

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

  const handlePay = (method: 'CONTANTI' | 'CARTA' | 'DIVISO') => {
    if (!selectedOrder) return;
    payOrder(selectedOrder.id, method);
    setSelectedOrder(null);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal Tabs */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Cassa & Gestione</span>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('CASSA')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'CASSA' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Cassa / Conti</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {unpaidOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'MENU' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Listino Menu</span>
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
      </div>

      {/* MODALE CASSA (SALDA CONTO) */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <form onSubmit={handleSaveMenuItem} className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl">
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
