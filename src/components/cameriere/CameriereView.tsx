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
  ShoppingBag,
  Flame,
  Sparkles,
  HelpCircle,
  Users,
  ChevronDown,
  Check
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
  const [customizingTab, setCustomizingTab] = useState<'PRE_BAKE' | 'POST_BAKE' | 'CLARIFICATION' | 'REMOVE_BASE'>('PRE_BAKE');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Customization state
  const [addedIngredients, setAddedIngredients] = useState<IngredientDelta[]>([]);
  const [removedIngredients, setRemovedIngredients] = useState<{ ingredientId: string; name: string }[]>([]);
  const [notes, setNotes] = useState('');

  // Dispatch confirmation
  const [sentOrderCode, setSentOrderCode] = useState<string | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];

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
    setCustomizingTab('PRE_BAKE');
    setAddedIngredients([]);
    setRemovedIngredients([]);
    setNotes('');
  };

  const quickAddItem = (item: MenuItem) => {
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

  const categories: { key: MenuCategory | 'ALL'; label: string; icon: string }[] = [
    { key: 'ALL', label: 'Tutti', icon: '🍽️' },
    { key: 'pizze_classiche', label: 'Classiche', icon: '🍕' },
    { key: 'pizze_speciali', label: 'Speciali', icon: '⭐' },
    { key: 'antipasti_cucina', label: 'Cucina', icon: '🥗' },
    { key: 'fritti', label: 'Fritti', icon: '🍟' },
    { key: 'bevande', label: 'Bevande', icon: '🍺' }
  ];

  // FILTRO ESCLUSIVO PER AGGIUNTE PIZZA: SOLO ingredienti del reparto pizzeria!
  const isPizzaCustomization = customizingItem?.targetDepartment === 'pizzeria';
  const relevantIngredients = ingredients.filter(ing => {
    if (isPizzaCustomization) {
      return ing.stationTarget === 'pizzeria';
    }
    return ing.stationTarget === customizingItem?.targetDepartment;
  });

  const preBakeAdditions = relevantIngredients.filter(i => i.isPreBake && !i.requiresClarification);
  const postBakeAdditions = relevantIngredients.filter(i => !i.isPreBake && !i.requiresClarification);
  const clarificationOptions = relevantIngredients.filter(i => i.requiresClarification);

  // Quick note chips for fast thumb tapping
  const quickNotesSuggestions = ['Ben cotta', 'Croccante', 'Senza sale', 'Tagliata a fette', 'Poco pomodoro', 'Servire subito'];

  return (
    <div className="h-full flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 overflow-hidden relative select-none">
      {/* Toast Conferma Invio */}
      {sentOrderCode && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-black animate-bounce border border-emerald-400">
          <CheckCircle className="w-4 h-4" />
          <span>Comanda {sentOrderCode} inviata al KDS!</span>
        </div>
      )}

      {/* Main Menu Area */}
      <div className="flex-1 flex flex-col overflow-hidden pb-14 lg:pb-0">
        {/* Top Controls: Mobile Table Selector & Search */}
        <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
          {/* Tactile Table Selector Button */}
          <div className="flex items-center space-x-1.5 min-w-0">
            <button
              onClick={() => setShowTablePicker(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 text-xs font-black text-orange-400 active:scale-95 transition-all truncate"
            >
              <span>📍</span>
              <span className="truncate">Tavolo #{selectedTable?.number}</span>
              {selectedTable?.tavolataName && (
                <span className="hidden sm:inline text-[10px] text-purple-300 font-mono">
                  [{selectedTable.tavolataName}]
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            </button>

            {/* Stepper Coperti Touch */}
            <div className="flex items-center bg-zinc-800/90 px-1.5 py-1 rounded-xl border border-zinc-700/70 text-xs">
              <button
                onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                className="w-6 h-6 rounded-lg bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-90 transition-transform"
                title="Riduci coperti"
              >
                -
              </button>
              <div className="flex items-center space-x-0.5 px-1.5 font-bold font-mono text-zinc-200 text-xs">
                <Users className="w-3 h-3 text-zinc-400" />
                <span>{guestsCount}</span>
              </div>
              <button
                onClick={() => setGuestsCount(guestsCount + 1)}
                className="w-6 h-6 rounded-lg bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-90 transition-transform"
                title="Aumenta coperti"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative w-32 sm:w-48 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Cerca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Categories Horizontal Scrolling Bar (No Scrollbar, Native Feel) */}
        <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/60 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {categories.map(c => {
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 active:scale-95 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800/80'
                }`}
              >
                <span className="text-xs">{c.icon}</span>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Grid: Ergonomic Touch Cards */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {filteredMenuItems.map(item => {
            const countInCart = cartItems
              .filter(ci => ci.menuItemId === item.id)
              .reduce((a, b) => a + b.quantity, 0);

            const isPizza = item.targetDepartment === 'pizzeria';

            return (
              <div
                key={item.id}
                onClick={() => quickAddItem(item)}
                className={`bg-zinc-900/90 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.98] relative shadow-sm ${
                  countInCart > 0
                    ? 'border-orange-500 ring-1 ring-orange-500/30 bg-zinc-900'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* Quantity Badge */}
                {countInCart > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-zinc-950">
                    {countInCart}
                  </span>
                )}

                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-white line-clamp-2 leading-tight">
                    {item.name}
                  </h3>
                  {item.recipe && item.recipe.length > 0 && (
                    <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1 truncate">
                      {item.recipe.map(r => r.ingredientName).join(', ')}
                    </p>
                  )}
                  <span className="font-mono font-bold text-xs sm:text-sm text-emerald-400 mt-1.5 block">
                    € {item.price.toFixed(2)}
                  </span>
                </div>

                {/* Tactile Action Buttons at bottom of card */}
                <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1.5">
                  {/* Tasto Modifiche / Aggiunte per pizze e piatti */}
                  <button
                    onClick={(e) => openCustomization(e, item)}
                    className="flex-1 py-1 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 text-[11px] font-bold flex items-center justify-center space-x-1 active:scale-95 transition-all border border-zinc-700/60"
                    title="Modifica ingredienti, cottura o note"
                  >
                    <Sliders className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{isPizza ? 'Varianti' : 'Note'}</span>
                  </button>

                  {/* Pulsante Rapido Aggiungi */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      quickAddItem(item);
                    }}
                    className="w-8 h-8 rounded-xl bg-orange-500/15 hover:bg-orange-500 text-orange-400 hover:text-white flex items-center justify-center text-sm font-black active:scale-90 transition-all border border-orange-500/30 shrink-0"
                    title="Aggiungi rapido"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Sticky Cart Bar (Mobile Only) */}
      {cartItems.length > 0 && (
        <div className="lg:hidden fixed bottom-2 inset-x-3 z-30">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 px-4 bg-orange-500 active:bg-orange-600 rounded-2xl text-white font-extrabold text-xs shadow-2xl flex items-center justify-between border border-orange-400 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center space-x-2">
              <span className="bg-zinc-950/40 px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold">
                {totalItemCount} {totalItemCount === 1 ? 'voce' : 'voci'}
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

      {/* CARRELLO / DETTAGLIO COMANDA (Native Bottom Sheet on Mobile / Sidebar on Desktop) */}
      <div
        className={`fixed lg:relative inset-x-0 bottom-0 lg:bottom-0 z-40 lg:z-auto w-full lg:w-80 xl:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col justify-between transition-transform duration-300 rounded-t-3xl lg:rounded-none max-h-[85dvh] lg:max-h-none shadow-2xl ${
          isCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        }`}
      >
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1 bg-zinc-700 rounded-full mx-auto mt-2 lg:hidden" />

        <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm text-white">
              Comanda Tavolo #{selectedTable?.number}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono font-bold">
              {guestsCount} coperti
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="lg:hidden p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cartItems.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-zinc-500 text-xs">
              <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-zinc-600" />
              <span>Nessun articolo nella comanda</span>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800/80 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-xs text-white block">{item.name}</span>
                    <div className="text-[11px] font-mono text-zinc-400">
                      € {item.finalUnitPrice.toFixed(2)} cad.
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-400">
                    € {item.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Modifiche e aggiunte */}
                {(item.customization.addedIngredients.length > 0 ||
                  item.customization.removedIngredients.length > 0 ||
                  item.customization.notes) && (
                  <div className="text-[11px] bg-zinc-900/60 p-2 rounded-xl border border-zinc-800/50 space-y-0.5">
                    {item.customization.addedIngredients.map(a => (
                      <span key={a.ingredientId} className="text-emerald-400 font-semibold block">
                        + {a.name} (+€{a.priceDelta.toFixed(2)})
                      </span>
                    ))}
                    {item.customization.removedIngredients.map(r => (
                      <span key={r.ingredientId} className="text-rose-400 line-through font-semibold block">
                        - {r.name}
                      </span>
                    ))}
                    {item.customization.notes && (
                      <span className="text-amber-300 italic font-medium block">
                        "{item.customization.notes}"
                      </span>
                    )}
                  </div>
                )}

                {/* Stepper Quantità & Elimina Touch */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                    title="Rimuovi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-xs active:scale-90 transition-transform"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-xs text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-xs active:scale-90 transition-transform"
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
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950/80 space-y-2.5 pb-safe">
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
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
              cartItems.length === 0
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25 border border-orange-400'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>INVIA COMANDA AL KDS 🚀</span>
          </button>
        </div>
      </div>

      {/* MODAL PERSONALIZZAZIONE PIZZE & PIATTI (Native Mobile Bottom Sheet) */}
      {customizingItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-4 sm:p-5 space-y-3.5 shadow-2xl max-h-[88dvh] flex flex-col pb-safe">
            {/* Mobile Drag Handle */}
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">{customizingItem.name}</h3>
                <span className="text-xs text-emerald-400 font-mono font-bold">Base: € {customizingItem.price.toFixed(2)}</span>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* SELEZIONE TABS MODIFICHE (SOLO INGREDIENTI PIZZERIA PER LE PIZZE) */}
            {isPizzaCustomization && (
              <div className="flex space-x-1 bg-zinc-950 p-1 rounded-2xl border border-zinc-800 text-xs shrink-0 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setCustomizingTab('PRE_BAKE')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 transition-all ${
                    customizingTab === 'PRE_BAKE' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span className="truncate">In Forno ({preBakeAdditions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizingTab('POST_BAKE')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 transition-all ${
                    customizingTab === 'POST_BAKE' ? 'bg-sky-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="truncate">Uscita ({postBakeAdditions.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizingTab('CLARIFICATION')}
                  className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 transition-all ${
                    customizingTab === 'CLARIFICATION' ? 'bg-amber-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span className="truncate">Varianti ({clarificationOptions.length})</span>
                </button>
                {customizingItem.recipe && customizingItem.recipe.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomizingTab('REMOVE_BASE')}
                    className={`flex-1 py-2 px-2 rounded-xl font-bold flex items-center justify-center space-x-1 transition-all ${
                      customizingTab === 'REMOVE_BASE' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs">✕</span>
                    <span className="truncate">Senza ({customizingItem.recipe.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* GRIGLIA INGREDIENTI SELEZIONABILI CON TOUCH COMODO */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Tab 1: In Cottura */}
              {(!isPizzaCustomization || customizingTab === 'PRE_BAKE') && (
                <div>
                  <span className="text-[11px] font-bold text-orange-400 block mb-1.5 uppercase tracking-wider">
                    Ingredienti in Cottura (Da Infornare):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {preBakeAdditions.map(ing => {
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
                                priceDelta: ing.extraPrice
                              }]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between active:scale-95 ${
                            isAdded
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500 shadow-sm'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span className="truncate">{ing.name}</span>
                          <span className="font-mono text-emerald-400 ml-1 shrink-0 font-bold">
                            {isAdded ? '✓' : `+€${ing.extraPrice.toFixed(2)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Dopo Cottura */}
              {isPizzaCustomization && customizingTab === 'POST_BAKE' && (
                <div>
                  <span className="text-[11px] font-bold text-sky-400 block mb-1.5 uppercase tracking-wider">
                    Ingredienti all'Uscita Forno (A Freddo):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {postBakeAdditions.map(ing => {
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
                                priceDelta: ing.extraPrice
                              }]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between active:scale-95 ${
                            isAdded
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span className="truncate">{ing.name}</span>
                          <span className="font-mono text-emerald-400 ml-1 shrink-0 font-bold">
                            {isAdded ? '✓' : `+€${ing.extraPrice.toFixed(2)}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Da Chiedere */}
              {isPizzaCustomization && customizingTab === 'CLARIFICATION' && (
                <div>
                  <span className="text-[11px] font-bold text-amber-400 block mb-1.5 uppercase tracking-wider">
                    Varianti Cottura & Impasti:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {clarificationOptions.map(ing => {
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
                                priceDelta: ing.extraPrice
                              }]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between active:scale-95 ${
                            isAdded
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                              : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <span className="truncate">{ing.name}</span>
                          <span className="font-mono text-emerald-400 ml-1 shrink-0 font-bold">
                            {isAdded ? '✓' : ing.extraPrice > 0 ? `+€${ing.extraPrice.toFixed(2)}` : 'Gratis'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Rimuovi Base */}
              {isPizzaCustomization && customizingTab === 'REMOVE_BASE' && customizingItem.recipe && (
                <div>
                  <span className="text-[11px] font-bold text-rose-400 block mb-1.5 uppercase tracking-wider">
                    Togli Ingredienti dalla Ricetta (Senza...):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.recipe.map(r => {
                      const isRemoved = removedIngredients.some(rm => rm.ingredientId === r.ingredientId);
                      return (
                        <button
                          key={r.ingredientId}
                          type="button"
                          onClick={() => {
                            if (isRemoved) {
                              setRemovedIngredients(prev => prev.filter(rm => rm.ingredientId !== r.ingredientId));
                            } else {
                              setRemovedIngredients(prev => [...prev, { ingredientId: r.ingredientId, name: r.ingredientName }]);
                            }
                          }}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between active:scale-95 ${
                            isRemoved
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500 line-through'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                          }`}
                        >
                          <span>Senza {r.ingredientName}</span>
                          <span className="font-bold">{isRemoved ? '✕' : ''}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Note Suggestions & Note Libere */}
              <div className="pt-2 border-t border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold text-zinc-400 block">Note per il Forno / Cucina:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickNotesSuggestions.map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setNotes(prev => prev ? `${prev}, ${suggestion}` : suggestion);
                      }}
                      className="px-2 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] active:scale-95 transition-all"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Scrivi nota personalizzata..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Pulsante Conferma Bottom CTA */}
            <div className="pt-2.5 border-t border-zinc-800 flex justify-between items-center shrink-0">
              <div className="text-xs">
                <span className="text-zinc-400">Totale Piatto: </span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  € {(customizingItem.price + addedIngredients.reduce((s, a) => s + a.priceDelta, 0)).toFixed(2)}
                </span>
              </div>
              <button
                onClick={confirmCustomization}
                className="py-3 px-5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
              >
                Conferma e Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE PICKER BOTTOM SHEET (Mobile Friendly Table Selection) */}
      {showTablePicker && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-4 space-y-3.5 shadow-2xl max-h-[85dvh] flex flex-col pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white">Seleziona Tavolo</h3>
                <p className="text-xs text-zinc-400">Scegli il tavolo da servire</p>
              </div>
              <button
                onClick={() => setShowTablePicker(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-2 py-1 pr-1">
              {tables.map(t => {
                const isSelected = selectedTableId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTableId(t.id);
                      setActiveTableId(t.id);
                      setShowTablePicker(false);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center active:scale-95 ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/25 font-black'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-sm font-black">#{t.number}</span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/90' : 'text-zinc-400'}`}>
                      {t.seats} posti
                    </span>
                    {t.tavolataName && (
                      <span className="text-[9px] text-purple-300 font-bold truncate max-w-full mt-0.5">
                        Tavolata
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
