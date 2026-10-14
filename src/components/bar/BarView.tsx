import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wine, Clock, CheckCircle2 } from 'lucide-react';

export const BarView: React.FC = () => {
  const { orders, updateItemPhase } = useApp();

  const barItems = orders
    .filter(o => o.status !== 'COMPLETATO' && o.status !== 'ANNULLATO' && o.status !== 'PAGATO')
    .flatMap(order =>
      order.items
        .filter(item => item.targetDepartment === 'bar' && item.isReleased)
        .map(item => ({
          orderId: order.id,
          orderCode: order.code,
          tableName: order.tableName || 'Asporto',
          orderCreatedAt: order.createdAt,
          item
        }))
    )
    .sort((a, b) => new Date(a.item.orderedAt).getTime() - new Date(b.item.orderedAt).getTime());

  const pendingItems = barItems.filter(b => b.item.barPhase !== 'PRONTO');

  const handleMarkReady = (orderId: string, itemId: string) => {
    updateItemPhase(orderId, itemId, 'PRONTO', 'bar');
  };

  const getElapsedMinutes = (timestamp: string) => {
    return Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Bar & Beverage</span>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold font-mono">
          {pendingItems.length} da servire
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {pendingItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
            <Wine className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
            <p className="text-sm font-semibold">Nessuna bevanda in attesa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {pendingItems.map(({ orderId, orderCode, tableName, item }) => {
              const elapsed = getElapsedMinutes(item.orderedAt);

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-purple-500/30 rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg"
                >
                  {/* Header */}
                  <div className="p-3 bg-purple-950/20 border-b border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
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

                    {/* Modifiche e Note */}
                    {(item.customization.addedIngredients.length > 0 ||
                      item.customization.removedIngredients.length > 0 ||
                      item.customization.notes) && (
                      <div className="bg-purple-950/40 border border-purple-500/20 p-2 rounded-xl text-xs space-y-0.5 mt-2">
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

                  {/* Action Button */}
                  <div className="p-2.5 bg-zinc-950/60 border-t border-zinc-800">
                    <button
                      onClick={() => handleMarkReady(orderId, item.id)}
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>SERVITA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
