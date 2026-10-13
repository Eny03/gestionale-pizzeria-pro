import {
  Ingredient,
  MenuItem,
  RestaurantZone,
  RestaurantTable,
  StaffMember,
  StaffAvailability,
  DayStaffRequirement,
  Order,
  StationStockItem
} from '../../shared/types.js';

export const initialIngredients: Ingredient[] = [
  // Latticini & Impasti
  {
    id: 'ing-1',
    name: 'Panetto Impasto Napoletano (260g)',
    category: 'impasto',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 180,
    unit: 'pz',
    minThreshold: 30,
    costPerUnit: 0.40,
    expiryDate: '2026-10-15',
    lotNumber: 'IMP-20261012-A'
  },
  {
    id: 'ing-2',
    name: 'Fiordilatte di Agerola',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.50,
    currentStock: 25.0,
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 7.50,
    expiryDate: '2026-10-17',
    lotNumber: 'LAT-20261011-03'
  },
  {
    id: 'ing-3',
    name: 'Mozzarella di Bufala Campana DOP',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.50,
    currentStock: 4.2, // Low stock alert!
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 12.00,
    expiryDate: '2026-10-14', // Expiring soon!
    lotNumber: 'BUF-20261010-01'
  },
  {
    id: 'ing-4',
    name: 'Burrata Pugliese 150g',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: false, // POST-COTTURA (A crudo)
    extraPrice: 3.00,
    currentStock: 18,
    unit: 'pz',
    minThreshold: 6,
    costPerUnit: 2.20,
    expiryDate: '2026-10-16',
    lotNumber: 'BUR-20261012-P'
  },

  // Salse & Condimenti
  {
    id: 'ing-5',
    name: 'Pomodoro San Marzano DOP schiacciato',
    category: 'salse',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 35.0,
    unit: 'kg',
    minThreshold: 8.0,
    costPerUnit: 2.80,
    expiryDate: '2026-12-31',
    lotNumber: 'POM-20260901-X'
  },
  {
    id: 'ing-6',
    name: 'Pesto di Pistacchio di Bronte',
    category: 'salse',
    stationTarget: 'pizzeria',
    isPreBake: false, // POST-COTTURA
    extraPrice: 2.50,
    currentStock: 3.5,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 22.00,
    expiryDate: '2026-11-20',
    lotNumber: 'PIS-20260815-B'
  },

  // Salumi
  {
    id: 'ing-7',
    name: 'Salame Piccante Calabrese (Spianata)',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.50,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 11.50,
    expiryDate: '2026-11-10',
    lotNumber: 'SAL-20260920-1'
  },
  {
    id: 'ing-8',
    name: 'Prosciutto di Parma 24 Mesi',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false, // POST-COTTURA (A crudo)
    extraPrice: 2.50,
    currentStock: 6.5,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 18.00,
    expiryDate: '2026-10-25',
    lotNumber: 'PAR-20260918-09'
  },
  {
    id: 'ing-9',
    name: 'Mortadella Bologna IGP con pistacchio',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false, // POST-COTTURA
    extraPrice: 2.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 10.00,
    expiryDate: '2026-10-18',
    lotNumber: 'MOR-20261001-A'
  },

  // Verdure & Aromi
  {
    id: 'ing-10',
    name: 'Funghi Champignon Freschi trifolati',
    category: 'verdure',
    stationTarget: 'cucina', // Preparato in cucina!
    isPreBake: true,
    extraPrice: 1.50,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-14', // Expiring soon!
    lotNumber: 'FUN-20261011-C'
  },
  {
    id: 'ing-11',
    name: 'Rucola Fresca Selvatica',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: false, // POST-COTTURA
    extraPrice: 1.00,
    currentStock: 2.2,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 6.00,
    expiryDate: '2026-10-16',
    lotNumber: 'RUC-20261012-V'
  },
  {
    id: 'ing-12',
    name: 'Basilico Fresco Genovese',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: false,
    extraPrice: 0.50,
    currentStock: 0.8,
    unit: 'kg',
    minThreshold: 0.3,
    costPerUnit: 12.00,
    expiryDate: '2026-10-15',
    lotNumber: 'BAS-20261012-G'
  },

  // Cucina Specifica
  {
    id: 'ing-13',
    name: 'Calamari Nazionali Freschi',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 4.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 2.5,
    costPerUnit: 15.00,
    expiryDate: '2026-10-14',
    lotNumber: 'PES-20261012-01'
  },
  {
    id: 'ing-14',
    name: 'Patatine Fritte Dippers Steakhouse',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 20.0,
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 2.20,
    expiryDate: '2027-01-15',
    lotNumber: 'SUR-20260901-P'
  },

  // Bevande & Bar
  {
    id: 'ing-15',
    name: 'Fusto Birra Artigianale Ichnusa Non Filtrata 30L',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 0.00,
    currentStock: 3,
    unit: 'pz',
    minThreshold: 1,
    costPerUnit: 75.00,
    expiryDate: '2026-12-15',
    lotNumber: 'BIR-20260910-I'
  },
  {
    id: 'ing-16',
    name: 'Coca Cola Vetro 33cl',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 0.00,
    currentStock: 48,
    unit: 'pz',
    minThreshold: 20,
    costPerUnit: 0.90,
    expiryDate: '2027-04-30',
    lotNumber: 'BEV-20260810-C'
  }
];

