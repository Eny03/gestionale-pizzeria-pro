import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, CheckCircle, Package, Clock, ArrowRight } from 'lucide-react';

export const PizzeriaView: React.FC = () => {
  const { orders, stationStock, updateItemPhase, updateStationStock, menuItems } = useApp();

  const [activeTab, setActiveTab] = useState<'PRE_COTTURA' | 'POST_COTTURA' | 'SCORTE'>('PRE_COTTURA');

  // Active pizza items
  const activePizzas = orders
    .filter(o => o.status !== 'COMPLETATO' && o.status !== 'ANNULLATO' && o.status !== 'PAGATO')
    .flatMap(order =>
      order.items
        .filter(item => item.targetDepartment === 'pizzeria' && item.isReleased)
        .map(item => ({
          orderId: order.id,
          orderCode: order.code,
          tableName: order.tableName || 'Asporto',
          orderCreatedAt: order.createdAt,
          item
        }))
    )
    .sort((a, b) => new Date(a.item.orderedAt).getTime() - new Date(b.item.orderedAt).getTime());

  const preBakePizzas = activePizzas.filter(p => p.item.pizzeriaPhase === 'PRE_COTTURA' || !p.item.pizzeriaPhase);
  const postBakePizzas = activePizzas.filter(p => p.item.pizzeriaPhase === 'POST_COTTURA');

  const getItemRecipe = (menuItemId: string) => {
    const found = menuItems.find(m => m.id === menuItemId);
    return found ? found.recipe : [];
  };

  const handleInforna = (orderId: string, itemId: string) => {
    updateItemPhase(orderId, itemId, 'POST_COTTURA', 'pizzeria');
  };

  const handleCompleta = (orderId: string, itemId: string) => {
    updateItemPhase(orderId, itemId, 'PRONTO', 'pizzeria');
  };

  const getElapsedMinutes = (timestamp: string) => {
    const elapsed = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal Tabs */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Pizzeria KDS</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('PRE_COTTURA')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'PRE_COTTURA'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Infornata</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {preBakePizzas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('POST_COTTURA')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
              activeTab === 'POST_COTTURA'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>A Crudo</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {postBakePizzas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SCORTE')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'SCORTE'
                ? 'bg-sky-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scorte</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {/* PRE-COTTURA (INFORNATA) */}
        {activeTab === 'PRE_COTTURA' && (
          <div>
            {preBakePizzas.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <Flame className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Nessuna pizza in attesa</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {preBakePizzas.map(({ orderId, orderCode, tableName, item }) => {
                  const recipe = getItemRecipe(item.menuItemId);
                  const preBakeIngredients = recipe.filter(r => r.isPreBake);
                  const elapsed = getElapsedMinutes(item.orderedAt);
                  const isUrgent = elapsed > 10;

                  return (
                    <div
                      key={item.id}
                      className={`bg-zinc-900 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        isUrgent ? 'border-amber-500/80 ring-1 ring-amber-500/50' : 'border-zinc-800'
                      }`}
                    >
                      {/* Ticket Header */}
                      <div className="p-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                            {tableName}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">{orderCode}</span>
                        </div>
                        <span className="text-xs text-zinc-400 flex items-center space-x-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{elapsed}m</span>
                        </span>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-3.5 flex-1 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-extrabold text-white leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-sm font-black text-white bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700 font-mono ml-2">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Pre-Bake Ingredients */}
                        <div className="flex flex-wrap gap-1 text-xs">
                          {preBakeIngredients.map(ing => (
                            <span
                              key={ing.ingredientId}
                              className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-750 font-medium"
                            >
                              {ing.ingredientName}
                            </span>
                          ))}
                        </div>

                        {/* Modifiche */}
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

                      {/* Action Button */}
                      <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800">
                        <button
                          onClick={() => handleInforna(orderId, item.id)}
                          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                        >
                          <Flame className="w-4 h-4" />
                          <span>INFORNA</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* POST-COTTURA (A CRUDO) */}
        {activeTab === 'POST_COTTURA' && (
          <div>
            {postBakePizzas.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <CheckCircle className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Nessuna pizza in finitura a crudo</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {postBakePizzas.map(({ orderId, orderCode, tableName, item }) => {
                  const recipe = getItemRecipe(item.menuItemId);
                  const postBakeIngredients = recipe.filter(r => !r.isPreBake);

                  return (
                    <div
                      key={item.id}
                      className="bg-zinc-900 rounded-2xl border border-emerald-500/50 flex flex-col justify-between overflow-hidden shadow-lg"
                    >
                      {/* Ticket Header */}
                      <div className="p-3 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                            {tableName}
                          </span>
                          <span className="font-mono text-xs text-zinc-400">{orderCode}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400">Sfornata</span>
                      </div>

                      {/* Ticket Body */}
                      <div className="p-3.5 flex-1 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-extrabold text-white leading-tight">
                            {item.name}
                          </h3>
                          <span className="text-sm font-black text-white bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700 font-mono ml-2">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Ingredienti a Freddo */}
                        {postBakeIngredients.length > 0 ? (
                          <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                              A Crudo:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {postBakeIngredients.map(ing => (
                                <span
                                  key={ing.ingredientId}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold"
                                >
                                  {ing.ingredientName}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-400 italic">
                            Nessun ingrediente a crudo. Pronta al taglio.
                          </div>
                        )}

                        {item.customization.notes && (
                          <div className="text-xs text-amber-300 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            "{item.customization.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800">
                        <button
                          onClick={() => handleCompleta(orderId, item.id)}
                          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>PRONTA</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SCORTE LINEA */}
        {activeTab === 'SCORTE' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="p-3 border-b border-zinc-800 font-bold text-xs text-zinc-300 uppercase tracking-wider">
                Scorte Linea Pizzeria
              </div>
              <div className="divide-y divide-zinc-800">
                {stationStock.map(stock => {
                  const isLow = stock.currentQty <= stock.startQty * 0.2;
                  return (
                    <div key={stock.ingredientId} className="p-3 flex items-center justify-between hover:bg-zinc-800/40">
                      <div>
                        <div className="font-bold text-xs text-white flex items-center space-x-2">
                          <span>{stock.ingredientName}</span>
                          {isLow && (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                              Bassa
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Usati: {stock.usedQty} {stock.unit}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className={`font-mono font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {stock.currentQty} {stock.unit}
                        </span>
                        <button
                          onClick={() => {
                            const add = prompt(`Rifornisci ${stock.ingredientName} (${stock.unit}):`, '10');
                            if (add && !isNaN(Number(add))) {
                              const num = Number(add);
                              updateStationStock({
                                ...stock,
                                startQty: stock.startQty + num,
                                currentQty: stock.currentQty + num
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700"
                        >
                          + Rifornisci
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
