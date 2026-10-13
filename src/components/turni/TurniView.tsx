import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CalendarDays, Users, Sparkles, CheckCircle, UserCheck } from 'lucide-react';
import { ShiftType, AvailabilityPreference, StaffAvailability } from '../../../shared/types';

export const TurniView: React.FC = () => {
  const {
    staff,
    requirements,
    availabilities,
    shiftAssignments,
    fairnessReport,
    submitAvailability,
    generateShifts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ROSTER' | 'DISPONIBILITA' | 'FABBISOGNO'>('ROSTER');
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || 'st-1');

  const handleSetPreference = (date: string, shiftType: ShiftType, preference: AvailabilityPreference) => {
    const avail: StaffAvailability = {
      id: `av-${selectedStaffId}-${date}-${shiftType}`,
      staffId: selectedStaffId,
      date,
      shiftType,
      preference
    };
    submitAvailability(avail);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header Minimal */}
      <div className="px-3 py-2 sm:px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-sm text-white">Turni & Personale</span>
        </div>

        <div className="flex items-center space-x-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'ROSTER' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Roster</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-900 text-white font-mono text-[11px]">
              {shiftAssignments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('DISPONIBILITA')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'DISPONIBILITA' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Disponibilità</span>
          </button>
          <button
            onClick={() => setActiveTab('FABBISOGNO')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition-all ${
              activeTab === 'FABBISOGNO' ? 'bg-orange-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Fabbisogno</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {/* ROSTER */}
        {activeTab === 'ROSTER' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-md">
              <div>
                <span className="font-bold text-sm text-white">Assegnazione Turni</span>
                {fairnessReport && (
                  <span className="text-xs text-emerald-400 font-mono ml-2 font-bold">
                    Fairness: {fairnessReport.fairnessScore}%
                  </span>
                )}
              </div>
              <button
                onClick={() => generateShifts()}
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow-md transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Genera Turni Equi</span>
              </button>
            </div>

            {shiftAssignments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500">
                <CalendarDays className="w-10 h-10 stroke-1 text-zinc-700 mb-2" />
                <p className="text-sm font-semibold">Nessun turno generato</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {requirements.map(req => {
                  const assigned = shiftAssignments.filter(
                    a => a.date === req.date && a.shiftType === req.shiftType
                  );
                  return (
                    <div key={`${req.date}-${req.shiftType}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-lg">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="font-mono font-bold text-xs text-white">{req.date}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-orange-400">
                          {req.shiftType}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {assigned.map(a => (
                          <div key={a.id} className="bg-zinc-950 p-2 rounded-xl border border-zinc-800 flex justify-between items-center text-xs">
                            <span className="font-semibold text-white">{a.staffName}</span>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                              {a.role}
                            </span>
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

        {/* DISPONIBILITA */}
        {activeTab === 'DISPONIBILITA' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Dipendente:</span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-orange-400 font-bold focus:outline-none"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden shadow-xl">
              {requirements.map(req => {
                const currentAvail = availabilities.find(
                  a => a.staffId === selectedStaffId && a.date === req.date && a.shiftType === req.shiftType
                );
                const pref = currentAvail?.preference || 'DISPONIBILE';
                return (
                  <div key={`${req.date}-${req.shiftType}`} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-800/40">
                    <div>
                      <span className="font-mono font-bold text-white block">{req.date}</span>
                      <span className="text-[11px] text-zinc-400">{req.shiftType}</span>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSetPreference(req.date, req.shiftType, 'PREFERITO')}
                        className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                          pref === 'PREFERITO' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        Preferito
                      </button>
                      <button
                        onClick={() => handleSetPreference(req.date, req.shiftType, 'DISPONIBILE')}
                        className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                          pref === 'DISPONIBILE' ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        Disponibile
                      </button>
                      <button
                        onClick={() => handleSetPreference(req.date, req.shiftType, 'NON_DISPONIBILE')}
                        className={`px-2 py-1 rounded text-xs font-semibold border transition-all ${
                          pref === 'NON_DISPONIBILE' ? 'bg-rose-500/20 text-rose-400 border-rose-500' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        Non Disp.
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FABBISOGNO */}
        {activeTab === 'FABBISOGNO' && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 divide-y divide-zinc-800 overflow-hidden shadow-xl">
              <div className="p-3 border-b border-zinc-800 font-bold text-xs text-zinc-300 uppercase">
                Fabbisogno per Serata
              </div>
              {requirements.map(req => (
                <div key={`${req.date}-${req.shiftType}`} className="p-3 flex items-center justify-between text-xs hover:bg-zinc-800/40">
                  <div>
                    <span className="font-mono font-bold text-white block">{req.date}</span>
                    <span className="text-[11px] text-zinc-400">{req.shiftType}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs">
                    <span className="text-amber-400">{req.requiredWaiters} cam.</span>
                    <span className="text-orange-400">{req.requiredPizzaioli} pizz.</span>
                    <span className="text-emerald-400">{req.requiredCooks} cuochi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
