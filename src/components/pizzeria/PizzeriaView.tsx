import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, CheckCircle, Package, Clock, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { StationStockItem } from '../../../shared/types';

export const PizzeriaView: React.FC = () => {
  const { orders, stationStock, updateItemPhase, updateStationStock, menuItems } = useApp();

  const [activeTab, setActiveTab] = useState<'PRE_COTTURA' | 'POST_COTTURA' | 'SCORTE'>('PRE_COTTURA');

  // Estrai tutte le pizze attive dagli ordini non completati
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

  // 1. Pizze in Pre-Cottura (in attesa di essere infornate)
  const preBakePizzas = activePizzas.filter(p => p.item.pizzeriaPhase === 'PRE_COTTURA' || !p.item.pizzeriaPhase);

  // 2. Pizze in Post-Cottura (uscite dal forno, richiedono condimenti a crudo)
  const postBakePizzas = activePizzas.filter(p => p.item.pizzeriaPhase === 'POST_COTTURA');

  // Helper per ottenere gli ingredienti della ricetta
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

  // Helper calcolo minuti trascorsi
  const getElapsedMinutes = (timestamp: string) => {
    const elapsed = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* HEADER REPARTO PIZZERIA: SWITCHER STAZIONI */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>Frontend Pizzeria KDS</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                DOPPIO SCHERMO
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Gestione sincronizzata Pre-Cottura, Post-Cottura & Tracking Scorte Linea
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('PRE_COTTURA')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'PRE_COTTURA'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>1. PRE-COTTURA (INFORNATA)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-white font-mono text-[11px]">
              {preBakePizzas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('POST_COTTURA')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'POST_COTTURA'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>2. POST-COTTURA (A CRUDO)</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-white font-mono text-[11px]">
              {postBakePizzas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SCORTE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'SCORTE'
                ? 'bg-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>SCORTE LINEA</span>
          </button>
        </div>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* STAZIONE 1: PIZZE PRE-COTTURA */}
        {activeTab === 'PRE_COTTURA' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Pizze in Entrata da Stendere & Infornare (Cronologico)
                </h2>
                <p className="text-xs text-slate-400">
                  Visualizza esclusivamente gli ingredienti e le modifiche da applicare <strong>prima della cottura</strong>.
                </p>
              </div>
              <span className="text-xs font-bold text-orange-400">
                {preBakePizzas.length} pizze da infornare
              </span>
            </div>

            {preBakePizzas.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                <Flame className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                <p className="text-base font-bold">Nessuna pizza in attesa di infornata</p>
                <p className="text-xs text-slate-500 mt-1">Le nuove comande inviate dai camerieri appariranno qui istantaneamente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {preBakePizzas.map(({ orderId, orderCode, tableName, item }) => {
                  const recipe = getItemRecipe(item.menuItemId);
                  // Filtra SOLO gli ingredienti della ricetta con isPreBake === true
                  const preBakeIngredients = recipe.filter(r => r.isPreBake);
                  const elapsed = getElapsedMinutes(item.orderedAt);
                  const isUrgent = elapsed > 10;

                  return (
                    <div
                      key={item.id}
                      className={`bg-slate-900 rounded-2xl border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        isUrgent ? 'border-amber-500/80 ring-2 ring-amber-500/30' : 'border-slate-800'
                      }`}
                    >
                      {/* Header comanda */}
                      <div className="p-4 bg-slate-800/80 border-b border-slate-750 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sm text-white">{orderCode}</span>
                            <span className="text-xs font-bold text-orange-400 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                              {tableName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>Ordinata da {elapsed} min</span>
                          </span>
                        </div>
                        <span className="text-base font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Corpo: Nome pizza e ingredienti PRE-COTTURA */}
                      <div className="p-4 flex-1 space-y-3">
                        <h3 className="text-lg font-black text-white">{item.name}</h3>

                        {/* LISTA INGREDIENTI DA METTERE PRIMA DI INFORNARE */}
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block mb-1">
                            INGREDIENTI PRE-COTTURA:
                          </span>
                          <ul className="text-xs space-y-1">
                            {preBakeIngredients.map((ing) => (
                              <li key={ing.ingredientId} className="text-slate-200 flex items-center space-x-2 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                <span>{ing.ingredientName}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Modifiche speciali della comanda */}
                        {(item.customization.addedIngredients.length > 0 ||
                          item.customization.removedIngredients.length > 0 ||
                          item.customization.notes) && (
                          <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl space-y-1 text-xs">
                            <span className="text-[10px] font-black uppercase text-amber-400 block">
                              ATTENZIONE MODIFICHE:
                            </span>
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
                              <div className="text-amber-300 italic font-medium">
                                Note: "{item.customization.notes}"
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer: Pulsante INFORNA */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800">
                        <button
                          onClick={() => handleInforna(orderId, item.id)}
                          className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25 transition-all"
                        >
                          <Flame className="w-4 h-4" />
                          <span>INFORNA (PASSA A POST-COTTURA)</span>
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

        {/* STAZIONE 2: PIZZE POST-COTTURA (A CRUDO) */}
        {activeTab === 'POST_COTTURA' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Pizze Uscite dal Forno (Aggiunte a Freddo & Finitura)
                </h2>
                <p className="text-xs text-slate-400">
                  Mostra le pizze sfornate pronte per l'aggiunta di ingredienti a crudo (Burrata, Rucola, Crudo, Granella).
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {postBakePizzas.length} pizze da completare
              </span>
            </div>

            {postBakePizzas.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                <CheckCircle className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                <p className="text-base font-bold">Nessuna pizza in attesa di finitura a freddo</p>
                <p className="text-xs text-slate-500 mt-1">Inforna una pizza dal primo schermo per vederla apparire qui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {postBakePizzas.map(({ orderId, orderCode, tableName, item }) => {
                  const recipe = getItemRecipe(item.menuItemId);
                  // Filtra gli ingredienti POST-COTTURA
                  const postBakeIngredients = recipe.filter(r => !r.isPreBake);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900 rounded-2xl border-2 border-emerald-500/50 flex flex-col justify-between overflow-hidden shadow-xl"
                    >
                      {/* Header comanda */}
                      <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-black text-sm text-white">{orderCode}</span>
                            <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">
                              {tableName}
                            </span>
                          </div>
                          <span className="text-[11px] text-emerald-300 font-semibold mt-0.5 block">
                            🔥 Sfornata • In fase di condimento
                          </span>
                        </div>
                        <span className="text-base font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Corpo: INGREDIENTI A CRUDO DA AGGIUNGERE */}
                      <div className="p-4 flex-1 space-y-3">
                        <h3 className="text-lg font-black text-white">{item.name}</h3>

                        {postBakeIngredients.length > 0 ? (
                          <div className="bg-emerald-950/30 border border-emerald-500/40 p-3.5 rounded-xl space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 block">
                              🟢 DA AGGIUNGERE A FREDDO:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {postBakeIngredients.map((ing) => (
                                <span
                                  key={ing.ingredientId}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-sm"
                                >
                                  ✨ {ing.ingredientName} ({ing.quantity} {ing.unit})
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                            Nessun ingrediente a freddo previsto per questa ricetta. Pronta per il taglio e servizio!
                          </div>
                        )}

                        {/* Note cameriere */}
                        {item.customization.notes && (
                          <div className="text-xs text-amber-300 italic bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                            Nota cameriere: "{item.customization.notes}"
                          </div>
                        )}
                      </div>

                      {/* Footer: Pulsante COMPLETA & SERVI */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800">
                        <button
                          onClick={() => handleCompleta(orderId, item.id)}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>COMPLETA E INVIA AL BANCO SERVIZIO</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STAZIONE 3: GESTIONE INVENTARIO REPARTO & SCORTE SERATA */}
        {activeTab === 'SCORTE' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Tracking Scorte Linea Pizzeria (Consumi Serata)
                </h2>
                <p className="text-xs text-slate-400">
                  Le quantità consumate si scalano automaticamente ad ogni pizza preparata. Puoi aggiornare le scorte iniziali o aggiungere rifornimenti.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-750">
                  <tr>
                    <th className="p-3.5">Ingrediente Linea</th>
                    <th className="p-3.5 text-center">Inizio Serata</th>
                    <th className="p-3.5 text-center">Consumati (Auto)</th>
                    <th className="p-3.5 text-center">Disponibilità Attuale</th>
                    <th className="p-3.5 text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {stationStock.map((stock) => {
                    const isLow = stock.currentQty <= stock.startQty * 0.2;
                    return (
                      <tr key={stock.ingredientId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{stock.ingredientName}</span>
                            {isLow && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black border border-rose-500/30">
                                SCORTA BASSA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-center font-mono">
                          {stock.startQty} {stock.unit}
                        </td>
                        <td className="p-3.5 text-center font-mono text-orange-400 font-bold">
                          {stock.usedQty} {stock.unit}
                        </td>
                        <td className="p-3.5 text-center font-mono">
                          <span className={`font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {stock.currentQty} {stock.unit}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => {
                              const addAmount = prompt(`Quanti ${stock.unit} vuoi aggiungere a ${stock.ingredientName}?`, '10');
                              if (addAmount && !isNaN(Number(addAmount))) {
                                const addNum = Number(addAmount);
                                updateStationStock({
                                  ...stock,
                                  startQty: Number((stock.startQty + addNum).toFixed(2)),
                                  currentQty: Number((stock.currentQty + addNum).toFixed(2))
                                });
                              }
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
                          >
                            + Rifornisci
                          </button>
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
    </div>
  );
};
