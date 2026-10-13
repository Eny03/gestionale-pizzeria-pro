// ============================================================================
// GESTIONALE PIZZERIA PRO - MODELLO DATI E TIPI TYPESCRIPT COMPLETI
// ============================================================================

export type UserRole =
  | 'ADMIN'
  | 'CAMERIERE'
  | 'CAPO_SALA'
  | 'PIZZERIA'
  | 'CUCINA'
  | 'BAR'
  | 'ASPORTO'
  | 'TURNI';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// ----------------------------------------------------------------------------
// 1. INGREDIENTI, RICETTE & MAGAZZINO
// ----------------------------------------------------------------------------

export type IngredientCategory =
  | 'impasto'
  | 'latticini'
  | 'salumi'
  | 'verdure'
  | 'salse'
  | 'bevande'
  | 'cucina'
  | 'condimenti';

export type StationTarget = 'pizzeria' | 'cucina' | 'bar';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  stationTarget: StationTarget;
  isPreBake: boolean; // TRUE: va in forno (pomodoro, mozzarella). FALSE: a crudo/post-cottura (crudo, burrata, rucola)
  extraPrice: number; // Costo aggiunta per il cliente (es. +1.50€)
  currentStock: number; // Quantità globale in magazzino
  unit: 'kg' | 'g' | 'pz' | 'l' | 'ml';
  minThreshold: number; // Soglia minima alert esaurimento
  costPerUnit: number; // Costo fornitore
  expiryDate: string; // YYYY-MM-DD
  lotNumber: string; // Lotto tracciabilità
}

export interface StationStockItem {
  ingredientId: string;
  ingredientName: string;
  startQty: number; // Quantità iniziale impostata a inizio servizio
  usedQty: number;  // Quantità consumata in tempo reale
  currentQty: number; // startQty - usedQty
  unit: string;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number; // Quantità usata per porzione
  unit: string;
  isPreBake: boolean; // Se deve apparire in pre-cottura o post-cottura
}

export type MenuCategory =
  | 'pizze_classiche'
  | 'pizze_speciali'
  | 'antipasti_cucina'
  | 'primi_secondi'
  | 'fritti'
  | 'bevande'
  | 'dolci';

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  targetDepartment: StationTarget; // 'pizzeria' | 'cucina' | 'bar'
  recipe: RecipeItem[];
  prepTimeMinutes: number; // Tempo stimato di preparazione (fondamentale per cron asporto)
  available: boolean;
  imageUrl?: string;
}

// ----------------------------------------------------------------------------
// 2. MODIFICHE, COMANDI E TICKET DI REPARTO
// ----------------------------------------------------------------------------

export interface IngredientDelta {
  ingredientId: string;
  name: string;
  priceDelta: number;
}

export interface OrderItemCustomization {
  addedIngredients: IngredientDelta[];
  removedIngredients: { ingredientId: string; name: string }[];
  notes?: string;
  priceDeltaTotal: number;
}

export type PizzeriaItemPhase = 'PRE_COTTURA' | 'IN_FORNO' | 'POST_COTTURA' | 'PRONTO';
export type KitchenItemPhase = 'IN_ATTESA' | 'IN_PREPARAZIONE' | 'PRONTO';
export type BarItemPhase = 'IN_ATTESA' | 'PRONTO';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  basePrice: number;
  customization: OrderItemCustomization;
  finalUnitPrice: number; // basePrice + priceDeltaTotal
  quantity: number;
  subtotal: number; // finalUnitPrice * quantity
  targetDepartment: StationTarget;
  prepTimeMinutes: number;
  
  // Stati di avanzamento reparto
  pizzeriaPhase?: PizzeriaItemPhase;
  kitchenPhase?: KitchenItemPhase;
  barPhase?: BarItemPhase;

  // Gestione rilascio asporto differito
  isReleased: boolean; // true = inviato alla stazione; false = trattenuto dal cron asporto
  scheduledReleaseTime?: string; // ISO timestamp in cui rilasciare il ticket
  
  orderedAt: string;
  updatedAt: string;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type OrderStatus = 'ATTIVO' | 'IN_CORSO' | 'PRONTO' | 'COMPLETATO' | 'PAGATO' | 'ANNULLATO';

export interface Order {
  id: string;
  code: string; // Es: "#T04-12" oppure "#ASP-08"
  type: OrderType;
  tableId?: string;
  tableName?: string;
  waiterId: string;
  waiterName: string;
  customerName?: string;
  customerPhone?: string;
  pickupTime?: string; // Orario ritiro desiderato (es: "20:30")
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  coverCharge: number; // Coperto (es: 2€ * coperti)
  guestsCount?: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'CONTANTI' | 'CARTA' | 'DIVISO';
  isPaid: boolean;
  paidAt?: string;
}

