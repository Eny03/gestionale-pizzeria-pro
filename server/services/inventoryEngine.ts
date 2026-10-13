import { store } from '../db/store.js';
import { OrderItem } from '../../shared/types.js';

export class InventoryEngine {
  /**
   * Scala automaticamente gli ingredienti dalla scorta della stazione (Pizzeria)
   * e dal magazzino generale quando un piatto/pizza viene preparato.
   */
  public static deductIngredientsForOrderItem(item: OrderItem): void {
    const menuItem = store.menuItems.find(m => m.id === item.menuItemId);
    if (!menuItem) return;

    for (const recipePart of menuItem.recipe) {
      const totalAmount = recipePart.quantity * item.quantity;

      // 1. Scala dal Magazzino Globale
      const globalIngredient = store.ingredients.find(ing => ing.id === recipePart.ingredientId);
      if (globalIngredient) {
        globalIngredient.currentStock = Math.max(0, Number((globalIngredient.currentStock - totalAmount).toFixed(3)));
      }

      // 2. Scala dalla Scorta di Stazione (se presente nella linea serale della Pizzeria)
      const stationItem = store.stationStock.find(s => s.ingredientId === recipePart.ingredientId);
      if (stationItem) {
        stationItem.usedQty = Number((stationItem.usedQty + totalAmount).toFixed(3));
        stationItem.currentQty = Math.max(0, Number((stationItem.startQty - stationItem.usedQty).toFixed(3)));
      }
    }

    // Gestisci anche gli ingredienti extra aggiunti tramite la personalizzazione del cameriere
    for (const added of item.customization.addedIngredients) {
      const globalIngredient = store.ingredients.find(ing => ing.id === added.ingredientId);
      if (globalIngredient) {
        // Applica decremento convenzionale in base all'unità (es. 0.05kg o 1pz)
        const deltaQty = globalIngredient.unit === 'pz' ? 1 * item.quantity : 0.05 * item.quantity;
        globalIngredient.currentStock = Math.max(0, Number((globalIngredient.currentStock - deltaQty).toFixed(3)));
        
        const stationItem = store.stationStock.find(s => s.ingredientId === added.ingredientId);
        if (stationItem) {
          stationItem.usedQty = Number((stationItem.usedQty + deltaQty).toFixed(3));
          stationItem.currentQty = Math.max(0, Number((stationItem.startQty - stationItem.usedQty).toFixed(3)));
        }
      }
    }
  }

  /**
   * Verifica se ci sono prodotti sotto la soglia minima o in scadenza entro 2 giorni
   */
  public static checkAlerts(): { lowStock: string[]; expiringSoon: string[] } {
    const today = new Date().toISOString().split('T')[0];
    const twoDaysLater = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const lowStock = store.ingredients
      .filter(i => i.currentStock <= i.minThreshold)
      .map(i => `${i.name} (${i.currentStock} ${i.unit} rimasti, soglia: ${i.minThreshold} ${i.unit})`);

    const expiringSoon = store.ingredients
      .filter(i => i.expiryDate <= twoDaysLater)
      .map(i => `${i.name} (Scade il: ${i.expiryDate})`);

    return { lowStock, expiringSoon };
  }
}