export const initialStationStock: StationStockItem[] = [
  {
    ingredientId: 'ing-1',
    ingredientName: 'Panetti Impasto Napoletano',
    startQty: 100,
    usedQty: 14,
    currentQty: 86,
    unit: 'pz'
  },
  {
    ingredientId: 'ing-2',
    ingredientName: 'Fiordilatte di Agerola',
    startQty: 12.0,
    usedQty: 1.8,
    currentQty: 10.2,
    unit: 'kg'
  },
  {
    ingredientId: 'ing-3',
    ingredientName: 'Mozzarella di Bufala DOP',
    startQty: 3.5,
    usedQty: 0.7,
    currentQty: 2.8,
    unit: 'kg'
  },
  {
    ingredientId: 'ing-5',
    ingredientName: 'Pomodoro San Marzano DOP',
    startQty: 15.0,
    usedQty: 2.1,
    currentQty: 12.9,
    unit: 'kg'
  },
  {
    ingredientId: 'ing-7',
    ingredientName: 'Salame Piccante Spianata',
    startQty: 4.0,
    usedQty: 0.5,
    currentQty: 3.5,
    unit: 'kg'
  },
  {
    ingredientId: 'ing-8',
    ingredientName: 'Prosciutto di Parma 24M (Post)',
    startQty: 3.0,
    usedQty: 0.4,
    currentQty: 2.6,
    unit: 'kg'
  },
  {
    ingredientId: 'ing-4',
    ingredientName: 'Burrata Pugliese (Post)',
    startQty: 15,
    usedQty: 3,
    currentQty: 12,
    unit: 'pz'
  },
  {
    ingredientId: 'ing-11',
    ingredientName: 'Rucola Selvatica (Post)',
    startQty: 1.5,
    usedQty: 0.3,
    currentQty: 1.2,
    unit: 'kg'
  }
];

