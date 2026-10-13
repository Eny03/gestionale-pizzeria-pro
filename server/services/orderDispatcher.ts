import { Order, OrderItem, StationTarget } from '../../shared/types.js';
import { store } from '../db/store.js';
import { InventoryEngine } from './inventoryEngine.js';

export class OrderDispatcher {
  /**
   * Smista automaticamente i ticket della comanda ai reparti di competenza
   */
  public static processNewOrder(order: Order): {
    order: Order;
    dispatchedToPizzeria: OrderItem[];
    dispatchedToCucina: OrderItem[];
    dispatchedToBar: OrderItem[];
    heldTakeawayItems: OrderItem[];
  } {
    const isTakeawayOrDelivery = order.type === 'TAKEAWAY' || order.type === 'DELIVERY';
    const now = new Date();

    const dispatchedToPizzeria: OrderItem[] = [];
    const dispatchedToCucina: OrderItem[] = [];
    const dispatchedToBar: OrderItem[] = [];
    const heldTakeawayItems: OrderItem[] = [];

    // Calcolo target timestamp se asporto
    let targetPickupTimestamp: number | null = null;
    if (isTakeawayOrDelivery && order.pickupTime) {
      const [hours, minutes] = order.pickupTime.split(':').map(Number);
      const targetDate = new Date();
      targetDate.setHours(hours, minutes, 0, 0);
      
      // Se l'orario indicato è nel passato rispetto a oggi (es. dopo la mezzanotte), aggiungi 1 giorno
      if (targetDate.getTime() < now.getTime() - 1000 * 60 * 60) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      targetPickupTimestamp = targetDate.getTime();
    }

    order.items.forEach(item => {
      const prepMinutes = item.prepTimeMinutes || 12;

      if (isTakeawayOrDelivery && targetPickupTimestamp) {
        // Calcola l'orario esatto in cui rilasciare il ticket in reparto
        const releaseTimestamp = targetPickupTimestamp - prepMinutes * 60 * 1000;
        item.scheduledReleaseTime = new Date(releaseTimestamp).toISOString();

        // Se l'orario di rilascio è adesso o nel passato, invialo subito
        if (now.getTime() >= releaseTimestamp) {
          item.isReleased = true;
        } else {
          item.isReleased = false; // TRATTENUTO DAL SISTEMA CRON
          heldTakeawayItems.push(item);
        }
      } else {
        // Tavolo al ristorante: rilascio immediato in tempo reale
        item.isReleased = true;
      }

      // Imposta le fasi di partenza per reparto se rilasciato
      if (item.isReleased) {
        if (item.targetDepartment === 'pizzeria') {
          item.pizzeriaPhase = 'PRE_COTTURA';
          dispatchedToPizzeria.push(item);
          // Scala le scorte
          InventoryEngine.deductIngredientsForOrderItem(item);
        } else if (item.targetDepartment === 'cucina') {
          item.kitchenPhase = 'IN_ATTESA';
          dispatchedToCucina.push(item);
          InventoryEngine.deductIngredientsForOrderItem(item);
        } else if (item.targetDepartment === 'bar') {
          item.barPhase = 'IN_ATTESA';
          dispatchedToBar.push(item);
          InventoryEngine.deductIngredientsForOrderItem(item);
        }
      }
    });

    // Salva o aggiorna la comanda nello store
    const existingIndex = store.orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      store.orders[existingIndex] = order;
    } else {
      store.orders.unshift(order);
    }

    // Se la comanda è legata a un tavolo, aggiorna lo stato del tavolo
    if (order.tableId) {
      const table = store.tables.find(t => t.id === order.tableId);
      if (table) {
        table.status = 'OCCUPATO';
        table.activeOrderId = order.id;
      }
    }

    return {
      order,
      dispatchedToPizzeria,
      dispatchedToCucina,
      dispatchedToBar,
      heldTakeawayItems
    };
  }

  /**
   * Cron Job Runner: Eseguito periodicamente (es. ogni 10 secondi)
   * Controlla gli ordini d'asporto con ticket trattenuti e li rilascia
   * al momento esatto del calcolo dei tempi di preparazione.
   */
  public static checkAndReleaseTakeawayOrders(): { releasedItems: { order: Order; item: OrderItem }[] } {
    const now = Date.now();
    const releasedItems: { order: Order; item: OrderItem }[] = [];

    store.orders.forEach(order => {
      if (order.status === 'COMPLETATO' || order.status === 'ANNULLATO' || order.status === 'PAGATO') {
        return;
      }

      order.items.forEach(item => {
        if (!item.isReleased && item.scheduledReleaseTime) {
          const scheduledTime = new Date(item.scheduledReleaseTime).getTime();
          if (now >= scheduledTime) {
            // È arrivato il momento di preparare l'articolo!
            item.isReleased = true;
            item.updatedAt = new Date().toISOString();

            if (item.targetDepartment === 'pizzeria') {
              item.pizzeriaPhase = 'PRE_COTTURA';
            } else if (item.targetDepartment === 'cucina') {
              item.kitchenPhase = 'IN_ATTESA';
            } else if (item.targetDepartment === 'bar') {
              item.barPhase = 'IN_ATTESA';
            }

            // Scala automaticamente l'inventario all'inizio della lavorazione
            InventoryEngine.deductIngredientsForOrderItem(item);

            releasedItems.push({ order, item });
          }
        }
      });
    });

    return { releasedItems };
  }
}
