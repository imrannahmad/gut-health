import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { ProductRepository } from '@/lib/repositories/productRepository';
import { InventoryRepository } from '@/lib/repositories/inventoryRepository';
import {
  ValidateCartInputSchema,
  SyncCartInputSchema,
  type CartItemInput,
} from '@/lib/validations/cartSchema';
import type {
  FirestoreCart,
  FirestoreCartItem,
  CartValidationResult,
  CartValidationSummary,
} from '@/types/firestore/cart';

export class CartService {
  private cartsCol = adminDb.collection('carts');
  private productRepo = new ProductRepository();
  private inventoryRepo = new InventoryRepository();

  /**
   * Authoritative server-side calculation and physical inventory validation
   */
  async validateCart(rawInput: unknown): Promise<CartValidationResult> {
    const validated = ValidateCartInputSchema.parse(rawInput);
    const errors: string[] = [];

    let subtotalInPaise = 0;
    let totalPhysicalUnits = 0;
    const validatedItems: CartValidationResult['items'] = [];
    const baseSku = 'GG-DWF-200G';

    // 1. Fetch live physical stock for the base SKU
    const inventory = await this.inventoryRepo.getInventory(baseSku);
    const availableStock = inventory?.quantityAvailable ?? 0;

    // 2. Validate each item against authoritative product catalog
    for (const item of validated.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product || product.status !== 'active') {
        errors.push(`Product "${item.productId}" is currently unavailable or inactive.`);
        validatedItems.push({
          productId: item.productId,
          packOptionId: item.packOptionId,
          productName: product?.name || 'Unavailable Product',
          packName: 'Unavailable',
          image: '/images/gutglow-product-front.jpg',
          quantity: item.quantity,
          unitPriceInPaise: 0,
          subtotalInPaise: 0,
          physicalUnits: 0,
          isAvailable: false,
        });
        continue;
      }

      // Match pack option by id or packId
      const pack = product.packOptions?.find(
        (p: any) => p.id === item.packOptionId || p.packId === item.packOptionId
      );

      if (!pack || pack.isActive === false) {
        errors.push(`Pack configuration "${item.packOptionId}" for product "${product.name}" is invalid or inactive.`);
        validatedItems.push({
          productId: item.productId,
          packOptionId: item.packOptionId,
          productName: product.name,
          packName: 'Invalid Pack',
          image: product.images?.[0]?.src || '/images/gutglow-product-front.jpg',
          quantity: item.quantity,
          unitPriceInPaise: 0,
          subtotalInPaise: 0,
          physicalUnits: 0,
          isAvailable: false,
        });
        continue;
      }

      // Authoritative integer paise price
      const unitPriceInPaise = pack.sellingPriceInPaise || 199900;
      const multiplier = pack.packQuantity || 1;
      const physicalUnits = multiplier * item.quantity;
      const itemSubtotalInPaise = unitPriceInPaise * item.quantity;

      subtotalInPaise += itemSubtotalInPaise;
      totalPhysicalUnits += physicalUnits;

      validatedItems.push({
        productId: product.id,
        packOptionId: pack.id || item.packOptionId,
        productName: product.name,
        packName: pack.name,
        image: product.images?.[0]?.src || '/images/gutglow-product-front.jpg',
        quantity: item.quantity,
        unitPriceInPaise,
        subtotalInPaise: itemSubtotalInPaise,
        physicalUnits,
        isAvailable: true,
      });
    }

    // 3. Physical Inventory Availability Check
    const isStockAvailable = availableStock >= totalPhysicalUnits;
    if (!isStockAvailable) {
      const shortage = totalPhysicalUnits - availableStock;
      errors.push(
        `Insufficient physical stock: ${totalPhysicalUnits} units requested, but only ${availableStock} currently available (${shortage} short).`
      );
    }

    // 4. Financial Calculations in Integer Paise
    // Free shipping threshold: ₹1,500.00 (150,000 paise)
    const FREE_SHIPPING_THRESHOLD_PAISE = 150000;
    const STANDARD_SHIPPING_FEE_PAISE = 9900; // ₹99.00
    const shippingFeeInPaise =
      subtotalInPaise >= FREE_SHIPPING_THRESHOLD_PAISE || subtotalInPaise === 0
        ? 0
        : STANDARD_SHIPPING_FEE_PAISE;

