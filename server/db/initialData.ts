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

// ============================================================================
// 1. INGREDIENTI REALI PIZZERIA IL GALLO (Divisi per Reparto, Cottura e Prezzo)
// ============================================================================
export const initialIngredients: Ingredient[] = [
  // --- PIZZERIA: Latticini & Basi ---
  {
    id: 'ing-1',
    name: 'Panetto Impasto Tradizionale (260g)',
    category: 'impasto',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 250,
    unit: 'pz',
    minThreshold: 40,
    costPerUnit: 0.35,
    expiryDate: '2026-10-20',
    lotNumber: 'IMP-20261014-01'
  },
  {
    id: 'ing-2',
    name: 'Fiordilatte / Mozzarella',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 30.0,
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 7.00,
    expiryDate: '2026-10-22',
    lotNumber: 'MOZ-20261014-01'
  },
  {
    id: 'ing-3',
    name: 'Mozzarella di Bufala Campana DOP',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: false, // In uscita / freddo
    extraPrice: 2.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 12.00,
    expiryDate: '2026-10-20',
    lotNumber: 'BUF-20261014-01'
  },
  {
    id: 'ing-4',
    name: 'Burrata Fresca',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: false,
    extraPrice: 2.50,
    currentStock: 15,
    unit: 'pz',
    minThreshold: 4,
    costPerUnit: 2.20,
    expiryDate: '2026-10-19',
    lotNumber: 'BUR-20261014-01'
  },
  {
    id: 'ing-5',
    name: 'Scamorza Affumicata',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 8.50,
    expiryDate: '2026-11-10',
    lotNumber: 'SCA-20261010-01'
  },
  {
    id: 'ing-6',
    name: 'Gorgonzola (Zola)',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 9.00,
    expiryDate: '2026-11-05',
    lotNumber: 'ZOL-20261012-01'
  },
  {
    id: 'ing-7',
    name: 'Brie Francese',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 10.00,
    expiryDate: '2026-11-01',
    lotNumber: 'BRI-20261010-01'
  },
  {
    id: 'ing-8',
    name: 'Taleggio DOP',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 11.00,
    expiryDate: '2026-11-08',
    lotNumber: 'TAL-20261011-01'
  },
  {
    id: 'ing-9',
    name: 'Scaglie di Grana / Parmigiano',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 14.00,
    expiryDate: '2026-12-31',
    lotNumber: 'GRA-20261001-01'
  },

  // --- PIZZERIA: Pomodoro & Salse ---
  {
    id: 'ing-10',
    name: 'Pomodoro San Marzano schiacciato',
    category: 'salse',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 40.0,
    unit: 'kg',
    minThreshold: 10.0,
    costPerUnit: 2.50,
    expiryDate: '2026-12-31',
    lotNumber: 'POM-20261001-01'
  },
  {
    id: 'ing-11',
    name: 'Panna da Cucina',
    category: 'salse',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'l',
    minThreshold: 1.0,
    costPerUnit: 3.50,
    expiryDate: '2026-11-15',
    lotNumber: 'PAN-20261012-01'
  },

  // --- PIZZERIA: Salumi & Affettati (+€2.00 da listino Il Gallo) ---
  {
    id: 'ing-12',
    name: 'Prosciutto Cotto',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 12.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 10.00,
    expiryDate: '2026-11-01',
    lotNumber: 'COT-20261010-01'
  },
  {
    id: 'ing-13',
    name: 'Prosciutto Crudo di Parma',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita forno
    extraPrice: 2.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 18.00,
    expiryDate: '2026-11-15',
    lotNumber: 'CRU-20261010-01'
  },
  {
    id: 'ing-14',
    name: 'Salamino Piccante',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.5,
    costPerUnit: 11.00,
    expiryDate: '2026-11-20',
    lotNumber: 'SAL-20261012-01'
  },
  {
    id: 'ing-15',
    name: 'Salsiccia Fresca Nostrana',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.5,
    costPerUnit: 8.00,
    expiryDate: '2026-10-25',
    lotNumber: 'SAS-20261013-01'
  },
  {
    id: 'ing-16',
    name: 'Speck Trentino',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false, // Spesso uscita forno
    extraPrice: 2.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 14.00,
    expiryDate: '2026-11-18',
    lotNumber: 'SPE-20261010-01'
  },
  {
    id: 'ing-17',
    name: 'Bresaola della Valtellina',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita forno
    extraPrice: 2.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 22.00,
    expiryDate: '2026-11-12',
    lotNumber: 'BRE-20261010-01'
  },
  {
    id: 'ing-18',
    name: 'Coppa Nostrana',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: false,
    extraPrice: 2.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 15.00,
    expiryDate: '2026-11-15',
    lotNumber: 'COP-20261011-01'
  },
  {
    id: 'ing-19',
    name: 'Pancetta Arrotolata',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 12.00,
    expiryDate: '2026-11-10',
    lotNumber: 'PAN-20261010-01'
  },
  {
    id: 'ing-20',
    name: 'Wurstel',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 5.50,
    expiryDate: '2026-11-30',
    lotNumber: 'WUR-20261010-01'
  },

  // --- PIZZERIA: Pesce ---
  {
    id: 'ing-21',
    name: 'Tonno all Olio',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 9.00,
    expiryDate: '2026-12-31',
    lotNumber: 'TON-20260901-01'
  },
  {
    id: 'ing-22',
    name: 'Salmone Affumicato',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.50,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 20.00,
    expiryDate: '2026-10-25',
    lotNumber: 'SAL-20261012-01'
  },
  {
    id: 'ing-23',
    name: 'Gamberetti',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.50,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 16.00,
    expiryDate: '2026-11-20',
    lotNumber: 'GAM-20261010-01'
  },
  {
    id: 'ing-24',
    name: 'Frutti di Mare Misti',
    category: 'salumi',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.50,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 14.00,
    expiryDate: '2026-11-15',
    lotNumber: 'FRU-20261011-01'
  },
  {
    id: 'ing-25',
    name: 'Acciughe di Cetara',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.50,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 15.00,
    expiryDate: '2026-12-31',
    lotNumber: 'ACC-20260915-01'
  },

  // --- PIZZERIA: Verdure & Funghi ---
  {
    id: 'ing-26',
    name: 'Funghi Champignon Freschi',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-22',
    lotNumber: 'FUN-20261014-01'
  },
  {
    id: 'ing-27',
    name: 'Funghi Porcini',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 18.00,
    expiryDate: '2026-11-05',
    lotNumber: 'POR-20261010-01'
  },
  {
    id: 'ing-28',
    name: 'Carciofi a spicchi',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 6.00,
    expiryDate: '2026-12-10',
    lotNumber: 'CAR-20261005-01'
  },
  {
    id: 'ing-29',
    name: 'Olive Nere / Verdi',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 4.00,
    expiryDate: '2026-12-31',
    lotNumber: 'OLI-20261001-01'
  },
  {
    id: 'ing-30',
    name: 'Capperi',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 3.0,
    unit: 'kg',
    minThreshold: 0.8,
    costPerUnit: 7.00,
    expiryDate: '2026-12-31',
    lotNumber: 'CAP-20261001-01'
  },
  {
    id: 'ing-31',
    name: 'Melanzane Grigliate',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-22',
    lotNumber: 'MEL-20261012-01'
  },
  {
    id: 'ing-32',
    name: 'Zucchine Grigliate',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-22',
    lotNumber: 'ZUC-20261012-01'
  },
  {
    id: 'ing-33',
    name: 'Peperoni Grigliati',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-22',
    lotNumber: 'PEP-20261012-01'
  },
  {
    id: 'ing-34',
    name: 'Spinaci Lessati',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 4.00,
    expiryDate: '2026-10-20',
    lotNumber: 'SPI-20261012-01'
  },
  {
    id: 'ing-35',
    name: 'Cipolle Bianche / Rosse',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 2.00,
    expiryDate: '2026-11-10',
    lotNumber: 'CIP-20261010-01'
  },
  {
    id: 'ing-36',
    name: 'Cipolle Caramellate',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita
    extraPrice: 1.50,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 5.00,
    expiryDate: '2026-10-25',
    lotNumber: 'CIP-CAR-01'
  },
  {
    id: 'ing-37',
    name: 'Asparagi',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 6.50,
    expiryDate: '2026-10-25',
    lotNumber: 'ASP-20261010-01'
  },
  {
    id: 'ing-38',
    name: 'Rucola Fresca',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 6.00,
    expiryDate: '2026-10-18',
    lotNumber: 'RUC-20261014-01'
  },
  {
    id: 'ing-39',
    name: 'Pomodorini Freschi / Confit',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita
    extraPrice: 1.00,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 4.00,
    expiryDate: '2026-10-20',
    lotNumber: 'POM-CONF-01'
  },
  {
    id: 'ing-40',
    name: 'Radicchio Rosso',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 3.50,
    expiryDate: '2026-10-22',
    lotNumber: 'RAD-20261012-01'
  },

  // --- PIZZERIA: Speciali & Aggiunte Particolari ---
  {
    id: 'ing-41',
    name: 'Patatine Fritte (su Pizza)',
    category: 'verdure',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 2.00, // Da listino: Aggiunte patatine €2.00
    currentStock: 20.0,
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 2.00,
    expiryDate: '2026-12-31',
    lotNumber: 'PAT-PIZ-01'
  },
  {
    id: 'ing-42',
    name: 'Uovo al Forno',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 60,
    unit: 'pz',
    minThreshold: 15,
    costPerUnit: 0.30,
    expiryDate: '2026-10-28',
    lotNumber: 'UOV-20261010-01'
  },
  {
    id: 'ing-43',
    name: 'Gherigli di Noce',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: false, // Uscita
    extraPrice: 1.00,
    currentStock: 3.0,
    unit: 'kg',
    minThreshold: 0.8,
    costPerUnit: 14.00,
    expiryDate: '2026-12-31',
    lotNumber: 'NOC-20260901-01'
  },
  {
    id: 'ing-44',
    name: 'Pere a fette sottili',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 2.50,
    expiryDate: '2026-10-25',
    lotNumber: 'PER-20261012-01'
  },
  {
    id: 'ing-45',
    name: 'Polvere di Curry',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 0.50,
    currentStock: 2.0,
    unit: 'kg',
    minThreshold: 0.5,
    costPerUnit: 12.00,
    expiryDate: '2027-12-31',
    lotNumber: 'CUR-20260101-01'
  },
  {
    id: 'ing-46',
    name: 'Olio Peperoncino Piccante',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    extraPrice: 0.00,
    currentStock: 5.0,
    unit: 'l',
    minThreshold: 1.0,
    costPerUnit: 5.00,
    expiryDate: '2027-12-31',
    lotNumber: 'PEP-20260101-01'
  },

  // --- PIZZERIA: Opzioni di Cottura & Impasti (Da Chiedere) ---
  {
    id: 'ing-47',
    name: 'Mozzarella Senza Lattosio',
    category: 'latticini',
    stationTarget: 'pizzeria',
    isPreBake: true,
    requiresClarification: true,
    extraPrice: 0.00, // Gratuito come da cartello sul menu!
    currentStock: 15.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 8.50,
    expiryDate: '2026-10-25',
    lotNumber: 'LAT-FREE-01'
  },
  {
    id: 'ing-48',
    name: 'Impasto Senza Glutine',
    category: 'impasto',
    stationTarget: 'pizzeria',
    isPreBake: true,
    requiresClarification: true,
    extraPrice: 2.50,
    currentStock: 25,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 2.00,
    expiryDate: '2026-11-15',
    lotNumber: 'GLUT-FREE-01'
  },
  {
    id: 'ing-49',
    name: 'Cottura Ben Cotta / Croccante',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: true,
    requiresClarification: true,
    extraPrice: 0.00,
    currentStock: 999,
    unit: 'pz',
    minThreshold: 0,
    costPerUnit: 0.00,
    expiryDate: '2099-12-31',
    lotNumber: 'COT-BEN'
  },
  {
    id: 'ing-50',
    name: 'Tagliata a Spicchi',
    category: 'condimenti',
    stationTarget: 'pizzeria',
    isPreBake: false,
    requiresClarification: true,
    extraPrice: 0.00,
    currentStock: 999,
    unit: 'pz',
    minThreshold: 0,
    costPerUnit: 0.00,
    expiryDate: '2099-12-31',
    lotNumber: 'TAG-SPIC'
  },
  // ==========================================================================
  // REPARTO CUCINA: Carni, Primi, Secondi, Hamburger & Insalate
  // ==========================================================================
  {
    id: 'ing-cuc-1',
    name: 'Hamburger di Chianina IGP (200g)',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 5.00,
    currentStock: 30,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 4.50,
    expiryDate: '2026-10-20',
    lotNumber: 'BUR-CHIA-01'
  },
  {
    id: 'ing-cuc-2',
    name: 'Hamburger di Scottona (200g)',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 4.00,
    currentStock: 35,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 3.80,
    expiryDate: '2026-10-20',
    lotNumber: 'BUR-SCOT-01'
  },
  {
    id: 'ing-cuc-3',
    name: 'Hamburger di Patanegra (200g)',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 5.00,
    currentStock: 25,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 4.80,
    expiryDate: '2026-10-20',
    lotNumber: 'BUR-PATA-01'
  },
  {
    id: 'ing-cuc-4',
    name: 'Hamburger di Black Angus (200g)',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 4.50,
    currentStock: 30,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 4.00,
    expiryDate: '2026-10-20',
    lotNumber: 'BUR-ANGU-01'
  },
  {
    id: 'ing-cuc-5',
    name: 'Pulled Pork Sfilacciato',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 4.50,
    currentStock: 15.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 9.00,
    expiryDate: '2026-10-24',
    lotNumber: 'PUL-PORK-01'
  },
  {
    id: 'ing-cuc-6',
    name: 'Bacon Croccante a Fette',
    category: 'salumi',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 2.00,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 8.00,
    expiryDate: '2026-11-05',
    lotNumber: 'BAC-CUC-01'
  },
  {
    id: 'ing-cuc-7',
    name: 'Formaggio Cheddar Fuso',
    category: 'latticini',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.50,
    currentStock: 6.0,
    unit: 'kg',
    minThreshold: 1.5,
    costPerUnit: 7.00,
    expiryDate: '2026-11-15',
    lotNumber: 'CHE-CUC-01'
  },
  {
    id: 'ing-cuc-8',
    name: 'Salsa Gallo della Casa',
    category: 'salse',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 3.00,
    expiryDate: '2026-11-20',
    lotNumber: 'SAL-GAL-01'
  },
  {
    id: 'ing-cuc-9',
    name: 'Salsa Senape & Miele',
    category: 'salse',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 4.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 4.00,
    expiryDate: '2026-11-20',
    lotNumber: 'SEN-MIE-01'
  },
  {
    id: 'ing-cuc-10',
    name: 'Petto di Pollo Grigliato',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.00,
    currentStock: 12.0,
    unit: 'kg',
    minThreshold: 2.5,
    costPerUnit: 7.50,
    expiryDate: '2026-10-22',
    lotNumber: 'POL-GRI-01'
  },
  {
    id: 'ing-cuc-11',
    name: 'Code di Gambero Scottate',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.50,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 14.00,
    expiryDate: '2026-10-25',
    lotNumber: 'GAM-SCO-01'
  },
  {
    id: 'ing-cuc-12',
    name: 'Uovo all Occhio / Sodo',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.50,
    currentStock: 60,
    unit: 'pz',
    minThreshold: 12,
    costPerUnit: 0.35,
    expiryDate: '2026-11-02',
    lotNumber: 'UOV-FRE-01'
  },
  {
    id: 'ing-cuc-13',
    name: 'Crostini di Pane / Focaccia',
    category: 'impasto',
    stationTarget: 'pizzeria',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 2.00,
    expiryDate: '2026-10-28',
    lotNumber: 'CRO-PAN-01'
  },
  {
    id: 'ing-cuc-14',
    name: 'Gnocco Fritto Caldo',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 2.00,
    currentStock: 50,
    unit: 'pz',
    minThreshold: 10,
    costPerUnit: 0.50,
    expiryDate: '2026-10-25',
    lotNumber: 'GNO-FRI-01'
  },
  {
    id: 'ing-cuc-15',
    name: 'Polenta Calda Tradizionale',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 2.50,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 1.50,
    expiryDate: '2026-10-22',
    lotNumber: 'POL-CAL-01'
  },
  {
    id: 'ing-cuc-16',
    name: 'Ragù Rustico di Cinghiale',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.50,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 8.00,
    expiryDate: '2026-10-25',
    lotNumber: 'RAG-CIN-01'
  },
  {
    id: 'ing-cuc-17',
    name: 'Filetto di Manzo',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 6.00,
    currentStock: 15,
    unit: 'pz',
    minThreshold: 3,
    costPerUnit: 7.00,
    expiryDate: '2026-10-22',
    lotNumber: 'FIL-MAN-01'
  },
  {
    id: 'ing-cuc-18',
    name: 'Fritto Misto di Pesce (Calamari & Gamberi)',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 6.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 8.50,
    expiryDate: '2026-10-24',
    lotNumber: 'FRI-MIS-01'
  },
  {
    id: 'ing-cuc-19',
    name: 'Cotoletta Panata',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 4.00,
    currentStock: 20,
    unit: 'pz',
    minThreshold: 4,
    costPerUnit: 2.80,
    expiryDate: '2026-10-23',
    lotNumber: 'COT-PAN-01'
  },
  {
    id: 'ing-cuc-20',
    name: 'Polpette di Scottona al Sugo',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.50,
    currentStock: 25,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 2.00,
    expiryDate: '2026-10-23',
    lotNumber: 'POL-SCO-01'
  },
  {
    id: 'ing-cuc-21',
    name: 'Stick di Pollo Croccanti',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.00,
    currentStock: 15.0,
    unit: 'kg',
    minThreshold: 3.0,
    costPerUnit: 4.50,
    expiryDate: '2026-11-10',
    lotNumber: 'STI-POL-01'
  },
  {
    id: 'ing-cuc-22',
    name: 'Verdure Grigliate (Zucchine, Melanzane, Peperoni)',
    category: 'verdure',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 2.50,
    currentStock: 8.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 3.00,
    expiryDate: '2026-10-22',
    lotNumber: 'VER-GRI-01'
  },
  {
    id: 'ing-cuc-23',
    name: 'Insalata Lattuga / Misticanza',
    category: 'verdure',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 1.00,
    currentStock: 10.0,
    unit: 'kg',
    minThreshold: 2.0,
    costPerUnit: 2.00,
    expiryDate: '2026-10-20',
    lotNumber: 'INS-MIS-01'
  },
  {
    id: 'ing-cuc-24',
    name: 'Patatine Fritte Calde Porzione',
    category: 'cucina',
    stationTarget: 'cucina',
    isPreBake: false,
    extraPrice: 3.00,
    currentStock: 25.0,
    unit: 'kg',
    minThreshold: 5.0,
    costPerUnit: 1.80,
    expiryDate: '2026-12-31',
    lotNumber: 'PAT-FRI-01'
  },

  // ==========================================================================
  // REPARTO BAR: Bevande, Birre, Vini, Caffetteria
  // ==========================================================================
  {
    id: 'ing-bar-1',
    name: 'Birra alla Spina Moretti Bionda',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 2.50,
    currentStock: 120.0,
    unit: 'l',
    minThreshold: 20.0,
    costPerUnit: 1.80,
    expiryDate: '2026-12-31',
    lotNumber: 'FUS-MOR-01'
  },
  {
    id: 'ing-bar-2',
    name: 'Birra Ichnusa Non Filtrata Spina',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 3.00,
    currentStock: 90.0,
    unit: 'l',
    minThreshold: 15.0,
    costPerUnit: 2.20,
    expiryDate: '2026-12-31',
    lotNumber: 'FUS-ICH-01'
  },
  {
    id: 'ing-bar-3',
    name: 'Bibita in Lattina (Coca, Fanta, Sprite, Thé)',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 3.00,
    currentStock: 80,
    unit: 'pz',
    minThreshold: 15,
    costPerUnit: 0.80,
    expiryDate: '2027-06-30',
    lotNumber: 'BIB-LAT-01'
  },
  {
    id: 'ing-bar-4',
    name: 'Acqua San Pellegrino / Panna 0.75 L',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 2.50,
    currentStock: 150,
    unit: 'pz',
    minThreshold: 24,
    costPerUnit: 0.50,
    expiryDate: '2027-12-31',
    lotNumber: 'ACQ-BOT-01'
  },
  {
    id: 'ing-bar-5',
    name: 'Caffè Espresso / Decaffeinato',
    category: 'bevande',
    stationTarget: 'bar',
    isPreBake: false,
    extraPrice: 1.50,
    currentStock: 5.0,
    unit: 'kg',
    minThreshold: 1.0,
    costPerUnit: 15.00,
    expiryDate: '2027-01-31',
    lotNumber: 'CAF-ESP-01'
  },
  {
    id: 'ing-bar-6',
    name: 'Fetta di Limone / Agrumi',
    category: 'condimenti',
    stationTarget: 'bar',
    isPreBake: false,
    requiresClarification: true,
    extraPrice: 0.00,
    currentStock: 50,
    unit: 'pz',
    minThreshold: 5,
    costPerUnit: 0.10,
    expiryDate: '2026-10-25',
    lotNumber: 'LIM-BAR-01'
  },
  {
    id: 'ing-bar-7',
    name: 'Ghiaccio Extra',
    category: 'condimenti',
    stationTarget: 'bar',
    isPreBake: false,
    requiresClarification: true,
    extraPrice: 0.00,
    currentStock: 999,
    unit: 'pz',
    minThreshold: 0,
    costPerUnit: 0.00,
    expiryDate: '2099-12-31',
    lotNumber: 'GHI-BAR-01'
  }

];

