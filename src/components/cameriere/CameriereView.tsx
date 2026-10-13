import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MenuItem,
  OrderItem,
  IngredientDelta,
  Order,
  MenuCategory
} from '../../../shared/types';
import {
  Utensils,
  Plus,
  Minus,
  Sliders,
  Send,
  Trash2,
  CheckCircle,
  Search,
  X,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';

export const CameriereView: React.FC = () => {
  const {
    tables,
    menuItems,
    ingredients,
    currentUser,
    createOrder,
    activeTableId,
    setActiveTableId
  } = useApp();

  // Selected table ID defaults to activeTableId or first table
  const [selectedTableId, setSelectedTableId] = useState<string>(
    activeTableId || tables[0]?.id || 't-1'
  );

  useEffect(() => {
    if (activeTableId) {
      setSelectedTableId(activeTableId);
    }
  }, [activeTableId]);

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customization modal state
  const [addedIngredients, setAddedIngredients] = useState<IngredientDelta[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<{ ingredientId: string; name: string }[]>([]);
  const [notes, setNotes] = useState('');

  // Dispatch confirmation notification
  const [sentOrderCode, setSentOrderCode] = useState<string | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // Update table coperti if table changes
  useEffect(() => {
    if (selectedTable) {
      setGuestsCount(selectedTable.seats || 2);
    }
  }, [selectedTableId]);

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openCustomization = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    setCustomizingItem(item);
    setAddedIngredients([]);
    setRemovedIngredients([]);
    setNotes('');
  };

  const quickAddItem = (item: MenuItem) => {
    // If existing standard item in cart, increment quantity
    const existingIndex = cartItems.findIndex(
      ci => ci.menuItemId === item.id &&
      ci.customization.addedIngredients.length === 0 &&
      ci.customization.removedIngredients.length === 0 &&
      !ci.customization.notes
    );

    if (existingIndex > -1) {
      setCartItems(prev => prev.map((ci, idx) => {
        if (idx === existingIndex) {
          const qty = ci.quantity + 1;
          return { ...ci, quantity: qty, subtotal: Number((ci.finalUnitPrice * qty).toFixed(2)) };
        }
        return ci;
      }));
    } else {
      const orderItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        customization: {
          addedIngredients: [],
          removedIngredients: [],
          priceDeltaTotal: 0
        },
        finalUnitPrice: item.price,
        quantity: 1,
        subtotal: item.price,
        targetDepartment: item.targetDepartment,
        prepTimeMinutes: item.prepTimeMinutes,
        isReleased: true,
        orderedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCartItems(prev => [...prev, orderItem]);
    }
  };

  const confirmCustomization = () => {
    if (!customizingItem) return;
    const priceDeltaTotal = addedIngredients.reduce((sum, ing) => sum + ing.priceDelta, 0);
    const finalUnitPrice = Number((customizingItem.price + priceDeltaTotal).toFixed(2));

    const orderItem: OrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      menuItemId: customizingItem.id,
      name: customizingItem.name,
      basePrice: customizingItem.price,
      customization: {
        addedIngredients,
        removedIngredients,
        notes: notes.trim() || undefined,
        priceDeltaTotal
      },
      finalUnitPrice,
      quantity: 1,
      subtotal: finalUnitPrice,
      targetDepartment: customizingItem.targetDepartment,
      prepTimeMinutes: customizingItem.prepTimeMinutes,
      isReleased: true,
      orderedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCartItems(prev => [...prev, orderItem]);
    setCustomizingItem(null);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: Number((item.finalUnitPrice * newQty).toFixed(2))
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const coverRate = 2.00;
  const coverTotal = guestsCount * coverRate;
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const grandTotal = Number((itemsSubtotal + coverTotal).toFixed(2));
  const totalItemCount = cartItems.reduce((a, b) => a + b.quantity, 0);

  const handleSendOrder = () => {
    if (cartItems.length === 0 || !selectedTable) return;

    const newOrderCode = `#T${String(selectedTable.number).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: newOrderCode,
      type: 'DINE_IN',
      tableId: selectedTable.id,
      tableName: selectedTable.tavolataName || `Tavolo ${selectedTable.number}`,
      waiterId: currentUser.id,
      waiterName: currentUser.name,
      status: 'IN_CORSO',
      coverCharge: coverTotal,
      guestsCount,
      subtotal: itemsSubtotal,
      totalAmount: grandTotal,
      items: cartItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaid: false
    };

    createOrder(newOrder);
    setSentOrderCode(newOrderCode);
    setCartItems([]);
    setIsCartOpen(false);

    setTimeout(() => setSentOrderCode(null), 4000);
  };

  const categories: { key: MenuCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tutti' },
    { key: 'pizze_classiche', label: 'Classiche' },
    { key: 'pizze_speciali', label: 'Speciali' },
    { key: 'antipasti_cucina', label: 'Cucina' },
    { key: 'fritti', label: 'Fritti' },
    { key: 'bevande', label: 'Bevande' }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Toast Conferma Invio */}
      {sentOrderCode && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-black animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>Comanda {sentOrderCode} inviata con successo al KDS!</span>
        </div>
      )}

      {/* Main Menu Area */}
      <div className="flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0">
        {/* Top Controls: Table Selector & Guests */}
        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                setActiveTableId(e.target.value);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-1.5 font-bold text-xs sm:text-sm text-orange-400 focus:outline-none cursor-pointer"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                  Tavolo #{t.number} {t.tavolataName ? `[${t.tavolataName}]` : ''} ({t.seats}p)
                </option>
              ))}
            </select>

            <div className="flex items-center bg-zinc-800 px-2 py-1 rounded-xl border border-zinc-700/80 text-xs">
              <button
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                className="w-5 h-5 rounded bg-zinc-700 text-white font-bold flex items-center justify-center text-xs"
              >
                -
              </button>
              <span className="font-bold text-white w-6 text-center text-xs">{guestsCount}p</span>
              <button
                onClick={() => setGuestsCount(guestsCount + 1)}
                className="w-5 h-5 rounded bg-zinc-700 text-white font-bold flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="relative w-36 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca piatto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-3 py-1.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center space-x-1.5 overflow-x-auto">
          {categories.map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === c.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
          {filteredMenuItems.map(item => {
            const countInCart = cartItems
              .filter(ci => ci.menuItemId === item.id)
              .reduce((a, b) => a + b.quantity, 0);

            return (
              <div
                key={item.id}
                onClick={() => quickAddItem(item)}
                className={`bg-zinc-900 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] relative shadow-sm ${
                  countInCart > 0
                    ? 'border-orange-500/80 ring-1 ring-orange-500/40 bg-zinc-900/90'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Badge Quantità Carrello */}
                {countInCart > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    {countInCart}
                  </span>
                )}

                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-1">
                    {item.name}
                  </h3>
                  <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 mt-1 block">
                    € {item.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={(e) => openCustomization(e, item)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                    title="Modifica ingredienti"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-orange-500 text-zinc-200 hover:text-white flex items-center justify-center text-xs font-bold transition-colors">
                    +
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STICKY BOTTOM BAR (MOBILE / TABLET) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-14 inset-x-2 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 bg-orange-500 active:bg-orange-600 rounded-2xl text-white font-extrabold text-xs shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-zinc-950/40 px-2 py-0.5 rounded-md font-mono">
                {totalItemCount} voci
              </span>
              <span>Tavolo #{selectedTable?.number}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-sm font-black">€ {grandTotal.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* CARRELLO / DETTAGLIO COMANDA (Slide-up su Mobile / Sidebar su Desktop) */}
      <div
        className={`fixed lg:relative inset-x-0 bottom-14 lg:bottom-0 z-40 lg:z-auto w-full lg:w-80 xl:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between transition-transform duration-200 rounded-t-2xl lg:rounded-none max-h-[80vh] lg:max-h-none ${
          isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Header Carrello */}
        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white">
                Tavolo #{selectedTable?.number}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {guestsCount} coperti
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="lg:hidden p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista Articoli Carrello */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-xs">
              <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-zinc-600" />
              <span>Nessun articolo aggiunto</span>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800/80 space-y-1.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="font-bold text-xs text-white">{item.name}</span>
                    <div className="text-[11px] font-mono text-zinc-400">
                      € {item.finalUnitPrice.toFixed(2)} cad.
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    € {item.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Modifiche */}
                {(item.customization.addedIngredients.length > 0 ||
                  item.customization.removedIngredients.length > 0 ||
                  item.customization.notes) && (
                  <div className="text-[11px] text-zinc-400 space-y-0.5">
                    {item.customization.addedIngredients.map(a => (
                      <span key={a.ingredientId} className="text-emerald-400 block">+ {a.name}</span>
                    ))}
                    {item.customization.removedIngredients.map(r => (
                      <span key={r.ingredientId} className="text-rose-400 line-through block">- {r.name}</span>
                    ))}
                    {item.customization.notes && (
                      <span className="text-amber-300 italic block">"{item.customization.notes}"</span>
                    )}
                  </div>
                )}

                {/* Stepper Quantità */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-white font-bold flex items-center justify-center text-xs"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-zinc-800 text-white font-bold flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totale & Bottone Invia */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950/70 space-y-2">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Coperti ({guestsCount} x €2.00)</span>
              <span className="font-mono">€ {coverTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-zinc-800">
              <span>Totale Comanda</span>
              <span className="font-mono text-emerald-400 text-base">€ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSendOrder}
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>INVIA COMANDA AL KDS</span>
          </button>
        </div>
      </div>

      {/* MODALE PERSONALIZZAZIONE PIATTO */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">{customizingItem.name}</h3>
                <span className="text-xs text-emerald-400 font-mono">€ {customizingItem.price.toFixed(2)}</span>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {/* Aggiunte Ingredienti */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 block mb-1">Aggiungi Ingredienti:</span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {ingredients.slice(0, 8).map(ing => {
                  const isAdded = addedIngredients.some(a => a.ingredientId === ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          setAddedIngredients(prev => prev.filter(a => a.ingredientId !== ing.id));
                        } else {
                          setAddedIngredients(prev => [...prev, {
                            ingredientId: ing.id,
                            name: ing.name,
                            quantity: 1,
                            unit: ing.unit,
                            priceDelta: ing.extraPrice
                          }]);
                        }
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {isAdded ? '✓' : '+'} {ing.name} (+€{ing.extraPrice.toFixed(2)})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 block mb-1">Note Speciali:</span>
              <input
                type="text"
                placeholder="Es. Ben cotta, senza origano..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
              />
            </div>

            <button
              onClick={confirmCustomization}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl"
            >
              Conferma e Aggiungi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
