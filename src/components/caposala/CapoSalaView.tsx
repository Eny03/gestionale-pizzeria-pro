import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantTable, RestaurantZone, Reservation, TableStatus, TableShape } from '../../../shared/types';
import {
  LayoutGrid,
  Plus,
  Users,
  Clock,
  Calendar,
  CheckCircle,
  Move,
  Maximize2,
  Trash2,
  Phone,
  BookmarkPlus
} from 'lucide-react';

export const CapoSalaView: React.FC = () => {
  const { zones, tables, reservations, updateTable, createZone, createReservation } = useApp();

  const [activeZoneId, setActiveZoneId] = useState<string>(zones[0]?.id || 'z-1');
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  // Modale nuova zona
  const [showNewZoneModal, setShowNewZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneWidth, setNewZoneWidth] = useState(10);
  const [newZoneHeight, setNewZoneHeight] = useState(8);

  // Modale nuovo tavolo
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(4);
  const [newTableShape, setNewTableShape] = useState<TableShape>('RECTANGLE');

  // Dragging state on 1m x 1m grid
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Prenotazione form state
  const [resCustomerName, setResCustomerName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(4);
  const [resTime, setResTime] = useState('20:30');
  const [resDuration, setResDuration] = useState(90);
  const [resNotes, setResNotes] = useState('');

  const activeZone = zones.find(z => z.id === activeZoneId) || zones[0];
  const zoneTables = tables.filter(t => t.zoneId === activeZone?.id);
  const selectedTable = tables.find(t => t.id === selectedTableId);
  const activeReservation = reservations.find(r => r.id === selectedTable?.activeReservationId);

  // Scala metrica: 1 metro = 54 pixel
  const METERS_TO_PX = 54;

  // Gestione Drag & Drop sulla griglia 1m x 1m
  const handleMouseDownTable = (e: React.MouseEvent, table: RestaurantTable) => {
    e.stopPropagation();
    setSelectedTableId(table.id);
    setDraggingTableId(table.id);

    if (gridContainerRef.current) {
      const rect = gridContainerRef.current.getBoundingClientRect();
      const clickXInMeters = (e.clientX - rect.left) / METERS_TO_PX;
      const clickYInMeters = (e.clientY - rect.top) / METERS_TO_PX;
      setDragOffset({
        x: clickXInMeters - table.x,
        y: clickYInMeters - table.y
      });
    }
  };

  const handleMouseMoveGrid = (e: React.MouseEvent) => {
    if (!draggingTableId || !gridContainerRef.current || !activeZone) return;

    const rect = gridContainerRef.current.getBoundingClientRect();
    const rawXInMeters = (e.clientX - rect.left) / METERS_TO_PX - dragOffset.x;
    const rawYInMeters = (e.clientY - rect.top) / METERS_TO_PX - dragOffset.y;

    // Snap to 0.5m grid
    const snappedX = Math.round(rawXInMeters * 2) / 2;
    const snappedY = Math.round(rawYInMeters * 2) / 2;

    const clampedX = Math.max(0.5, Math.min(activeZone.widthMeters - 1.5, snappedX));
    const clampedY = Math.max(0.5, Math.min(activeZone.heightMeters - 1.5, snappedY));

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

  // Creazione nuova zona
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName) return;

    const newZone: RestaurantZone = {
      id: `z-${Date.now()}`,
      name: newZoneName,
      widthMeters: Number(newZoneWidth),
      heightMeters: Number(newZoneHeight),
      colorTheme: '#ea580c'
    };

    createZone(newZone);
    setActiveZoneId(newZone.id);
    setShowNewZoneModal(false);
    setNewZoneName('');
  };

  // Aggiungi tavolo nella zona corrente
  const handleAddTable = () => {
    if (!activeZone) return;

    const nextNumber = Math.max(0, ...tables.map(t => t.number)) + 1;
    const newTable: RestaurantTable = {
      id: `t-${Date.now()}`,
      number: nextNumber,
      zoneId: activeZone.id,
      x: 1.5,
      y: 1.5,
      widthMeters: newTableShape === 'ROUND' ? 1.2 : 1.3,
      heightMeters: newTableShape === 'ROUND' ? 1.2 : 0.9,
      shape: newTableShape,
      seats: newTableSeats,
      status: 'LIBERO'
    };

    updateTable(newTable);
    setSelectedTableId(newTable.id);
    setShowAddTableModal(false);
  };

  // Aggiorna stato tavolo (Libero, Occupato, Prenotato)
  const handleChangeStatus = (status: TableStatus) => {
    if (!selectedTable) return;
    updateTable({
      ...selectedTable,
      status,
      activeReservationId: status === 'LIBERO' ? undefined : selectedTable.activeReservationId
    });
  };

  // Registra prenotazione
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
    updateTable({
      ...selectedTable,
      status: 'PRENOTATO',
      activeReservationId: newRes.id
    });

    // Reset form
    setResCustomerName('');
    setResPhone('');
    setResNotes('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* AREA CENTRALE: GRIGLIA CANVAS 1M X 1M */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-800">
        {/* Toolbar Superiore: Zone e Aggiunta Tavoli */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Tabs Zone */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {zones.map(z => (
              <button
                key={z.id}
                onClick={() => {
                  setActiveZoneId(z.id);
                  setSelectedTableId(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeZone?.id === z.id
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {z.name} ({z.widthMeters}m x {z.heightMeters}m)
              </button>
            ))}

            <button
              onClick={() => setShowNewZoneModal(true)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 text-xs font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuova Zona</span>
            </button>
          </div>

          {/* Quick Actions Canvas */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Griglia metrica 1m x 1m • Trascina per spostare
            </span>
            <button
              onClick={() => setShowAddTableModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Tavolo</span>
            </button>
          </div>
        </div>

        {/* CONTAINER CANVAS METRICO INTERATTIVO */}
        <div
          className="flex-1 overflow-auto p-8 bg-slate-950 flex items-center justify-center relative cursor-crosshair"
          onMouseMove={handleMouseMoveGrid}
          onMouseUp={handleMouseUpGrid}
          onClick={() => setSelectedTableId(null)}
        >
          {activeZone && (
            <div
              ref={gridContainerRef}
              style={{
                width: `${activeZone.widthMeters * METERS_TO_PX}px`,
                height: `${activeZone.heightMeters * METERS_TO_PX}px`,
                backgroundSize: `${METERS_TO_PX}px ${METERS_TO_PX}px`,
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
                `
              }}
              className="relative bg-slate-900/90 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Etichette metriche su assi (1m, 2m, ...) */}
              {Array.from({ length: activeZone.widthMeters }).map((_, i) => (
                <span
                  key={`x-${i}`}
                  style={{ left: `${i * METERS_TO_PX + 4}px` }}
                  className="absolute top-1 text-[9px] font-mono text-slate-500 pointer-events-none"
                >
                  {i}m
                </span>
              ))}
              {Array.from({ length: activeZone.heightMeters }).map((_, i) => (
                <span
                  key={`y-${i}`}
                  style={{ top: `${i * METERS_TO_PX + 4}px` }}
                  className="absolute left-1 text-[9px] font-mono text-slate-500 pointer-events-none"
                >
                  {i}m
                </span>
              ))}

              {/* TAVOLI DISPOSTI NELLA GRIGLIA */}
              {zoneTables.map(table => {
                const isSelected = selectedTableId === table.id;
                const widthPx = table.widthMeters * METERS_TO_PX;
                const heightPx = table.heightMeters * METERS_TO_PX;
                const leftPx = table.x * METERS_TO_PX;
                const topPx = table.y * METERS_TO_PX;

                // Colori per stato
                let statusBg = 'bg-emerald-500/20 border-emerald-500 text-emerald-300';
                if (table.status === 'OCCUPATO') statusBg = 'bg-rose-500/20 border-rose-500 text-rose-300';
                if (table.status === 'PRENOTATO') statusBg = 'bg-amber-500/20 border-amber-500 text-amber-300';

                return (
                  <div
                    key={table.id}
                    onMouseDown={(e) => handleMouseDownTable(e, table)}
                    style={{
                      width: `${widthPx}px`,
                      height: `${heightPx}px`,
                      left: `${leftPx}px`,
                      top: `${topPx}px`
                    }}
                    className={`absolute cursor-grab active:cursor-grabbing border-2 flex flex-col items-center justify-center transition-shadow shadow-md select-none ${
                      table.shape === 'ROUND' ? 'rounded-full' : 'rounded-xl'
                    } ${statusBg} ${isSelected ? 'ring-4 ring-sky-400 ring-offset-2 ring-offset-slate-900 z-20' : 'z-10'}`}
                  >
                    {/* Sedie stilizzate attorno al tavolo */}
                    <div className="text-[10px] font-extrabold uppercase tracking-tight">
                      T #{table.number}
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-semibold opacity-90">
                      <Users className="w-3 h-3" />
                      <span>{table.seats}</span>
                    </div>

                    <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">
                      {table.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PANNELLO LATERALE: GESTIONE DETTAGLIO TAVOLO & PRENOTAZIONI */}
      <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 border-slate-800 flex flex-col justify-between overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h2 className="font-extrabold text-base text-white flex items-center space-x-2">
            <LayoutGrid className="w-4 h-4 text-sky-400" />
            <span>Gestione Tavolo & Prenotazioni</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clicca su un tavolo nella griglia per impostarne lo stato o prenotarlo.
          </p>
        </div>

        {selectedTable ? (
          <div className="p-4 space-y-5 flex-1">
            {/* Scheda Tavolo Selezionato */}
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-white">Tavolo #{selectedTable.number}</span>
                <span className="text-xs font-mono text-slate-400">
                  {selectedTable.seats} Posti • {selectedTable.shape}
                </span>
              </div>

              {/* Pulsanti Cambio Stato */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                  Imposta Stato Tavolo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleChangeStatus('LIBERO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'LIBERO'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                    }`}
                  >
                    Libero
                  </button>
                  <button
                    onClick={() => handleChangeStatus('OCCUPATO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'OCCUPATO'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-slate-800 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
                    }`}
                  >
                    Occupato
                  </button>
                  <button
                    onClick={() => handleChangeStatus('PRENOTATO')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                      selectedTable.status === 'PRENOTATO'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                        : 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                    }`}
                  >
                    Prenotato
                  </button>
                </div>
              </div>
            </div>

            {/* Dettagli Prenotazione Esistente se attiva */}
            {activeReservation && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>Prenotazione Attiva:</span>
                  <span className="font-mono">{activeReservation.reservationTime}</span>
                </div>
                <div className="text-white font-semibold">{activeReservation.customerName} ({activeReservation.guestsCount} pers.)</div>
                {activeReservation.customerPhone && (
                  <div className="text-slate-400 flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{activeReservation.customerPhone}</span>
                  </div>
                )}
                {activeReservation.notes && (
                  <div className="text-slate-300 italic text-[11px]">Note: "{activeReservation.notes}"</div>
                )}
              </div>
            )}

            {/* Form Nuova Prenotazione per questo tavolo */}
            <form onSubmit={handleSaveReservation} className="bg-slate-800/40 p-4 rounded-xl border border-slate-750 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5 uppercase">
                <BookmarkPlus className="w-4 h-4 text-sky-400" />
                <span>Assegna Nuova Prenotazione</span>
              </h3>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Nome Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Es. Mario Rossi"
                  value={resCustomerName}
                  onChange={(e) => setResCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">N. Persone:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={resGuests}
                    onChange={(e) => setResGuests(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Durata Stimata:</label>
                  <select
                    value={resDuration}
                    onChange={(e) => setResDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value={60}>60 minuti</option>
                    <option value={90}>90 minuti</option>
                    <option value={120}>120 minuti</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Note speciali:</label>
                <input
                  type="text"
                  placeholder="Seggiolone, compleanno..."
                  value={resNotes}
                  onChange={(e) => setResNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
              >
                Salva Prenotazione al Tavolo #{selectedTable.number}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
            <LayoutGrid className="w-12 h-12 text-slate-700 stroke-1 mb-2" />
            <p className="text-sm font-semibold">Nessun tavolo selezionato</p>
            <p className="text-xs text-slate-500 mt-1">
              Fai clic su un tavolo per visualizzarne i dettagli o trascinalo per riposizionarlo sulla griglia metrica.
            </p>
          </div>
        )}
      </div>

      {/* MODALE CREA NUOVA ZONA */}
      {showNewZoneModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateZone} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Crea Nuova Zona Sala</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Nome Zona:</label>
              <input
                type="text"
                required
                placeholder="Es. Dehors Esterno, Terrazza..."
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Larghezza (metri):</label>
                <input
                  type="number"
                  min={4}
                  max={25}
                  value={newZoneWidth}
                  onChange={(e) => setNewZoneWidth(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Altezza (metri):</label>
                <input
                  type="number"
                  min={4}
                  max={25}
                  value={newZoneHeight}
                  onChange={(e) => setNewZoneHeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
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
                Crea Zona
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODALE AGGIUNGI TAVOLO */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">Nuovo Tavolo in {activeZone?.name}</h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Posti a Sedere:</label>
              <select
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value={2}>2 Posti</option>
                <option value={4}>4 Posti</option>
                <option value={6}>6 Posti</option>
                <option value={8}>8 Posti</option>
                <option value={10}>10 Posti</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Forma:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['RECTANGLE', 'ROUND', 'SQUARE'] as TableShape[]).map(shape => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => setNewTableShape(shape)}
                    className={`py-2 rounded-lg text-xs font-semibold border ${
                      newTableShape === shape
                        ? 'bg-sky-500 text-white border-sky-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {shape === 'RECTANGLE' ? 'Rettangolo' : shape === 'ROUND' ? 'Rotondo' : 'Quadrato'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTableModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleAddTable}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold"
              >
                Posiziona sulla Griglia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
