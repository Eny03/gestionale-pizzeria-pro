import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable, RestaurantZone, Reservation, TableStatus } from '../../../shared/types';
import {
  LayoutGrid,
  Plus,
  Users,
  Clock,
  Link,
  Unlink,
  Phone,
  BookmarkPlus,
  ZoomIn,
  ZoomOut,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

export const CapoSalaView: React.FC = () => {
  const {
    zones,
    tables,
    reservations,
    updateTable,
    createZone,
    createReservation,
    mergeTables,
    splitTavolata,
    toggleEndSeat
  } = useApp();

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(44); // Pixel per metro (scalabile)

  // Modale nuova zona nel quadrato
  const [showNewZoneModal, setShowNewZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneX, setNewZoneX] = useState(1);
  const [newZoneY, setNewZoneY] = useState(1);
  const [newZoneWidth, setNewZoneWidth] = useState(8);
  const [newZoneHeight, setNewZoneHeight] = useState(7);
  const [newZoneColor, setNewZoneColor] = useState('#ea580c');

  // Modale unione tavolata
  const [tableToMergeWith, setTableToMergeWith] = useState<string>('');

  // Dragging state on 1m x 1m grid
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Prenotazione form state
  const [resCustomerName, setResCustomerName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resTime, setResTime] = useState('20:30');
  const [resDuration, setResDuration] = useState(90);
  const [resNotes, setResNotes] = useState('');

  // Dimensioni del grande quadrato del locale (18m x 18m)
  const TOTAL_FLOOR_METERS = 18;

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const activeReservation = reservations.find(r => r.id === selectedTable?.activeReservationId);

  // Se il tavolo selezionato è parte di una tavolata, trova tutti i tavoli del gruppo
  const tavolataMembers = selectedTable?.tavolataGroupId
    ? tables.filter(t => t.tavolataGroupId === selectedTable.tavolataGroupId)
    : [];

  const tavolataTotalSeats = tavolataMembers.reduce((sum, t) => sum + t.seats, 0);

  // Gestione Drag & Drop sulla griglia 1m x 1m (snap esatto al metro)
  const handleMouseDownTable = (e: React.MouseEvent, table: RestaurantTable) => {
    e.stopPropagation();
    setSelectedTableId(table.id);
    setDraggingTableId(table.id);

    if (gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const clickXInMeters = (e.clientX - rect.left) / zoomLevel;
      const clickYInMeters = (e.clientY - rect.top) / zoomLevel;
      setDragOffset({
        x: clickXInMeters - table.x,
        y: clickYInMeters - table.y
      });
    }
  };

  const handleMouseMoveGrid = (e: React.MouseEvent) => {
    if (!draggingTableId || !gridContainerRef.current) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const rawXInMeters = (e.clientX - rect.left) / zoomLevel - dragOffset.x;
    const rawYInMeters = (e.clientY - rect.top) / zoomLevel - dragOffset.y;

    // SNAP AL METRO ESATTO (oppure mezzo metro per allineamento perfetto)
    const snappedX = Math.round(rawXInMeters);
    const snappedY = Math.round(rawYInMeters);

    const clampedX = Math.max(0, Math.min(TOTAL_FLOOR_METERS - 1, snappedX));
    const clampedY = Math.max(0, Math.min(TOTAL_FLOOR_METERS - 1, snappedY));

    const currentTable = tables.find(t => t.id === draggingTableId);
    if (currentTable && (currentTable.x !== clampedX || currentTable.y !== clampedY)) {
      updateTable({
        ...currentTable,
        x: clampedX,
        y: clampedY
      });
    }
  };

  const handleMouseUpGrid = () => {
    setDraggingTableId(null);
  };

  // Creazione nuova zona all'interno del quadrato del locale
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: RestaurantZone = {
      id: `z-${Date.now()}`,
      name: newZoneName,
      x: Number(newZoneX),
      y: Number(newZoneY),
      widthMeters: Number(newZoneWidth),
      heightMeters: Number(newZoneHeight),
      colorTheme: newZoneColor
    };

    createZone(newZone);
    setShowNewZoneModal(false);
    setNewZoneName('');
  };

  // Aggiungi un nuovo tavolo 1m x 1m
  const handleAddTable = () => {
    const nextNumber = Math.max(0, ...tables.map(t => t.number)) + 1;
    const newTable: RestaurantTable = {
      id: `t-${Date.now()}`,
      number: nextNumber,
      x: 3,
      y: 3,
      widthMeters: 1.0, // TAVOLO ESATTAMENTE 1m x 1m
      heightMeters: 1.0,
      shape: 'SQUARE',
      seats: 2, // 2 PERSONE STANDARD
      hasEndSeat: false,
      status: 'LIBERO'
    };

    updateTable(newTable);
    setSelectedTableId(newTable.id);
  };

  // Accorpa due tavoli in una Tavolata
  const handleMergeTables = () => {
    if (!selectedTable || !tableToMergeWith) return;
    mergeTables([selectedTable.id, tableToMergeWith]);
    setTableToMergeWith('');
  };

  // Sciogli tavolata
  const handleSplitTavolata = () => {
    if (!selectedTable?.tavolataGroupId) return;
    splitTavolata(selectedTable.tavolataGroupId);
  };

  // Aggiorna stato tavolo
  const handleChangeStatus = (status: TableStatus) => {
    if (!selectedTable) return;

    // Se è parte di una tavolata, aggiorna lo stato di tutti i tavoli uniti
    if (selectedTable.tavolataGroupId) {
      tavolataMembers.forEach(t => {
        updateTable({ ...t, status });
      });
    } else {
      updateTable({
        ...selectedTable,
        status,
        activeReservationId: status === 'LIBERO' ? undefined : selectedTable.activeReservationId
      });
    }
  };

  // Salva prenotazione
  const handleSaveReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !resCustomerName) return;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      tableId: selectedTable.id,
      tableNumber: selectedTable.number,
      customerName: resCustomerName,
      customerPhone: resPhone,
      guestsCount: resGuests,
      reservationTime: resTime,
      expectedDurationMinutes: resDuration,
      notes: resNotes,
      status: 'CONFERMATA',
      createdAt: new Date().toISOString()
    };

    createReservation(newRes);
    handleChangeStatus('PRENOTATO');

    setResCustomerName('');
    setResPhone('');
    setResNotes('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* AREA CENTRALE: GRANDE QUADRATO DEL LOCALE CON ZONE E TAVOLI */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        {/* Toolbar Superiore */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                <LayoutGrid className="w-4 h-4 text-orange-400" />
                <span>Planimetria Unificata Locale</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {TOTAL_FLOOR_METERS}m x {TOTAL_FLOOR_METERS}m
              </span>
            </div>

            <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Tavoli 1m x 1m (2-3 posti). Affianca per creare Tavolate.</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setZoomLevel(Math.max(32, zoomLevel - 4))}
                className="p-1 hover:text-white text-slate-400"
                title="Riduci Zoom"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-mono text-slate-300">{Math.round((zoomLevel / 44) * 100)}%</span>
              <button
                onClick={() => setZoomLevel(Math.min(64, zoomLevel + 4))}
                className="p-1 hover:text-white text-slate-400"
                title="Aumenta Zoom"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Aggiungi Zona & Tavolo */}
            <button
              onClick={() => setShowNewZoneModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nuova Zona</span>
            </button>

            <button
              onClick={handleAddTable}
              className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tavolo 1m x 1m</span>
            </button>
          </div>
        </div>

        {/* CONTAINER CANVAS METRICO INTERATTIVO */}
        <div
          className="flex-1 overflow-auto p-6 bg-slate-950 flex items-center justify-center relative cursor-crosshair"
          onMouseMove={handleMouseMoveGrid}
          onMouseUp={handleMouseUpGrid}
          onClick={() => setSelectedTableId(null)}
        >
          {/* IL GRANDE QUADRATO GLOBALE DEL LOCALE (18m x 18m) */}
          <div
            ref={gridContainerRef}
            style={{
              width: `${TOTAL_FLOOR_METERS * zoomLevel}px`,
              height: `${TOTAL_FLOOR_METERS * zoomLevel}px`,
              backgroundSize: `${zoomLevel}px ${zoomLevel}px`,
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
              `
            }}
            className="relative bg-slate-900 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Righello Metrico (1m, 2m, ...) */}
            {Array.from({ length: TOTAL_FLOOR_METERS }).map((_, i) => (
              <span
                key={`metric-x-${i}`}
                style={{ left: `${i * zoomLevel + 3}px` }}
                className="absolute top-1 text-[9px] font-mono text-slate-500 pointer-events-none select-none"
              >
                {i}m
              </span>
            ))}
            {Array.from({ length: TOTAL_FLOOR_METERS }).map((_, i) => (
              <span
                key={`metric-y-${i}`}
                style={{ top: `${i * zoomLevel + 3}px` }}
                className="absolute left-1 text-[9px] font-mono text-slate-500 pointer-events-none select-none"
              >
                {i}m
              </span>
            ))}

            {/* 1. ZONE SUDDIVISE ALL'INTERNO DEL GRANDE QUADRATO */}
            {zones.map(zone => (
              <div
                key={zone.id}
                style={{
                  left: `${zone.x * zoomLevel}px`,
                  top: `${zone.y * zoomLevel}px`,
                  width: `${zone.widthMeters * zoomLevel}px`,
                  height: `${zone.heightMeters * zoomLevel}px`,
                  borderColor: zone.colorTheme
                }}
                className="absolute rounded-2xl border-2 border-dashed bg-slate-800/25 pointer-events-none p-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ backgroundColor: `${zone.colorTheme}33`, color: zone.colorTheme, borderColor: zone.colorTheme }}
                    className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-lg border backdrop-blur-sm"
                  >
                    {zone.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {zone.widthMeters}m x {zone.heightMeters}m
                  </span>
                </div>
              </div>
            ))}

            {/* 2. TAVOLI 1M X 1M E TAVOLATE ACCORPATE */}
            {tables.map(table => {
              const isSelected = selectedTableId === table.id;
              const isTavolata = Boolean(table.tavolataGroupId);
              const tableSizePx = 1.0 * zoomLevel; // 1m x 1m esatto
              const leftPx = table.x * zoomLevel;
              const topPx = table.y * zoomLevel;

              let statusBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
              if (table.status === 'OCCUPATO') statusBg = 'bg-rose-500/20 border-rose-500 text-rose-300';
              if (table.status === 'PRENOTATO') statusBg = 'bg-amber-500/20 border-amber-500 text-amber-300';

              return (
                <div
                  key={table.id}
                  onMouseDown={(e) => handleMouseDownTable(e, table)}
                  style={{
                    width: `${tableSizePx}px`,
                    height: `${tableSizePx}px`,
                    left: `${leftPx}px`,
                    top: `${topPx}px`
                  }}
                  className={`absolute cursor-grab active:cursor-grabbing border-2 rounded-xl flex flex-col items-center justify-center transition-all select-none shadow-md ${statusBg} ${
                    isTavolata ? 'ring-2 ring-purple-500 border-purple-400' : ''
                  } ${isSelected ? 'ring-4 ring-orange-400 z-30 scale-105' : 'z-20'}`}
                >
                  {/* Sedia Superiore (Posto 1) */}
                  <div className="absolute -top-1.5 w-4 h-1.5 rounded-full bg-slate-400/80"></div>

                  {/* Sedia Inferiore (Posto 2) */}
                  <div className="absolute -bottom-1.5 w-4 h-1.5 rounded-full bg-slate-400/80"></div>

                  {/* Sedia all'Estremo (Posto 3 opzionale) */}
                  {table.hasEndSeat && (
                    <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-full bg-amber-400" title="3° Posto Estremo"></div>
                  )}

                  {/* Nome Tavolo */}
                  <span className="text-[10px] font-black leading-tight">
                    T{table.number}
                  </span>

                  {/* Icona Posti & Capacità */}
                  <span className="text-[9px] font-bold opacity-90 flex items-center space-x-0.5">
                    <Users className="w-2.5 h-2.5" />
                    <span>{table.seats}p</span>
                  </span>

                  {/* Badge Tavolata */}
                  {isTavolata && (
                    <span className="absolute -top-2.5 text-[8px] font-black uppercase bg-purple-600 text-white px-1 rounded-sm shadow-sm">
                      UNITA
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PANNELLO LATERALE: GESTIONE TAVOLO, TAVOLATA & PRENOTAZIONI */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 text-orange-400" />
            <span>Dettaglio Tavolo & Tavolata</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tavoli 1m x 1m. Affianca o unisci per comporre tavolate per gruppi numerosi.
          </p>
        </div>

        {selectedTable ? (
          <div className="p-4 space-y-4 flex-1">
            {/* SCHEDA TAVOLO SELEZIONATO */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-base font-black text-white">Tavolo #{selectedTable.number}</span>
                  <span className="text-xs text-slate-400 block font-mono">
                    Dimensione: 1m x 1m • Coordinate: ({selectedTable.x}m, {selectedTable.y}m)
                  </span>
                </div>
                <span className="text-sm font-black text-emerald-400 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {selectedTable.seats} Posti
                </span>
              </div>

              {/* TASTO TERZO POSTO AGLI ESTREMI (2 o 3 persone) */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">3° Posto a Capotavola:</span>
                  <span className="text-[11px] text-slate-400">
                    {selectedTable.hasEndSeat ? 'Attivo (Ospita 3 persone)' : 'Disattivato (2 persone)'}
                  </span>
                </div>
                <button
                  onClick={() => toggleEndSeat(selectedTable.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    selectedTable.hasEndSeat
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {selectedTable.hasEndSeat ? '✓ 3 Persone' : '+ Aggiungi 3°'}
                </button>
              </div>

              {/* SEZIONE TAVOLATA ACCORPATA */}
              <div className="pt-2 border-t border-slate-700/60 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-400 block">
                  GESTIONE TAVOLATA (AFFIANCAMENTO):
                </span>

                {selectedTable.tavolataGroupId ? (
                  <div className="bg-purple-950/40 border border-purple-500/40 p-2.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-purple-200 font-bold">
                      <span>{selectedTable.tavolataName}</span>
                      <span className="font-mono bg-purple-900/60 px-2 py-0.5 rounded">
                        Totale: {tavolataTotalSeats} persone
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Tavoli uniti: {tavolataMembers.map(t => `#${t.number}`).join(', ')}
                    </p>
                    <button
                      onClick={handleSplitTavolata}
                      className="w-full py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-lg border border-rose-500/30 flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                      <span>Sciogli Tavolata (Separa i tavoli)</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <select
                      value={tableToMergeWith}
                      onChange={(e) => setTableToMergeWith(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Unisci con tavolo...</option>
                      {tables
                        .filter(t => t.id !== selectedTable.id)
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            Tavolo #{t.number} ({t.seats} posti)
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={handleMergeTables}
                      disabled={!tableToMergeWith}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg disabled:opacity-50 flex items-center space-x-1 shrink-0"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Unisci</span>
                    </button>
                  </div>
                )}
              </div>

              {/* PULSANTI CAMBIO STATO */}
              <div className="pt-2 border-t border-slate-700/60">
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                  Stato Tavolo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleChangeStatus('LIBERO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'LIBERO'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    Libero
                  </button>
                  <button
                    onClick={() => handleChangeStatus('OCCUPATO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'OCCUPATO'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-800 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Occupato
                  </button>
                  <button
                    onClick={() => handleChangeStatus('PRENOTATO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'PRENOTATO'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                        : 'bg-slate-800 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    Prenotato
                  </button>
                </div>
              </div>
            </div>

            {/* PRENOTAZIONE TAVOLO O TAVOLATA */}
            {activeReservation && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>Prenotazione:</span>
                  <span className="font-mono">{activeReservation.reservationTime}</span>
                </div>
                <div className="text-white font-semibold">
                  {activeReservation.customerName} ({activeReservation.guestsCount} pers.)
                </div>
                {activeReservation.customerPhone && (
                  <div className="text-slate-400 flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{activeReservation.customerPhone}</span>
                  </div>
                )}
              </div>
            )}

            {/* Form Nuova Prenotazione */}
            <form onSubmit={handleSaveReservation} className="bg-slate-800/40 p-4 rounded-xl border border-slate-750 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 uppercase">
                <BookmarkPlus className="w-4 h-4 text-orange-400" />
                <span>Prenota Tavolo #{selectedTable.number}</span>
              </h3>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Nome Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Famiglia Rossi"
                  value={resCustomerName}
                  onChange={(e) => setResCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Telefono:</label>
                  <input
                    type="tel"
                    placeholder="+39 340..."
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">N. Persone:</label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={resGuests}
                    onChange={(e) => setResGuests(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-400 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Orario:</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-orange-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Durata Stimata:</label>
                  <select
                    value={resDuration}
                    onChange={(e) => setResDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value={60}>60 minuti</option>
                    <option value={90}>90 minuti</option>
                    <option value={120}>120 minuti</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all mt-1"
              >
                Conferma Prenotazione
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
            <LayoutGrid className="w-12 h-12 text-slate-700 stroke-1 mb-2" />
            <p className="text-sm font-semibold">Nessun tavolo selezionato</p>
            <p className="text-xs text-slate-500 mt-1">
              Fai clic su un tavolo 1m x 1m per gestirne i posti (2 o 3 persone) o per unirlo in una tavolata.
            </p>
          </div>
        )}
      </div>

      {/* MODALE NUOVA ZONA NEL QUADRATO DEL LOCALE */}
      {showNewZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateZone} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Disegna Nuova Zona nella Planimetria</h3>
            <p className="text-xs text-slate-400">
              Definisci la posizione (X, Y) e le dimensioni (metri) all'interno del quadrato del locale.
            </p>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nome Zona:</label>
              <input
                type="text"
                required
                placeholder="Es. Dehors Esterno, Sala Giardino..."
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Posizione X (metri):</label>
                <input
                  type="number"
                  min={0}
                  max={TOTAL_FLOOR_METERS - 2}
                  value={newZoneX}
                  onChange={(e) => setNewZoneX(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Posizione Y (metri):</label>
                <input
                  type="number"
                  min={0}
                  max={TOTAL_FLOOR_METERS - 2}
                  value={newZoneY}
                  onChange={(e) => setNewZoneY(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Larghezza (metri):</label>
                <input
                  type="number"
                  min={2}
                  max={TOTAL_FLOOR_METERS}
                  value={newZoneWidth}
                  onChange={(e) => setNewZoneWidth(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Altezza (metri):</label>
                <input
                  type="number"
                  min={2}
                  max={TOTAL_FLOOR_METERS}
                  value={newZoneHeight}
                  onChange={(e) => setNewZoneHeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Colore Identificativo Zona:</label>
              <div className="flex space-x-2">
                {['#ea580c', '#0284c7', '#10b981', '#8b5cf6', '#ec4899', '#eab308'].map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewZoneColor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      newZoneColor === color ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewZoneModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold"
              >
                Inserisci nella Planimetria
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
