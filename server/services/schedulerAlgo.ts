import {
  StaffMember,
  StaffRole,
  StaffAvailability,
  DayStaffRequirement,
  ShiftAssignment,
  ShiftType,
  SchedulingFairnessReport
} from '../../shared/types.js';

export class SchedulerAlgo {
  /**
   * Genera una pianificazione turni equa rispettando:
   * 1. Requisiti di organico per ogni data e turno
   * 2. Disponibilità e preferenze dei lavoratori (esclude NON_DISPONIBILE)
   * 3. Equità dei weekend (venerdì sera, sabato, domenica)
   * 4. Bilanciamento ore e carico di lavoro tra colleghi dello stesso ruolo
   * 5. Mantenimento degli override manuali bloccati dal manager
   */
  public static generateSchedule(
    staff: StaffMember[],
    requirements: DayStaffRequirement[],
    availabilities: StaffAvailability[],
    existingAssignments: ShiftAssignment[] = []
  ): { assignments: ShiftAssignment[]; report: SchedulingFairnessReport } {
    // Mantieni le assegnazioni bloccate o manuali dell'amministratore
    const preservedAssignments = existingAssignments.filter(a => a.locked || a.isManualOverride);
    const newAssignments: ShiftAssignment[] = [...preservedAssignments];

    // Tracciatori di carico dinamico durante la generazione
    const assignedCounts = new Map<string, number>(); // staffId -> numero di turni
    const weekendCounts = new Map<string, number>();  // staffId -> numero di turni nel weekend
    const hoursCounts = new Map<string, number>();    // staffId -> monte ore stimato

    // Inizializza con lo storico del dipendente
    staff.forEach(s => {
      assignedCounts.set(s.id, 0);
      weekendCounts.set(s.id, s.workedWeekendsThisMonth || 0);
      hoursCounts.set(s.id, 0);
    });

    // Registra le assegnazioni già preservate
    preservedAssignments.forEach(a => {
      assignedCounts.set(a.staffId, (assignedCounts.get(a.staffId) || 0) + 1);
      hoursCounts.set(a.staffId, (hoursCounts.get(a.staffId) || 0) + 5); // 5h a turno
      const isWeekend = this.isWeekendShift(a.date, a.shiftType);
      if (isWeekend) {
        weekendCounts.set(a.staffId, (weekendCounts.get(a.staffId) || 0) + 1);
      }
    });

    // Per ogni giorno e turno richiesto
    for (const req of requirements) {
      const isWeekend = this.isWeekendShift(req.date, req.shiftType);

      // Requisiti suddivisi per ruolo
      const rolesNeeded: { role: StaffRole; count: number }[] = [
        { role: 'CAMERIERE', count: req.requiredWaiters },
        { role: 'PIZZAIOLO', count: req.requiredPizzaioli },
        { role: 'CUOCO', count: req.requiredCooks },
        { role: 'BARISTA', count: req.requiredBaristas }
      ];

      for (const { role, count } of rolesNeeded) {
        // Conta quanti sono già assegnati a questo turno/ruolo da override
        const alreadyAssignedCount = newAssignments.filter(
          a => a.date === req.date && a.shiftType === req.shiftType && a.role === role
        ).length;

        const neededToFill = Math.max(0, count - alreadyAssignedCount);

        for (let i = 0; i < neededToFill; i++) {
          // Trova il candidato migliore tra i membri del personale con questo ruolo
          const candidate = this.findBestCandidate(
            staff.filter(s => s.role === role),
            req.date,
            req.shiftType,
            isWeekend,
            newAssignments,
            availabilities,
            assignedCounts,
            weekendCounts,
            hoursCounts
          );

          if (candidate) {
            const assignment: ShiftAssignment = {
              id: `shift-${req.date}-${req.shiftType}-${role}-${i}-${Date.now().toString().slice(-4)}`,
              date: req.date,
              shiftType: req.shiftType,
              staffId: candidate.id,
              staffName: candidate.name,
              role: role,
              isManualOverride: false,
              locked: false
            };

            newAssignments.push(assignment);

            // Aggiorna contatori
            assignedCounts.set(candidate.id, (assignedCounts.get(candidate.id) || 0) + 1);
            hoursCounts.set(candidate.id, (hoursCounts.get(candidate.id) || 0) + 5);
            if (isWeekend) {
              weekendCounts.set(candidate.id, (weekendCounts.get(candidate.id) || 0) + 1);
            }
          }
        }
      }
    }

    // Calcola il punteggio di equità (Fairness Score)
    const fairnessScore = this.calculateFairnessScore(staff, assignedCounts);

    const report: SchedulingFairnessReport = {
      generatedAt: new Date().toISOString(),
      totalShiftsAssigned: newAssignments.length,
      fairnessScore: fairnessScore,
      staffSummary: staff.map(s => ({
        staffId: s.id,
        staffName: s.name,
        role: s.role,
        shiftsCount: assignedCounts.get(s.id) || 0,
        weekendShiftsCount: weekendCounts.get(s.id) || 0,
        hoursCount: hoursCounts.get(s.id) || 0
      }))
    };

    return { assignments: newAssignments, report };
  }

