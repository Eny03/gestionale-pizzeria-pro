import { Server, Socket } from 'socket.io';
import { store } from '../db/store.js';
import { OrderDispatcher } from '../services/orderDispatcher.js';
import { InventoryEngine } from '../services/inventoryEngine.js';
import { SchedulerAlgo } from '../services/schedulerAlgo.js';
import {
  Order,
  RestaurantTable,
  RestaurantZone,
  Reservation,
  StaffAvailability,
  DayStaffRequirement,
  ShiftAssignment,
  Ingredient,
  StationStockItem,
  MenuItem
} from '../../shared/types.js';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Nuovo client connesso: ${socket.id}`);

    // Invia subito lo stato completo iniziale
    socket.emit('INITIAL_STATE', store.getAllData());

    // 1. Creazione Comanda (Cameriere o Asporto)
    socket.on('order:create', (orderData: Order) => {
      console.log(`[Order] Ricevuta comanda ${orderData.code} da ${orderData.waiterName}`);
      const result = OrderDispatcher.processNewOrder(orderData);

      io.emit('ORDER_CREATED', result.order);
      io.emit('GLOBAL_INVENTORY_UPDATED', store.ingredients);
      io.emit('STATION_STOCK_UPDATED', store.stationStock);
      io.emit('TABLE_UPDATED', store.tables);

      if (result.heldTakeawayItems.length > 0) {
        io.emit('NOTIFICATION_ALERT', {
          title: 'Asporto Programmato',
          message: `${result.heldTakeawayItems.length} articoli trattenuti in attesa dell'orario di preparazione.`,
          type: 'info'
        });
      }
    });

    // 2. Cambio Fase Articolo (Pizzeria Pre/Post, Cucina, Bar)
    socket.on('order:updateItemPhase', (payload: {
      orderId: string;
      itemId: string;
      phase: string;
      department: 'pizzeria' | 'cucina' | 'bar';
    }) => {
      const order = store.orders.find(o => o.id === payload.orderId);
      if (!order) return;

      const item = order.items.find(i => i.id === payload.itemId);
      if (!item) return;

      if (payload.department === 'pizzeria') {
        item.pizzeriaPhase = payload.phase as any;
      } else if (payload.department === 'cucina') {
        item.kitchenPhase = payload.phase as any;
      } else if (payload.department === 'bar') {
        item.barPhase = payload.phase as any;
      }

      item.updatedAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();

      // Se tutti gli articoli sono pronti, aggiorna lo stato dell'ordine
      const allReady = order.items.every(i => {
        if (i.targetDepartment === 'pizzeria') return i.pizzeriaPhase === 'PRONTO';
        if (i.targetDepartment === 'cucina') return i.kitchenPhase === 'PRONTO';
        if (i.targetDepartment === 'bar') return i.barPhase === 'PRONTO';
        return true;
      });

      if (allReady && order.status !== 'PAGATO') {
        order.status = 'PRONTO';
      }

      io.emit('ORDER_UPDATED', order);
    });

    // 3. Pagamento e Chiusura Conto (Cassa Veloce / Cameriere)
    socket.on('order:pay', (payload: {
      orderId: string;
      method: 'CONTANTI' | 'CARTA' | 'DIVISO';
    }) => {
      const order = store.orders.find(o => o.id === payload.orderId);
      if (!order) return;

      order.isPaid = true;
      order.paidAt = new Date().toISOString();
      order.paymentMethod = payload.method;
      order.status = 'PAGATO';

      // Libera il tavolo se era occupato
      if (order.tableId) {
        const table = store.tables.find(t => t.id === order.tableId);
        if (table) {
          table.status = 'LIBERO';
          table.activeOrderId = undefined;
        }
      }

      io.emit('ORDER_PAID', order);
      io.emit('TABLE_UPDATED', store.tables);
    });

    // 4. Aggiornamento Tavolo & Layout (Capo Sala)
    socket.on('table:update', (table: RestaurantTable) => {
      const index = store.tables.findIndex(t => t.id === table.id);
      if (index >= 0) {
        store.tables[index] = table;
      } else {
        store.tables.push(table);
      }
      io.emit('TABLE_UPDATED', store.tables);
    });

    socket.on('zone:create', (zone: RestaurantZone) => {
      store.zones.push(zone);
      io.emit('ZONE_UPDATED', store.zones);
    });

    socket.on('reservation:create', (reservation: Reservation) => {
      store.reservations.unshift(reservation);
      const table = store.tables.find(t => t.id === reservation.tableId);
      if (table) {
        table.status = 'PRENOTATO';
        table.activeReservationId = reservation.id;
      }
      io.emit('RESERVATION_CREATED', reservation);
      io.emit('TABLE_UPDATED', store.tables);
    });

    // 5. Gestione Inventario (Cucina & Pizzeria)
    socket.on('inventory:updateIngredient', (ingredient: Ingredient) => {
      const idx = store.ingredients.findIndex(i => i.id === ingredient.id);
      if (idx >= 0) {
        store.ingredients[idx] = ingredient;
      } else {
        store.ingredients.push(ingredient);
      }
      io.emit('GLOBAL_INVENTORY_UPDATED', store.ingredients);
    });

    socket.on('inventory:deleteIngredient', (ingredientId: string) => {
      store.ingredients = store.ingredients.filter(i => i.id !== ingredientId);
      store.stationStock = store.stationStock.filter(s => s.ingredientId !== ingredientId);
      io.emit('GLOBAL_INVENTORY_UPDATED', store.ingredients);
      io.emit('STATION_STOCK_UPDATED', store.stationStock);
    });

    socket.on('stationStock:update', (stockItem: StationStockItem) => {
      const idx = store.stationStock.findIndex(s => s.ingredientId === stockItem.ingredientId);
      if (idx >= 0) {
        store.stationStock[idx] = stockItem;
      } else {
        store.stationStock.push(stockItem);
      }
      io.emit('STATION_STOCK_UPDATED', store.stationStock);
    });

    // 6. Gestione Turni (HR)
    socket.on('availability:submit', (availability: StaffAvailability) => {
      const idx = store.availabilities.findIndex(
        a => a.staffId === availability.staffId && a.date === availability.date && a.shiftType === availability.shiftType
      );
      if (idx >= 0) {
        store.availabilities[idx] = availability;
      } else {
        store.availabilities.push(availability);
      }
      io.emit('AVAILABILITIES_UPDATED', store.availabilities);
    });

    socket.on('requirements:update', (reqs: DayStaffRequirement[]) => {
      store.requirements = reqs;
      io.emit('REQUIREMENTS_UPDATED', store.requirements);
    });

    socket.on('shifts:generate', () => {
      const result = SchedulerAlgo.generateSchedule(
        store.staff,
        store.requirements,
        store.availabilities,
        store.shiftAssignments
      );
      store.shiftAssignments = result.assignments;
      io.emit('SHIFTS_GENERATED', {
        assignments: store.shiftAssignments,
        report: result.report
      });
    });

    socket.on('shift:override', (assignment: ShiftAssignment) => {
      const idx = store.shiftAssignments.findIndex(a => a.id === assignment.id);
      if (idx >= 0) {
        store.shiftAssignments[idx] = { ...assignment, isManualOverride: true, locked: true };
      } else {
        store.shiftAssignments.push({ ...assignment, isManualOverride: true, locked: true });
      }
      io.emit('SHIFT_OVERRIDE', store.shiftAssignments);
    });

    // 7. Menu Management (Admin)
    socket.on('menu:saveItem', (item: MenuItem) => {
      const idx = store.menuItems.findIndex(m => m.id === item.id);
      if (idx >= 0) {
        store.menuItems[idx] = item;
      } else {
        store.menuItems.push(item);
      }
      io.emit('MENU_UPDATED', store.menuItems);
    });

    socket.on('menu:deleteItem', (itemId: string) => {
      store.menuItems = store.menuItems.filter(m => m.id !== itemId);
      io.emit('MENU_UPDATED', store.menuItems);
    });
  });

  // Background Cron Job per lo smistamento asporto
  setInterval(() => {
    const { releasedItems } = OrderDispatcher.checkAndReleaseTakeawayOrders();
    if (releasedItems.length > 0) {
      releasedItems.forEach(({ order, item }) => {
        io.emit('ORDER_UPDATED', order);
        io.emit('NOTIFICATION_ALERT', {
          title: 'Asporto Pronto alla Lavorazione!',
          message: `L'articolo "${item.name}" per l'ordine ${order.code} è stato inviato al reparto ${item.targetDepartment.toUpperCase()}.`,
          type: 'warning'
        });
      });
      io.emit('GLOBAL_INVENTORY_UPDATED', store.ingredients);
      io.emit('STATION_STOCK_UPDATED', store.stationStock);
    }
  }, 5000); // Controllo ogni 5 secondi
}
