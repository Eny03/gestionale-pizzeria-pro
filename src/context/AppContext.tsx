import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  UserRole,
  UserSession,
  Order,
  OrderItem,
  Ingredient,
  StationStockItem,
  MenuItem,
  RestaurantZone,
  RestaurantTable,
  Reservation,
  StaffMember,
  DayStaffRequirement,
  StaffAvailability,
  ShiftAssignment,
  SchedulingFairnessReport
} from '../../shared/types';

interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AppContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  
  // Data State
  orders: Order[];
  ingredients: Ingredient[];
  stationStock: StationStockItem[];
  menuItems: MenuItem[];
  zones: RestaurantZone[];
  tables: RestaurantTable[];
  reservations: Reservation[];
  staff: StaffMember[];
  requirements: DayStaffRequirement[];
  availabilities: StaffAvailability[];
  shiftAssignments: ShiftAssignment[];
  fairnessReport: SchedulingFairnessReport | null;
  notifications: NotificationToast[];
  dismissNotification: (id: string) => void;

  // Actions
  createOrder: (order: Order) => void;
  updateItemPhase: (orderId: string, itemId: string, phase: string, department: 'pizzeria' | 'cucina' | 'bar') => void;
  payOrder: (orderId: string, method: 'CONTANTI' | 'CARTA' | 'DIVISO') => void;
  updateTable: (table: RestaurantTable) => void;
  createZone: (zone: RestaurantZone) => void;
  createReservation: (reservation: Reservation) => void;
  updateIngredient: (ingredient: Ingredient) => void;
  updateStationStock: (stockItem: StationStockItem) => void;
  submitAvailability: (avail: StaffAvailability) => void;
  updateRequirements: (reqs: DayStaffRequirement[]) => void;
  generateShifts: () => void;
  overrideShift: (assignment: ShiftAssignment) => void;
  mergeTables: (tableIds: string[]) => void;
  splitTavolata: (tavolataGroupId: string) => void;
  toggleEndSeat: (tableId: string) => void;
  saveMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('CAMERIERE');
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'st-1',
    name: 'Marco Rossi',
    role: 'CAMERIERE'
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stationStock, setStationStock] = useState<StationStockItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [zones, setZones] = useState<RestaurantZone[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [requirements, setRequirements] = useState<DayStaffRequirement[]>([]);
  const [availabilities, setAvailabilities] = useState<StaffAvailability[]>([]);
  const [shiftAssignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [fairnessReport, setFairnessReport] = useState<SchedulingFairnessReport | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newToast: NotificationToast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setNotifications(prev => [newToast, ...prev.slice(0, 4)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    // Inizializza Socket.IO
    const socketUrl = window.location.port === '5173' ? 'http://localhost:3001' : window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    // Recupera stato offline se presente in cache
    try {
      const cached = localStorage.getItem('pizzeria_cached_state');
      if (cached) {
        const data = JSON.parse(cached);
        if (data.orders) setOrders(data.orders);
        if (data.menuItems) setMenuItems(data.menuItems);
        if (data.tables) setTables(data.tables);
        if (data.ingredients) setIngredients(data.ingredients);
        if (data.zones) setZones(data.zones);
      }
    } catch (e) {
      console.warn('Errore lettura cache offline:', e);
    }

    newSocket.on('connect', () => {
      console.log('✅ Connesso al server real-time');
      setIsConnected(true);

      // Sincronizza eventuali comande create offline
      try {
        const pending = localStorage.getItem('pizzeria_offline_queue');
        if (pending) {
          const queue = JSON.parse(pending);
          if (Array.isArray(queue) && queue.length > 0) {
            queue.forEach((offlineOrder: Order) => {
              newSocket.emit('order:create', offlineOrder);
            });
            localStorage.removeItem('pizzeria_offline_queue');
            addToast('Sincronizzazione Completa', `${queue.length} comande offline inviate al server!`, 'success');
          }
        }
      } catch (e) {
        console.error('Errore sincronizzazione queue offline:', e);
      }
    });

    newSocket.on('disconnect', () => {
      console.warn('❌ Disconnesso dal server real-time (Modalità Offline Attiva)');
      setIsConnected(false);
      addToast('Modalità Offline', 'Sei offline. Le comande verranno salvate in memoria e sincronizzate automaticamente.', 'warning');
    });

    newSocket.on('INITIAL_STATE', (data: any) => {
      // Salva in cache per utilizzo offline
      try {
        localStorage.setItem('pizzeria_cached_state', JSON.stringify(data));
      } catch (e) {}

      if (data.orders) setOrders(data.orders);
      if (data.ingredients) setIngredients(data.ingredients);
      if (data.stationStock) setStationStock(data.stationStock);
      if (data.menuItems) setMenuItems(data.menuItems);
      if (data.zones) setZones(data.zones);
      if (data.tables) setTables(data.tables);
      if (data.reservations) setReservations(data.reservations);
      if (data.staff) setStaff(data.staff);
      if (data.requirements) setRequirements(data.requirements);
      if (data.availabilities) setAvailabilities(data.availabilities);
      if (data.shiftAssignments) setShiftAssignments(data.shiftAssignments);
    });

    newSocket.on('ORDER_CREATED', (order: Order) => {
      setOrders(prev => [order, ...prev.filter(o => o.id !== order.id)]);
      addToast('Nuova Comanda!', `Comanda ${order.code} registrata per ${order.tableName || 'Asporto'}`, 'success');
    });

    newSocket.on('ORDER_UPDATED', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    });

    newSocket.on('ORDER_PAID', (order: Order) => {
      setOrders(prev => prev.map(o => o.id === order.id ? order : o));
      addToast('Conto Chiuso', `Tavolo ${order.tableName} ha pagato ${order.totalAmount.toFixed(2)}€`, 'success');
    });

    newSocket.on('GLOBAL_INVENTORY_UPDATED', (updatedIngredients: Ingredient[]) => {
      setIngredients(updatedIngredients);
    });

    newSocket.on('STATION_STOCK_UPDATED', (updatedStock: StationStockItem[]) => {
      setStationStock(updatedStock);
    });

    newSocket.on('TABLE_UPDATED', (updatedTables: RestaurantTable[]) => {
      setTables(updatedTables);
    });

    newSocket.on('ZONE_UPDATED', (updatedZones: RestaurantZone[]) => {
      setZones(updatedZones);
    });

    newSocket.on('RESERVATION_CREATED', (res: Reservation) => {
      setReservations(prev => [res, ...prev]);
      addToast('Nuova Prenotazione', `${res.customerName} per Tavolo #${res.tableNumber} alle ${res.reservationTime}`, 'info');
    });

    newSocket.on('AVAILABILITIES_UPDATED', (avails: StaffAvailability[]) => {
      setAvailabilities(avails);
    });

    newSocket.on('REQUIREMENTS_UPDATED', (reqs: DayStaffRequirement[]) => {
      setRequirements(reqs);
    });

    newSocket.on('SHIFTS_GENERATED', (data: { assignments: ShiftAssignment[]; report: SchedulingFairnessReport }) => {
      setShiftAssignments(data.assignments);
      setFairnessReport(data.report);
      addToast('Turni Generati!', `Pianificazione completata con Equità: ${data.report.fairnessScore}%`, 'success');
    });

    newSocket.on('SHIFT_OVERRIDE', (assignments: ShiftAssignment[]) => {
      setShiftAssignments(assignments);
      addToast('Override Turno', 'Modifica manuale turno applicata con successo', 'info');
    });

    newSocket.on('MENU_UPDATED', (items: MenuItem[]) => {
      setMenuItems(items);
    });

    newSocket.on('NOTIFICATION_ALERT', (alert: { title: string; message: string; type: any }) => {
      addToast(alert.title, alert.message, alert.type);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Action dispatches
  const createOrder = (order: Order) => {
    if (socket?.connected) {
      socket.emit('order:create', order);
    } else {
      // Salva in coda offline e aggiorna la UI locale
      setOrders(prev => [order, ...prev]);
      try {
        const pending = localStorage.getItem('pizzeria_offline_queue');
        const queue = pending ? JSON.parse(pending) : [];
        queue.push(order);
        localStorage.setItem('pizzeria_offline_queue', JSON.stringify(queue));
        addToast('Comanda Registrata Offline', `Comanda ${order.code} salvata in memoria locale!`, 'warning');
      } catch (e) {
        console.error('Errore salvataggio offline:', e);
      }
    }
  };

  const updateItemPhase = (orderId: string, itemId: string, phase: string, department: 'pizzeria' | 'cucina' | 'bar') => {
    socket?.emit('order:updateItemPhase', { orderId, itemId, phase, department });
  };

  const payOrder = (orderId: string, method: 'CONTANTI' | 'CARTA' | 'DIVISO') => {
    socket?.emit('order:pay', { orderId, method });
  };

  const updateTable = (table: RestaurantTable) => {
    socket?.emit('table:update', table);
  };

  const createZone = (zone: RestaurantZone) => {
    socket?.emit('zone:create', zone);
  };

  const createReservation = (reservation: Reservation) => {
    socket?.emit('reservation:create', reservation);
  };

  const updateIngredient = (ingredient: Ingredient) => {
    socket?.emit('inventory:updateIngredient', ingredient);
  };

  const updateStationStock = (stockItem: StationStockItem) => {
    socket?.emit('stationStock:update', stockItem);
  };

  const submitAvailability = (avail: StaffAvailability) => {
    socket?.emit('availability:submit', avail);
  };

  const updateRequirements = (reqs: DayStaffRequirement[]) => {
    socket?.emit('requirements:update', reqs);
  };

  const generateShifts = () => {
    socket?.emit('shifts:generate');
  };

  const overrideShift = (assignment: ShiftAssignment) => {
    socket?.emit('shift:override', assignment);
  };

  const saveMenuItem = (item: MenuItem) => {
    socket?.emit('menu:saveItem', item);
  };

  const toggleEndSeat = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    const newHasEnd = !table.hasEndSeat;
    const newSeats = newHasEnd ? 3 : 2;
    const updated = { ...table, hasEndSeat: newHasEnd, seats: newSeats };
    updateTable(updated);
  };

  const mergeTables = (tableIds: string[]) => {
    const selected = tables.filter(t => tableIds.includes(t.id));
    if (selected.length < 2) return;
    const groupId = `tav-${Date.now()}`;
    const name = `Tavolata ${selected.map(t => 'T' + t.number).join('+')}`;
    selected.forEach(t => {
      updateTable({
        ...t,
        tavolataGroupId: groupId,
        tavolataName: name
      });
    });
    addToast('Tavolata Creata', `${name} creata con successo!`, 'success');
  };

  const splitTavolata = (groupId: string) => {
    const grouped = tables.filter(t => t.tavolataGroupId === groupId);
    grouped.forEach(t => {
      updateTable({
        ...t,
        tavolataGroupId: undefined,
        tavolataName: undefined
      });
    });
    addToast('Tavolata Sciolta', 'I tavoli sono stati separati.', 'info');
  };

  const deleteMenuItem = (itemId: string) => {
    socket?.emit('menu:deleteItem', itemId);
  };

  return (
    <AppContext.Provider
      value={{
        socket,
        isConnected,
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        orders,
        ingredients,
        stationStock,
        menuItems,
        zones,
        tables,
        reservations,
        staff,
        requirements,
        availabilities,
        shiftAssignments,
        fairnessReport,
        notifications,
        dismissNotification,
        createOrder,
        updateItemPhase,
        payOrder,
        updateTable,
        createZone,
        createReservation,
        updateIngredient,
        updateStationStock,
        submitAvailability,
        updateRequirements,
        generateShifts,
        overrideShift,
        mergeTables,
        splitTavolata,
        toggleEndSeat,
        saveMenuItem,
        deleteMenuItem
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
