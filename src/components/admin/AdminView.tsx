import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Split,
  X,
  CheckCircle,
  Package,
  Search,
  Check,
  AlertTriangle,
  Flame,
  ChefHat,
  Wine,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  MenuItem,
  Order,
  MenuCategory,
  Ingredient,
  StationTarget,
  IngredientCategory,
  RecipeItem
} from '../../../shared/types';

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

  // Filters & Search
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<'ALL' | MenuCategory>('ALL');
  const [menuDeptFilter, setMenuDeptFilter] = useState<'ALL' | StationTarget>('ALL');
  const [ingFilterStation, setIngFilterStation] = useState<'ALL' | StationTarget>('ALL');
  const [ingSearch, setIngSearch] = useState('');

  // Confirmation Modals (Anti-accidental touch)
  const [deleteItemConfirm, setDeleteItemConfirm] = useState<MenuItem | null>(null);
  const [deleteIngConfirm, setDeleteIngConfirm] = useState<Ingredient | null>(null);

  // Menu Modal State
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MenuCategory>('pizze_classiche');
  const [formPrice, setFormPrice] = useState(8.50);
  const [formDept, setFormDept] = useState<StationTarget>('pizzeria');
  const [formPrepTime, setFormPrepTime] = useState(10);
  const [formDescription, setFormDescription] = useState('');
  const [formRecipe, setFormRecipe] = useState<RecipeItem[]>([]);

  // New ingredient into recipe sub-form
  const [selectedRecipeIngId, setSelectedRecipeIngId] = useState<string>('');
  const [selectedRecipeQty, setSelectedRecipeQty] = useState<number>(0.05);
  const [selectedRecipeDept, setSelectedRecipeDept] = useState<StationTarget>('pizzeria');

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

  const unpaidOrders = orders.filter(o => !o.isPaid && o.status !== 'ANNULLATO');

  // Open Dish Modal
  const handleOpenEditMenu = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setFormName(item.name);
      setFormCategory(item.category);
      setFormPrice(item.price);
      setFormDept(item.targetDepartment);
      setFormPrepTime(item.prepTimeMinutes || 10);
      setFormDescription(item.description || '');
      setFormRecipe(item.recipe ? [...item.recipe] : []);
    } else {
      setEditingMenuItem(null);
      setFormName('');
      setFormCategory('pizze_classiche');
      setFormPrice(8.50);
      setFormDept('pizzeria');
      setFormPrepTime(10);
      setFormDescription('');
      setFormRecipe([]);
    }
    setShowMenuModal(true);
  };

  // Add ingredient to recipe sub-form
  const handleAddIngredientToRecipe = () => {
    if (!selectedRecipeIngId) return;
    const found = ingredients.find(i => i.id === selectedRecipeIngId);
    if (!found) return;

    const newItem: RecipeItem = {
      ingredientId: found.id,
      ingredientName: found.name,
      quantity: Number(selectedRecipeQty) || 0.05,
      unit: found.unit,
      isPreBake: found.isPreBake,
      sourceDepartment: selectedRecipeDept || found.stationTarget
    };

    setFormRecipe(prev => [...prev, newItem]);
    setSelectedRecipeIngId('');
  };

  const handleRemoveRecipeItem = (index: number) => {
    setFormRecipe(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const saved: MenuItem = {
      id: editingMenuItem ? editingMenuItem.id : `m-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      price: Number(formPrice),
      description: formDescription.trim(),
      targetDepartment: formDept,
      prepTimeMinutes: Number(formPrepTime) || 10,
      available: editingMenuItem ? editingMenuItem.available : true,
      recipe: formRecipe
    };

    saveMenuItem(saved);
    setShowMenuModal(false);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    saveMenuItem({
      ...item,
      available: !item.available
    });
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
      setIngExtraPrice(1.00);
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

  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = menuCategoryFilter === 'ALL' || item.category === menuCategoryFilter;
    const matchesDept = menuDeptFilter === 'ALL' || item.targetDepartment === menuDeptFilter;
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(menuSearch.toLowerCase()));
    return matchesCategory && matchesDept && matchesSearch;
  });

  const filteredIngredients = ingredients.filter(i => {
    const matchesDept = ingFilterStation === 'ALL' || i.stationTarget === ingFilterStation;
    const matchesSearch = i.name.toLowerCase().includes(ingSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const categoriesList: { key: MenuCategory | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tutti' },
    { key: 'pizze_classiche', label: 'Pizze Classiche' },
    { key: 'pizze_speciali', label: 'Pizze Speciali' },
    { key: 'antipasti_cucina', label: 'Antipasti & Burgers' },
    { key: 'primi_secondi', label: 'Primi & Secondi' },
    { key: 'fritti', label: 'Fritti & Contorni' },
    { key: 'bevande', label: 'Bevande & Birre' },
    { key: 'dolci', label: 'Dessert' }
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal Tabs */}
      <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-sm text-white">Cassa & Gestione</span>
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
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {menuItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('INGREDIENTI')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all whitespace-nowrap active:scale-95 ${
              activeTab === 'INGREDIENTI' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Ingredienti & Scorte</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {ingredients.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 pb-safe">
        {/* =====================================================================
            1. CASSA & PAGAMENTI TAVOLI
            ===================================================================== */}
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
                        <span className="font-mono text-xs text-orange-400 font-bold">{order.code}</span>
                      </div>
                      <div className="text-xs text-zinc-400 space-y-1">
                        <div>{order.items.length} articoli ordinati</div>
                        {order.guestsCount && <div>{order.guestsCount} coperti (Coperto: €{order.coverCharge.toFixed(2)})</div>}
                        <div className="text-[11px] text-zinc-500">Cameriere: {order.waiterName}</div>
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

        {/* =====================================================================
            2. LISTINO MENU & PIATTI (MODIFICA TUTTO, RICETTE & DISPONIBILITÀ)
            ===================================================================== */}
        {activeTab === 'MENU' && (
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Top Toolbar: Categories & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Cerca nel menu..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <select
                  value={menuDeptFilter}
                  onChange={(e: any) => setMenuDeptFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-white"
                >
                  <option value="ALL">Tutti Reparti</option>
                  <option value="pizzeria">🍕 Pizzeria</option>
                  <option value="cucina">👨‍🍳 Cucina</option>
                  <option value="bar">🍺 Bar</option>
                </select>
              </div>

              <button
                onClick={() => handleOpenEditMenu()}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuovo Piatto / Pizza</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {categoriesList.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setMenuCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    menuCategoryFilter === cat.key
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Menu Items Table / Cards */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800/80 overflow-hidden shadow-xl">
              {filteredMenuItems.map(item => {
                const deptLabel = item.targetDepartment === 'pizzeria' ? '🍕 Pizzeria' : item.targetDepartment === 'cucina' ? '👨‍🍳 Cucina' : '🍺 Bar';

                return (
                  <div key={item.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-zinc-800/40">
                    <div className="space-y-1 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono font-bold">
                          {deptLabel}
                        </span>
                        {!item.available && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30">
                            Esaurito
                          </span>
                        )}
                      </div>

                      {/* Lista Ingredienti con Reparto */}
                      {item.recipe && item.recipe.length > 0 ? (
                        <div className="text-[11px] text-zinc-400 leading-snug">
                          <span className="text-zinc-500 font-semibold">Ingredienti: </span>
                          {item.recipe.map((r, idx) => (
                            <span key={idx}>
                              {r.ingredientName}
                              {r.sourceDepartment && (
                                <span className="text-[9px] text-amber-400 ml-0.5 font-mono">
                                  [{r.sourceDepartment === 'cucina' ? 'Cucina' : r.sourceDepartment === 'pizzeria' ? 'Pizzeria' : 'Bar'}]
                                </span>
                              )}
                              {idx < item.recipe.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : item.description ? (
                        <p className="text-[11px] text-zinc-400">{item.description}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                      <span className="font-mono font-black text-sm text-emerald-400 mr-2">
                        € {item.price.toFixed(2)}
                      </span>

                      {/* Toggle Disponibile / Esaurito One-Tap */}
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all min-h-[40px] active:scale-95 ${
                          item.available
                            ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30'
                        }`}
                        title={item.available ? 'Disponibile (clicca per esaurire)' : 'Esaurito (clicca per riattivare)'}
                      >
                        {item.available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-[11px] font-bold">{item.available ? 'Attivo' : 'Esaurito'}</span>
                      </button>

                      {/* Tasto Modifica Piatto & Ricetta */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditMenu(item)}
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center active:scale-95"
                        title="Modifica piatto e ricetta"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Tasto Elimina */}
                      <button
                        type="button"
                        onClick={() => setDeleteItemConfirm(item)}
                        className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center active:scale-95"
                        title="Elimina dal listino"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            3. GESTIONE INGREDIENTI & SCORTE (AGGIUNGI, ELIMINA, MODIFICA REPARTO)
            ===================================================================== */}
        {activeTab === 'INGREDIENTI' && (
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Cerca ingrediente..."
                    value={ingSearch}
                    onChange={(e) => setIngSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                onClick={() => handleOpenEditIng()}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md shrink-0 min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nuovo Ingrediente</span>
              </button>
            </div>

            {/* Station Filter Pills */}
            <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => setIngFilterStation('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  ingFilterStation === 'ALL' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tutti ({ingredients.length})
              </button>
              <button
                onClick={() => setIngFilterStation('pizzeria')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  ingFilterStation === 'pizzeria' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍕 Pizzeria ({ingredients.filter(i => i.stationTarget === 'pizzeria').length})
              </button>
              <button
                onClick={() => setIngFilterStation('cucina')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  ingFilterStation === 'cucina' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍳 Cucina ({ingredients.filter(i => i.stationTarget === 'cucina').length})
              </button>
              <button
                onClick={() => setIngFilterStation('bar')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  ingFilterStation === 'bar' ? 'bg-purple-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍸 Bar ({ingredients.filter(i => i.stationTarget === 'bar').length})
              </button>
            </div>

            {/* Ingredients List */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden shadow-xl">
              {filteredIngredients.map(ing => {
                let stationBadge = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
                if (ing.stationTarget === 'cucina') stationBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
                if (ing.stationTarget === 'bar') stationBadge = 'bg-purple-500/15 text-purple-400 border-purple-500/30';

                return (
                  <div key={ing.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/40">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs sm:text-sm text-white">{ing.name}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${stationBadge}`}>
                          {ing.stationTarget}
                        </span>
                        {ing.requiresClarification ? (
                          <span className="text-[10px] font-bold bg-amber-500/15 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                            Da Chiedere
                          </span>
                        ) : ing.isPreBake ? (
                          <span className="text-[10px] font-bold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded border border-zinc-700">
                            In Forno
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-sky-500/15 text-sky-400 px-1.5 py-0.2 rounded border border-sky-500/30">
                            Dopo Cottura / Freddo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Giacenza: {ing.currentStock} {ing.unit} • Prezzo Extra: € {ing.extraPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-emerald-400 mr-2">
                        +€ {ing.extraPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleOpenEditIng(ing)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                        title="Modifica ingrediente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteIngConfirm(ing)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                        title="Elimina ingrediente"
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

      {/* =========================================================================
          MODALE COMPLETO: NUOVO / MODIFICA PIATTO & COSTRUTTORE RICETTA
          ========================================================================= */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <form
            onSubmit={handleSaveMenuItem}
            className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl max-h-[90dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <h3 className="font-black text-sm sm:text-base text-white">
                {editingMenuItem ? `Modifica: ${editingMenuItem.name}` : 'Nuovo Articolo nel Listino'}
              </h3>
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Nome Articolo */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">Nome Piatto / Pizza:</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Es. Pizza Margherita, Burger Chianina..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Categoria, Reparto e Prezzo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Categoria:</label>
                <select
                  value={formCategory}
                  onChange={(e: any) => setFormCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="pizze_classiche">Pizze Classiche</option>
                  <option value="pizze_speciali">Pizze Speciali</option>
                  <option value="antipasti_cucina">Antipasti & Burgers</option>
                  <option value="primi_secondi">Primi & Secondi</option>
                  <option value="fritti">Fritti & Contorni</option>
                  <option value="bevande">Bevande & Birre</option>
                  <option value="dolci">Dessert</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Reparto Principale:</label>
                <select
                  value={formDept}
                  onChange={(e: any) => setFormDept(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="pizzeria">🍕 Pizzeria</option>
                  <option value="cucina">👨‍🍳 Cucina</option>
                  <option value="bar">🍺 Bar</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Prezzo Base (€):</label>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Descrizione / Note del menu */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">Descrizione:</label>
              <input
                type="text"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Breve descrizione o allergeni..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500"
              />
            </div>

            {/* ===============================================================
                COSTRUTTORE RICETTA / INGREDIENTI BASE CON REPARTO
                =============================================================== */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  Ingredienti Base Ricetta ({formRecipe.length}):
                </span>
                <span className="text-[10px] text-zinc-500">
                  Mostrati e toglibili in presa comanda
                </span>
              </div>

              {/* Lista ingredienti già inseriti nella ricetta */}
              <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-2 max-h-36 overflow-y-auto space-y-1">
                {formRecipe.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic p-1 text-center">
                    Nessun ingrediente nella ricetta. Aggiungine uno sotto.
                  </p>
                ) : (
                  formRecipe.map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-semibold text-white truncate">{r.ingredientName}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-amber-400 font-mono">
                          [{r.sourceDepartment === 'cucina' ? 'Cucina' : r.sourceDepartment === 'pizzeria' ? 'Pizzeria' : 'Bar'}]
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {r.quantity} {r.unit}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipeItem(idx)}
                        className="text-zinc-500 hover:text-rose-400 p-1"
                        title="Rimuovi ingrediente dalla ricetta"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Sotto-form per aggiungere un ingrediente alla ricetta */}
              <div className="bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/80 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                  + Aggiungi Ingrediente alla Ricetta:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  <select
                    value={selectedRecipeIngId}
                    onChange={(e) => {
                      setSelectedRecipeIngId(e.target.value);
                      const f = ingredients.find(ing => ing.id === e.target.value);
                      if (f) setSelectedRecipeDept(f.stationTarget);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white truncate sm:col-span-1"
                  >
                    <option value="">Seleziona ingrediente...</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.stationTarget})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedRecipeDept}
                    onChange={(e: any) => setSelectedRecipeDept(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="pizzeria">Reparto Pizzeria</option>
                    <option value="cucina">Reparto Cucina</option>
                    <option value="bar">Reparto Bar</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleAddIngredientToRecipe}
                    disabled={!selectedRecipeIngId}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-orange-400 font-bold text-xs rounded-lg border border-zinc-700"
                  >
                    + Aggiungi
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all mt-3"
            >
              SALVA PIATTO NEL LISTINO
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          MODALE NUOVO / MODIFICA INGREDIENTE (CON REPARTO OBBLIGATORIO)
          ========================================================================= */}
      {showIngModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <form
            onSubmit={handleSaveIngredient}
            className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-3.5 shadow-2xl max-h-[90dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                {editingIng ? `Modifica: ${editingIng.name}` : 'Nuovo Ingrediente / Scorta'}
              </h3>
              <button
                type="button"
                onClick={() => setShowIngModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* SELEZIONE REPARTO DI PROVENIENZA (PIZZERIA / CUCINA / BAR) */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                Reparto di Provenienza (Obbligatorio):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIngStation('pizzeria')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
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
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
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
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
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
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">Nome Ingrediente:</label>
              <input
                type="text"
                required
                placeholder="Es. Fiordilatte, Bacon, Porcini, Gin..."
                value={ingName}
                onChange={(e) => setIngName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* APPLICAZIONE / FASE */}
            <div>
              <label className="text-[11px] font-bold text-zinc-300 block mb-1">Fase di Preparazione / Timing:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setIngTiming('PRE_BAKE')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    ingTiming === 'PRE_BAKE'
                      ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
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
                      ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
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
                      ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  ❓ Da Chiedere
                </button>
              </div>
            </div>

            {/* PREZZO EXTRA, SCORTA E UNITÀ */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Prezzo Extra (€):</label>
                <input
                  type="number"
                  step="0.50"
                  value={ingExtraPrice}
                  onChange={(e) => setIngExtraPrice(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Giacenza:</label>
                <input
                  type="number"
                  step="1"
                  value={ingStock}
                  onChange={(e) => setIngStock(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">Unità:</label>
                <select
                  value={ingUnit}
                  onChange={(e: any) => setIngUnit(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
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
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all mt-2"
            >
              SALVA INGREDIENTE
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          DIALOG CONFERMA ELIMINA PIATTO (ANTI-TOCCHI ACCIDENTALI)
          ========================================================================= */}
      {deleteItemConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-white">Eliminare Piatto?</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Sei sicuro di voler rimuovere "{deleteItemConfirm.name}" dal listino prezzi del ristorante?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteItemConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMenuItem(deleteItemConfirm.id);
                  setDeleteItemConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-black text-xs"
              >
                Elimina Piatto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG CONFERMA ELIMINA INGREDIENTE (ANTI-TOCCHI ACCIDENTALI)
          ========================================================================= */}
      {deleteIngConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-white">Eliminare Ingrediente?</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Rimuovere "{deleteIngConfirm.name}" ({deleteIngConfirm.stationTarget.toUpperCase()}) dall'inventario e dalle opzioni di aggiunta?
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteIngConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteIngredient(deleteIngConfirm.id);
                  setDeleteIngConfirm(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white font-black text-xs"
              >
                Elimina Ingrediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALE CASSA (SALDA CONTO - Mobile Bottom Sheet)
          ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90dvh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
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
                  <span>Coperti ({selectedOrder.guestsCount}x €1.50)</span>
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
                  className="w-6 h-6 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="font-bold text-white w-5 text-center">{splitGuests}</span>
                <button
                  type="button"
                  onClick={() => setSplitGuests(splitGuests + 1)}
                  className="w-6 h-6 bg-zinc-800 rounded font-bold text-white flex items-center justify-center text-xs"
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
                className="py-3 px-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg active:scale-95"
              >
                <DollarSign className="w-4 h-4" />
                <span>CONTANTI</span>
              </button>
              <button
                onClick={() => handlePay('CARTA')}
                className="py-3 px-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-lg active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span>POS / CARTA</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
