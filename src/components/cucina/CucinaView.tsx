import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, AlertTriangle, Package, Calendar, Clock, CheckCircle2, Plus, Filter, Search } from 'lucide-react';
import { Ingredient, KitchenItemPhase } from '../../../shared/types';

export const CucinaView: React.FC = () => {
  const { orders, ingredients, updateItemPhase, updateIngredient } = useApp();

  const [activeTab, setActiveTab] = useState<'COMANDE' | 'MAGAZZINO'>('COMANDE');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'LOW_STOCK' | 'EXPIRING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modale nuovo ingrediente magazzino
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<any>('cucina');
  const [newIngStock, setNewIngStock] = useState(10);
  const [newIngUnit, setNewIngUnit] = useState<'kg' | 'pz' | 'l'>('kg');
  const [newIngThreshold, setNewIngThreshold] = useState(2);
  const [newIngExpiry, setNewIngExpiry] = useState('2026-10-20');
  const [newIngLot, setNewIngLot] = useState('LOT-202610-01');

  // Comande cucina attive
  const activeKitchenItems = orders
    .filter(o => o.status !== 'COMPLETATO' && o.status !== 'ANNULLATO' && o.status !== 'PAGATO')
    .flatMap(order =>
      order.items
        .filter(item => item.targetDepartment === 'cucina' && item.isReleased)
        .map(item => ({
          orderId: order.id,
          orderCode: order.code,
          tableName: order.tableName || 'Asporto',
          orderCreatedAt: order.createdAt,
          item
        }))
    )
    .sort((a, b) => new Date(a.item.orderedAt).getTime() - new Date(b.item.orderedAt).getTime());

  const handleUpdateKitchenPhase = (orderId: string, itemId: string, nextPhase: KitchenItemPhase) => {
    updateItemPhase(orderId, itemId, nextPhase, 'cucina');
  };

  const getElapsedMinutes = (timestamp: string) => {
    const elapsed = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  // Calcolo scadenze e alert magazzino
  const today = new Date().toISOString().split('T')[0];
  const twoDaysLater = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ing.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const isLowStock = ing.currentStock <= ing.minThreshold;
    const isExpiring = ing.expiryDate <= twoDaysLater;

    if (!matchesSearch) return false;
    if (inventoryFilter === 'LOW_STOCK') return isLowStock;
    if (inventoryFilter === 'EXPIRING') return isExpiring;
    return true;
  });

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minThreshold).length;
  const expiringCount = ingredients.filter(i => i.expiryDate <= twoDaysLater).length;

  const handleCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;

    const newIng: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newIngName,
      category: newIngCategory,
      stationTarget: 'cucina',
      isPreBake: false,
      extraPrice: 1.50,
      currentStock: Number(newIngStock),
      unit: newIngUnit,
      minThreshold: Number(newIngThreshold),
      costPerUnit: 5.00,
      expiryDate: newIngExpiry,
      lotNumber: newIngLot
    };

    updateIngredient(newIng);
    setShowAddModal(false);
    setNewIngName('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* HEADER REPARTO CUCINA */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-extrabold text-white flex items-center space-x-1.5">
              <span>Cucina & Magazzino</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                KDS
              </span>
            </h1>
          </div>
        </div>

        {/* Tab Switcher Compatto */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('COMANDE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all text-xs ${
              activeTab === 'COMANDE'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Comande</span>
            <span className="px-1.5 rounded bg-slate-950/60 text-white font-mono text-[10px]">
              {activeKitchenItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MAGAZZINO')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all text-xs ${
              activeTab === 'MAGAZZINO'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Magazzino</span>
            {(lowStockCount > 0 || expiringCount > 0) && (
              <span className="px-1.5 rounded bg-rose-500 text-white font-mono text-[10px]">
                {lowStockCount + expiringCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CONTENUTO */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* SCHERMATA 1: COMANDE CUCINA REAL-TIME */}
        {activeTab === 'COMANDE' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Ticket Cucina Attivi (Piatti e Preparazioni Pizzeria)
                </h2>
                <p className="text-xs text-slate-400">
                  Aggiornati istantaneamente dalle comande dei camerieri.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {activeKitchenItems.length} comande in corso
              </span>
            </div>

            {activeKitchenItems.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                <ChefHat className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                <p className="text-base font-bold">Nessun piatto in attesa per la cucina</p>
                <p className="text-xs text-slate-500 mt-1">I nuovi piatti inviati dai camerieri appariranno qui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeKitchenItems.map(({ orderId, orderCode, tableName, item }) => {
                  const phase = item.kitchenPhase || 'IN_ATTESA';
                  const elapsed = getElapsedMinutes(item.orderedAt);
                  const isUrgent = elapsed > 15;

                  return (
                    <div
                      key={item.id}
                      className={`bg-slate-900 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        phase === 'IN_PREPARAZIONE'
                          ? 'border-amber-500/60 ring-2 ring-amber-500/20'
                          : isUrgent
                          ? 'border-rose-500/80 ring-2 ring-rose-500/30'
                          : 'border-slate-800'
                      }`}
                    >
                      {/* Header comanda */}
                      <div className="p-4 bg-slate-800/80 border-b border-slate-750 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sm text-white">{orderCode}</span>
                            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                              {tableName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Ordinato da {elapsed} min</span>
                          </span>
                        </div>
                        <span className="text-base font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Corpo comanda */}
                      <div className="p-4 flex-1 space-y-3">
                        <h3 className="text-lg font-black text-white">{item.name}</h3>

                        {item.customization.notes && (
                          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs text-amber-300 italic font-medium">
                            Note speciali: "{item.customization.notes}"
                          </div>
                        )}

                        <div className="flex items-center space-x-2 text-xs">
                          <span className="text-slate-400">Stato attuale:</span>
                          <span
                            className={`font-black uppercase px-2 py-0.5 rounded text-[11px] ${
                              phase === 'IN_PREPARAZIONE'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {phase === 'IN_PREPARAZIONE' ? 'In Cottura / Preparazione' : 'In Coda'}
                          </span>
                        </div>
                      </div>

                      {/* Footer azioni di stato */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                        {phase === 'IN_ATTESA' && (
                          <button
                            onClick={() => handleUpdateKitchenPhase(orderId, item.id, 'IN_PREPARAZIONE')}
                            className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
                          >
                            <Clock className="w-4 h-4" />
                            <span>INIZIA PREPARAZIONE</span>
                          </button>
                        )}

                        {phase === 'IN_PREPARAZIONE' && (
                          <button
                            onClick={() => handleUpdateKitchenPhase(orderId, item.id, 'PRONTO')}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>SEGNALA PIATTO PRONTO</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SCHERMATA 2: MAGAZZINO GENERALE & SCADENZE */}
        {activeTab === 'MAGAZZINO' && (
          <div className="space-y-4">
            {/* Toolbar filtri & Aggiunta */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setInventoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    inventoryFilter === 'ALL'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Tutti ({ingredients.length})
                </button>
                <button
                  onClick={() => setInventoryFilter('LOW_STOCK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    inventoryFilter === 'LOW_STOCK'
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-800 text-rose-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Scorta Bassa ({lowStockCount})</span>
                </button>
                <button
                  onClick={() => setInventoryFilter('EXPIRING')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    inventoryFilter === 'EXPIRING'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-amber-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>In Scadenza ({expiringCount})</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cerca ingrediente o lotto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center space-x-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuovo Prodotto</span>
                </button>
              </div>
            </div>

            {/* Vista Mobile: Schede Compatte */}
            <div className="sm:hidden space-y-2.5">
              {filteredIngredients.map((ing) => {
                const isLowStock = ing.currentStock <= ing.minThreshold;
                const isExpiring = ing.expiryDate <= twoDaysLater;

                return (
                  <div key={ing.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs">{ing.name}</h4>
                        <span className="text-[10px] text-slate-400 capitalize">{ing.category} • Reparto: {ing.stationTarget}</span>
                      </div>
                      {isLowStock ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black border border-rose-500/30">
                          ESAURIMENTO
                        </span>
                      ) : isExpiring ? (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                          IN SCADENZA
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          REGOLARE
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[9px] block">Giacenza</span>
                        <span className={`font-mono font-bold ${isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {ing.currentStock} {ing.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">Scadenza</span>
                        <span className={`font-mono ${isExpiring ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                          {ing.expiryDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[9px] block">Lotto</span>
                        <span className="font-mono text-slate-400 truncate block">
                          {ing.lotNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabella Magazzino Generale per Tablet & Desktop */}
            <div className="hidden sm:block bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs min-w-[650px]">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-750">
                  <tr>
                    <th className="p-3.5">Prodotto / Ingrediente</th>
                    <th className="p-3.5">Categoria</th>
                    <th className="p-3.5 text-center">Giacenza Attuale</th>
                    <th className="p-3.5 text-center">Soglia Minima</th>
                    <th className="p-3.5">Data di Scadenza</th>
                    <th className="p-3.5">Lotto Tracciabilità</th>
                    <th className="p-3.5 text-center">Stato / Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredIngredients.map((ing) => {
                    const isLowStock = ing.currentStock <= ing.minThreshold;
                    const isExpiring = ing.expiryDate <= twoDaysLater;

                    return (
                      <tr key={ing.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div>{ing.name}</div>
                          <span className="text-[10px] text-slate-400">Reparto: {ing.stationTarget}</span>
                        </td>
                        <td className="p-3.5 capitalize text-slate-400">{ing.category}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-sm">
                          <span className={isLowStock ? 'text-rose-400' : 'text-emerald-400'}>
                            {ing.currentStock} {ing.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono text-slate-400">
                          {ing.minThreshold} {ing.unit}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className={isExpiring ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {ing.expiryDate}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">{ing.lotNumber}</td>
                        <td className="p-3.5 text-center">
                          {isLowStock ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black border border-rose-500/30">
                              ESAURIMENTO
                            </span>
                          ) : isExpiring ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                              IN SCADENZA
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              REGOLARE
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODALE NUOVO PRODOTTO MAGAZZINO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateIngredient} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-3.5 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Carica Ingrediente a Magazzino</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nome Ingrediente:</label>
              <input
                type="text"
                required
                placeholder="Es. Olio Extravergine Biologico 5L"
                value={newIngName}
                onChange={(e) => setNewIngName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Quantità:</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newIngStock}
                  onChange={(e) => setNewIngStock(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Unità:</label>
                <select
                  value={newIngUnit}
                  onChange={(e) => setNewIngUnit(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                >
                  <option value="kg">kg</option>
                  <option value="pz">pz</option>
                  <option value="l">l</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Soglia Minima Alert:</label>
                <input
                  type="number"
                  value={newIngThreshold}
                  onChange={(e) => setNewIngThreshold(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Data di Scadenza:</label>
                <input
                  type="date"
                  value={newIngExpiry}
                  onChange={(e) => setNewIngExpiry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Lotto di Produzione:</label>
              <input
                type="text"
                value={newIngLot}
                onChange={(e) => setNewIngLot(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
              >
                Salva a Magazzino
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