export const initialMenuItems: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Margherita Verace DOP',
    category: 'pizze_classiche',
    price: 8.50,
    description: 'Pomodoro San Marzano DOP, Fiordilatte di Agerola, Basilico fresco, Olio EVO',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
      { ingredientId: 'ing-5', ingredientName: 'Pomodoro San Marzano', quantity: 0.09, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.11, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-12', ingredientName: 'Basilico Fresco', quantity: 0.005, unit: 'kg', isPreBake: false }
    ]
  },
  {
    id: 'm-2',
    name: 'Diavola Vesuviana',
    category: 'pizze_classiche',
    price: 9.50,
    description: 'Pomodoro San Marzano, Fiordilatte, Salame piccante calabrese spianata, Peperoncino',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
      { ingredientId: 'ing-5', ingredientName: 'Pomodoro San Marzano', quantity: 0.09, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.10, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-7', ingredientName: 'Salame Piccante', quantity: 0.06, unit: 'kg', isPreBake: true }
    ]
  },
  {
    id: 'm-3',
    name: 'Pistacchiosa Gourmet',
    category: 'pizze_speciali',
    price: 13.50,
    description: 'Base bianca con Fiordilatte. In uscita a freddo: Mortadella Bologna IGP, Burrata Pugliese intera, Pesto di pistacchio di Bronte e granella.',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
      { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.09, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-9', ingredientName: 'Mortadella Bologna IGP', quantity: 0.08, unit: 'kg', isPreBake: false },
      { ingredientId: 'ing-4', ingredientName: 'Burrata Pugliese', quantity: 1, unit: 'pz', isPreBake: false },
      { ingredientId: 'ing-6', ingredientName: 'Pesto di Pistacchio', quantity: 0.04, unit: 'kg', isPreBake: false }
    ]
  },
  {
    id: 'm-4',
    name: 'Parma & Burratina',
    category: 'pizze_speciali',
    price: 13.00,
    description: 'Pomodoro San Marzano, Fiordilatte. In uscita: Prosciutto di Parma 24 Mesi, Burratina fresca 150g e Rucola.',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 13,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
      { ingredientId: 'ing-5', ingredientName: 'Pomodoro San Marzano', quantity: 0.08, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.09, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-8', ingredientName: 'Prosciutto di Parma', quantity: 0.07, unit: 'kg', isPreBake: false },
      { ingredientId: 'ing-4', ingredientName: 'Burrata Pugliese', quantity: 1, unit: 'pz', isPreBake: false },
      { ingredientId: 'ing-11', ingredientName: 'Rucola Selvatica', quantity: 0.02, unit: 'kg', isPreBake: false }
    ]
  },
  {
    id: 'm-5',
    name: 'Capricciosa Tradizionale',
    category: 'pizze_classiche',
    price: 10.50,
    description: 'Pomodoro San Marzano, Fiordilatte, Funghi freschi trifolati dalla cucina, carciofi, olive taggiasche',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true },
      { ingredientId: 'ing-5', ingredientName: 'Pomodoro San Marzano', quantity: 0.09, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-2', ingredientName: 'Fiordilatte di Agerola', quantity: 0.10, unit: 'kg', isPreBake: true },
      { ingredientId: 'ing-10', ingredientName: 'Funghi trifolati (Cucina)', quantity: 0.06, unit: 'kg', isPreBake: true }
    ]
  },
  // Cucina
  {
    id: 'm-6',
    name: 'Gran Frittura di Calamari e Gamberi',
    category: 'antipasti_cucina',
    price: 15.00,
    description: 'Calamari freschi dorati croccanti serviti con maionese al lime fatta in casa',
    targetDepartment: 'cucina',
    prepTimeMinutes: 18,
    available: true,
    recipe: [
      { ingredientId: 'ing-13', ingredientName: 'Calamari Freschi', quantity: 0.25, unit: 'kg', isPreBake: false }
    ]
  },
  {
    id: 'm-7',
    name: 'Cuvette di Patatine Dippers Croccanti',
    category: 'fritti',
    price: 5.50,
    description: 'Patate tagliate con buccia con salsa barbecue e maionese',
    targetDepartment: 'cucina',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-14', ingredientName: 'Patatine Fritte Dippers', quantity: 0.25, unit: 'kg', isPreBake: false }
    ]
  },
  // Bar
  {
    id: 'm-8',
    name: 'Birra Ichnusa Non Filtrata Media 0.4L',
    category: 'bevande',
    price: 5.50,
    description: 'Birra bionda sarda corpo morbido, spillata al momento',
    targetDepartment: 'bar',
    prepTimeMinutes: 3,
    available: true,
    recipe: [
      { ingredientId: 'ing-15', ingredientName: 'Fusto Ichnusa', quantity: 0.4, unit: 'l', isPreBake: false }
    ]
  },
  {
    id: 'm-9',
    name: 'Coca Cola in Bottiglia 33cl',
    category: 'bevande',
    price: 3.50,
    description: 'Servita ghiaccio e limone',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-16', ingredientName: 'Coca Cola Vetro', quantity: 1, unit: 'pz', isPreBake: false }
    ]
  }
];