export const initialStationStock: StationStockItem[] = [
  { ingredientId: 'ing-1', ingredientName: 'Panetti Impasto (260g)', startQty: 180, usedQty: 24, currentQty: 156, unit: 'pz' },
  { ingredientId: 'ing-2', ingredientName: 'Fiordilatte Mozzarella', startQty: 20.0, usedQty: 3.5, currentQty: 16.5, unit: 'kg' },
  { ingredientId: 'ing-10', ingredientName: 'Pomodoro San Marzano', startQty: 25.0, usedQty: 4.2, currentQty: 20.8, unit: 'kg' },
  { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', startQty: 6.0, usedQty: 1.1, currentQty: 4.9, unit: 'kg' },
  { ingredientId: 'ing-14', ingredientName: 'Salamino Piccante', startQty: 5.0, usedQty: 0.8, currentQty: 4.2, unit: 'kg' }
];

// ============================================================================
// 2. LISTINO MENU UFFICIALE PIZZERIA IL GALLO (100% REALE DALLE FOTO)
// ============================================================================
export const initialMenuItems: MenuItem[] = [
  // --------------------------------------------------------------------------
  // PIZZE CLASSICHE
  // --------------------------------------------------------------------------
  {
    id: 'piz-1',
    name: 'Margherita',
    category: 'pizze_classiche',
    price: 5.50,
    description: 'Pomodoro, mozzarella',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-2',
    name: 'Marinara',
    category: 'pizze_classiche',
    price: 5.50,
    description: 'Pomodoro, aglio, prezzemolo, olive nere',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-29', ingredientName: 'Olive Nere', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-3',
    name: 'Napoletana',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, acciughe, origano',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-25', ingredientName: 'Acciughe', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-4',
    name: 'Romana',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, capperi, acciughe, origano',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-30', ingredientName: 'Capperi', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-25', ingredientName: 'Acciughe', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-5',
    name: 'Pugliese',
    category: 'pizze_classiche',
    price: 7.00,
    description: 'Pomodoro, mozzarella, cipolle',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-35', ingredientName: 'Cipolle', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-6',
    name: 'Prosciutto',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, prosciutto',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-7',
    name: 'Prosciutto e Funghi',
    category: 'pizze_classiche',
    price: 8.50,
    description: 'Pomodoro, mozzarella, prosciutto e funghi',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi Champignon', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-8',
    name: 'Funghi',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, funghi',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi Champignon', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-9',
    name: 'Salamino',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, salamino piccante',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-14', ingredientName: 'Salamino Piccante', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-10',
    name: 'Salsiccia',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, salsiccia',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-15', ingredientName: 'Salsiccia', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-11',
    name: 'Viennese',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, wurstel',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-20', ingredientName: 'Wurstel', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-12',
    name: 'Tonno',
    category: 'pizze_classiche',
    price: 8.00,
    description: 'Pomodoro, mozzarella, tonno',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-21', ingredientName: 'Tonno', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-13',
    name: 'Melanzane',
    category: 'pizze_classiche',
    price: 7.00,
    description: 'Pomodoro, mozzarella, melanzane alla griglia',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-31', ingredientName: 'Melanzane', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-14',
    name: 'Contadina',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, spinaci, grana',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-34', ingredientName: 'Spinaci', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-9', ingredientName: 'Grana', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-15',
    name: 'Estate',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, pomodoro fresco, cipolle, basilico',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-39', ingredientName: 'Pomodorini', quantity: 0.04, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-35', ingredientName: 'Cipolle', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-16',
    name: 'Asparagi',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, asparagi, uovo',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-37', ingredientName: 'Asparagi', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-42', ingredientName: 'Uovo', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-17',
    name: 'Calzone Liscio',
    category: 'pizze_classiche',
    price: 7.50,
    description: 'Pomodoro, mozzarella, prosciutto cotto',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },

  // --------------------------------------------------------------------------
  // PIZZE SPECIALI & GOURMET
  // --------------------------------------------------------------------------
  {
    id: 'piz-18',
    name: 'Quattro Stagioni',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-28', ingredientName: 'Carciofi', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-19',
    name: 'Capricciosa',
    category: 'pizze_speciali',
    price: 9.00,
    description: 'Pomodoro, mozzarella, prosciutto cotto, funghi, carciofi, peperoni, olive',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-28', ingredientName: 'Carciofi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-33', ingredientName: 'Peperoni', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-29', ingredientName: 'Olive', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-20',
    name: 'Calzone Farcito',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, prosciutto cotto, carciofi, funghi',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-28', ingredientName: 'Carciofi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-21',
    name: 'Formaggi',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, brie, scamorza, taleggio, zola, grana',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-7', ingredientName: 'Brie', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-5', ingredientName: 'Scamorza', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-8', ingredientName: 'Taleggio', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-6', ingredientName: 'Zola', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-9', ingredientName: 'Grana', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-22',
    name: 'Scamorza e Rucola',
    category: 'pizze_speciali',
    price: 7.50,
    description: 'Pomodoro, mozzarella, scamorza, rucola',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-5', ingredientName: 'Scamorza', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-38', ingredientName: 'Rucola', quantity: 0.02, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-23',
    name: 'Bufala e Rucola',
    category: 'pizze_speciali',
    price: 7.50,
    description: 'Pomodoro, bufala, rucola',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-3', ingredientName: 'Bufala', quantity: 0.10, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-38', ingredientName: 'Rucola', quantity: 0.02, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-24',
    name: 'Pomodorini e Rucola',
    category: 'pizze_speciali',
    price: 7.50,
    description: 'Pomodoro, mozzarella, pomodorini e rucola',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-39', ingredientName: 'Pomodorini', quantity: 0.04, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-38', ingredientName: 'Rucola', quantity: 0.02, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-25',
    name: 'Crudo',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, prosciutto crudo di Parma',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-13', ingredientName: 'Crudo di Parma', quantity: 0.06, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-26',
    name: 'Bresaola e Rucola',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, bresaola, rucola',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-17', ingredientName: 'Bresaola', quantity: 0.05, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-38', ingredientName: 'Rucola', quantity: 0.02, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-27',
    name: 'Speck e Brie',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, speck, brie',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-7', ingredientName: 'Brie', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-16', ingredientName: 'Speck', quantity: 0.05, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-28',
    name: 'Briosa',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, prosciutto cotto, brie',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-7', ingredientName: 'Brie', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-29',
    name: 'Rustica',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, melanzane, peperoni, prosciutto cotto',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-31', ingredientName: 'Melanzane', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-33', ingredientName: 'Peperoni', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto Cotto', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-30',
    name: 'Padovana',
    category: 'pizze_speciali',
    price: 9.00,
    description: 'Pomodoro, mozzarella, verdure di stagione',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-31', ingredientName: 'Melanzane', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-32', ingredientName: 'Zucchine', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-33', ingredientName: 'Peperoni', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-31',
    name: 'Paesana',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, zola, radicchio rosso',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-6', ingredientName: 'Zola', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-40', ingredientName: 'Radicchio', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-32',
    name: 'Selvaggia',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, salamino piccante, cipolle, zola',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-14', ingredientName: 'Salamino Piccante', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-35', ingredientName: 'Cipolle', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-6', ingredientName: 'Zola', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-33',
    name: 'Zola e Noci',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, zola, noci',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-6', ingredientName: 'Zola', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-43', ingredientName: 'Noci', quantity: 0.03, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-34',
    name: 'Zola e Pere',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, zola, pere',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-6', ingredientName: 'Zola', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-44', ingredientName: 'Pere', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-35',
    name: 'Porcini',
    category: 'pizze_speciali',
    price: 9.00,
    description: 'Pomodoro, mozzarella, porcini',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-27', ingredientName: 'Porcini', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-36',
    name: 'Porcini e Taleggio',
    category: 'pizze_speciali',
    price: 10.00,
    description: 'Mozzarella, porcini e taleggio',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-27', ingredientName: 'Porcini', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-8', ingredientName: 'Taleggio', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-37',
    name: 'Fungosa',
    category: 'pizze_speciali',
    price: 10.50,
    description: 'Pomodoro, mozzarella, porcini, prosciutto crudo di Parma',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-27', ingredientName: 'Porcini', quantity: 0.05, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-13', ingredientName: 'Crudo di Parma', quantity: 0.05, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-38',
    name: 'Caramellata',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, taleggio, noci, cipolle caramellate, curry',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-8', ingredientName: 'Taleggio', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-36', ingredientName: 'Cipolle Caramellate', quantity: 0.04, unit: 'kg', isPreBake: false, sourceDepartment: 'cucina' },
      { ingredientId: 'ing-43', ingredientName: 'Noci', quantity: 0.02, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-45', ingredientName: 'Curry', quantity: 0.005, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-39',
    name: 'Calabrese',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, coppa, olive verdi e nere, peperoncino',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-18', ingredientName: 'Coppa', quantity: 0.05, unit: 'kg', isPreBake: false, sourceDepartment: 'cucina' },
      { ingredientId: 'ing-29', ingredientName: 'Olive', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-46', ingredientName: 'Peperoncino', quantity: 0.01, unit: 'l', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-40',
    name: 'Ciociara',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, salamino, acciughe, peperoncino',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-14', ingredientName: 'Salamino', quantity: 0.04, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-25', ingredientName: 'Acciughe', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-46', ingredientName: 'Peperoncino', quantity: 0.01, unit: 'l', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-41',
    name: 'Americana',
    category: 'pizze_speciali',
    price: 8.50,
    description: 'Pomodoro, mozzarella, patatine fritte',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-41', ingredientName: 'Patatine Fritte', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-42',
    name: 'Salmone',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Mozzarella, panna, salmone',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-11', ingredientName: 'Panna', quantity: 0.04, unit: 'l', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-22', ingredientName: 'Salmone', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-43',
    name: 'Gamberetti',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, gamberetti',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 11,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.10, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-23', ingredientName: 'Gamberetti', quantity: 0.06, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-44',
    name: 'Frutti di Mare',
    category: 'pizze_speciali',
    price: 9.50,
    description: 'Pomodoro, mozzarella, frutti di mare',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-24', ingredientName: 'Frutti di Mare', quantity: 0.07, unit: 'kg', isPreBake: true, sourceDepartment: 'cucina' }
    ]
  },
  {
    id: 'piz-45',
    name: 'Regina',
    category: 'pizze_speciali',
    price: 10.00,
    description: 'Pomodoro, mozzarella, speck, olive nere, melanzane, funghi champignon',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.09, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-31', ingredientName: 'Melanzane', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-29', ingredientName: 'Olive Nere', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-16', ingredientName: 'Speck', quantity: 0.04, unit: 'kg', isPreBake: false, sourceDepartment: 'pizzeria' }
    ]
  },
  {
    id: 'piz-46',
    name: 'Abbuffata',
    category: 'pizze_speciali',
    price: 10.50,
    description: 'Pomodoro, mozzarella, prosciutto, funghi, asparagi, carciofi, wurstel, salamino, acciughe',
    targetDepartment: 'pizzeria',
    prepTimeMinutes: 13,
    available: true,
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Panetto Impasto', quantity: 1, unit: 'pz', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-10', ingredientName: 'Pomodoro', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-2', ingredientName: 'Mozzarella', quantity: 0.08, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-12', ingredientName: 'Prosciutto', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-26', ingredientName: 'Funghi', quantity: 0.03, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-37', ingredientName: 'Asparagi', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-28', ingredientName: 'Carciofi', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-20', ingredientName: 'Wurstel', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-14', ingredientName: 'Salamino', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' },
      { ingredientId: 'ing-25', ingredientName: 'Acciughe', quantity: 0.02, unit: 'kg', isPreBake: true, sourceDepartment: 'pizzeria' }
    ]
  },

  // --------------------------------------------------------------------------
  // GALLO'S SALADS / INSALATONE (Cucina)
  // --------------------------------------------------------------------------
  {
    id: 'sal-1',
    name: 'Insalata di Pollo',
    category: 'antipasti_cucina',
    price: 11.00,
    description: 'Petto di pollo, insalata mista, carote, pomodori, uova, noci, olive, capperi, maionese',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-10",
                "ingredientName": "Petto di Pollo Grigliato",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Insalata Mista / Lattuga",
                "quantity": 0.1,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-39",
                "ingredientName": "Pomodorini Freschi",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-12",
                "ingredientName": "Uovo Sodo",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-43",
                "ingredientName": "Noci",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-29",
                "ingredientName": "Olive Nere",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-30",
                "ingredientName": "Capperi",
                "quantity": 0.01,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Crostini di Focaccia",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          }
        ]
  },
  {
    id: 'sal-2',
    name: 'Insalata Vegana',
    category: 'antipasti_cucina',
    price: 10.00,
    description: 'Pesche noci, insalata, rucola, cetrioli, carote, mais, mango, noci, cipolle rosse, salsa di soia',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Insalata Mista e Rucola",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-38",
                "ingredientName": "Rucola Fresca",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-39",
                "ingredientName": "Pomodorini",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-35",
                "ingredientName": "Cipolle Rosse",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-43",
                "ingredientName": "Noci",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Crostini di Focaccia",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          }
        ]
  },
  {
    id: 'sal-3',
    name: 'Insalata di Gamberi',
    category: 'antipasti_cucina',
    price: 12.00,
    description: 'Code di gambero, rucola, insalata, cipolle rosse, pomodori e pomodorini, basilico, mele, finocchio, succo di limone',
    targetDepartment: 'cucina',
    prepTimeMinutes: 9,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-11",
                "ingredientName": "Code di Gambero Scottate",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-38",
                "ingredientName": "Rucola Fresca",
                "quantity": 0.06,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Insalata Lattuga",
                "quantity": 0.06,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-39",
                "ingredientName": "Pomodorini Freschi",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-35",
                "ingredientName": "Cipolle Rosse",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Crostini di Focaccia",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          }
        ]
  },
  {
    id: 'sal-4',
    name: 'Insalata Vegetariana',
    category: 'antipasti_cucina',
    price: 10.00,
    description: 'Insalata verde, pomodori, cetrioli, cipolle rosse, olive, bufala, origano, olio evo',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Insalata Verde Mista",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-39",
                "ingredientName": "Pomodorini Freschi",
                "quantity": 0.06,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-35",
                "ingredientName": "Cipolle Rosse",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-29",
                "ingredientName": "Olive Nere",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-4",
                "ingredientName": "Mozzarella di Bufala",
                "quantity": 0.1,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Crostini di Focaccia",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          }
        ]
  },

  // --------------------------------------------------------------------------
  // GALLO'S BURGERS (Serviti con patatine, birra piccola o bibita, caffè)
  // --------------------------------------------------------------------------
  {
    id: 'bur-1',
    name: 'Burger Chianina (Menu Completo)',
    category: 'antipasti_cucina',
    price: 17.00,
    description: 'Lattuga, porcini, uovo, scaglie di parmigiano, chianina 200g. Con patatine, bibita/birra e caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 15,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-1",
                "ingredientName": "Hamburger di Chianina IGP (200g)",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Pane Bun Artigianale",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-27",
                "ingredientName": "Funghi Porcini Trifolati",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-12",
                "ingredientName": "Uovo all Occhio",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Scaglie di Grana Padano",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Lattuga Fresca",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde (Contorno)",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-bar-1",
                "ingredientName": "Birra Bionda / Bibita",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          },
          {
                "ingredientId": "ing-bar-5",
                "ingredientName": "Caffè Espresso",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          }
        ]
  },
  {
    id: 'bur-2',
    name: 'Burger Scottona (Menu Completo)',
    category: 'antipasti_cucina',
    price: 13.00,
    description: 'Lattuga, bacon, zucchine, pomodoro, mozzarella, manzo 200g. Con patatine, bibita/birra e caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-2",
                "ingredientName": "Hamburger di Scottona (200g)",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Pane Bun Artigianale",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-6",
                "ingredientName": "Bacon Croccante",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-32",
                "ingredientName": "Zucchine Grigliate",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-2",
                "ingredientName": "Mozzarella Fiordilatte",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Lattuga e Pomodoro",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde (Contorno)",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-bar-1",
                "ingredientName": "Birra Bionda / Bibita",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          },
          {
                "ingredientId": "ing-bar-5",
                "ingredientName": "Caffè Espresso",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          }
        ]
  },
  {
    id: 'bur-3',
    name: 'Burger Patanegra (Menu Completo)',
    category: 'antipasti_cucina',
    price: 16.00,
    description: 'Lattuga, salsa gallo, crudo di Parma, pomodorini confit, mozzarella di bufala, patanegra 200g. Con patatine, bibita/birra e caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 15,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-3",
                "ingredientName": "Hamburger di Patanegra (200g)",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Pane Bun Artigianale",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-8",
                "ingredientName": "Salsa Gallo della Casa",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-13",
                "ingredientName": "Prosciutto Crudo di Parma",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-4",
                "ingredientName": "Mozzarella di Bufala",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-39",
                "ingredientName": "Pomodorini Confit",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Lattuga Fresca",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde (Contorno)",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-bar-1",
                "ingredientName": "Birra Bionda / Bibita",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          },
          {
                "ingredientId": "ing-bar-5",
                "ingredientName": "Caffè Espresso",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          }
        ]
  },
  {
    id: 'bur-4',
    name: 'Burger Angus (Menu Completo)',
    category: 'antipasti_cucina',
    price: 14.00,
    description: 'Lattuga, bacon, cipolla, pomodoro, scamorza, angus 200g. Con patatine, bibita/birra e caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-4",
                "ingredientName": "Hamburger di Black Angus (200g)",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Pane Bun Artigianale",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-6",
                "ingredientName": "Bacon Croccante",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-35",
                "ingredientName": "Cipolle Bianche / Rosse",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-5",
                "ingredientName": "Scamorza Affumicata",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Lattuga e Pomodoro",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde (Contorno)",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-bar-1",
                "ingredientName": "Birra Bionda / Bibita",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          },
          {
                "ingredientId": "ing-bar-5",
                "ingredientName": "Caffè Espresso",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          }
        ]
  },
  {
    id: 'bur-5',
    name: 'Burger Pulled Pork (Menu Completo)',
    category: 'antipasti_cucina',
    price: 18.00,
    description: 'Senape, miele, insalata verde, insalata capricciosa, pulled pork con patate speziate, bibita/birra e caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 15,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-5",
                "ingredientName": "Pulled Pork Sfilacciato",
                "quantity": 0.18,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-13",
                "ingredientName": "Pane Bun Artigianale",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "pizzeria"
          },
          {
                "ingredientId": "ing-cuc-9",
                "ingredientName": "Salsa Senape & Miele",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-23",
                "ingredientName": "Insalata Verde / Capricciosa",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Speziate Calde (Contorno)",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-bar-1",
                "ingredientName": "Birra Bionda / Bibita",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          },
          {
                "ingredientId": "ing-bar-5",
                "ingredientName": "Caffè Espresso",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "bar"
          }
        ]
  },

  // --------------------------------------------------------------------------
  // CUCINA: ANTIPASTI, PRIMI & SECONDI
  // --------------------------------------------------------------------------
  {
    id: 'cuc-1',
    name: 'Tagliere della Casa (Salumi e Formaggi)',
    category: 'antipasti_cucina',
    price: 12.00,
    description: 'Selezione di salumi e formaggi tipici con gnocco fritto',
    targetDepartment: 'cucina',
    prepTimeMinutes: 7,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-13",
                "ingredientName": "Prosciutto Crudo di Parma",
                "quantity": 0.06,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-15",
                "ingredientName": "Salame Nostrano & Coppa",
                "quantity": 0.06,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-8",
                "ingredientName": "Taleggio DOP",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-6",
                "ingredientName": "Gorgonzola DOP",
                "quantity": 0.05,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-14",
                "ingredientName": "Gnocco Fritto Caldo",
                "quantity": 4,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-2',
    name: 'Tagliere della Casa (Per 2 Persone)',
    category: 'antipasti_cucina',
    price: 20.00,
    description: 'Grande tagliere di salumi, formaggi e sfiziosità per 2 persone',
    targetDepartment: 'cucina',
    prepTimeMinutes: 9,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-13",
                "ingredientName": "Prosciutto Crudo di Parma",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-15",
                "ingredientName": "Salame Nostrano & Coppa",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-8",
                "ingredientName": "Taleggio DOP",
                "quantity": 0.1,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-6",
                "ingredientName": "Gorgonzola DOP",
                "quantity": 0.1,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Grana Padano Riserva",
                "quantity": 0.08,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-14",
                "ingredientName": "Gnocco Fritto Caldo",
                "quantity": 8,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-3',
    name: 'Risotto con Funghi Porcini',
    category: 'primi_secondi',
    price: 10.00,
    description: 'Risotto mantecato con funghi porcini nostrani',
    targetDepartment: 'cucina',
    prepTimeMinutes: 18,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-27",
                "ingredientName": "Funghi Porcini Nostrani",
                "quantity": 0.08,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Mantecatura Grana Padano & Burro",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-4',
    name: 'Tagliatelle al Cinghiale',
    category: 'primi_secondi',
    price: 9.00,
    description: 'Tagliatelle all uovo con ragù rustico di cinghiale',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-16",
                "ingredientName": "Ragù Rustico di Cinghiale",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Grana Padano",
                "quantity": 0.03,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-5',
    name: 'Ravioli della Casa Zucca & Ricotta',
    category: 'primi_secondi',
    price: 10.00,
    description: 'Con zucca, pinoli e ricotta di bufala, al burro versato',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-8",
                "ingredientName": "Ripieno Zucca e Ricotta",
                "quantity": 0.18,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Burro Versato, Salvia e Grana",
                "quantity": 0.04,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-6',
    name: 'Filetto ai Funghi Porcini',
    category: 'primi_secondi',
    price: 15.00,
    description: 'Filetto di manzo tenero ai funghi porcini trifolati',
    targetDepartment: 'cucina',
    prepTimeMinutes: 18,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-17",
                "ingredientName": "Filetto di Manzo (220g)",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-27",
                "ingredientName": "Funghi Porcini Trifolati",
                "quantity": 0.08,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'cuc-7',
    name: 'Manzo all Olio con Polenta',
    category: 'primi_secondi',
    price: 15.00,
    description: 'Tradizionale manzo all olio bresciano con polenta calda',
    targetDepartment: 'cucina',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-15",
                "ingredientName": "Polenta Calda Tradizionale",
                "quantity": 0.2,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-17",
                "ingredientName": "Manzo Stufato all Olio Bresciano",
                "quantity": 0.22,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },

  // --------------------------------------------------------------------------
  // MENU BIMBI
  // --------------------------------------------------------------------------
  {
    id: 'bim-1',
    name: 'Pasta al Pomodoro (Bimbi)',
    category: 'primi_secondi',
    price: 7.00,
    description: 'Pasta fresca con salsa al pomodoro semplice e basilico',
    targetDepartment: 'cucina',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-10",
                "ingredientName": "Sugo al Pomodoro San Marzano & Basilico",
                "quantity": 0.12,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Grana Padano",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'bim-2',
    name: 'Pasta al Pesto (Bimbi)',
    category: 'primi_secondi',
    price: 7.00,
    description: 'Pasta con pesto alla genovese delicato',
    targetDepartment: 'cucina',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-8",
                "ingredientName": "Pesto alla Genovese Delicato",
                "quantity": 0.08,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-7",
                "ingredientName": "Grana Padano",
                "quantity": 0.02,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'bim-3',
    name: 'Cotoletta con Patatine (Bimbi)',
    category: 'primi_secondi',
    price: 8.00,
    description: 'Cotoletta dorata e croccante con patatine fritte',
    targetDepartment: 'cucina',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-19",
                "ingredientName": "Cotoletta Dorata Croccante",
                "quantity": 1,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'bim-4',
    name: 'Polpette di Scottona con Patatine (Bimbi)',
    category: 'primi_secondi',
    price: 8.00,
    description: 'Polpette morbide di scottona servite con patatine',
    targetDepartment: 'cucina',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-20",
                "ingredientName": "Polpette di Scottona al Sugo",
                "quantity": 4,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          },
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Calde",
                "quantity": 0.15,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },

  // --------------------------------------------------------------------------
  // CONTORNI & FRITTI (Cucina)
  // --------------------------------------------------------------------------
  {
    id: 'fri-1',
    name: 'Patatine Fritte Classiche',
    category: 'fritti',
    price: 3.00,
    description: 'Patatine dorate croccanti',
    targetDepartment: 'cucina',
    prepTimeMinutes: 7,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine Fritte Dorate",
                "quantity": 0.2,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-2',
    name: 'Patatine Speziate',
    category: 'fritti',
    price: 3.00,
    description: 'Patatine aromatizzate con paprika e spezie dolci',
    targetDepartment: 'cucina',
    prepTimeMinutes: 7,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patatine con Paprika & Spezie",
                "quantity": 0.2,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-3',
    name: 'Patatine con Buccia (Rustiche)',
    category: 'fritti',
    price: 3.00,
    description: 'Tagliate spesse con buccia naturale',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-24",
                "ingredientName": "Patate Rustiche con Buccia",
                "quantity": 0.2,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-4',
    name: 'Mini Panzerotti',
    category: 'fritti',
    price: 2.50,
    description: 'Panzerottini fritti dorati con ripieno filante a scelta',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-2",
                "ingredientName": "Mini Panzerotti Pomodoro & Mozzarella",
                "quantity": 4,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-5',
    name: 'Verdure Grigliate Miste',
    category: 'fritti',
    price: 3.50,
    description: 'Zucchine, melanzane e peperoni alla griglia',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-22",
                "ingredientName": "Zucchine, Melanzane & Peperoni alla Griglia",
                "quantity": 0.18,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-6',
    name: 'Gnocco Fritto',
    category: 'fritti',
    price: 3.50,
    description: 'Gonfi e fragranti al momento',
    targetDepartment: 'cucina',
    prepTimeMinutes: 7,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-14",
                "ingredientName": "Gnocco Fritto Dorato al Momento",
                "quantity": 5,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-7',
    name: 'Stick di Pollo Dorati',
    category: 'fritti',
    price: 4.00,
    description: 'Bastoncini di pollo croccanti serviti con salse',
    targetDepartment: 'cucina',
    prepTimeMinutes: 8,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-21",
                "ingredientName": "Stick di Pollo Dorati Croccanti",
                "quantity": 6,
                "unit": "pz",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-8',
    name: 'Gamberi e Verdure in Pastella',
    category: 'fritti',
    price: 9.00,
    description: 'Fritto leggero e croccante di gamberi e verdure fresche',
    targetDepartment: 'cucina',
    prepTimeMinutes: 10,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-11",
                "ingredientName": "Gamberi e Verdure in Pastella",
                "quantity": 0.2,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },
  {
    id: 'fri-9',
    name: 'Fritto Misto di Pesce',
    category: 'fritti',
    price: 15.00,
    description: 'Calamari, gamberi e paranza dell Adriatico fritti dorati',
    targetDepartment: 'cucina',
    prepTimeMinutes: 12,
    available: true,
    recipe: [
    
          {
                "ingredientId": "ing-cuc-18",
                "ingredientName": "Fritto Misto di Pesce Dorato",
                "quantity": 0.25,
                "unit": "kg",
                "isPreBake": false,
                "sourceDepartment": "cucina"
          }
        ]
  },

  // --------------------------------------------------------------------------
  // BEVANDE, ACQUE & CAFFETTERIA (Bar)
  // --------------------------------------------------------------------------
  {
    id: 'bev-1',
    name: 'Acqua San Pellegrino / Panna 0.75 L',
    category: 'bevande',
    price: 2.50,
    description: 'Bottiglia vetro naturale o frizzante',
    targetDepartment: 'bar',
    prepTimeMinutes: 1,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-2',
    name: 'Coca Cola Bottiglia da 1 L',
    category: 'bevande',
    price: 5.00,
    description: 'Bottiglia grande in vetro da 1 Litro',
    targetDepartment: 'bar',
    prepTimeMinutes: 1,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-3',
    name: 'Bibita in Lattina o Vetro 33cl',
    category: 'bevande',
    price: 3.00,
    description: 'Coca Cola, Fanta, Sprite, Thé Limone/Pesca',
    targetDepartment: 'bar',
    prepTimeMinutes: 1,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-4',
    name: 'Caffè Espresso',
    category: 'bevande',
    price: 1.50,
    description: 'Miscela arabica selezione Il Gallo',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-5',
    name: 'Cappuccino',
    category: 'bevande',
    price: 2.00,
    description: 'Con morbida crema di latte fresco',
    targetDepartment: 'bar',
    prepTimeMinutes: 3,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-6',
    name: 'Tisane & Infusi',
    category: 'bevande',
    price: 2.00,
    description: 'Selezione di erbe e thé caldi',
    targetDepartment: 'bar',
    prepTimeMinutes: 3,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-7',
    name: 'Spritz Aperitivo',
    category: 'bevande',
    price: 5.00,
    description: 'Aperol o Campari con prosecco e spruzzo di soda',
    targetDepartment: 'bar',
    prepTimeMinutes: 3,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-8',
    name: 'Crodino / Campari Soda',
    category: 'bevande',
    price: 2.50,
    description: 'Aperitivo analcolico / bitter servito con fetta d arancia',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-9',
    name: 'Liquori & Amari',
    category: 'bevande',
    price: 3.00,
    description: 'Montenegro, Jagermeister, Fernet, Sambuca, Limoncello',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-10',
    name: 'Grappa Barricata',
    category: 'bevande',
    price: 4.00,
    description: 'Distillato invecchiato in botte di rovere',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bev-11',
    name: 'Rum Selezione',
    category: 'bevande',
    price: 6.00,
    description: 'Rum invecchiato servito con cioccolato fondente',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },

  // --------------------------------------------------------------------------
  // BIRRE ALLA SPINA & ARTIGIANALI (Bar)
  // --------------------------------------------------------------------------
  {
    id: 'bir-1',
    name: 'Birra Moretti Bionda 0.2 L (Piccola)',
    category: 'bevande',
    price: 2.50,
    description: 'Lager classica bionda alla spina',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-2',
    name: 'Birra Moretti Bionda 0.4 L (Media)',
    category: 'bevande',
    price: 5.00,
    description: 'Lager classica bionda alla spina',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-3',
    name: 'Birra Ichnusa 0.2 L (Piccola)',
    category: 'bevande',
    price: 2.50,
    description: 'Anima sarda non filtrata alla spina',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-4',
    name: 'Birra Ichnusa 0.4 L (Media)',
    category: 'bevande',
    price: 5.00,
    description: 'Anima sarda non filtrata alla spina',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-5',
    name: 'Affligem Blonde 0.33 L',
    category: 'bevande',
    price: 5.00,
    description: 'Birra d abbazia belga aromatica e speziata',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-6',
    name: 'Birra Artigianale Flea 33cl (Costanza / Bastola / Smoked)',
    category: 'bevande',
    price: 5.00,
    description: 'Birra artigianale non filtrata 33cl (Bionda 5.2% / Rossa 6.9% / Ambrata 6.4%)',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-7',
    name: 'La Villana 33cl (Cinque Bionda / Gatsby Rossa)',
    category: 'bevande',
    price: 5.00,
    description: 'Birra artigianale veneta 33cl',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-8',
    name: 'PBH Artigianale 50cl (First Lady / Fiandra / Drulù / Weiss / Mary Cat)',
    category: 'bevande',
    price: 6.00,
    description: 'Birra artigianale in bottiglia da 50cl',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-9',
    name: 'Hofbrauhaus 50cl (Jagerbier Bionda / Dunkel Rossa)',
    category: 'bevande',
    price: 5.00,
    description: 'Birra bavarese tradizionale da 50cl',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-10',
    name: 'Birra Gjulia 75cl (Nord Bionda / Est Weizen / Ovest Ambrata)',
    category: 'bevande',
    price: 12.00,
    description: 'Grande bottiglia artigianale da 75cl ideale da condividere',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'bir-11',
    name: 'Birra Dolomiti Bionda 75cl 5.9%',
    category: 'bevande',
    price: 10.00,
    description: 'Birra premium delle Dolomiti in bottiglia da 75cl',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },

  // --------------------------------------------------------------------------
  // VINI, PROSECCHI & VINI DELLA CASA (Bar)
  // --------------------------------------------------------------------------
  {
    id: 'vin-1',
    name: 'Vino Rosso della Casa Val Calepio (Calice €3 / Bott. €12)',
    category: 'bevande',
    price: 3.00,
    description: 'DOC Il Calepino rosso corposo e fruttato',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-2',
    name: 'Vino Bianco della Casa Val Calepio (Calice €3 / Bott. €12)',
    category: 'bevande',
    price: 3.00,
    description: 'DOC Il Calepino bianco fresco e minerale',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-3',
    name: 'Prosecco alla Spina Villa Cornaro (Calice)',
    category: 'bevande',
    price: 3.00,
    description: 'Frizzante Veneto IGT (1/4L €3, 1/2L €5, 1L €9)',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-4',
    name: 'Neropasso Biscardo Veneto IGT 75cl',
    category: 'bevande',
    price: 16.00,
    description: 'Rosso appassimento morbido e intenso 13.5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-5',
    name: 'Prunotto Dolcetto d Alba DOC 75cl',
    category: 'bevande',
    price: 20.00,
    description: 'Piemonte DOC elegante e asciutto 13%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-6',
    name: 'Jacopo Biondi Santi Sassoalloro 75cl',
    category: 'bevande',
    price: 35.00,
    description: 'Grande rosso toscano 100% Sangiovese Grosso 14%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-7',
    name: 'Pio Cesare Langhe DOC Nebbiolo 75cl',
    category: 'bevande',
    price: 35.00,
    description: 'Nebbiolo nobile piemontese di gran struttura 14.5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-8',
    name: 'Franz Haas Pinot Nero DOC 75cl',
    category: 'bevande',
    price: 40.00,
    description: 'Alto Adige DOC, uno dei migliori pinot neri d Italia 13.5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-9',
    name: 'Oropasso Biscardo Veneto IGT 75cl',
    category: 'bevande',
    price: 16.00,
    description: 'Garganega e Chardonnay fresco e minerale 13%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-10',
    name: 'Peter Zemmer Gewurztraminer DOC 75cl',
    category: 'bevande',
    price: 15.00,
    description: 'Aromatico ed elegante dell Alto Adige 13.5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-11',
    name: 'Cà dei Frati I Frati Lugana DOC 75cl',
    category: 'bevande',
    price: 20.00,
    description: 'Il celebre Lugana del Garda, fresco e profumato 13%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-12',
    name: 'Emilio Vada Moscato d Asti 75cl',
    category: 'bevande',
    price: 12.00,
    description: 'Dolce naturale piemontese 5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-13',
    name: 'V8+ Cuvée Spumante Brut Siorberto 75cl',
    category: 'bevande',
    price: 15.00,
    description: 'Spumante brut profumato e brioso 11%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-14',
    name: 'V8+ Prosecco Extra Dry Siorsandro 75cl',
    category: 'bevande',
    price: 20.00,
    description: 'Prosecco DOP superiore millesimato 11%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-15',
    name: 'Villa Sandi Prosecco Rosé DOC 75cl',
    category: 'bevande',
    price: 20.00,
    description: 'Prosecco rosé millesimato elegante 11%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },
  {
    id: 'vin-16',
    name: 'Contadi Castaldi Franciacorta Brut 75cl',
    category: 'bevande',
    price: 35.00,
    description: 'Franciacorta DOCG metodo classico 12.5%',
    targetDepartment: 'bar',
    prepTimeMinutes: 2,
    available: true,
    recipe: [
      { ingredientId: 'ing-bar-1', ingredientName: 'Bottiglia / Calice Bar', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'bar' }
    ]
  },

  // --------------------------------------------------------------------------
  // FORMULE PRANZO DI LAVORO (Mar-Ven 12:00-14:00)
  // --------------------------------------------------------------------------
  {
    id: 'pra-1',
    name: 'Menu Pranzo di Lavoro 18€',
    category: 'primi_secondi',
    price: 18.00,
    description: 'Primo, Secondo + contorno, Calice di vino o Acqua, Caffè, Dolce del giorno',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: []
  },
  {
    id: 'pra-2',
    name: 'Menu Pranzo di Lavoro 15€',
    category: 'primi_secondi',
    price: 15.00,
    description: 'Primo, Secondo + contorno, Calice di vino o Acqua, Caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: []
  },
  {
    id: 'pra-3',
    name: 'Menu Pranzo di Lavoro 12€',
    category: 'primi_secondi',
    price: 12.00,
    description: 'Primo OPPURE Secondo con contorno, Calice di vino o Acqua, Caffè',
    targetDepartment: 'cucina',
    prepTimeMinutes: 12,
    available: true,
    recipe: []
  },
  {
    id: 'pra-4',
    name: 'Menu Hamburger Pranzo 15€',
    category: 'antipasti_cucina',
    price: 15.00,
    description: 'Hamburger manzo 200g, mozzarella, pomodoro, insalata, zucchine, patatine fritte e bevanda',
    targetDepartment: 'cucina',
    prepTimeMinutes: 14,
    available: true,
    recipe: []
  },

  // --------------------------------------------------------------------------
  // DESSERT DELLA CASA
  // --------------------------------------------------------------------------
  {
    id: 'dol-1',
    name: 'Dolce della Casa / Dessert del Giorno',
    category: 'dolci',
    price: 5.00,
    description: 'Tiramisù artigianale, panna cotta o torta del giorno fatta in casa',
    targetDepartment: 'cucina',
    prepTimeMinutes: 4,
    available: true,
    recipe: [
      { ingredientId: 'ing-cuc-8', ingredientName: 'Dessert Artigianale della Casa', quantity: 1, unit: 'pz', isPreBake: false, sourceDepartment: 'cucina' }
    ]
  }
];

