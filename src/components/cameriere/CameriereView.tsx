import React, { useState } from 'react';
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
  Sparkles,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  Search,
  UserCheck,
  X,
  ChevronRight
} from 'lucide-react';

export const CameriereView: React.FC = () => {
  const { tables, menuItems, ingredients, currentUser, createOrder } = useApp();

  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 't-1');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Customization modal state
  const [addedIngredients, setAddedIngredients] = useState<IngredientDelta[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<{ ingredientId: string; name: string }[]>([]);
  const [notes, setNotes] = useState('');

  // Dispatch confirmation modal state
  const [dispatchResult, setDispatchResult] = useState<{
    orderCode: string;
    pizzeriaCount: number;
    barCount: number;
    cucinaCount: number;
  } | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId);

  // Filtered menu
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open customization modal
  const openCustomization = (item: MenuItem) => {
    setCustomizingItem(item);
    setAddedIngredients([]);
    setRemovedIngredients([]);
    setNotes('');
  };

  // Quick add without customization
  const quickAddItem = (item: MenuItem) => {
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
  };

  // Confirm customization modal
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
    setCartItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          subtotal: Number((item.finalUnitPrice * newQty).toFixed(2))
        };
      }
      return item;
    }));
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculations
  const coverRate = 2.00;
  const coverTotal = guestsCount * coverRate;
  const itemsSubtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const grandTotal = Number((itemsSubtotal + coverTotal).toFixed(2));

  // Invia comanda con smistamento automatico
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

    const pizzeCount = cartItems.filter(i => i.targetDepartment === 'pizzeria').reduce((a, b) => a + b.quantity, 0);
    const barCount = cartItems.filter(i => i.targetDepartment === 'bar').reduce((a, b) => a + b.quantity, 0);
    const cucinaCount = cartItems.filter(i => i.targetDepartment === 'cucina').reduce((a, b) => a + b.quantity, 0);

    createOrder(newOrder);

    setDispatchResult({
      orderCode: newOrderCode,
      pizzeriaCount: pizzeCount,
      barCount,
      cucinaCount
    });

    setCartItems([]);
    setIsMobileCartOpen(false);
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
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* CATALOGO MENU */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* BARRA TAVOLO E COPERTI */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1.5 font-bold text-xs sm:text-sm text-orange-400 focus:outline-none cursor-pointer"
            >
              {tables.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  Tavolo #{t.number} {t.tavolataName ? `[${t.tavolataName}]` : ''} ({t.seats}p) - {t.status}
                </option>
              ))}
            </select>

            {/* Selettore Coperti */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Coperti:</span>
              <button
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                className="w-5 h-5 rounded bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
              >
                -
              </button>
              <span className="font-bold text-white w-3.5 text-center text-xs">{guestsCount}</span>
              <button
                onClick={() => setGuestsCount(guestsCount + 1)}
                className="w-5 h-5 rounded bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>{currentUser.name}</span>
          </div>
        </div>

        {/* BARRA RICERCA & CATEGORIE CHIPS */}
        <div className="px-3 py-2 bg-slate-900/30 border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1 shrink-0">
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[120px] max-w-[200px] ml-auto">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* GRIGLIA PRODOTTI TOUCH */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pb-24 lg:pb-4">
          {filteredMenuItems.map(item => (
            <div
              key={item.id}
              className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between transition-all active:scale-[0.99]"
            >
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-1">
                    {item.name}
                  </h3>
                </div>
                <div className="font-mono font-black text-xs sm:text-sm text-emerald-400 mt-0.5">
                  € {item.price.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {item.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => openCustomization(item)}
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Mod</span>
                </button>

                <button
                  onClick={() => quickAddItem(item)}
                  className="h-7 w-7 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold flex items-center justify-center shadow-sm"
                  title="Aggiungi"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING ACTION PILL SU SMARTPHONE/TABLET */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-3 right-3 z-30">
          <button
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full py-3 px-4 bg-orange-500 active:bg-orange-600 rounded-2xl text-white font-black text-xs shadow-2xl flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-slate-950/40 px-2 py-0.5 rounded-md font-mono">
                {cartItems.reduce((a, b) => a + b.quantity, 0)} voci
              </span>
              <span>Comanda Tavolo #{selectedTable?.number}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-sm">€ {grandTotal.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* RIEPILOGO COMANDA (SIDEBAR SU DESKTOP / BOTTOM SHEET SU MOBILE) */}
      <div
        className={`fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto w-full lg:w-80 xl:w-96 bg-slate-950 lg:bg-slate-900 border-l border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ${
          isMobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Intestazione Carrello */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center space-x-1.5">
              <Utensils className="w-4 h-4 text-orange-400" />
              <span>Tavolo #{selectedTable?.number} {selectedTable?.tavolataName ? `(${selectedTable.tavolataName})` : ''}</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Operatore: {currentUser.name}
            </p>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista Articoli Carrello */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500">
              <Utensils className="w-8 h-8 stroke-1 text-slate-700 mb-1" />
              <p className="text-xs font-semibold">Nessun articolo</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800 flex flex-col space-y-1.5"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-xs text-slate-100 truncate">{item.name}</h4>
                    <span className="text-[11px] text-emerald-400 font-mono">
                      € {item.finalUnitPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-white text-xs"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-bold text-xs text-white w-3.5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-white text-xs"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Modifiche */}
                {(item.customization.addedIngredients.length > 0 ||
                  item.customization.removedIngredients.length > 0 ||
                  item.customization.notes) && (
                  <div className="bg-slate-950/60 rounded-lg p-1.5 text-[11px] space-y-0.5 border border-slate-800/80">
                    {item.customization.addedIngredients.map(add => (
                      <div key={add.ingredientId} className="text-emerald-400">
                        + {add.name} (+€{add.priceDelta.toFixed(2)})
                      </div>
                    ))}
                    {item.customization.removedIngredients.map(rem => (
                      <div key={rem.ingredientId} className="text-rose-400 line-through">
                        - {rem.name}
                      </div>
                    ))}
                    {item.customization.notes && (
                      <div className="text-amber-300 italic">
                        "{item.customization.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Totali */}
        <div className="p-3.5 bg-slate-900 border-t border-slate-800 space-y-2.5 pb-safe">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Coperti ({guestsCount} x €{coverRate.toFixed(2)})</span>
              <span className="font-mono text-slate-200">€ {coverTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-black text-white pt-1 border-t border-slate-800">
              <span>TOTALE</span>
              <span className="font-mono text-emerald-400 text-sm">€ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSendOrder}
            disabled={cartItems.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-xs flex items-center justify-center space-x-1.5 disabled:opacity-40 transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>INVIA E SMISTA COMANDA</span>
          </button>
        </div>
      </div>

      {/* MODALE DI PERSONALIZZAZIONE AVANZATA (MINIMALE E COMPATTO) */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-5 max-h-[85vh] flex flex-col justify-between shadow-2xl pb-safe">
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white">Modifica {customizingItem.name}</h3>
                  <span className="text-[11px] text-emerald-400 font-mono">Base: €{customizingItem.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto max-h-[50vh] py-2.5 space-y-3">
                {/* 1. Rimozioni dalla ricetta base */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Ingredienti Ricetta (Tocca per togliere):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {customizingItem.recipe.map(r => {
                      const isRemoved = removedIngredients.some(rem => rem.ingredientId === r.ingredientId);
                      return (
                        <button
                          key={r.ingredientId}
                          type="button"
                          onClick={() => {
                            if (isRemoved) {
                              setRemovedIngredients(prev => prev.filter(rem => rem.ingredientId !== r.ingredientId));
                            } else {
                              setRemovedIngredients(prev => [...prev, { ingredientId: r.ingredientId, name: r.ingredientName }]);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            isRemoved
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 line-through'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          {isRemoved ? 'Senza ' : '✓ '} {r.ingredientName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Aggiunte extra */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    Aggiungi Extra (+ Sovrapprezzo automatico):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ingredients.map(ing => {
                      const isAdded = addedIngredients.some(add => add.ingredientId === ing.id);
                      return (
                        <button
                          key={ing.id}
                          type="button"
                          onClick={() => {
                            if (isAdded) {
                              setAddedIngredients(prev => prev.filter(add => add.ingredientId !== ing.id));
                            } else {
                              setAddedIngredients(prev => [
                                ...prev,
                                { ingredientId: ing.id, name: ing.name, priceDelta: ing.extraPrice }
                              ]);
                            }
                          }}
                          className={`p-2 rounded-xl text-left border text-xs transition-all ${
                            isAdded
                              ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                          }`}
                        >
                          <div className="font-semibold truncate text-[11px]">{ing.name}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">+€{ing.extraPrice.toFixed(2)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Note */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Note:</label>
                  <input
                    type="text"
                    placeholder="Es. Ben cotta, senza origano..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <span className="text-sm font-black text-emerald-400 font-mono">
                € {(customizingItem.price + addedIngredients.reduce((s, i) => s + i.priceDelta, 0)).toFixed(2)}
              </span>
              <button
                onClick={confirmCustomization}
                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md"
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK SMISTAMENTO */}
      {dispatchResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-sm w-full p-5 text-center space-y-3 shadow-2xl">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-black text-white">Comanda {dispatchResult.orderCode} Inviata!</h3>
            <p className="text-xs text-slate-400">
              Smistata istantaneamente a: Pizzeria ({dispatchResult.pizzeriaCount}), Bar ({dispatchResult.barCount}), Cucina ({dispatchResult.cucinaCount}).
            </p>
            <button
              onClick={() => setDispatchResult(null)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
