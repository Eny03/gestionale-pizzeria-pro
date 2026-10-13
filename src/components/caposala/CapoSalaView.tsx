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
  Settings,
  Check,
  Trash2,
  PenTool,
  MousePointer,
  HelpCircle
} from 'lucide-react';

export const CapoSalaView: React.FC = () => {
  const {
    zones,
    tables,
    reservations,
    updateTable,
    updateAllTables,
    createZone,
    deleteZone,
    createReservation,
    toggleEndSeat,
    setCurrentRole,
    activeTableId,
    setActiveTableId,
    selectedDate,
    setSelectedDate
  } = useApp();

  // Dimensioni locale: 500 m² (Quadrato da 22.5m x 22.5m ≈ 506 m²)
  const floorWidth = 22.5;
  const floorHeight = 22.5;
  const GRID_STEP = 0.5; // Risoluzione griglia 0.5m x 0.5m

  // MODALITÀ MODIFICA STRUTTURA DI DEFAULT (si ripete per tutti i giorni)
  const [isEditingDefaultLayout, setIsEditingDefaultLayout] = useState(false);

  // DETTAGLIO SCHEDA TAVOLO: APRE SOLO AL DOPPIO CLICK / DOPPIO TOCCO!
  const [openTableDetailsId, setOpenTableDetailsId] = useState<string | null>(null);
  const selectedTable = tables.find(t => t.id === openTableDetailsId) || null;

  // MODALITÀ TRACCIAMENTO ZONA CON MOUSE O DITO
  const [isDrawingZoneMode, setIsDrawingZoneMode] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number; y: number } | null>(null);

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
    if (typeof window === 'undefined') return 18;
    const paddingX = window.innerWidth < 768 ? 20 : 48;
    const paddingY = window.innerWidth < 768 ? 170 : 130;
    const availWidth = window.innerWidth - paddingX;
    const availHeight = window.innerHeight - paddingY;
    const maxDim = Math.max(floorWidth, floorHeight);
    const targetPx = Math.min(availWidth, availHeight);
    return Math.max(12, Math.min(42, Math.floor(targetPx / maxDim)));
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
          if (single.tavolataGroupId) {
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

  // START DRAG TAVOLO (SE NON STIAMO TRACCIANDO UNA ZONA)
  const handleStartDrag = (clientX: number, clientY: number, table: RestaurantTable) => {
    if (isDrawingZoneMode) return;
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

  // TOUCH END / DOUBLE TAP HANDLER SUI TAVOLI (SOLO DOPPIO CLICK APRE LA SCHEDA!)
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

  return (
    <div className="h-full flex flex-col lg:flex-row bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* AREA PLANIMETRIA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* BANNER MODALITÀ MODIFICA DEFAULT SE ATTIVA */}
        {isEditingDefaultLayout && (
          <div className="bg-amber-500/20 border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between text-xs text-amber-300">
            <span className="font-bold flex items-center space-x-1.5">
              <Settings className="w-3.5 h-3.5 animate-spin" />
              <span>Modalità Modifica Struttura di Default (La disposizione salvata si ripeterà per ogni giornata)</span>
            </span>
            <button
              onClick={() => {
                updateAllTables(tables);
                setIsEditingDefaultLayout(false);
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-lg flex items-center space-x-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salva e Chiudi Default</span>
            </button>
          </div>
        )}

        {/* Top Minimal Toolbar con Selettore Data, Struttura Default e Tracciamento Zone */}
        <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          {/* Selettore Giornata (visibile se non stiamo modificando il default) */}
          {!isEditingDefaultLayout ? (
            <div className="flex items-center space-x-1.5">
              <CalendarDays className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    selectedDate === todayStr ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Oggi
                </button>
                <button
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    selectedDate === tomorrowStr ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Domani
                </button>
                <button
                  onClick={() => setSelectedDate(dayAfterStr)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
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
          ) : (
            <div className="font-extrabold text-sm text-white flex items-center space-x-2">
              <span>Struttura Tavoli Master</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Default tutti i giorni
              </span>
            </div>
          )}

          {/* Azioni Principali: Modifica Default, Traccia Zona, Gestione Zone */}
          <div className="flex items-center space-x-1.5">
            {/* TASTO MODIFICA STRUTTURA DI DEFAULT */}
            <button
              onClick={() => setIsEditingDefaultLayout(!isEditingDefaultLayout)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                isEditingDefaultLayout
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
              title="Modifica il layout dei tavoli che si ripete per tutti i giorni"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{isEditingDefaultLayout ? 'Fine Modifica Default' : 'Modifica Default'}</span>
            </button>

            {/* TASTO TRACCIA ZONA CON DITO O MOUSE */}
            <button
              onClick={() => setIsDrawingZoneMode(!isDrawingZoneMode)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                isDrawingZoneMode
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md animate-pulse'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
              title="Disegna un rettangolo con dito o mouse per creare una zona"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isDrawingZoneMode ? 'Traccia con Dito...' : 'Traccia Zona'}</span>
            </button>

            {/* GESTIONE ZONE (ELIMINA / VISUALIZZA) */}
            <button
              onClick={() => setShowZoneManagerModal(true)}
              className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700 text-xs font-semibold"
              title="Gestisci ed elimina zone"
            >
              Zone ({zones.length})
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/60">
              <button
                onClick={() => setZoomLevel(Math.max(12, zoomLevel - 3))}
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
                onClick={() => setZoomLevel(Math.min(45, zoomLevel + 3))}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Ingrandisci"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleAddTable}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Tavolo</span>
            </button>
          </div>
        </div>

        {/* GUIDA RAPIDA MINIMALE SE IN MODALITÀ TRACCIAMENTO */}
        {isDrawingZoneMode && (
          <div className="bg-orange-500/20 text-orange-300 border-b border-orange-500/30 px-3 py-1 text-[11px] flex items-center justify-between">
            <span>👉 Trascina il mouse o il dito sul quadrato per tracciare il rettangolo della nuova zona.</span>
            <button onClick={() => setIsDrawingZoneMode(false)} className="underline text-orange-200">Annulla</button>
          </div>
        )}

        {/* Canvas Planimetria 500 m² (22.5m x 22.5m, Risoluzione Griglia 0.5m x 0.5m) */}
        <div
          className={`flex-1 overflow-auto p-2 sm:p-4 bg-zinc-950 flex items-center justify-center relative touch-none ${
            isDrawingZoneMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={(e) => handleCanvasMouseDown(e.clientX, e.clientY)}
          onTouchStart={(e) => e.touches[0] && handleCanvasMouseDown(e.touches[0].clientX, e.touches[0].clientY)}
          onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
          onTouchMove={(e) => e.touches[0] && handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY)}
          onMouseUp={handleEndDrag}
          onTouchEnd={handleEndDrag}
          onClick={() => {
            if (!isDrawingZoneMode) {
              setActiveTableId(null);
            }
          }}
        >
          <div
            ref={gridContainerRef}
            style={{
              width: `${floorWidth * zoomLevel}px`,
              height: `${floorHeight * zoomLevel}px`,
              backgroundSize: `${zoomLevel * GRID_STEP}px ${zoomLevel * GRID_STEP}px`,
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `
            }}
            className="relative bg-zinc-900/90 rounded-2xl border border-zinc-700/80 shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Righello Orizzontale Metro (X) */}
            {Array.from({ length: Math.ceil(floorWidth) }).map((_, i) => (
              <span
                key={`meter-x-${i}`}
                style={{ left: `${i * zoomLevel + 2}px` }}
                className="absolute top-0.5 text-[8px] font-mono text-zinc-600 pointer-events-none select-none"
              >
                {i}m
              </span>
            ))}

            {/* Righello Verticale Metro (Y) */}
            {Array.from({ length: Math.ceil(floorHeight) }).map((_, i) => (
              <span
                key={`meter-y-${i}`}
                style={{ top: `${i * zoomLevel + 2}px` }}
                className="absolute left-0.5 text-[8px] font-mono text-zinc-600 pointer-events-none select-none"
              >
                {i}m
              </span>
            ))}

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

            {/* ANTEPRIMA RETTANGOLO DURANTE IL TRACCIAMENTO ZONA CON DITO/MOUSE */}
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

            {/* TAVOLI 1m x 1m: SPOSTAMENTO LIBERO; APRE LA SCHEDA SOLO AL DOPPIO CLICK! */}
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
                    // DOPPIO CLICK APRE LA SCHEDA TAVOLO!
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
                  title="Trascina per spostare • Doppio click per aprire scheda tavolo"
                >
                  {/* Sedia Alto (Posto 1) */}
                  <div className="absolute -top-1 w-3 h-1 rounded-full bg-zinc-400/80 pointer-events-none" />
                  {/* Sedia Basso (Posto 2) */}
                  <div className="absolute -bottom-1 w-3 h-1 rounded-full bg-zinc-400/80 pointer-events-none" />
                  {/* Sedia Estremo (3° posto opzionale) */}
                  {table.hasEndSeat && (
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-3 rounded-full bg-amber-400 pointer-events-none" />
                  )}

                  <span className="text-[11px] font-black leading-none pointer-events-none">T{table.number}</span>
                  <span className="text-[9px] font-bold opacity-80 mt-0.5 pointer-events-none">{table.seats}p</span>

                  {/* Badge Tavolata Automatica */}
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

      {/* SCHEDA DETTAGLIO TAVOLO (APRE SOLO AL DOPPIO CLICK / DOPPIO TOCCO) */}
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
            <button onClick={() => setOpenTableDetailsId(null)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
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
            <span className="text-[11px] font-semibold text-zinc-400 block mb-1">Capacità Tavolo 1x1:</span>
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
                Tavoli adiacenti uniti: {tavolataMembers.map(t => `#${t.number}`).join(', ')}. Allontanando il tavolo si scioglierà automaticamente.
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

          {/* ELIMINA TAVOLO IN MODALITÀ MODIFICA DEFAULT */}
          {isEditingDefaultLayout && (
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleDeleteSelectedTable(selectedTable.id)}
                className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs rounded-xl border border-rose-500/30 flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Elimina Tavolo #{selectedTable.number}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODALE SALVATAGGIO ZONA TRACCIATA COL DITO/MOUSE */}
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