export const initialZones: RestaurantZone[] = [
  {
    id: 'z-1',
    name: 'Sala Interna Vesuvio',
    widthMeters: 10,
    heightMeters: 8,
    colorTheme: '#ea580c'
  },
  {
    id: 'z-2',
    name: 'Veranda Panoramica',
    widthMeters: 8,
    heightMeters: 6,
    colorTheme: '#0284c7'
  }
];

export const initialTables: RestaurantTable[] = [
  // Sala Interna
  {
    id: 't-1',
    number: 1,
    zoneId: 'z-1',
    x: 1.5,
    y: 1.5,
    widthMeters: 1.2,
    heightMeters: 0.8,
    shape: 'RECTANGLE',
    seats: 4,
    status: 'OCCUPATO',
    activeOrderId: 'ord-101'
  },
  {
    id: 't-2',
    number: 2,
    zoneId: 'z-1',
    x: 4.0,
    y: 1.5,
    widthMeters: 1.2,
    heightMeters: 0.8,
    shape: 'RECTANGLE',
    seats: 4,
    status: 'LIBERO'
  },
  {
    id: 't-3',
    number: 3,
    zoneId: 'z-1',
    x: 6.5,
    y: 1.5,
    widthMeters: 1.5,
    heightMeters: 1.0,
    shape: 'RECTANGLE',
    seats: 6,
    status: 'PRENOTATO',
    activeReservationId: 'res-301'
  },
  {
    id: 't-4',
    number: 4,
    zoneId: 'z-1',
    x: 2.0,
    y: 4.5,
    widthMeters: 1.0,
    heightMeters: 1.0,
    shape: 'SQUARE',
    seats: 2,
    status: 'OCCUPATO',
    activeOrderId: 'ord-102'
  },
  {
    id: 't-5',
    number: 5,
    zoneId: 'z-1',
    x: 5.0,
    y: 4.5,
    widthMeters: 1.2,
    heightMeters: 1.2,
    shape: 'ROUND',
    seats: 4,
    status: 'LIBERO'
  },
  // Veranda
  {
    id: 't-10',
    number: 10,
    zoneId: 'z-2',
    x: 1.5,
    y: 1.5,
    widthMeters: 1.2,
    heightMeters: 0.8,
    shape: 'RECTANGLE',
    seats: 4,
    status: 'LIBERO'
  },
  {
    id: 't-11',
    number: 11,
    zoneId: 'z-2',
    x: 4.5,
    y: 1.5,
    widthMeters: 1.5,
    heightMeters: 0.9,
    shape: 'RECTANGLE',
    seats: 6,
    status: 'LIBERO'
  }
];