    // 18% GST Inclusive Calculation (Consumer prices in India include GST)
    // Formula: GST = Math.round(subtotal * 1800 / 11800)
    const estimatedGstInPaise = Math.round((subtotalInPaise * 1800) / 11800);
    const cgstInPaise = Math.round(estimatedGstInPaise / 2);
    const sgstInPaise = estimatedGstInPaise - cgstInPaise;

    const totalInPaise = subtotalInPaise + shippingFeeInPaise;

    const summary: CartValidationSummary = {
      subtotalInPaise,
      shippingFeeInPaise,
      estimatedGstInPaise,
      cgstInPaise,
      sgstInPaise,
      totalInPaise,
      totalPhysicalUnits,
    };

    return {
      isValid: errors.length === 0 && isStockAvailable,
      isStockAvailable,
      items: validatedItems,
      summary,
      stockStatus: {
        isAvailable: isStockAvailable,
        availableStock,
        requiredStock: totalPhysicalUnits,
        shortage: isStockAvailable ? 0 : totalPhysicalUnits - availableStock,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Get server-side persisted cart for an authenticated user
   */
  async getCart(uid: string): Promise<FirestoreCart | null> {
    const snap = await this.cartsCol.doc(uid).get();
    if (!snap.exists) return null;
    return { userId: snap.id, ...snap.data() } as FirestoreCart;
  }

  /**
   * Save / Overwrite authenticated user's cart in Firestore
   */
  async saveCart(uid: string, rawInput: unknown): Promise<FirestoreCart> {
    const validatedCart = await this.validateCart(rawInput);
    const docRef = this.cartsCol.doc(uid);

    const cartItems: FirestoreCartItem[] = validatedCart.items
      .filter((i) => i.isAvailable)
      .map((i) => ({
        productId: i.productId,
        packOptionId: i.packOptionId,
        quantity: i.quantity,
        unitPriceInPaise: i.unitPriceInPaise,
        subtotalInPaise: i.subtotalInPaise,
        physicalUnitsCount: i.physicalUnits,
        productName: i.productName,
        packName: i.packName,
        image: i.image,
        addedAt: Timestamp.now() as any,
      }));

    const cartPayload = {
      userId: uid,
      items: cartItems,
      subtotalInPaise: validatedCart.summary.subtotalInPaise,
      shippingFeeInPaise: validatedCart.summary.shippingFeeInPaise,
      taxInPaise: validatedCart.summary.estimatedGstInPaise,
      totalInPaise: validatedCart.summary.totalInPaise,
      totalPhysicalUnits: validatedCart.summary.totalPhysicalUnits,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(
      {
        ...cartPayload,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      ...cartPayload,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    } as any;
  }

  /**
   * Merge guest/local cart items with existing server-side cart on customer login
   */
  async mergeCart(uid: string, rawInput: unknown): Promise<FirestoreCart> {
    const parsed = SyncCartInputSchema.parse(rawInput);
    const existingCart = await this.getCart(uid);

    const mergedMap = new Map<string, CartItemInput>();

    // 1. Add existing remote items
    if (existingCart?.items) {
      for (const item of existingCart.items) {
        const key = `${item.productId}:::${item.packOptionId}`;
        mergedMap.set(key, {
          productId: item.productId,
          packOptionId: item.packOptionId,
          quantity: item.quantity,
        });
      }
    }

    // 2. Merge local items
    for (const item of parsed.items) {
      const key = `${item.productId}:::${item.packOptionId}`;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        // Keep combined quantity, capped at 10 packs per item
        mergedMap.set(key, {
          ...existing,
          quantity: Math.min(10, existing.quantity + item.quantity),
        });
      } else {
        mergedMap.set(key, item);
      }
    }

    const mergedList = Array.from(mergedMap.values());
    return this.saveCart(uid, { items: mergedList });
  }

  /**
   * Clear user's persisted cart
   */
  async clearCart(uid: string): Promise<void> {
    await this.cartsCol.doc(uid).delete();
  }
}

export const cartService = new CartService();
