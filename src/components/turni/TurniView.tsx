import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Users,
  Sparkles,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  ShieldAlert,
  Clock,
  Plus
} from 'lucide-react';
import {
  StaffAvailability,
  AvailabilityPreference,
  DayStaffRequirement,
  ShiftType,
  StaffRole
} from '../../../shared/types';

export const TurniView: React.FC = () => {
  const {
    staff,
    requirements,
    availabilities,
    shiftAssignments,
    fairnessReport,
    submitAvailability,
    updateRequirements,
    generateShifts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DIPENDENTI' | 'MANAGER' | 'ROSTER'>('MANAGER');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || 'st-1');

  // Form nuova data fabbisogno
  const [newReqDate, setNewReqDate] = useState('2026-10-19');
  const [newReqShift, setNewReqShift] = useState<ShiftType>('CENA');
  const [newReqWaiters, setNewReqWaiters] = useState(3);
  const [newReqPizzaioli, setNewReqPizzaioli] = useState(2);
  const [newReqCooks, setNewReqCooks] = useState(1);
  const [newReqBaristas, setNewReqBaristas] = useState(1);

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  // Date uniche definite nei requisiti
  const dates = Array.from(new Set(requirements.map(r => r.date))).sort();

  const handleSetPreference = (date: string, shiftType: ShiftType, preference: AvailabilityPreference) => {
    if (!selectedStaff) return;
    const avail: StaffAvailability = {
      id: `av-${selectedStaff.id}-${date}-${shiftType}`,
      staffId: selectedStaff.id,
      date,
      shiftType,
      preference
    };
    submitAvailability(avail);
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: DayStaffRequirement = {
      date: newReqDate,
      shiftType: newReqShift,
      requiredWaiters: newReqWaiters,
      requiredPizzaioli: newReqPizzaioli,
      requiredCooks: newReqCooks,
      requiredBaristas: newReqBaristas
    };
    updateRequirements([...requirements, newReq]);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* HEADER GESTIONE TURNI & HR */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>Frontend Gestione Turni & HR</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                FAIR SCHEDULER
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Disponibilità dipendenti, fabbisogno manager & algoritmo di assegnazione equa dei weekend
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('DIPENDENTI')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'DIPENDENTI'
                ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>1. INTERFACCIA DIPENDENTI</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'MANAGER'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. MANAGER & ALGORITMO</span>
          </button>

          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all ${
              activeTab === 'ROSTER'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. ROSTER PIANIFICATO</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-950/60 text-white font-mono text-[11px]">
              {shiftAssignments.length}
            </span>
          </button>
        </div>
      </div>

      {/* CONTENUTO PRINCIPALE */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* TAB 1: INTERFACCIA DIPENDENTI (INSERIMENTO DISPONIBILITÀ) */}
        {activeTab === 'DIPENDENTI' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-base font-extrabold text-white">
                  Dichiarazione Disponibilità e Preferenze Mensili
                </h2>
                <p className="text-xs text-slate-400">
                  Camerieri, pizzaioli e cuochi esprimono preferenze o indisponibilità turno per turno.
                </p>
              </div>

              {/* Selettore Dipendente */}
              <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-xs text-slate-400">Seleziona Profilo:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="bg-transparent font-bold text-cyan-400 text-xs focus:outline-none cursor-pointer"
                >
                  {staff.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrice Date & Turni per il dipendente selezionato */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-750">
                  <tr>
                    <th className="p-3.5">Data del Servizio</th>
                    <th className="p-3.5">Turno</th>
                    <th className="p-3.5 text-center">Stato / Preferenza Espressa</th>
                    <th className="p-3.5 text-center">Imposta Scelta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {requirements.map((req) => {
                    const currentAvail = availabilities.find(
                      a => a.staffId === selectedStaffId && a.date === req.date && a.shiftType === req.shiftType
                    );
                    const pref = currentAvail?.preference || 'DISPONIBILE';

                    return (
                      <tr key={`${req.date}-${req.shiftType}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-white font-mono">
                          {req.date}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.shiftType === 'PRANZO'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                          }`}>
                            {req.shiftType}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          {pref === 'PREFERITO' && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px]">
                              ★ TURNO PREFERITO
                            </span>
                          )}
                          {pref === 'DISPONIBILE' && (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                              ✓ Disponibile
                            </span>
                          )}
                          {pref === 'NON_DISPONIBILE' && (
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px]">
                              ✕ NON DISPONIBILE
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => handleSetPreference(req.date, req.shiftType, 'PREFERITO')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 text-xs font-semibold"
                              title="Indica come preferito"
                            >
                              Preferito
                            </button>
                            <button
                              onClick={() => handleSetPreference(req.date, req.shiftType, 'DISPONIBILE')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
                              title="Disponibile standard"
                            >
                              Disponibile
                            </button>
                            <button
                              onClick={() => handleSetPreference(req.date, req.shiftType, 'NON_DISPONIBILE')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 border border-slate-700 text-xs font-semibold"
                              title="Escludi per indisponibilità"
                            >
                              Non Disp.
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INTERFACCIA MANAGER & SCHEDULING ALGORITMICO */}
        {activeTab === 'MANAGER' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Box Trigger Algoritmo & Report Equità */}
            <div className="bg-gradient-to-r from-orange-950/40 to-slate-900 p-6 rounded-2xl border border-orange-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block mb-1">
                  MOTORE DI OTTIMIZZAZIONE EURISTICA
                </span>
                <h2 className="text-xl font-black text-white">Algoritmo di Scheduling Equo</h2>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Assegna i turni massimizzando l'equità: bilancia le ore totali, distribuisce uniformemente i weekend lavorati tra colleghi dello stesso ruolo e rispetta tassativamente le indisponibilità.
                </p>
              </div>

              <button
                onClick={() => generateShifts()}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm flex items-center space-x-2.5 shadow-xl shadow-orange-500/30 shrink-0 transition-all hover:scale-105"
              >
                <Sparkles className="w-5 h-5 text-amber-200" />
                <span>GENERA TURNI EQUI ORA</span>
              </button>
            </div>

            {/* Metriche di Equità (Fairness Report) se generato */}
            {fairnessReport && (
              <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Report di Equità Generato</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400">Punteggio Fairness:</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {fairnessReport.fairnessScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fairnessReport.staffSummary.map(s => (
                    <div key={s.staffId} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{s.staffName}</span>
                        <span className="text-[10px] uppercase text-cyan-400">{s.role}</span>
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>Turni Assegnati:</span>
                        <span className="font-mono font-bold text-white">{s.shiftsCount}</span>
                      </div>
                      <div className="text-slate-300 flex justify-between">
                        <span>Weekend Lavorati:</span>
                        <span className="font-mono font-bold text-amber-400">{s.weekendShiftsCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabella Fabbisogno Giornaliero Manager */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Fabbisogno Personale per Giorno & Turno</h3>
                  <p className="text-xs text-slate-400">Specifica quante figure di ciascun ruolo servono per ogni serata.</p>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-bold text-[11px] border-b border-slate-750">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Turno</th>
                    <th className="p-3 text-center">Camerieri</th>
                    <th className="p-3 text-center">Pizzaioli</th>
                    <th className="p-3 text-center">Cuochi</th>
                    <th className="p-3 text-center">Baristi</th>
                    <th className="p-3">Note Serata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {requirements.map((req, idx) => (
                    <tr key={`${req.date}-${req.shiftType}`} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-white">{req.date}</td>
                      <td className="p-3 font-semibold">{req.shiftType}</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-400">
                        {req.requiredWaiters}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-orange-400">
                        {req.requiredPizzaioli}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-emerald-400">
                        {req.requiredCooks}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-purple-400">
                        {req.requiredBaristas}
                      </td>
                      <td className="p-3 text-slate-400 italic text-[11px]">{req.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CALENDARIO ROSTER ASSEGNATO */}
        {activeTab === 'ROSTER' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white">Roster Operativo Assegnato</h2>
                <p className="text-xs text-slate-400">
                  Visualizzazione completa dei turni e dei dipendenti assegnati al lavoro.
                </p>
              </div>
            </div>

            {shiftAssignments.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500">
                <CalendarDays className="w-12 h-12 stroke-1 text-slate-700 mb-2" />
                <p className="text-base font-bold">Nessun turno generato</p>
                <p className="text-xs text-slate-500 mt-1">
                  Vai sulla scheda "Manager & Algoritmo" e fai clic su "Genera Turni Equi Ora".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requirements.map((req) => {
                  const assignedThisShift = shiftAssignments.filter(
                    a => a.date === req.date && a.shiftType === req.shiftType
                  );

                  return (
                    <div
                      key={`${req.date}-${req.shiftType}`}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-white text-sm">{req.date}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            {req.shiftType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {assignedThisShift.length} operatori assegnati
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {assignedThisShift.map(assignment => (
                          <div
                            key={assignment.id}
                            className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white">{assignment.staffName}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                                {assignment.role}
                              </span>
                            </div>

                            {assignment.isManualOverride && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                                OVERRIDE
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