// ============================================================================
// 3. ZONE E TAVOLI
// ============================================================================
export const initialZones: RestaurantZone[] = [
  {
    id: 'z-1',
    name: 'Sala Principale Il Gallo',
    x: 2,
    y: 2,
    widthMeters: 10,
    heightMeters: 9,
    colorTheme: '#f97316'
  },
  {
    id: 'z-2',
    name: 'Veranda & Dehor Esterno',
    x: 13,
    y: 2,
    widthMeters: 8,
    heightMeters: 9,
    colorTheme: '#10b981'
  }
];

export const initialTables: RestaurantTable[] = [
  { id: 't-1', number: 1, x: 3.0, y: 3.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'OCCUPATO', zoneId: 'z-1' },
  { id: 't-2', number: 2, x: 4.0, y: 3.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'OCCUPATO', zoneId: 'z-1', tavolataGroupId: 'auto-tav-1-2', tavolataName: 'Tavolata T1 + T2' },
  { id: 't-3', number: 3, x: 7.0, y: 3.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: true, status: 'LIBERO', zoneId: 'z-1' },
  { id: 't-4', number: 4, x: 3.0, y: 6.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-1' },
  { id: 't-5', number: 5, x: 5.0, y: 6.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'PRENOTATO', zoneId: 'z-1' },
  { id: 't-6', number: 6, x: 7.0, y: 6.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-1' },
  { id: 't-7', number: 7, x: 14.0, y: 3.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-2' },
  { id: 't-8', number: 8, x: 16.0, y: 3.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-2' },
  { id: 't-9', number: 9, x: 14.0, y: 6.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-2' },
  { id: 't-10', number: 10, x: 16.0, y: 6.0, widthMeters: 1.0, heightMeters: 1.0, shape: 'SQUARE', seats: 2, hasEndSeat: false, status: 'LIBERO', zoneId: 'z-2' }
];

export const initialStaff: StaffMember[] = [
  { id: 'st-1', name: 'Marco Rossi', role: 'PIZZAIOLO', email: 'marco@ilgallo.it', phone: '3331112233', avatarColor: '#e11d48', maxWeeklyHours: 40, currentWeeklyHours: 32, workedWeekendsThisMonth: 2 },
  { id: 'st-2', name: 'Luca Bianchi', role: 'CAMERIERE', email: 'luca@ilgallo.it', phone: '3332223344', avatarColor: '#2563eb', maxWeeklyHours: 35, currentWeeklyHours: 28, workedWeekendsThisMonth: 1 },
  { id: 'st-3', name: 'Giulia Verdi', role: 'CUOCO', email: 'giulia@ilgallo.it', phone: '3333334455', avatarColor: '#16a34a', maxWeeklyHours: 40, currentWeeklyHours: 35, workedWeekendsThisMonth: 2 },
  { id: 'st-4', name: 'Sofia Neri', role: 'BARISTA', email: 'sofia@ilgallo.it', phone: '3334445566', avatarColor: '#d97706', maxWeeklyHours: 30, currentWeeklyHours: 20, workedWeekendsThisMonth: 1 }
];

export const initialRequirements: DayStaffRequirement[] = [
  { date: '2026-10-16', shiftType: 'CENA', requiredWaiters: 3, requiredPizzaioli: 2, requiredCooks: 1, requiredBaristas: 1 },
  { date: '2026-10-17', shiftType: 'CENA', requiredWaiters: 4, requiredPizzaioli: 2, requiredCooks: 2, requiredBaristas: 1 }
];

export const initialAvailabilities: StaffAvailability[] = [
  { id: 'av-1', staffId: 'st-1', date: '2026-10-16', shiftType: 'CENA', preference: 'DISPONIBILE' },
  { id: 'av-2', staffId: 'st-2', date: '2026-10-16', shiftType: 'CENA', preference: 'DISPONIBILE' }
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    code: '#T01-44',
    type: 'DINE_IN',
    tableId: 't-1',
    tableName: 'Tavolata T1 + T2',
    waiterId: 'st-2',
    waiterName: 'Luca Bianchi',
    status: 'IN_CORSO',
    coverCharge: 6.00, // 4 persone x 1.50€
    guestsCount: 4,
    subtotal: 35.50,
    totalAmount: 41.50,
    items: [
      {
        id: 'oi-1',
        menuItemId: 'piz-1',
        name: 'Margherita',
        basePrice: 5.50,
        customization: {
          addedIngredients: [{ ingredientId: 'ing-14', name: 'Salamino Piccante', priceDelta: 2.00 }],
          removedIngredients: [],
          priceDeltaTotal: 2.00
        },
        finalUnitPrice: 7.50,
        quantity: 2,
        subtotal: 15.00,
        targetDepartment: 'pizzeria',
        prepTimeMinutes: 4,
        pizzeriaPhase: 'PRE_COTTURA',
        isReleased: true,
        orderedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'oi-2',
        menuItemId: 'cuc-1',
        name: 'Tagliere della Casa (Salumi e Formaggi)',
        basePrice: 12.00,
        customization: { addedIngredients: [], removedIngredients: [], priceDeltaTotal: 0 },
        finalUnitPrice: 12.00,
        quantity: 1,
        subtotal: 12.00,
        targetDepartment: 'cucina',
        prepTimeMinutes: 8,
        kitchenPhase: 'IN_PREPARAZIONE',
        isReleased: true,
        orderedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'oi-3',
        menuItemId: 'bir-2',
        name: 'Birra Moretti Bionda 0.4 L (Media)',
        basePrice: 5.00,
        customization: { addedIngredients: [], removedIngredients: [], priceDeltaTotal: 0 },
        finalUnitPrice: 5.00,
        quantity: 1,
        subtotal: 5.00,
        targetDepartment: 'bar',
        prepTimeMinutes: 2,
        barPhase: 'PRONTO',
        isReleased: true,
        orderedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'oi-4',
        menuItemId: 'bev-1',
        name: 'Acqua San Pellegrino 0.75 L',
        basePrice: 2.50,
        customization: { addedIngredients: [], removedIngredients: [], priceDeltaTotal: 0 },
        finalUnitPrice: 2.50,
        quantity: 1,
        subtotal: 2.50,
        targetDepartment: 'bar',
        prepTimeMinutes: 1,
        barPhase: 'PRONTO',
        isReleased: true,
        orderedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    isPaid: false
  }
];
