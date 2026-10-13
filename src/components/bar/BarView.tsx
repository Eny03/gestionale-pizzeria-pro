import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wine, Clock, CheckCircle2 } from 'lucide-react';
import { BarItemPhase } from '../../../shared/types';

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
  const readyItems = barItems.filter(b => b.item.barPhase === 'PRONTO');

  const handleMarkReady = (orderId: string, itemId: string) => {
    updateItemPhase(orderId, itemId, 'PRONTO', 'bar');
  };

  const getElapsedMinutes = (timestamp: string) => {
    const elapsed = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
    return Math.max(0, elapsed);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>Frontend Bar & Beverage KDS</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                BEVANDE & SPILLATURA
              </span>
            </h1>
            <p className="text-xs text-slate-400">Ticket bevande e bibite in arrivo dalle comande dei camerieri</p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold font-mono">
          {pendingItems.length} da servire
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pendingItems.length === 0 ? (
          <div className="col-span-full h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
            <Wine className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
            <p className="text-base font-bold">Nessuna bevanda in attesa di preparazione</p>
            <p className="text-xs text-slate-500 mt-1">Le bevande ordinate dai tavoli appariranno qui in tempo reale.</p>
          </div>
        ) : (
          pendingItems.map(({ orderId, orderCode, tableName, item }) => {
            const elapsed = getElapsedMinutes(item.orderedAt);

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-purple-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="font-mono font-black text-xs text-purple-400">{orderCode}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                      {tableName}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-base text-white">{item.name}</h3>
                    <span className="text-base font-black text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-slate-800">
                      x{item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In attesa da {elapsed} min</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleMarkReady(orderId, item.id)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>SEGNALA BEVANDA PRONTA</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
