import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Clock, Send, Plus, Phone, User, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { MenuItem, Order, OrderItem } from '../../../shared/types';

export const AsportoView: React.FC = () => {
  const { menuItems, orders, currentUser, createOrder, updateItemPhase } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('20:45');
  const [cartItems, setCartItems] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);

  // Filtra solo gli ordini d'asporto / delivery attivi
  const takeawayOrders = orders.filter(
    o => (o.type === 'TAKEAWAY' || o.type === 'DELIVERY') && o.status !== 'COMPLETATO' && o.status !== 'PAGATO'
  );

  const addItemToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(p => p.menuItem.id === item.id);
      if (existing) {
        return prev.map(p => p.menuItem.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev => prev.map(p => {
      if (p.menuItem.id === itemId) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    }));
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(p => p.menuItem.id !== itemId));
  };

  const totalAmount = cartItems.reduce((sum, p) => sum + p.menuItem.price * p.quantity, 0);

  // Invia comanda con Cron Job intelligente
  const handleSubmitTakeaway = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !customerName) return;

    const code = `#ASP-${Math.floor(10 + Math.random() * 90)}`;

    const orderItems: OrderItem[] = cartItems.map(({ menuItem, quantity }) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      customization: {
        addedIngredients: [],
        removedIngredients: [],
        priceDeltaTotal: 0
      },
      finalUnitPrice: menuItem.price,
      quantity,
      subtotal: Number((menuItem.price * quantity).toFixed(2)),
      targetDepartment: menuItem.targetDepartment,
      prepTimeMinutes: menuItem.prepTimeMinutes,
      isReleased: false, // Sarà gestito dal Cron Job differito
      orderedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const newOrder: Order = {
      id: `ord-asp-${Date.now()}`,
      code,
      type: 'TAKEAWAY',
      tableName: `Asporto (${customerName})`,
      waiterId: currentUser.id,
      waiterName: currentUser.name,
      customerName,
      customerPhone,
      pickupTime,
      status: 'ATTIVO',
      coverCharge: 0,
      subtotal: totalAmount,
      totalAmount,
      items: orderItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaid: false
    };

    createOrder(newOrder);

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCartItems([]);
  };

  // Forza il rilascio immediato di un articolo trattenuto
  const handleForceRelease = (order: Order, item: OrderItem) => {
    item.isReleased = true;
    item.updatedAt = new Date().toISOString();
    if (item.targetDepartment === 'pizzeria') item.pizzeriaPhase = 'PRE_COTTURA';
    if (item.targetDepartment === 'cucina') item.kitchenPhase = 'IN_ATTESA';
    if (item.targetDepartment === 'bar') item.barPhase = 'IN_ATTESA';
    createOrder(order); // Salva aggiornamento
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* SEZIONE SINISTRA: NUOVO ORDINE ASPORTO / TELEFONICO */}
      <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span>Nuovo Ordine Asporto & Delivery</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Inserisci l'orario di ritiro: il Cron Job differito invierà i ticket ai reparti al momento esatto.
          </p>
        </div>

        <form onSubmit={handleSubmitTakeaway} className="flex-1 flex flex-col justify-between overflow-hidden p-4 space-y-4">
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Dati cliente & Orario ritiro */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Nome Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Telefono:</label>
                <input
                  type="tel"
                  placeholder="+39 347..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-indigo-400 block mb-1">Orario Ritiro Previsto:</label>
                <input
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full bg-slate-800 border border-indigo-500/50 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* Selezione Prodotti Menu */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Aggiungi Prodotti all'Ordine:
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItemToCart(item)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-slate-200 truncate">{item.name}</div>
                      <span className="text-[10px] text-slate-400">{item.prepTimeMinutes}m prep • {item.targetDepartment}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold shrink-0">€{item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Carrello Asporto */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Riepilogo Ordine ({cartItems.length} voci):
              </label>
              <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-2.5 max-h-36 overflow-y-auto space-y-1.5">
                {cartItems.length === 0 ? (
                  <span className="text-xs text-slate-500 italic block text-center py-2">
                    Nessun articolo selezionato. Clicca sui prodotti sopra per aggiungerli.
                  </span>
                ) : (
                  cartItems.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="flex items-center justify-between text-xs bg-slate-800/60 p-1.5 rounded-lg">
                      <span className="font-semibold text-slate-200 truncate">{menuItem.name}</span>
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(menuItem.id, -1)}
                          className="w-5 h-5 bg-slate-700 rounded text-center text-white"
                        >
                          -
                        </button>
                        <span className="font-bold text-white w-4 text-center">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(menuItem.id, 1)}
                          className="w-5 h-5 bg-slate-700 rounded text-center text-white"
                        >
                          +
                        </button>
                        <span className="font-mono text-emerald-400 w-14 text-right">
                          €{(menuItem.price * quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(menuItem.id)}
                          className="text-slate-500 hover:text-rose-400 ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Invio */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Totale Ordine:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">€ {totalAmount.toFixed(2)}</span>
            </div>
            <button
              type="submit"
              disabled={cartItems.length === 0 || !customerName}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span>REGISTRA ASPORTO CON CRON SCHEDULER</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEZIONE DESTRA: MONITOR ORDINI ASPORTO & SCHEDULER CRON */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Monitor Cron Job Ordini Asporto</span>
            </h2>
            <p className="text-xs text-slate-400">
              Tracciamento in tempo reale degli ordini differiti e rilasci automatici
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 font-mono text-xs font-bold border border-slate-700">
            {takeawayOrders.length} attivi
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {takeawayOrders.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-center p-6">
              <ShoppingBag className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
              <p className="text-base font-bold">Nessun ordine d'asporto attivo</p>
              <p className="text-xs text-slate-500 mt-1">
                Registra un nuovo ordine dal modulo a sinistra per avviare il monitoraggio cronometrico.
              </p>
            </div>
          ) : (
            takeawayOrders.map(order => (
              <div
                key={order.id}
                className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm text-indigo-400">{order.code}</span>
                      <span className="font-bold text-white text-sm">{order.customerName}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      Tel: {order.customerPhone || 'N/D'} • Registrato da {order.waiterName}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ritiro ore:</span>
                    <span className="font-mono text-base font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      {order.pickupTime}
                    </span>
                  </div>
                </div>

                {/* Lista Articoli con stato Cron (Trattenuto vs Rilasciato) */}
                <div className="space-y-2">
                  {order.items.map(item => {
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          item.isReleased
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center space-x-2">
                            <span>x{item.quantity} {item.name}</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {item.targetDepartment}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.isReleased ? (
                              <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                <span>Rilasciato in reparto • In lavorazione</span>
                              </span>
                            ) : (
                              <span className="text-indigo-400 flex items-center space-x-1 font-semibold">
                                <Clock className="w-3 h-3" />
                                <span>Trattenuto dal Cron (Tempo prep: {item.prepTimeMinutes}m)</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Azione di forzatura manuale se trattenuto */}
                        {!item.isReleased && (
                          <button
                            type="button"
                            onClick={() => handleForceRelease(order, item)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-[11px] flex items-center space-x-1 shrink-0 shadow-sm"
                            title="Invia subito al reparto ignorando l'orario programmato"
                          >
                            <Play className="w-3 h-3" />
                            <span>Invia Ora</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Importo Totale Comanda:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    € {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