export const initialStaff: StaffMember[] = [
  {
    id: 'st-1',
    name: 'Marco Rossi',
    role: 'CAMERIERE',
    email: 'marco.rossi@pizzeriasmart.it',
    phone: '+39 340 1234567',
    avatarColor: '#f97316',
    maxWeeklyHours: 40,
    currentWeeklyHours: 32,
    workedWeekendsThisMonth: 2
  },
  {
    id: 'st-2',
    name: 'Chiara Esposito',
    role: 'CAMERIERE',
    email: 'chiara.esposito@pizzeriasmart.it',
    phone: '+39 347 9876543',
    avatarColor: '#ec4899',
    maxWeeklyHours: 36,
    currentWeeklyHours: 28,
    workedWeekendsThisMonth: 1
  },
  {
    id: 'st-3',
    name: 'Luigi De Luca',
    role: 'PIZZAIOLO',
    email: 'luigi.pizzaiolo@pizzeriasmart.it',
    phone: '+39 333 4567890',
    avatarColor: '#eab308',
    maxWeeklyHours: 42,
    currentWeeklyHours: 35,
    workedWeekendsThisMonth: 3
  },
  {
    id: 'st-4',
    name: 'Gennaro Sannino',
    role: 'PIZZAIOLO',
    email: 'gennaro.s@pizzeriasmart.it',
    phone: '+39 349 5556677',
    avatarColor: '#84cc16',
    maxWeeklyHours: 40,
    currentWeeklyHours: 30,
    workedWeekendsThisMonth: 2
  },
  {
    id: 'st-5',
    name: 'Antonio Cannavaro',
    role: 'CUOCO',
    email: 'antonio.cucina@pizzeriasmart.it',
    phone: '+39 328 1122334',
    avatarColor: '#06b6d4',
    maxWeeklyHours: 40,
    currentWeeklyHours: 32,
    workedWeekendsThisMonth: 2
  },
  {
    id: 'st-6',
    name: 'Alessia Moretti',
    role: 'BARISTA',
    email: 'alessia.bar@pizzeriasmart.it',
    phone: '+39 339 9988776',
    avatarColor: '#8b5cf6',
    maxWeeklyHours: 35,
    currentWeeklyHours: 25,
    workedWeekendsThisMonth: 1
  }
];

// Initial Staff Requirements & Availabilities
export const initialRequirements: DayStaffRequirement[] = [
  {
    date: '2026-10-16', // Venerdì
    shiftType: 'CENA',
    requiredWaiters: 3,
    requiredPizzaioli: 2,
    requiredCooks: 1,
    requiredBaristas: 1,
    notes: 'Serata piena con musica dal vivo'
  },
  {
    date: '2026-10-17', // Sabato
    shiftType: 'CENA',
    requiredWaiters: 4,
    requiredPizzaioli: 2,
    requiredCooks: 2,
    requiredBaristas: 1,
    notes: 'Picco settimanale'
  },
  {
    date: '2026-10-18', // Domenica
    shiftType: 'PRANZO',
    requiredWaiters: 2,
    requiredPizzaioli: 1,
    requiredCooks: 1,
    requiredBaristas: 1
  },
  {
    date: '2026-10-18', // Domenica
    shiftType: 'CENA',
    requiredWaiters: 3,
    requiredPizzaioli: 2,
    requiredCooks: 1,
    requiredBaristas: 1
  }
];

