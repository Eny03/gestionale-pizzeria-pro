import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Clock, Plus, Phone, CheckCircle, Play } from 'lucide-react';
import { MenuItem, Order, OrderItem } from '../../../shared/types';

export const AsportoView: React.FC = () => {
  const { menuItems, orders, currentUser, createOrder } = useApp();

  const [activeTab, setActiveTab] = useState<'NUOVO' | 'ATTIVI'>('NUOVO');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('20:30');
  const [cartItems, setCartItems] = useState<{ menuItem: MenuItem; quantity: number }[]>([]);

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
    setCartItems(prev =>
      prev
        .map(p => p.menuItem.id === itemId ? { ...p, quantity: p.quantity + delta } : p)
        .filter(p => p.quantity > 0)
    );
  };

  const totalAmount = cartItems.reduce((sum, p) => sum + p.menuItem.price * p.quantity, 0);

  const handleSubmitTakeaway = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !customerName) return;

    const code = `#ASP-${Math.floor(10 + Math.random() * 90)}`;
    const orderItems: OrderItem[] = cartItems.map(({ menuItem, quantity }) => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      basePrice: menuItem.price,
      customization: { addedIngredients: [], removedIngredients: [], priceDeltaTotal: 0 },
      finalUnitPrice: menuItem.price,
      quantity,
      subtotal: Number((menuItem.price * quantity).toFixed(2)),
      targetDepartment: menuItem.targetDepartment,
      prepTimeMinutes: menuItem.prepTimeMinutes,
      isReleased: true,
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
    setCustomerName('');
    setCustomerPhone('');
    setCartItems([]);
    setActiveTab('ATTIVI');
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Asporto & Ritiro</span>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('NUOVO')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'NUOVO' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Nuovo Ordine</span>
          </button>
          <button
            onClick={() => setActiveTab('ATTIVI')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'ATTIVI' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>In Corso</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {takeawayOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {activeTab === 'NUOVO' && (
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-16 lg:pb-0">
            {/* Form Cliente */}
            <form onSubmit={handleSubmitTakeaway} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 shadow-lg">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Dati Ritiro</span>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nome Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Telefono:</label>
                  <input
                    type="tel"
                    placeholder="340..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Orario Ritiro:</label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Riepilogo Voci Asporto */}
              <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 block">Pizze nel carrello:</span>
                {cartItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">Seleziona le pizze dal menu a fianco</p>
                ) : (
                  cartItems.map(({ menuItem, quantity }) => (
                    <div key={menuItem.id} className="flex justify-between items-center text-xs bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <span className="font-semibold text-white">{menuItem.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400">€ {(menuItem.price * quantity).toFixed(2)}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(menuItem.id, -1)}
                            className="w-5 h-5 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="w-4 text-center font-bold text-white">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(menuItem.id, 1)}
                            className="w-5 h-5 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white">Totale Asporto</span>
                <span className="font-mono text-base font-black text-emerald-400">€ {totalAmount.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={cartItems.length === 0 || !customerName}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg"
              >
                CONFERMA ORDINE ASPORTO
              </button>
            </form>

            {/* Menu Rapido Asporto */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-2 max-h-[500px] overflow-y-auto">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">Menu Rapido</span>
              <div className="grid grid-cols-2 gap-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addItemToCart(item)}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 text-left transition-all active:scale-[0.98]"
                  >
                    <div className="font-bold text-xs text-white truncate">{item.name}</div>
                    <div className="font-mono text-emerald-400 text-xs mt-1">€ {item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ATTIVI' && (
          <div>
            {takeawayOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <ShoppingBag className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Nessun ordine d'asporto attivo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {takeawayOrders.map(order => (
                  <div key={order.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 space-y-3 shadow-lg">
                    <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-orange-400">{order.code}</span>
                        <h3 className="font-extrabold text-sm text-white">{order.customerName}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Ritiro: {order.pickupTime}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-zinc-300">
                      {order.items.map(it => (
                        <div key={it.id} className="flex justify-between">
                          <span>{it.quantity}x {it.name}</span>
                          <span className="font-mono text-zinc-400">€ {it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-400">Totale</span>
                      <span className="font-mono text-sm font-black text-emerald-400">€ {order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
