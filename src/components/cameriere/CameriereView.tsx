import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MenuItem,
  OrderItem,
  OrderItemCustomization,
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
  Layers,
  Search,
  Check,
  UserCheck
} from 'lucide-react';

export const CameriereView: React.FC = () => {
  const { tables, menuItems, ingredients, currentUser, createOrder } = useApp();

  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || 't-1');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

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
      tableName: `Tavolo ${selectedTable.number}`,
      waiterId: currentUser.id,
      waiterName: currentUser.name, // REGISTRA AUTOMATICAMENTE IL NOME DEL CAMERIERE
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

    // Conta gli articoli smistati
    const pizzeCount = cartItems.filter(i => i.targetDepartment === 'pizzeria').reduce((a, b) => a + b.quantity, 0);
    const barCount = cartItems.filter(i => i.targetDepartment === 'bar').reduce((a, b) => a + b.quantity, 0);
    const cucinaCount = cartItems.filter(i => i.targetDepartment === 'cucina').reduce((a, b) => a + b.quantity, 0);

    createOrder(newOrder);

    // Mostra il modale di smistamento automatico
    setDispatchResult({
      orderCode: newOrderCode,
      pizzeriaCount: pizzeCount,
      barCount,
      cucinaCount
    });

    // Reset carrello
    setCartItems([]);
  };

  const categories: { key: MenuCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tutto il Menu' },
    { key: 'pizze_classiche', label: 'Pizze Classiche' },
    { key: 'pizze_speciali', label: 'Pizze Speciali' },
    { key: 'antipasti_cucina', label: 'Cucina & Antipasti' },
    { key: 'fritti', label: 'Fritti' },
    { key: 'bevande', label: 'Bevande' }
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden">
      {/* COLONNA SINISTRA & CENTRALE: SELEZIONE TAVOLO + CATALOGO MENU */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        {/* BARRA SUPERIORE: Selezione Tavolo e Cameriere */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400">Tavolo:</span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="bg-transparent font-bold text-orange-400 focus:outline-none cursor-pointer"
              >
                {tables.map(t => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    Tavolo #{t.number} ({t.seats} posti) - {t.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400">Coperti:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-bold text-white w-4 text-center">{guestsCount}</span>
                <button
                  onClick={() => setGuestsCount(guestsCount + 1)}
                  className="w-5 h-5 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg">
              <UserCheck className="w-4 h-4" />
              <span>Cameriere: <strong>{currentUser.name}</strong></span>
            </div>
          </div>
        </div>

        {/* RICERCA & CATEGORIE */}
        <div className="p-3 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row gap-2 items-center justify-between">
          {/* Categorie Pill */}
          <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto py-1">
            {categories.map(c => (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === c.key
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Cerca pizza, piatto o bibita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* GRIGLIA PRODOTTI */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredMenuItems.map(item => {
            let deptBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            if (item.targetDepartment === 'pizzeria') deptBadge = 'bg-red-500/10 text-red-400 border-red-500/20';
            if (item.targetDepartment === 'cucina') deptBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            if (item.targetDepartment === 'bar') deptBadge = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

            return (
              <div
                key={item.id}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between transition-all group hover:border-slate-700 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                      {item.name}
                    </h3>
                    <span className="font-black text-sm text-emerald-400 whitespace-nowrap">
                      € {item.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${deptBadge}`}>
                      {item.targetDepartment}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.prepTimeMinutes}m</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {/* Pulsante personalizzazione avanzata (aggiunte/rimozioni) */}
                    <button
                      onClick={() => openCustomization(item)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1 border border-slate-700 transition-colors"
                      title="Personalizza (Aggiunte, Rimozioni, Note)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modifica</span>
                    </button>

                    {/* Quick add standard */}
                    <button
                      onClick={() => quickAddItem(item)}
                      className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-sm"
                      title="Aggiungi comanda rapida"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COLONNA DESTRA: RIEPILOGO COMANDA E CARRELLO TAVOLO */}
      <div className="w-full lg:w-96 bg-slate-900 flex flex-col justify-between border-t lg:border-t-0 border-slate-800">
        {/* Intestazione Carrello */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-white flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-orange-400" />
              <span>Comanda Tavolo #{selectedTable?.number}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cameriere: <span className="text-slate-200 font-semibold">{currentUser.name}</span>
            </p>
          </div>
          <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-mono">
            {cartItems.length} voci
          </span>
        </div>

        {/* Lista Articoli Carrello */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Utensils className="w-12 h-12 text-slate-700 stroke-1 mb-2" />
              <p className="text-sm font-semibold">Nessun articolo inserito</p>
              <p className="text-xs text-slate-500 mt-1">
                Seleziona i piatti e le pizze dal menu a sinistra per comporre la comanda.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 rounded-xl p-3 border border-slate-750 flex flex-col space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{item.name}</h4>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      € {item.finalUnitPrice.toFixed(2)} cad.
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-sm text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-rose-400 ml-1 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mostra modifiche (Aggiunte / Rimozioni / Note) */}
                {(item.customization.addedIngredients.length > 0 ||
                  item.customization.removedIngredients.length > 0 ||
                  item.customization.notes) && (
                  <div className="bg-slate-900/70 rounded-lg p-2 text-xs space-y-1 border border-slate-800">
                    {item.customization.addedIngredients.map(add => (
                      <div key={add.ingredientId} className="text-emerald-400 flex items-center justify-between">
                        <span>+ {add.name}</span>
                        <span className="font-mono">+€{add.priceDelta.toFixed(2)}</span>
                      </div>
                    ))}
                    {item.customization.removedIngredients.map(rem => (
                      <div key={rem.ingredientId} className="text-rose-400 line-through">
                        - {rem.name}
                      </div>
                    ))}
                    {item.customization.notes && (
                      <div className="text-amber-300 italic text-[11px]">
                        Note: "{item.customization.notes}"
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/50">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Reparto: {item.targetDepartment}
                  </span>
                  <span className="font-bold text-white font-mono">
                    € {item.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Totali & Pulsante Invio Smistamento */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Coperti ({guestsCount} x €{coverRate.toFixed(2)})</span>
              <span className="font-mono text-slate-200">€ {coverTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Subtotale Piatti & Pizze</span>
              <span className="font-mono text-slate-200">€ {itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
              <span>TOTALE CONTO</span>
              <span className="font-mono text-emerald-400 text-base">€ {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSendOrder}
            disabled={cartItems.length === 0}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
            <span>INVIA E SMISTA AI REPARTI</span>
          </button>
        </div>
      </div>

      {/* MODALE DI PERSONALIZZAZIONE AVANZATA (AGGIUNTE / RIMOZIONI / PREZZI) */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 max-h-[90vh] flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Personalizza {customizingItem.name}</h3>
                  <p className="text-xs text-slate-400">
                    Prezzo base: €{customizingItem.price.toFixed(2)} • Reparto: {customizingItem.targetDepartment}
                  </p>
                </div>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto max-h-[55vh] py-3 space-y-4">
                {/* 1. Ingredienti Ricetta Originale (Per Rimozioni) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Ingredienti Ricetta Base (Clicca per rimuovere / deselezionare):
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            isRemoved
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 line-through'
                              : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {isRemoved ? 'Senza ' : '✓ '} {r.ingredientName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Ingredienti Extra Aggiuntivi (Con calcolo automatico variazione prezzo) */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Aggiungi Ingredienti Extra (+ Variazione Prezzo Automatica):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                              : 'bg-slate-800/70 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-semibold truncate">{ing.name}</div>
                          <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                            +€{ing.extraPrice.toFixed(2)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Note Personalizzate per la cucina/pizzeria */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Note per la Pizzeria / Cucina:
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Ben cotta, cornicione alto, intolleranza..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Riepilogo prezzo finale dinamico */}
            <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Prezzo Modificato:</span>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  € {(customizingItem.price + addedIngredients.reduce((s, i) => s + i.priceDelta, 0)).toFixed(2)}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Annulla
                </button>
                <button
                  onClick={confirmCustomization}
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Conferma e Inserisci
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK SMISTAMENTO AUTOMATICO AI REPARTI */}
      {dispatchResult && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Comanda {dispatchResult.orderCode} Inviata!</h3>
              <p className="text-xs text-slate-400 mt-1">
                La comanda è stata registrata a nome di <strong className="text-slate-200">{currentUser.name}</strong> e smistata istantaneamente:
              </p>
            </div>

            {/* Badge smistamento */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span>🍕 Frontend Pizzeria</span>
                </span>
                <span className="font-bold text-white font-mono">{dispatchResult.pizzeriaCount} ticket</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>🍺 Frontend Bar</span>
                </span>
                <span className="font-bold text-white font-mono">{dispatchResult.barCount} ticket</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>🍳 Frontend Cucina</span>
                </span>
                <span className="font-bold text-white font-mono">{dispatchResult.cucinaCount} ticket</span>
              </div>
            </div>

            <button
              onClick={() => setDispatchResult(null)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md"
            >
              OK, Torna ai Tavoli
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
