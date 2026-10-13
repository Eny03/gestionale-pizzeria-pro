import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable, RestaurantZone, Reservation, TableStatus } from '../../../shared/types';
import {
  Plus,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize2,
  UtensilsCrossed,
  X,
  Calendar,
  Phone,
  CalendarDays,
  Unlink,
  Check
} from 'lucide-react';

export const CapoSalaView: React.FC = () => {
  const {
    zones,
    tables,
    reservations,
    updateTable,
    createZone,
    createReservation,
    toggleEndSeat,
    setCurrentRole,
    activeTableId,
    setActiveTableId,
    selectedDate,
    setSelectedDate
  } = useApp();

  // Floor dimensions: 18m x 18m square
  const TOTAL_FLOOR_METERS = 18;
  const GRID_STEP = 0.5; // Risoluzione griglia 0.5m x 0.5m

  // Selected table
  const selectedTable = tables.find(t => t.id === activeTableId) || null;

  // Prenotazioni filtrate per la data selezionata
  const dayReservations = reservations.filter(r => {
    const resDate = r.date || r.createdAt?.split('T')[0];
    return resDate === selectedDate;
  });

  const activeReservation = dayReservations.find(r => r.tableId === selectedTable?.id);

  // Auto-fit zoom calculation
  const calculateFitZoom = () => {
    if (typeof window === 'undefined') return 24;
    const paddingX = window.innerWidth < 768 ? 20 : 48;
    const paddingY = window.innerWidth < 768 ? 170 : 130;
    const availWidth = window.innerWidth - paddingX;
    const availHeight = window.innerHeight - paddingY;
    const targetPx = Math.min(availWidth, availHeight);
    return Math.max(16, Math.min(48, Math.floor(targetPx / TOTAL_FLOOR_METERS)));
  };

  const [zoomLevel, setZoomLevel] = useState<number>(calculateFitZoom);

  useEffect(() => {
    const handleResize = () => {
      setZoomLevel(prev => {
        const fit = calculateFitZoom();
        return Math.abs(prev - fit) < 6 ? fit : prev;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modals state
  const [showNewZoneModal, setShowNewZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneX, setNewZoneX] = useState(1);
  const [newZoneY, setNewZoneY] = useState(1);
  const [newZoneWidth, setNewZoneWidth] = useState(8);
  const [newZoneHeight, setNewZoneHeight] = useState(7);
  const [newZoneColor, setNewZoneColor] = useState('#f97316');

  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [resCustomerName, setResCustomerName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resTime, setResTime] = useState('20:30');

  // Dragging state on 0.5m x 0.5m grid
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // ALGORITMO AUTOMATICO TAVOLATE:
  // Se due tavoli 1x1 toccano (coincidenti o adiacenti entro tolleranza), diventano AUTOMATICAMENTE una tavolata!
  const syncAutoTavolate = (allTables: RestaurantTable[]) => {
    const isTouching = (a: RestaurantTable, b: RestaurantTable) => {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      // Adiacenza orizzontale (condividono il lato verticale)
      const isH = Math.abs(dx - 1.0) < 0.15 && dy < 0.6;
      // Adiacenza verticale (condividono il lato orizzontale)
      const isV = Math.abs(dy - 1.0) < 0.15 && dx < 0.6;
      // Coincidenti / quasi sovrapposti
      const isCoincident = dx < 0.6 && dy < 0.6;
      return isH || isV || isCoincident;
    };

    // Costruisci grafo di adiacenza
    const adj: Record<string, string[]> = {};
    allTables.forEach(t => { adj[t.id] = []; });
    for (let i = 0; i < allTables.length; i++) {
      for (let j = i + 1; j < allTables.length; j++) {
        if (isTouching(allTables[i], allTables[j])) {
          adj[allTables[i].id].push(allTables[j].id);
          adj[allTables[j].id].push(allTables[i].id);
        }
      }
    }

    // Componenti connesse (BFS)
    const visited = new Set<string>();
    allTables.forEach(t => {
      if (!visited.has(t.id)) {
        const comp: RestaurantTable[] = [];
        const queue = [t.id];
        visited.add(t.id);
        while (queue.length > 0) {
          const currId = queue.shift()!;
          const currTbl = allTables.find(tb => tb.id === currId)!;
          comp.push(currTbl);
          for (const nId of adj[currId]) {
            if (!visited.has(nId)) {
              visited.add(nId);
              queue.push(nId);
            }
          }
        }

        if (comp.length >= 2) {
          const numbers = comp.map(tb => tb.number).sort((a, b) => a - b);
          const gId = `auto-tav-${numbers.join('-')}`;
          const gName = `Tavolata T${numbers.join(' + T')}`;
          comp.forEach(member => {
            if (member.tavolataGroupId !== gId || member.tavolataName !== gName) {
              updateTable({ ...member, tavolataGroupId: gId, tavolataName: gName });
            }
          });
        } else {
          const single = comp[0];
          if (single.tavolataGroupId) {
            updateTable({ ...single, tavolataGroupId: undefined, tavolataName: undefined });
          }
        }
      }
    });
  };

  // Tavolata members del tavolo selezionato
  const tavolataMembers = selectedTable?.tavolataGroupId
    ? tables.filter(t => t.tavolataGroupId === selectedTable.tavolataGroupId)
    : [];
  const tavolataTotalSeats = tavolataMembers.reduce((sum, t) => sum + t.seats, 0);

  // Drag table handlers
  const handleStartDrag = (clientX: number, clientY: number, table: RestaurantTable) => {
    setActiveTableId(table.id);
    setDraggingTableId(table.id);
    if (gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const clickXInMeters = (clientX - rect.left) / zoomLevel;
      const clickYInMeters = (clientY - rect.top) / zoomLevel;
      setDragOffset({
        x: clickXInMeters - table.x,
        y: clickYInMeters - table.y
      });
    }
  };

  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!draggingTableId || !gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / zoomLevel - dragOffset.x;
    const rawY = (clientY - rect.top) / zoomLevel - dragOffset.y;

    // SNAP A RISOLUZIONE 0.5 METRI
    const snappedX = Math.round(rawX / GRID_STEP) * GRID_STEP;
    const snappedY = Math.round(rawY / GRID_STEP) * GRID_STEP;

    const clampedX = Math.max(0, Math.min(TOTAL_FLOOR_METERS - 1.0, snappedX));
    const clampedY = Math.max(0, Math.min(TOTAL_FLOOR_METERS - 1.0, snappedY));

    const currentTable = tables.find(t => t.id === draggingTableId);
    if (currentTable && (currentTable.x !== clampedX || currentTable.y !== clampedY)) {
      const updated = { ...currentTable, x: clampedX, y: clampedY };
      updateTable(updated);
    }
  };

  const handleEndDrag = () => {
    if (draggingTableId) {
      setDraggingTableId(null);
      // RICALCOLA AUTOMATICAMENTE LE TAVOLATE DOPO LO SPOSTAMENTO
      syncAutoTavolate(tables);
    }
  };

  const handleAddTable = () => {
    const nextNumber = Math.max(0, ...tables.map(t => t.number)) + 1;
    const newTable: RestaurantTable = {
      id: `t-${Date.now()}`,
      number: nextNumber,
      x: 2.0,
      y: 2.0,
      widthMeters: 1.0, // TAVOLO SEMPRE 1m x 1m
      heightMeters: 1.0,
      shape: 'SQUARE',
      seats: 2,
      hasEndSeat: false,
      status: 'LIBERO'
    };
    updateTable(newTable);
    setActiveTableId(newTable.id);
    setTimeout(() => syncAutoTavolate([...tables, newTable]), 100);
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;
    createZone({
      id: `z-${Date.now()}`,
      name: newZoneName,
      x: Number(newZoneX),
      y: Number(newZoneY),
      widthMeters: Number(newZoneWidth),
      heightMeters: Number(newZoneHeight),
      colorTheme: newZoneColor
    });
    setShowNewZoneModal(false);
    setNewZoneName('');
  };

  const handleChangeStatus = (status: TableStatus) => {
    if (!selectedTable) return;
    if (selectedTable.tavolataGroupId) {
      tavolataMembers.forEach(t => updateTable({ ...t, status }));
    } else {
      updateTable({
        ...selectedTable,
        status,
        activeReservationId: status === 'LIBERO' ? undefined : selectedTable.activeReservationId
      });
    }
  };

  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !resCustomerName) return;
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      customerName: resCustomerName,
      customerPhone: resPhone,
      guestsCount: selectedTable.tavolataGroupId ? tavolataTotalSeats : selectedTable.seats,
      reservationTime: resTime,
      expectedDurationMinutes: 90,
      status: 'CONFERMATA',
      date: selectedDate, // ASSOCIATA ALLA GIORNATA SELEZIONATA
      createdAt: new Date().toISOString()
    };
    createReservation(newRes);
    handleChangeStatus('PRENOTATO');
    setShowBookingForm(false);
    setResCustomerName('');
    setResPhone('');
  };

  const handleTakeOrder = () => {
    if (!selectedTable) return;
    setActiveTableId(selectedTable.id);
    setCurrentRole('CAMERIERE');
  };

  // Helper date selector
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const getTableStatusOnDay = (table: RestaurantTable): TableStatus => {
    const res = dayReservations.find(r => r.tableId === table.id);
    if (res) return 'PRENOTATO';
    return table.status;
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* AREA PLANIMETRIA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Minimal Toolbar con Selettore Data e Zoom */}
        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          {/* Selettore Giornata */}
          <div className="flex items-center space-x-1.5">
            <CalendarDays className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDate === todayStr ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Oggi
              </button>
              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDate === tomorrowStr ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Domani
              </button>
              <button
                onClick={() => setSelectedDate(dayAfterStr)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDate === dayAfterStr ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                +2 gg
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-300 font-mono text-xs px-1 focus:outline-none cursor-pointer"
              />
            </div>
            {dayReservations.length > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {dayReservations.length} prenotati
              </span>
            )}
          </div>

          {/* Zoom Controls & Aggiungi Tavolo */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/60">
              <button
                onClick={() => setZoomLevel(Math.max(16, zoomLevel - 3))}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Riduci"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(calculateFitZoom())}
                className="px-2 py-1 text-[11px] font-mono text-zinc-300 hover:text-white flex items-center space-x-1"
                title="Adatta allo schermo"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">Fit</span>
              </button>
              <button
                onClick={() => setZoomLevel(Math.min(50, zoomLevel + 3))}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Ingrandisci"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setShowNewZoneModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 hidden sm:flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Zona</span>
            </button>

            <button
              onClick={handleAddTable}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tavolo 1x1</span>
            </button>
          </div>
        </div>

        {/* Canvas Planimetria (18m x 18m con Risoluzione Griglia 0.5m x 0.5m) */}
        <div
          className="flex-1 overflow-auto p-2 sm:p-4 bg-zinc-950 flex items-center justify-center relative touch-none"
          onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
          onMouseUp={handleEndDrag}
          onTouchMove={(e) => e.touches[0] && handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={handleEndDrag}
          onClick={() => setActiveTableId(null)}
        >
          <div
            ref={gridContainerRef}
            style={{
              width: `${TOTAL_FLOOR_METERS * zoomLevel}px`,
              height: `${TOTAL_FLOOR_METERS * zoomLevel}px`,
              backgroundSize: `${zoomLevel * GRID_STEP}px ${zoomLevel * GRID_STEP}px`,
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `
            }}
            className="relative bg-zinc-900/90 rounded-2xl border border-zinc-700/80 shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Righello Metro Principale */}
            {Array.from({ length: TOTAL_FLOOR_METERS }).map((_, i) => (
              <span
                key={`meter-${i}`}
                style={{ left: `${i * zoomLevel + 2}px` }}
                className="absolute top-0.5 text-[8px] font-mono text-zinc-600 pointer-events-none select-none"
              >
                {i}m
              </span>
            ))}

            {/* Zone all'interno del quadrato */}
            {zones.map(zone => (
              <div
                key={zone.id}
                style={{
                  left: `${zone.x * zoomLevel}px`,
                  top: `${zone.y * zoomLevel}px`,
                  width: `${zone.widthMeters * zoomLevel}px`,
                  height: `${zone.heightMeters * zoomLevel}px`,
                  borderColor: `${zone.colorTheme}66`
                }}
                className="absolute rounded-xl border border-dashed bg-zinc-800/20 pointer-events-none p-1.5 flex flex-col justify-between"
              >
                <span
                  style={{ color: zone.colorTheme }}
                  className="text-[10px] font-bold uppercase tracking-wider truncate"
                >
                  {zone.name}
                </span>
              </div>
            ))}

            {/* Tavoli 1m x 1m (Accorpamento Automatico in Tavolata se coincidenti/adiacenti) */}
            {tables.map(table => {
              const isSelected = activeTableId === table.id;
              const isTavolata = Boolean(table.tavolataGroupId);
              const sizePx = zoomLevel * 1.0; // 1m x 1m = 2 quadratini di 0.5m
              const leftPx = table.x * zoomLevel;
              const topPx = table.y * zoomLevel;

              const status = getTableStatusOnDay(table);

              let statusClasses = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
              if (status === 'OCCUPATO') statusClasses = 'bg-rose-500/25 border-rose-500 text-rose-300';
              if (status === 'PRENOTATO') statusClasses = 'bg-amber-500/25 border-amber-500 text-amber-300';
              if (isTavolata) statusClasses = 'bg-purple-500/30 border-purple-400 text-purple-200';

              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleStartDrag(e.clientX, e.clientY, table);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches[0]) handleStartDrag(e.touches[0].clientX, e.touches[0].clientY, table);
                  }}
                  style={{
                    width: `${sizePx}px`,
                    height: `${sizePx}px`,
                    left: `${leftPx}px`,
                    top: `${topPx}px`
                  }}
                  className={`absolute border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer shadow-md select-none ${statusClasses} ${
                    isSelected ? 'ring-2 ring-white scale-105 z-30' : 'z-20'
                  }`}
                >
                  {/* Sedia Alto (Posto 1) */}
                  <div className="absolute -top-1 w-3 h-1 rounded-full bg-zinc-400/80" />
                  {/* Sedia Basso (Posto 2) */}
                  <div className="absolute -bottom-1 w-3 h-1 rounded-full bg-zinc-400/80" />
                  {/* Sedia Estremo (3° posto opzionale) */}
                  {table.hasEndSeat && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-amber-400" />
                  )}

                  <span className="text-[11px] font-black leading-none">T{table.number}</span>
                  <span className="text-[9px] font-bold opacity-80 mt-0.5">{table.seats}p</span>

                  {/* Badge Tavolata Automatica */}
                  {isTavolata && (
                    <span className="absolute -top-2 bg-purple-600 text-white text-[8px] font-black px-1 rounded-sm shadow-sm uppercase">
                      UNITA
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PANNELLO TAVOLO (Bottom Sheet Mobile / Sidebar Desktop) */}
      {selectedTable && (
        <div className="fixed inset-x-0 bottom-14 lg:bottom-0 lg:relative lg:inset-auto z-40 lg:w-80 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 p-4 space-y-3.5 shadow-2xl rounded-t-2xl lg:rounded-none max-h-[75vh] lg:max-h-none overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-white">
                  Tavolo #{selectedTable.number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-300">
                  {selectedTable.seats} Posti
                </span>
              </div>
              {selectedTable.tavolataName && (
                <span className="text-xs text-purple-400 font-bold block mt-0.5">
                  {selectedTable.tavolataName} ({tavolataTotalSeats}p totali)
                </span>
              )}
            </div>
            <button onClick={() => setActiveTableId(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Azione Primaria: PRENDI COMANDA */}
          <button
            onClick={handleTakeOrder}
            className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>PRENDI COMANDA</span>
          </button>

          {/* Toggle Rapido Posti (2 o 3 persone agli estremi) */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Capacità Tavolo 1m:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => selectedTable.hasEndSeat && toggleEndSeat(selectedTable.id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  !selectedTable.hasEndSeat
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                2 Persone (Standard)
              </button>
              <button
                onClick={() => !selectedTable.hasEndSeat && toggleEndSeat(selectedTable.id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  selectedTable.hasEndSeat
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                + 3° Posto Estremo
              </button>
            </div>
          </div>

          {/* Status Pills */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Stato ({selectedDate}):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleChangeStatus('LIBERO')}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  selectedTable.status === 'LIBERO'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-zinc-800 text-emerald-400 border-zinc-700'
                }`}
              >
                Libero
              </button>
              <button
                onClick={() => handleChangeStatus('OCCUPATO')}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  selectedTable.status === 'OCCUPATO'
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-zinc-800 text-rose-400 border-zinc-700'
                }`}
              >
                Occupato
              </button>
              <button
                onClick={() => handleChangeStatus('PRENOTATO')}
                className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                  selectedTable.status === 'PRENOTATO'
                    ? 'bg-amber-500 text-white border-amber-400'
                    : 'bg-zinc-800 text-amber-400 border-zinc-700'
                }`}
              >
                Prenotato
              </button>
            </div>
          </div>

          {/* Tavolata Automatica Info */}
          {selectedTable.tavolataGroupId && (
            <div className="bg-purple-950/30 border border-purple-500/30 p-2.5 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center text-purple-300 font-bold">
                <span>Tavolata Automatica</span>
                <span className="font-mono bg-purple-900/40 px-2 py-0.5 rounded text-[11px]">
                  {tavolataTotalSeats} Persone
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Tavoli adiacenti rilevati: {tavolataMembers.map(t => `#${t.number}`).join(', ')}. Allontana il tavolo per separarlo automaticamente.
              </p>
            </div>
          )}

          {/* Prenotazione per la data selezionata */}
          {activeReservation ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-xs space-y-1">
              <div className="flex justify-between font-bold text-amber-300">
                <span>Prenotazione ({selectedDate})</span>
                <span className="font-mono">{activeReservation.reservationTime}</span>
              </div>
              <div className="text-white font-semibold">
                {activeReservation.customerName} ({activeReservation.guestsCount} pers.)
              </div>
              {activeReservation.customerPhone && (
                <div className="text-zinc-400 flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{activeReservation.customerPhone}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {!showBookingForm ? (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-dashed border-zinc-700 rounded-lg flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>+ Prenota per il {selectedDate}</span>
                </button>
              ) : (
                <form onSubmit={handleSaveReservation} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-300">Prenota per {selectedDate}</span>
                    <button type="button" onClick={() => setShowBookingForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nome cliente"
                    value={resCustomerName}
                    onChange={(e) => setResCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                  />
                  <div className="flex space-x-1.5">
                    <input
                      type="tel"
                      placeholder="Tel."
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                    />
                    <input
                      type="time"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded p-1.5 text-white"
                    />
                  </div>
                  <button type="submit" className="w-full py-1.5 bg-amber-500 text-white font-bold rounded">
                    Conferma Prenotazione
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal Nuova Zona */}
      {showNewZoneModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateZone} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm">Nuova Zona nel Locale</h3>
              <button type="button" onClick={() => setShowNewZoneModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome Zona:</label>
              <input
                type="text"
                required
                placeholder="Es. Dehor, Sala Interna, Terrazza"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Largh. (metri):</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="18"
                  value={newZoneWidth}
                  onChange={(e) => setNewZoneWidth(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Altezza (metri):</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="18"
                  value={newZoneHeight}
                  onChange={(e) => setNewZoneHeight(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl">
              Crea Zona
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
