import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RestaurantTable,
  RestaurantZone,
  TableStatus,
  Reservation
} from '../../../shared/types';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Plus,
  Users,
  Settings,
  X,
  Phone,
  Clock,
  Calendar,
  PenTool,
  Trash2,
  Check,
  CalendarDays,
  UtensilsCrossed,
  LayoutGrid,
  Map as MapIcon,
  Move,
  Hand,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export const CapoSalaView: React.FC = () => {
  const {
    tables,
    zones,
    reservations,
    updateTable,
    updateAllTables,
    createZone,
    deleteZone,
    createReservation,
    setActiveTableId,
    activeTableId,
    selectedDate,
    setSelectedDate,
    setCurrentRole,
    orders
  } = useApp();

  // Dimensioni locale: 500 m² (Quadrato da 22.5m x 22.5m ≈ 506 m²)
  const floorWidth = 22.5;
  const floorHeight = 22.5;
  const GRID_STEP = 0.5; // Risoluzione griglia 0.5m x 0.5m

  // MODALITÀ VISUALIZZAZIONE: 'GRID' (Elenco Tavoli POS per Smartphone) o 'MAP' (Mappa Planimetria)
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : true;
  const [viewMode, setViewMode] = useState<'GRID' | 'MAP'>(isMobileInitial ? 'GRID' : 'MAP');
  const [gridFilter, setGridFilter] = useState<'ALL' | 'LIBERO' | 'OCCUPATO' | 'PRENOTATO'>('ALL');

  // MODALITÀ MODIFICA STRUTTURA DI DEFAULT (si ripete per tutti i giorni)
  const [isEditingDefaultLayout, setIsEditingDefaultLayout] = useState(false);

  // DETTAGLIO SCHEDA TAVOLO: APRE AL DOPPIO CLICK (MAP) O AL TOCCO SINGOLO (GRID)
  const [openTableDetailsId, setOpenTableDetailsId] = useState<string | null>(null);
  const selectedTable = tables.find(t => t.id === openTableDetailsId) || null;

  // MODALITÀ TRACCIAMENTO ZONA CON MOUSE O DITO
  const [isDrawingZoneMode, setIsDrawingZoneMode] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);

  // PAN / SPOSTAMENTO MAPPA MOBILE: Permette di scorrere la planimetria col dito senza muovere i tavoli
  const [isPanMode, setIsPanMode] = useState(true);

  // Modal Strumenti Rapidi Mobile
  const [showToolsSheet, setShowToolsSheet] = useState(false);

  // Modal Conferma Salvataggio Zona Tracciata
  const [showSaveZoneModal, setShowSaveZoneModal] = useState(false);
  const [newZoneData, setNewZoneData] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 4,
    height: 4
  });
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#f97316');

  // Modal Zone List (per eliminare comodamente le zone)
  const [showZoneManagerModal, setShowZoneManagerModal] = useState(false);

  // Booking Form State
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [resCustomerName, setResCustomerName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resTime, setResTime] = useState('20:30');

  // Dragging state on 0.5m x 0.5m grid
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Double tap detection ref per smartphone/tablet
  const lastTapRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  const dragHasMovedRef = useRef<boolean>(false);

  // Prenotazioni filtrate per la data selezionata
  const dayReservations = reservations.filter(r => {
    const resDate = r.date || r.createdAt?.split('T')[0];
    return resDate === selectedDate;
  });

  const activeReservation = dayReservations.find(r => r.tableId === selectedTable?.id);

  // Auto-fit zoom calculation
  const calculateFitZoom = () => {
    if (typeof window === 'undefined') return 24;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // Su smartphone diamo uno zoom comodo dove i tavoli sono di almeno 32px
      return 30;
    }
    const paddingX = 48;
    const paddingY = 130;
    const availWidth = window.innerWidth - paddingX;
    const availHeight = window.innerHeight - paddingY;
    const maxDim = Math.max(floorWidth, floorHeight);
    const targetPx = Math.min(availWidth, availHeight);
    return Math.max(16, Math.min(42, Math.floor(targetPx / maxDim)));
  };

  const [zoomLevel, setZoomLevel] = useState<number>(calculateFitZoom);

  // ALGORITMO AUTOMATICO TAVOLATE:
  // Se due tavoli 1x1 toccano (coincidenti o adiacenti), diventano AUTOMATICAMENTE una tavolata!
  const syncAutoTavolate = (allTables: RestaurantTable[]) => {
    const isTouching = (a: RestaurantTable, b: RestaurantTable) => {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      const isH = Math.abs(dx - 1.0) < 0.15 && dy < 0.6;
      const isV = Math.abs(dy - 1.0) < 0.15 && dx < 0.6;
      const isCoincident = dx < 0.6 && dy < 0.6;
      return isH || isV || isCoincident;
    };

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
          if (single && single.tavolataGroupId) {
            updateTable({ ...single, tavolataGroupId: undefined, tavolataName: undefined });
          }
        }
      }
    });
  };

  // Tavolata members del tavolo aperto
  const tavolataMembers = selectedTable?.tavolataGroupId
    ? tables.filter(t => t.tavolataGroupId === selectedTable.tavolataGroupId)
    : [];
  const tavolataTotalSeats = tavolataMembers.reduce((sum, t) => sum + t.seats, 0);

  // START DRAG TAVOLO (SOLO SE NON IN PAN MODE E NON IN DRAWING ZONE)
  const handleStartDrag = (clientX: number, clientY: number, table: RestaurantTable) => {
    if (isDrawingZoneMode || (isPanMode && window.innerWidth < 768)) return;
    dragHasMovedRef.current = false;
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

  // MOVE DRAG TAVOLO
  const handleMoveDrag = (clientX: number, clientY: number) => {
    // Se stiamo tracciando una zona:
    if (isDrawingZoneMode && drawingStart && gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const rawX = (clientX - rect.left) / zoomLevel;
      const rawY = (clientY - rect.top) / zoomLevel;
      const snappedX = Math.max(0, Math.min(floorWidth, Math.round(rawX / GRID_STEP) * GRID_STEP));
      const snappedY = Math.max(0, Math.min(floorHeight, Math.round(rawY / GRID_STEP) * GRID_STEP));
      setDrawingCurrent({ x: snappedX, y: snappedY });
      return;
    }

    // Se stiamo trascinando un tavolo:
    if (!draggingTableId || !gridContainerRef.current) return;
    dragHasMovedRef.current = true;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / zoomLevel - dragOffset.x;
    const rawY = (clientY - rect.top) / zoomLevel - dragOffset.y;

    const snappedX = Math.round(rawX / GRID_STEP) * GRID_STEP;
    const snappedY = Math.round(rawY / GRID_STEP) * GRID_STEP;

    const clampedX = Math.max(0, Math.min(floorWidth - 1.0, snappedX));
    const clampedY = Math.max(0, Math.min(floorHeight - 1.0, snappedY));

    const currentTable = tables.find(t => t.id === draggingTableId);
    if (currentTable && (currentTable.x !== clampedX || currentTable.y !== clampedY)) {
      const updated = { ...currentTable, x: clampedX, y: clampedY };
      updateTable(updated);
    }
  };

  // END DRAG TAVOLO O FINE TRACCIAMENTO ZONA
  const handleEndDrag = () => {
    // Fine tracciamento zona
    if (isDrawingZoneMode && drawingStart && drawingCurrent) {
      const minX = Math.min(drawingStart.x, drawingCurrent.x);
      const minY = Math.min(drawingStart.y, drawingCurrent.y);
      const w = Math.abs(drawingCurrent.x - drawingStart.x);
      const h = Math.abs(drawingCurrent.y - drawingStart.y);

      if (w >= 1.0 && h >= 1.0) {
        setNewZoneData({ x: minX, y: minY, width: w, height: h });
        setNewZoneName(`Zona ${zones.length + 1}`);
        setShowSaveZoneModal(true);
      }
      setDrawingStart(null);
      setDrawingCurrent(null);
      return;
    }

    // Fine trascinamento tavolo
    if (draggingTableId) {
      setDraggingTableId(null);
      syncAutoTavolate(tables);
    }
  };

  // TOUCH END / DOUBLE TAP HANDLER SUI TAVOLI (SOLO DOPPIO CLICK APRE LA SCHEDA IN MAPPA!)
  const handleTableTouchEnd = (tableId: string) => {
    if (dragHasMovedRef.current) {
      dragHasMovedRef.current = false;
      return;
    }
    const now = Date.now();
    if (lastTapRef.current.id === tableId && now - lastTapRef.current.time < 350) {
      // Doppio tocco rilevato su smartphone / tablet!
      setOpenTableDetailsId(tableId);
      lastTapRef.current = { id: '', time: 0 };
    } else {
      lastTapRef.current = { id: tableId, time: now };
    }
  };

  // START DRAW ZONE (MOUSE O TOUCH)
  const handleCanvasMouseDown = (clientX: number, clientY: number) => {
    if (!isDrawingZoneMode || !gridContainerRef.current) return;
    const rect = gridContainerRef.current.getBoundingClientRect();
    const rawX = (clientX - rect.left) / zoomLevel;
    const rawY = (clientY - rect.top) / zoomLevel;
    const snappedX = Math.max(0, Math.min(floorWidth, Math.round(rawX / GRID_STEP) * GRID_STEP));
    const snappedY = Math.max(0, Math.min(floorHeight, Math.round(rawY / GRID_STEP) * GRID_STEP));
    setDrawingStart({ x: snappedX, y: snappedY });
    setDrawingCurrent({ x: snappedX, y: snappedY });
  };

  const handleSaveDrawnZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;
    createZone({
      id: `z-${Date.now()}`,
      name: newZoneName,
      x: newZoneData.x,
      y: newZoneData.y,
      widthMeters: newZoneData.width,
      heightMeters: newZoneData.height,
      colorTheme: newZoneColor
    });
    setShowSaveZoneModal(false);
    setIsDrawingZoneMode(false);
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

  const handleDeleteSelectedTable = (tableId: string) => {
    const filtered = tables.filter(t => t.id !== tableId);
    updateAllTables(filtered);
    setOpenTableDetailsId(null);
    setActiveTableId(null);
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

  const toggleEndSeat = (tableId: string) => {
    const current = tables.find(t => t.id === tableId);
    if (!current) return;
    const nextHasEndSeat = !current.hasEndSeat;
    const nextSeats = nextHasEndSeat ? 3 : 2;
    updateTable({
      ...current,
      hasEndSeat: nextHasEndSeat,
      seats: nextSeats
    });
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
      date: selectedDate,
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

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const getTableStatusOnDay = (table: RestaurantTable): TableStatus => {
    const res = dayReservations.find(r => r.tableId === table.id);
    if (res) return 'PRENOTATO';
    return table.status;
  };

  // Filtered tables for the grid view
  const filteredGridTables = tables.filter(t => {
    const status = getTableStatusOnDay(t);
    if (gridFilter === 'ALL') return true;
    return status === gridFilter;
  });

  return (
    <div className="h-full flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 select-none overflow-hidden relative">
      {/* AREA PRINCIPALE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* BANNER MODALITÀ MODIFICA DEFAULT SE ATTIVA */}
        {isEditingDefaultLayout && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-3 py-2 flex items-center justify-between text-xs text-amber-300 shrink-0">
            <span className="font-bold flex items-center space-x-1.5 truncate pr-2">
              <Settings className="w-4 h-4 animate-spin shrink-0" />
              <span className="truncate">Modifica Struttura Default (tutti i giorni)</span>
            </span>
            <button
              onClick={() => {
                updateAllTables(tables);
                setIsEditingDefaultLayout(false);
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-black rounded-xl flex items-center space-x-1 shadow-sm shrink-0 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva Default</span>
            </button>
          </div>
        )}

        {/* TOP MOBILE-FIRST TOOLBAR */}
        <div className="px-3 py-2 bg-zinc-900/95 border-b border-zinc-800/80 flex items-center justify-between gap-2 shrink-0">
          {/* Selettore Giornata Rapido */}
          <div className="flex items-center space-x-1.5">
            <CalendarDays className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="flex items-center space-x-0.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  selectedDate === todayStr ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Oggi
              </button>
              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  selectedDate === tomorrowStr ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Domani
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-zinc-300 font-mono text-xs px-1 focus:outline-none cursor-pointer w-20 sm:w-auto"
              />
            </div>
          </div>

          {/* Segmented Switcher: Elenco Tavoli vs Mappa Sala */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-bold">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                  viewMode === 'GRID' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Elenco</span>
              </button>
              <button
                onClick={() => setViewMode('MAP')}
                className={`px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                  viewMode === 'MAP' ? 'bg-orange-500 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mappa</span>
              </button>
            </div>

            {/* Pulsante Strumenti Mappa (Mobile Drawer) */}
            <button
              onClick={() => setShowToolsSheet(true)}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 active:scale-95 transition-transform"
              title="Strumenti sala e tavoli"
            >
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            </button>
          </div>
        </div>

        {/* GUIDA RAPIDA SE IN MODALITÀ TRACCIAMENTO */}
        {isDrawingZoneMode && (
          <div className="bg-orange-500/20 text-orange-300 border-b border-orange-500/30 px-3 py-1.5 text-xs flex items-center justify-between shrink-0">
            <span>👉 Traccia con dito o mouse il rettangolo della nuova zona.</span>
            <button onClick={() => setIsDrawingZoneMode(false)} className="underline text-orange-200 font-bold">Annulla</button>
          </div>
        )}

        {/* VISTA 1: ELENCO TAVOLI POS (Mobile-First Touch Grid) */}
        {viewMode === 'GRID' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setGridFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  gridFilter === 'ALL' ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                Tutti ({tables.length})
              </button>
              <button
                onClick={() => setGridFilter('LIBERO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  gridFilter === 'LIBERO' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Liberi ({tables.filter(t => getTableStatusOnDay(t) === 'LIBERO').length})</span>
              </button>
              <button
                onClick={() => setGridFilter('OCCUPATO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  gridFilter === 'OCCUPATO' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Occupati ({tables.filter(t => getTableStatusOnDay(t) === 'OCCUPATO').length})</span>
              </button>
              <button
                onClick={() => setGridFilter('PRENOTATO')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 ${
                  gridFilter === 'PRENOTATO' ? 'bg-amber-600 text-white' : 'bg-zinc-900 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Prenotati ({dayReservations.length})</span>
              </button>
            </div>

            {/* Grid of Tables */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              {filteredGridTables.map(table => {
                const status = getTableStatusOnDay(table);
                const isSelected = activeTableId === table.id;
                const isTavolata = Boolean(table.tavolataGroupId);
                const tableReservation = dayReservations.find(r => r.tableId === table.id);

                // Trova ordine attivo se occupato
                const activeOrder = orders.find(o => o.tableId === table.id && o.status !== 'COMPLETATO' && o.status !== 'PAGATO');

                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      setActiveTableId(table.id);
                      setOpenTableDetailsId(table.id);
                    }}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer active:scale-95 shadow-md relative min-h-[110px] ${
                      status === 'LIBERO'
                        ? 'bg-zinc-900/90 border-emerald-500/40 hover:border-emerald-500'
                        : status === 'OCCUPATO'
                        ? 'bg-zinc-900/90 border-rose-500/50 hover:border-rose-500'
                        : 'bg-zinc-900/90 border-amber-500/50 hover:border-amber-500'
                    } ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                  >
                    {/* Header Card */}
                    <div className="flex items-center justify-between">
                      <span className="font-black text-base sm:text-lg text-white">
                        #{table.number}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-zinc-800 text-zinc-300">
                        {table.seats}p
                      </span>
                    </div>

                    {/* Stato Centrale */}
                    <div className="my-1.5">
                      {status === 'LIBERO' && (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Libero</span>
                        </span>
                      )}
                      {status === 'OCCUPATO' && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-rose-400 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            <span>Occupato</span>
                          </span>
                          {activeOrder && (
                            <span className="text-xs font-mono font-bold text-white block">
                              € {activeOrder.totalAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                      {status === 'PRENOTATO' && (
                        <div className="space-y-0.5">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Prenotato</span>
                          </span>
                          {tableReservation && (
                            <span className="text-[10px] text-zinc-300 font-semibold truncate block">
                              {tableReservation.customerName} ({tableReservation.reservationTime})
                            </span>
                          )}
                        </div>
                      )}
                      {isTavolata && (
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-tight block">
                          {table.tavolataName}
                        </span>
                      )}
                    </div>

                    {/* Footer Quick Action */}
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-zinc-500 font-medium">Tocca per dettagli</span>
                      <span className="text-orange-400 font-bold">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 2: MAPPA GRAFICA PLANIMETRIA 500 m² (Scorrevole su Mobile) */}
        {viewMode === 'MAP' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Sotto-Toolbar Mappa: Toggle Pan Mode vs Sposta Tavoli */}
            <div className="px-3 py-1.5 bg-zinc-950/90 border-b border-zinc-800/80 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPanMode(!isPanMode)}
                  className={`px-2.5 py-1 rounded-lg font-bold flex items-center space-x-1.5 border transition-all ${
                    isPanMode
                      ? 'bg-zinc-800 text-white border-zinc-700'
                      : 'bg-orange-500 text-white border-orange-400'
                  }`}
                >
                  {isPanMode ? <Hand className="w-3.5 h-3.5 text-sky-400" /> : <Move className="w-3.5 h-3.5 text-white" />}
                  <span>{isPanMode ? 'Modalità Scorri Mappa' : 'Modalità Sposta Tavoli'}</span>
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1 bg-zinc-900 rounded-xl p-0.5 border border-zinc-800">
                <button
                  onClick={() => setZoomLevel(Math.max(16, zoomLevel - 4))}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Riduci"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(calculateFitZoom())}
                  className="px-2 py-0.5 text-[11px] font-mono text-zinc-300"
                  title="Adatta"
                >
                  Fit
                </button>
                <button
                  onClick={() => setZoomLevel(Math.min(50, zoomLevel + 4))}
                  className="p-1 text-zinc-400 hover:text-white"
                  title="Ingrandisci"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Container Scrollabile della Mappa (Senza touch-none per scrolling fluido col dito!) */}
            <div
              className={`flex-1 overflow-auto p-3 sm:p-6 bg-zinc-950 relative ${
                isDrawingZoneMode ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              {/* Box Planimetria 500 m² (22.5m x 22.5m) */}
              <div
                ref={gridContainerRef}
                style={{
                  width: `${floorWidth * zoomLevel}px`,
                  height: `${floorHeight * zoomLevel}px`
                }}
                onMouseDown={(e) => handleCanvasMouseDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
                onMouseUp={handleEndDrag}
                onTouchStart={(e) => {
                  if (e.touches[0] && (isDrawingZoneMode || !isPanMode)) {
                    handleCanvasMouseDown(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches[0] && (isDrawingZoneMode || !isPanMode)) {
                    handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onTouchEnd={handleEndDrag}
                className="relative bg-zinc-900/50 border border-zinc-800 shadow-2xl rounded-2xl select-none"
              >
                {/* Griglia a 0.5m x 0.5m */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <defs>
                    <pattern id="grid-half-meter" width={zoomLevel * GRID_STEP} height={zoomLevel * GRID_STEP} patternUnits="userSpaceOnUse">
                      <path d={`M ${zoomLevel * GRID_STEP} 0 L 0 0 0 ${zoomLevel * GRID_STEP}`} fill="none" stroke="#a1a1aa" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-half-meter)" />
                </svg>

                {/* ZONE TRACCIATE NEL LOCALE */}
                {zones.map(zone => (
                  <div
                    key={zone.id}
                    style={{
                      left: `${zone.x * zoomLevel}px`,
                      top: `${zone.y * zoomLevel}px`,
                      width: `${zone.widthMeters * zoomLevel}px`,
                      height: `${zone.heightMeters * zoomLevel}px`,
                      borderColor: `${zone.colorTheme}88`
                    }}
                    className="absolute rounded-xl border border-dashed bg-zinc-800/25 p-1.5 flex flex-col justify-between group pointer-events-auto"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        style={{ color: zone.colorTheme }}
                        className="text-[10px] font-bold uppercase tracking-wider truncate"
                      >
                        {zone.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Eliminare la zona "${zone.name}"?`)) {
                            deleteZone(zone.id);
                          }
                        }}
                        className="p-1 rounded bg-zinc-900/80 text-zinc-400 hover:text-rose-400 opacity-60 hover:opacity-100 transition-opacity"
                        title="Elimina Zona"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[9px] font-mono text-zinc-500 self-end">
                      {zone.widthMeters}m x {zone.heightMeters}m
                    </span>
                  </div>
                ))}

                {/* ANTEPRIMA RETTANGOLO DURANTE TRACCIAMENTO ZONA */}
                {isDrawingZoneMode && drawingStart && drawingCurrent && (
                  <div
                    style={{
                      left: `${Math.min(drawingStart.x, drawingCurrent.x) * zoomLevel}px`,
                      top: `${Math.min(drawingStart.y, drawingCurrent.y) * zoomLevel}px`,
                      width: `${Math.max(1, Math.abs(drawingCurrent.x - drawingStart.x)) * zoomLevel}px`,
                      height: `${Math.max(1, Math.abs(drawingCurrent.y - drawingStart.y)) * zoomLevel}px`
                    }}
                    className="absolute border-2 border-dashed border-orange-400 bg-orange-500/25 rounded-xl pointer-events-none z-30 flex items-center justify-center text-white font-mono text-xs font-bold shadow-lg"
                  >
                    <span>
                      {Math.abs(drawingCurrent.x - drawingStart.x).toFixed(1)}m x {Math.abs(drawingCurrent.y - drawingStart.y).toFixed(1)}m
                    </span>
                  </div>
                )}

                {/* TAVOLI 1m x 1m: SPOSTAMENTO LIBERO; APRE LA SCHEDA AL DOPPIO CLICK */}
                {tables.map(table => {
                  const isSelected = activeTableId === table.id;
                  const isDetailsOpen = openTableDetailsId === table.id;
                  const isTavolata = Boolean(table.tavolataGroupId);
                  const sizePx = zoomLevel * 1.0;
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
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        handleTableTouchEnd(table.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setOpenTableDetailsId(table.id);
                      }}
                      style={{
                        width: `${sizePx}px`,
                        height: `${sizePx}px`,
                        left: `${leftPx}px`,
                        top: `${topPx}px`
                      }}
                      className={`absolute border-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-grab active:cursor-grabbing shadow-md select-none ${statusClasses} ${
                        isDetailsOpen
                          ? 'ring-2 ring-white scale-105 z-30'
                          : isSelected
                          ? 'ring-1 ring-white/70 z-25'
                          : 'z-20'
                      }`}
                    >
                      {/* Sedie */}
                      <div className="absolute -top-1 w-3 h-1 rounded-full bg-zinc-400/80 pointer-events-none" />
                      <div className="absolute -bottom-1 w-3 h-1 rounded-full bg-zinc-400/80 pointer-events-none" />
                      {table.hasEndSeat && (
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-amber-400 pointer-events-none" />
                      )}

                      <span className="text-[11px] font-black leading-none pointer-events-none">T{table.number}</span>
                      <span className="text-[9px] font-bold opacity-80 mt-0.5 pointer-events-none">{table.seats}p</span>

                      {isTavolata && (
                        <span className="absolute -top-2 bg-purple-600 text-white text-[8px] font-black px-1 rounded-sm shadow-sm uppercase pointer-events-none">
                          UNITA
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop su Mobile per Scheda Tavolo */}
      {selectedTable && (
        <div
          className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-50 animate-fade-in"
          onClick={() => setOpenTableDetailsId(null)}
        />
      )}

      {/* SCHEDA DETTAGLIO TAVOLO (Bottom Sheet su Mobile / Sidebar su Desktop) */}
      {selectedTable && (
        <div className="fixed lg:relative inset-x-0 bottom-0 lg:bottom-0 z-50 lg:z-auto w-full lg:w-80 xl:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 p-4 space-y-3.5 shadow-2xl rounded-t-3xl lg:rounded-none max-h-[85dvh] lg:max-h-none overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          {/* Drag Handle su Mobile */}
          <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto lg:hidden" />

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
            <button
              onClick={() => setOpenTableDetailsId(null)}
              className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Azione Primaria: PRENDI COMANDA */}
          <button
            onClick={handleTakeOrder}
            className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-xl shadow-orange-500/25 border border-orange-400"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>PRENDI COMANDA (TAVOLO #{selectedTable.number})</span>
          </button>

          {/* Toggle Rapido Posti (2 o 3 persone) */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Capacità Tavolo 1x1:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => selectedTable.hasEndSeat && toggleEndSeat(selectedTable.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  !selectedTable.hasEndSeat
                    ? 'bg-zinc-800 text-white border-zinc-600'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                2 Persone (Standard)
              </button>
              <button
                onClick={() => !selectedTable.hasEndSeat && toggleEndSeat(selectedTable.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                  selectedTable.hasEndSeat
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                }`}
              >
                + 3° Posto Estremo
              </button>
            </div>
          </div>

          {/* Status Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Stato ({selectedDate}):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleChangeStatus('LIBERO')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedTable.status === 'LIBERO'
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                    : 'bg-zinc-950 text-emerald-400 border-zinc-800'
                }`}
              >
                Libero
              </button>
              <button
                onClick={() => handleChangeStatus('OCCUPATO')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedTable.status === 'OCCUPATO'
                    ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                    : 'bg-zinc-950 text-rose-400 border-zinc-800'
                }`}
              >
                Occupato
              </button>
              <button
                onClick={() => handleChangeStatus('PRENOTATO')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  selectedTable.status === 'PRENOTATO'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                    : 'bg-zinc-950 text-amber-400 border-zinc-800'
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
                Tavoli adiacenti uniti: {tavolataMembers.map(t => `#${t.number}`).join(', ')}. Allontanando il tavolo si scioglierà automaticamente.
              </p>
            </div>
          )}

          {/* Prenotazione per la data selezionata */}
          {activeReservation ? (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-amber-300">
                <span>Prenotazione Confermata</span>
                <span className="font-mono font-black">{activeReservation.reservationTime}</span>
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
                  className="w-full py-2.5 text-xs text-zinc-300 hover:text-white border border-dashed border-zinc-700 rounded-xl flex items-center justify-center space-x-1.5 bg-zinc-950/60"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>+ Prenota Tavolo ({selectedDate})</span>
                </button>
              ) : (
                <form onSubmit={handleSaveReservation} className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-200">Nuova Prenotazione</span>
                    <button type="button" onClick={() => setShowBookingForm(false)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nome cliente"
                    value={resCustomerName}
                    onChange={(e) => setResCustomerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                  />
                  <div className="flex space-x-1.5">
                    <input
                      type="tel"
                      placeholder="Telefono"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
                    />
                    <input
                      type="time"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-amber-500 text-white font-black rounded-xl">
                    Conferma Prenotazione
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ELIMINA TAVOLO IN MODALITÀ MODIFICA DEFAULT */}
          {isEditingDefaultLayout && (
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleDeleteSelectedTable(selectedTable.id)}
                className="w-full py-2.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina Tavolo #{selectedTable.number}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODALE STRUMENTI RAPIDI MOBILE (Drawer con Azioni Avanzate) */}
      {showToolsSheet && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl max-h-[85dvh] flex flex-col pb-safe">
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white">Strumenti Capo Sala</h3>
              <button
                onClick={() => setShowToolsSheet(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {/* Tasto Modifica Default Layout */}
              <button
                onClick={() => {
                  setIsEditingDefaultLayout(!isEditingDefaultLayout);
                  setShowToolsSheet(false);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between active:scale-98 transition-all ${
                  isEditingDefaultLayout
                    ? 'bg-amber-500 text-black border-amber-400 font-black'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-xs block">Modifica Struttura Default</span>
                    <span className="text-[10px] text-zinc-400">Si ripete per tutti i giorni</span>
                  </div>
                </div>
                <span className="text-xs font-bold">{isEditingDefaultLayout ? 'Attivo' : 'Avvia'}</span>
              </button>

              {/* Tasto Aggiungi Tavolo */}
              <button
                onClick={() => {
                  handleAddTable();
                  setShowToolsSheet(false);
                }}
                className="w-full p-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-left flex items-center justify-between active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-xs block">+ Aggiungi Nuovo Tavolo</span>
                    <span className="text-[10px] text-zinc-400">Dimensioni 1m x 1m</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-400">+1</span>
              </button>

              {/* Tasto Traccia Zona */}
              <button
                onClick={() => {
                  setIsDrawingZoneMode(true);
                  setViewMode('MAP');
                  setShowToolsSheet(false);
                }}
                className="w-full p-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-left flex items-center justify-between active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <PenTool className="w-4 h-4 text-orange-400" />
                  <div>
                    <span className="font-bold text-xs block">Traccia Nuova Zona</span>
                    <span className="text-[10px] text-zinc-400">Disegna col dito o mouse</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-400">Disegna</span>
              </button>

              {/* Tasto Gestione Zone */}
              <button
                onClick={() => {
                  setShowToolsSheet(false);
                  setShowZoneManagerModal(true);
                }}
                className="w-full p-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-200 text-left flex items-center justify-between active:scale-98"
              >
                <div className="flex items-center space-x-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="font-bold text-xs block">Gestisci ed Elimina Zone</span>
                    <span className="text-[10px] text-zinc-400">{zones.length} zone create</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-zinc-400">Vedi ({zones.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE SALVATAGGIO ZONA TRACCIATA */}
      {showSaveZoneModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveDrawnZone} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm">Salva Zona Tracciata</h3>
              <button type="button" onClick={() => setShowSaveZoneModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono">
              Dimensioni: {newZoneData.width.toFixed(1)}m x {newZoneData.height.toFixed(1)}m
              <br />
              Coordinate: ({newZoneData.x.toFixed(1)}m, {newZoneData.y.toFixed(1)}m)
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome Zona:</label>
              <input
                type="text"
                required
                placeholder="Es. Dehor Esterno, Sala Forno, Veranda"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Colore Tema:</label>
              <div className="flex space-x-2">
                {['#f97316', '#38bdf8', '#10b981', '#a855f7', '#f43f5e', '#eab308'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewZoneColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      newZoneColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-lg">
              Conferma e Crea Zona
            </button>
          </form>
        </div>
      )}

      {/* MODALE GESTIONE ED ELIMINAZIONE ZONE */}
      {showZoneManagerModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-bold text-white text-sm">Gestione Zone ({zones.length})</h3>
              <button type="button" onClick={() => setShowZoneManagerModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {zones.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">Nessuna zona creata. Usa "Traccia Zona" per disegnarne una col dito o mouse.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {zones.map(z => (
                  <div key={z.id} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block" style={{ color: z.colorTheme }}>{z.name}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{z.widthMeters}m x {z.heightMeters}m</span>
                    </div>
                    <button
                      onClick={() => deleteZone(z.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400"
                      title="Elimina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowZoneManagerModal(false);
                setIsDrawingZoneMode(true);
                setViewMode('MAP');
              }}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Traccia Nuova Zona</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