  private static isWeekendShift(dateStr: string, shiftType: ShiftType): boolean {
    const day = new Date(dateStr).getDay(); // 0 = Domenica, 5 = Venerdì, 6 = Sabato
    if (day === 5 && shiftType === 'CENA') return true;
    if (day === 6) return true;
    if (day === 0) return true;
    return false;
  }

  private static findBestCandidate(
    candidates: StaffMember[],
    date: string,
    shiftType: ShiftType,
    isWeekend: boolean,
    currentAssignments: ShiftAssignment[],
    availabilities: StaffAvailability[],
    assignedCounts: Map<string, number>,
    weekendCounts: Map<string, number>,
    hoursCounts: Map<string, number>
  ): StaffMember | null {
    let bestCandidate: StaffMember | null = null;
    let lowestPenalty = Infinity;

    for (const candidate of candidates) {
      // 1. Controllo: è già assegnato a questo turno?
      const alreadyWorkingThisShift = currentAssignments.some(
        a => a.staffId === candidate.id && a.date === date && a.shiftType === shiftType
      );
      if (alreadyWorkingThisShift) continue;

      // 2. Controllo disponibilità indicata dal dipendente
      const avail = availabilities.find(
        a => a.staffId === candidate.id && a.date === date && a.shiftType === shiftType
      );
      if (avail && avail.preference === 'NON_DISPONIBILE') {
        continue; // Rispetta tassativamente l'indisponibilità
      }

      // 3. Calcolo Punteggio di Penalità (minore è il punteggio, più merita il turno)
      let penalty = 0;

      // Bonus se il dipendente ha espresso preferenza per questo turno
      if (avail && avail.preference === 'PREFERITO') {
        penalty -= 60;
      }

      // Penalità per turni già accumulati (per distribuire equamente il lavoro)
      const currentShifts = assignedCounts.get(candidate.id) || 0;
      penalty += currentShifts * 25;

      // Penalità forte per weekend già lavorati per garantire turnazione equa dei fine settimana
      if (isWeekend) {
        const weekends = weekendCounts.get(candidate.id) || 0;
        penalty += weekends * 40;
      }

      // Penalità se supera le ore contrattuali massime settimanali
      const currentHours = hoursCounts.get(candidate.id) || 0;
      if (currentHours + 5 > candidate.maxWeeklyHours) {
        penalty += 300;
      }

      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  }

  private static calculateFairnessScore(staff: StaffMember[], assignedCounts: Map<string, number>): number {
    if (staff.length <= 1) return 100;

    // Raggruppa per ruolo e calcola la deviazione standard
    const roles: StaffRole[] = ['CAMERIERE', 'PIZZAIOLO', 'CUOCO', 'BARISTA'];
    let totalScore = 0;
    let rolesChecked = 0;

    for (const role of roles) {
      const roleStaff = staff.filter(s => s.role === role);
      if (roleStaff.length <= 1) continue;

      const counts = roleStaff.map(s => assignedCounts.get(s.id) || 0);
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      if (mean === 0) continue;

      const variance = counts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / counts.length;
      const stdDev = Math.sqrt(variance);

      // Coefficiente di variazione: minore è la variabilità, più alto è il punteggio di equità
      const roleFairness = Math.max(0, Math.min(100, Math.round(100 - (stdDev / (mean + 0.1)) * 50)));
      totalScore += roleFairness;
      rolesChecked++;
    }

    return rolesChecked > 0 ? Math.round(totalScore / rolesChecked) : 95;
  }
}