export const initialAvailabilities: StaffAvailability[] = [
  {
    id: 'av-1',
    staffId: 'st-1',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'PREFERITO'
  },
  {
    id: 'av-2',
    staffId: 'st-2',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-3',
    staffId: 'st-1',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-4',
    staffId: 'st-2',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'PREFERITO'
  },
  {
    id: 'av-5',
    staffId: 'st-3',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-6',
    staffId: 'st-4',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-7',
    staffId: 'st-3',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'NON_DISPONIBILE',
    notes: 'Matrimonio parente'
  },
  {
    id: 'av-8',
    staffId: 'st-4',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'PREFERITO'
  },
  {
    id: 'av-9',
    staffId: 'st-5',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-10',
    staffId: 'st-5',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-11',
    staffId: 'st-6',
    date: '2026-10-16',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  },
  {
    id: 'av-12',
    staffId: 'st-6',
    date: '2026-10-17',
    shiftType: 'CENA',
    preference: 'DISPONIBILE'
  }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    code: '#T01-14',
    type: 'DINE_IN',
    tableId: 't-1',
    tableName: 'Tavolo 1 (Sala Interna)',
    waiterId: 'st-1',
    waiterName: 'Marco Rossi',
    status: 'IN_CORSO',
    coverCharge: 4.0,
    guestsCount: 2,
    subtotal: 31.0,
    totalAmount: 35.0,
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isPaid: false,
    items: [
      {
        id: 'item-101-1',
        menuItemId: 'm-3',
        name: 'Pistacchiosa Gourmet',
        basePrice: 13.50,
        customization: {
          addedIngredients: [
            { ingredientId: 'ing-3', name: 'Extra Mozzarella di Bufala', priceDelta: 2.50 }
          ],
          removedIngredients: [],
          notes: 'Burrata ben fredda al centro',
          priceDeltaTotal: 2.50
        },
        finalUnitPrice: 16.00,
        quantity: 1,
        subtotal: 16.00,
        targetDepartment: 'pizzeria',
        prepTimeMinutes: 14,
        pizzeriaPhase: 'POST_COTTURA', // È già uscita dal forno! Sta attendendo la mortadella e burrata
        isReleased: true,
        orderedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
      },
      {
        id: 'item-101-2',
        menuItemId: 'm-1',
        name: 'Margherita Verace DOP',
        basePrice: 8.50,
        customization: {
          addedIngredients: [],
          removedIngredients: [{ ingredientId: 'ing-12', name: 'Basilico' }],
          notes: 'Senza basilico per allergia',
          priceDeltaTotal: 0
        },
        finalUnitPrice: 8.50,
        quantity: 1,
        subtotal: 8.50,
        targetDepartment: 'pizzeria',
        prepTimeMinutes: 12,
        pizzeriaPhase: 'PRE_COTTURA', // In attesa di essere infornata
        isReleased: true,
        orderedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
      },
      {
        id: 'item-101-3',
        menuItemId: 'm-8',
        name: 'Birra Ichnusa Media',
        basePrice: 5.50,
        customization: {
          addedIngredients: [],
          removedIngredients: [],
          priceDeltaTotal: 0
        },
        finalUnitPrice: 5.50,
        quantity: 1,
        subtotal: 5.50,
        targetDepartment: 'bar',
        prepTimeMinutes: 3,
        barPhase: 'PRONTO',
        isReleased: true,
        orderedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        id: 'item-101-4',
        menuItemId: 'm-9',
        name: 'Coca Cola Vetro',
        basePrice: 3.50,
        customization: {
          addedIngredients: [],
          removedIngredients: [],
          priceDeltaTotal: 0
        },
        finalUnitPrice: 3.50,
        quantity: 1,
        subtotal: 3.50,
        targetDepartment: 'bar',
        prepTimeMinutes: 2,
        barPhase: 'PRONTO',
        isReleased: true,
        orderedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'ord-102',
    code: '#T04-09',
    type: 'DINE_IN',
    tableId: 't-4',
    tableName: 'Tavolo 4 (Sala Interna)',
    waiterId: 'st-2',
    waiterName: 'Chiara Esposito',
    status: 'IN_CORSO',
    coverCharge: 2.0,
    guestsCount: 1,
    subtotal: 20.50,
    totalAmount: 22.50,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    isPaid: false,
    items: [
      {
        id: 'item-102-1',
        menuItemId: 'm-6',
        name: 'Gran Frittura di Calamari',
        basePrice: 15.00,
        customization: {
          addedIngredients: [],
          removedIngredients: [],
          notes: 'Ben croccante',
          priceDeltaTotal: 0
        },
        finalUnitPrice: 15.00,
        quantity: 1,
        subtotal: 15.00,
        targetDepartment: 'cucina',
        prepTimeMinutes: 18,
        kitchenPhase: 'IN_PREPARAZIONE',
        isReleased: true,
        orderedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        id: 'item-102-2',
        menuItemId: 'm-8',
        name: 'Birra Ichnusa Media',
        basePrice: 5.50,
        customization: {
          addedIngredients: [],
          removedIngredients: [],
          priceDeltaTotal: 0
        },
        finalUnitPrice: 5.50,
        quantity: 1,
        subtotal: 5.50,
        targetDepartment: 'bar',
        prepTimeMinutes: 3,
        barPhase: 'PRONTO',
        isReleased: true,
        orderedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString()
      }
    ]
  }
];