// ----------------------------------------------------------------------------
// 3. CAPO SALA: GRIGLIA 1M X 1M, ZONE, TAVOLI E PRENOTAZIONI
// ----------------------------------------------------------------------------

export interface RestaurantFloorPlan {
  totalWidthMeters: number; // Es. 20m (grande quadrato)
  totalHeightMeters: number; // Es. 20m
}

export interface RestaurantZone {
  id: string;
  name: string; // Es. "Sala Principale", "Veranda", "Zona Bar/Forno"
  x: number; // Posizione X nella planimetria globale (metri)
  y: number; // Posizione Y nella planimetria globale (metri)
  widthMeters: number; // Larghezza in metri
  heightMeters: number; // Altezza in metri
  colorTheme: string;
}

export type TableShape = 'RECTANGLE' | 'ROUND' | 'SQUARE';
export type TableStatus = 'LIBERO' | 'OCCUPATO' | 'PRENOTATO';

export interface RestaurantTable {
  id: string;
  number: number;
  zoneId?: string;
  x: number; // Coordinata X in metri (griglia 1m x 1m)
  y: number; // Coordinata Y in metri (griglia 1m x 1m)
  widthMeters: number; // 1.0m di default
  heightMeters: number; // 1.0m di default
  shape: TableShape;
  seats: number; // 2 di base, 3 con capotavola
  hasEndSeat?: boolean; // Posto extra agli estremi (3 persone)
  tavolataGroupId?: string; // ID se fa parte di una tavolata accorpata
  tavolataName?: string; // Nome della tavolata (es. "Tavolata T1+T2")
  status: TableStatus;
  activeOrderId?: string;
  activeReservationId?: string;
}

export interface Reservation {
  id: string;
  tableId: string;
  tableNumber: number;
  customerName: string;
  customerPhone: string;
  guestsCount: number;
  reservationTime: string; // HH:MM
  expectedDurationMinutes: number; // Durata prevista (es. 90 min)
  notes?: string;
  status: 'CONFERMATA' | 'SEDUTI' | 'COMPLETATA' | 'ANNULLATA';
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 4. GESTIONE TURNI & RISORSE UMANE (HR FAIR SCHEDULING)
// ----------------------------------------------------------------------------

export type StaffRole = 'CAMERIERE' | 'PIZZAIOLO' | 'CUOCO' | 'BARISTA';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  email: string;
  phone: string;
  avatarColor: string;
  maxWeeklyHours: number;
  currentWeeklyHours: number;
  workedWeekendsThisMonth: number;
}

export type AvailabilityPreference = 'DISPONIBILE' | 'PREFERITO' | 'NON_DISPONIBILE';
export type ShiftType = 'PRANZO' | 'CENA';

export interface StaffAvailability {
  id: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  preference: AvailabilityPreference;
  notes?: string;
}

export interface DayStaffRequirement {
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  requiredWaiters: number;
  requiredPizzaioli: number;
  requiredCooks: number;
  requiredBaristas: number;
  notes?: string;
}

export interface ShiftAssignment {
  id: string;
  date: string; // YYYY-MM-DD
  shiftType: ShiftType;
  staffId: string;
  staffName: string;
  role: StaffRole;
  isManualOverride: boolean;
  locked: boolean;
}

export interface SchedulingFairnessReport {
  generatedAt: string;
  totalShiftsAssigned: number;
  fairnessScore: number; // 0-100%
  staffSummary: {
    staffId: string;
    staffName: string;
    role: StaffRole;
    shiftsCount: number;
    weekendShiftsCount: number;
    hoursCount: number;
  }[];
}

// ----------------------------------------------------------------------------
// 5. EVENTI REAL-TIME WEBSOCKET
// ----------------------------------------------------------------------------

export type SocketEventType =
  | 'INITIAL_STATE'
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_PAID'
  | 'ORDER_ITEM_PHASE_CHANGED'
  | 'STATION_STOCK_UPDATED'
  | 'GLOBAL_INVENTORY_UPDATED'
  | 'TABLE_UPDATED'
  | 'ZONE_UPDATED'
  | 'RESERVATION_CREATED'
  | 'RESERVATION_UPDATED'
  | 'SHIFTS_GENERATED'
  | 'SHIFT_OVERRIDE'
  | 'NOTIFICATION_ALERT';

export interface SocketMessage<T = unknown> {
  type: SocketEventType;
  payload: T;
  timestamp: string;
}
