import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChefHat, Package, Clock, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Ingredient, KitchenItemPhase } from '../../../shared/types';

export const CucinaView: React.FC = () => {
  const { orders, ingredients, updateItemPhase, updateIngredient, deleteIngredient } = useApp();

  const [activeTab, setActiveTab] = useState<'COMANDE' | 'MAGAZZINO'>('COMANDE');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngStock, setNewIngStock] = useState(10);
  const [newIngUnit, setNewIngUnit] = useState<'kg' | 'pz' | 'l'>('kg');

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
    return Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  };

  const lowStockCount = ingredients.filter(i => i.currentStock <= i.minThreshold).length;

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal Tabs */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Cucina KDS</span>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('COMANDE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'COMANDE'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Comande</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {activeKitchenItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MAGAZZINO')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'MAGAZZINO'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Magazzino</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px]">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {activeTab === 'COMANDE' && (
          <div>
            {activeKitchenItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <ChefHat className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Nessun piatto in attesa per la cucina</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {activeKitchenItems.map(({ orderId, orderCode, tableName, item }) => {
                  const phase = item.kitchenPhase || 'IN_ATTESA';
                  const elapsed = getElapsedMinutes(item.orderedAt);
                  const isUrgent = elapsed > 15;

                  return (
                    <div
                      key={item.id}
                      className={`bg-zinc-900 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        phase === 'IN_PREPARAZIONE'
                          ? 'border-amber-500/80 ring-1 ring-amber-500/40'
                          : isUrgent
                          ? 'border-rose-500/80'
                          : 'border-zinc-800'
                      }`}
                    >
                      {/* Header */}
                      <div className="p-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {tableName}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">{orderCode}</span>
                        </div>
                        <span className="text-xs text-zinc-400 flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{elapsed}m</span>
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-3.5 flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-extrabold text-white leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-sm font-black text-white bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700 font-mono ml-2">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Ingredienti Aggiunti, Rimossi e Note */}
                        {(item.customization.addedIngredients.length > 0 ||
                          item.customization.removedIngredients.length > 0 ||
                          item.customization.notes) && (
                          <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-xs space-y-0.5">
                            {item.customization.addedIngredients.map(add => (
                              <div key={add.ingredientId} className="text-emerald-400 font-bold">
                                + {add.name}
                              </div>
                            ))}
                            {item.customization.removedIngredients.map(rem => (
                              <div key={rem.ingredientId} className="text-rose-400 font-bold line-through">
                                - Senza {rem.name}
                              </div>
                            ))}
                            {item.customization.notes && (
                              <div className="text-amber-300 italic pt-0.5">
                                "{item.customization.notes}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800">
                        {phase === 'IN_ATTESA' && (
                          <button
                            onClick={() => handleUpdateKitchenPhase(orderId, item.id, 'IN_PREPARAZIONE')}
                            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                          >
                            <Clock className="w-4 h-4" />
                            <span>INIZIA PREPARAZIONE</span>
                          </button>
                        )}
                        {phase === 'IN_PREPARAZIONE' && (
                          <button
                            onClick={() => handleUpdateKitchenPhase(orderId, item.id, 'PRONTO')}
                            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>PIATTO PRONTO</span>
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

        {/* MAGAZZINO CUCINA */}
        {activeTab === 'MAGAZZINO' && (
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-300 uppercase">Magazzino Cucina</span>
                <span className="text-xs text-zinc-400 font-mono">{ingredients.length} articoli</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {ingredients.map(ing => {
                  const isLow = ing.currentStock <= ing.minThreshold;
                  return (
                    <div key={ing.id} className="p-3 flex items-center justify-between hover:bg-zinc-800/40">
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-2">
                          <span>{ing.name}</span>
                          {isLow && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                              Scorta Bassa
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          Soglia: {ing.minThreshold} {ing.unit} • Lotto: {ing.lotNumber}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`font-mono font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {ing.currentStock} {ing.unit}
                        </span>
                        <button
                          onClick={() => {
                            const add = prompt(`Rifornisci ${ing.name} (${ing.unit}):`, '5');
                            if (add && !isNaN(Number(add))) {
                              updateIngredient({
                                ...ing,
                                currentStock: ing.currentStock + Number(add)
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700"
                        >
                          + Rifornisci
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Rimuovere l'ingrediente "${ing.name}"?`)) {
                              deleteIngredient(ing.id);
                            }
                          }}
                          className="p-1 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
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
          </div>
        )}
      </div>
    </div>
  );
};
