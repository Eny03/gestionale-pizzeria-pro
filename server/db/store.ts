import {
  Ingredient,
  MenuItem,
  RestaurantZone,
  RestaurantTable,
  Reservation,
  StaffMember,
  StaffAvailability,
  DayStaffRequirement,
  ShiftAssignment,
  Order,
  StationStockItem
} from '../../shared/types.js';

import {
  initialIngredients,
  initialStationStock,
  initialMenuItems,
  initialZones,
  initialTables,
  initialStaff,
  initialRequirements,
  initialAvailabilities,
  initialOrders
} from './initialData.js';

class InMemoryStore {
  public ingredients: Ingredient[] = [...initialIngredients];
  public stationStock: StationStockItem[] = [...initialStationStock];
  public menuItems: MenuItem[] = [...initialMenuItems];
  public zones: RestaurantZone[] = [...initialZones];
  public tables: RestaurantTable[] = [...initialTables];
  public reservations: Reservation[] = [
    {
      id: 'res-301',
      tableId: 't-3',
      tableNumber: 3,
      customerName: 'Famiglia Bianchi',
      customerPhone: '+39 345 6789012',
      guestsCount: 5,
      reservationTime: '20:45',
      expectedDurationMinutes: 90,
      notes: 'Seggiolone per bimbo',
      status: 'CONFERMATA',
      createdAt: new Date().toISOString()
    }
  ];
  public staff: StaffMember[] = [...initialStaff];
  public requirements: DayStaffRequirement[] = [...initialRequirements];
  public availabilities: StaffAvailability[] = [...initialAvailabilities];
  public shiftAssignments: ShiftAssignment[] = [];
  public orders: Order[] = [...initialOrders];

  // Helper getters
  public getAllData() {
    return {
      ingredients: this.ingredients,
      stationStock: this.stationStock,
      menuItems: this.menuItems,
      zones: this.zones,
      tables: this.tables,
      reservations: this.reservations,
      staff: this.staff,
      requirements: this.requirements,
      availabilities: this.availabilities,
      shiftAssignments: this.shiftAssignments,
      orders: this.orders
    };
  }
}

export const store = new InMemoryStore();
