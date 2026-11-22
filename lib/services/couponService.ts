import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, Timestamp, type Transaction } from 'firebase-admin/firestore';
import type { FirestoreCoupon } from '@/types/firestore/store';
import {
  ValidateCouponInputSchema,
  CreateCouponInputSchema,
  UpdateCouponInputSchema,
  type ValidateCouponInput,
  type CreateCouponInput,
  type UpdateCouponInput,
} from '@/lib/validations/couponSchema';

export interface ValidatedCouponResult {
  isValid: boolean;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  discountAmountInPaise: number;
  netPayableInPaise: number;
  savingsFormatted: string;
  description: string;
}

export class CouponService {
  private couponsCol = adminDb.collection('coupons');

  /**
   * Validate a coupon code against order subtotal, customer eligibility, date window, and usage limits
   */
  async validateCoupon(rawInput: unknown): Promise<ValidatedCouponResult> {
    const input = ValidateCouponInputSchema.parse(rawInput);
    const code = input.code;
    const docRef = this.couponsCol.doc(code);
    const snap = await docRef.get();

    if (!snap.exists) {
      throw new Error(`Coupon code "${code}" is invalid.`);
    }

    const coupon = { code: snap.id, ...snap.data() } as FirestoreCoupon;

    // 1. Active status check
    if (!coupon.isActive) {
      throw new Error(`Coupon "${code}" is currently inactive.`);
    }

    // 2. Date window check
    const nowMs = Date.now();
    const startMs = coupon.startDate?.toMillis
      ? coupon.startDate.toMillis()
      : new Date(coupon.startDate as any).getTime();
    const endMs = coupon.endDate?.toMillis
      ? coupon.endDate.toMillis()
      : new Date(coupon.endDate as any).getTime();

    if (nowMs < startMs) {
      const startDateStr = new Date(startMs).toLocaleDateString('en-IN');
      throw new Error(`Coupon "${code}" is not yet active. Valid from ${startDateStr}.`);
    }

    if (nowMs > endMs) {
      const endDateStr = new Date(endMs).toLocaleDateString('en-IN');
      throw new Error(`Coupon "${code}" has expired on ${endDateStr}.`);
    }

    // 3. Total usage limit check
    if (coupon.currentUses >= coupon.maxTotalUses) {
      throw new Error(`Coupon "${code}" has reached its maximum redemption limit.`);
    }

    // 4. Minimum order value check (in integer paise)
    if (input.subtotalInPaise < coupon.minOrderValueInPaise) {
      const requiredRupees = (coupon.minOrderValueInPaise / 100).toFixed(2);
      const currentRupees = (input.subtotalInPaise / 100).toFixed(2);
      throw new Error(
        `Minimum order value of ₹${requiredRupees} required for coupon "${code}". Your current cart is ₹${currentRupees}.`
      );
    }

    // 5. First-time customer check
    if (coupon.firstTimeCustomerOnly && input.customerEmail) {
      const emailLower = input.customerEmail.toLowerCase().trim();
      const existingOrdersSnap = await adminDb
        .collection('orders')
        .where('customer.email', '==', emailLower)
        .where('orderStatus', 'in', ['confirmed', 'processing', 'completed'])
        .limit(1)
        .get();

      if (!existingOrdersSnap.empty) {
        throw new Error(`Coupon "${code}" is reserved exclusively for your first GutGlow order.`);
      }
    }

    // 6. Per-customer usage limit check
    if (input.customerEmail) {
      const emailLower = input.customerEmail.toLowerCase().trim();
      const usageDoc = await docRef.collection('usages').doc(emailLower).get();
      if (usageDoc.exists) {
        const usageCount = Number(usageDoc.data()?.usageCount) || 0;
        if (usageCount >= coupon.maxUsesPerCustomer) {
          throw new Error(
            `You have already redeemed coupon "${code}" the maximum allowable times (${coupon.maxUsesPerCustomer}).`
          );
        }
      }
    }

    // 7. Calculate Discount Amount in Integer Paise
    let discountAmountInPaise = 0;

    if (coupon.type === 'flat') {
      discountAmountInPaise = Math.min(coupon.value, input.subtotalInPaise);
    } else if (coupon.type === 'percentage') {
      const calculated = Math.round((input.subtotalInPaise * coupon.value) / 100);
      if (coupon.maxDiscountAmountInPaise && coupon.maxDiscountAmountInPaise > 0) {
        discountAmountInPaise = Math.min(calculated, coupon.maxDiscountAmountInPaise, input.subtotalInPaise);
      } else {
        discountAmountInPaise = Math.min(calculated, input.subtotalInPaise);
      }
    }

    const netPayableInPaise = input.subtotalInPaise - discountAmountInPaise;
    const savingsFormatted = `₹${(discountAmountInPaise / 100).toFixed(2)}`;
    const description =
      coupon.type === 'percentage'
        ? `${coupon.value}% OFF${coupon.maxDiscountAmountInPaise ? ` (up to ₹${(coupon.maxDiscountAmountInPaise / 100).toFixed(2)})` : ''}`
        : `₹${(coupon.value / 100).toFixed(2)} FLAT DISCOUNT`;

    return {
      isValid: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmountInPaise,
      netPayableInPaise,
      savingsFormatted,
      description,
    };
  }

  /**
   * Atomic usage increment inside order placement transaction to prevent race conditions (Task 11.3)
   */
  async recordCouponUsage(
    code: string,
    customer: { email: string; uid?: string },
    orderId: string,
    transaction?: Transaction
  ): Promise<void> {
    const normalizedCode = code.trim().toUpperCase();
    const docRef = this.couponsCol.doc(normalizedCode);
    const emailLower = customer.email.toLowerCase().trim();
    const usageRef = docRef.collection('usages').doc(emailLower);

    const updateOperations = (t: Transaction) => {
      // 1. Atomically increment global usage count
      t.update(docRef, {
        currentUses: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // 2. Atomically increment customer usage count and record order reference
      t.set(
        usageRef,
        {
          customerEmail: emailLower,
          customerUid: customer.uid || '',
          usageCount: FieldValue.increment(1),
          orders: FieldValue.arrayUnion(orderId),
          lastUsedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    };

    if (transaction) {
      updateOperations(transaction);
    } else {
      await adminDb.runTransaction(async (t) => {
        updateOperations(t);
      });
    }
  }

  /**
   * List all coupons for admin
   */
  async listCoupons(search?: string, activeOnly?: boolean): Promise<FirestoreCoupon[]> {
    let query: FirebaseFirestore.Query = this.couponsCol.orderBy('createdAt', 'desc');
    if (activeOnly) {
      query = query.where('isActive', '==', true);
    }

    const snap = await query.get();
    let coupons = snap.docs.map((d) => ({ code: d.id, ...d.data() } as FirestoreCoupon));

    if (search && search.trim()) {
      const q = search.trim().toUpperCase();
      coupons = coupons.filter((c) => c.code.includes(q));
    }

    return coupons;
  }

  /**
   * Get single coupon with usage stats
   */
  async getCoupon(code: string): Promise<FirestoreCoupon | null> {
    const normalized = code.trim().toUpperCase();
    const snap = await this.couponsCol.doc(normalized).get();
    if (!snap.exists) return null;
    return { code: snap.id, ...snap.data() } as FirestoreCoupon;
  }

  /**
   * Create a new coupon (Admin)
   */
  async createCoupon(rawInput: unknown): Promise<FirestoreCoupon> {
    const validated = CreateCouponInputSchema.parse(rawInput);
    const docRef = this.couponsCol.doc(validated.code);

    const existing = await docRef.get();
    if (existing.exists) {
      throw new Error(`Coupon with code "${validated.code}" already exists.`);
    }

    const startDate =
      validated.startDate instanceof Date
        ? Timestamp.fromDate(validated.startDate)
        : Timestamp.fromDate(new Date(validated.startDate));

    const endDate =
      validated.endDate instanceof Date
        ? Timestamp.fromDate(validated.endDate)
        : Timestamp.fromDate(new Date(validated.endDate));

    const payload = {
      code: validated.code,
      type: validated.type,
      value: validated.value,
      minOrderValueInPaise: validated.minOrderValueInPaise,
      maxDiscountAmountInPaise: validated.maxDiscountAmountInPaise ?? null,
      maxTotalUses: validated.maxTotalUses,
      maxUsesPerCustomer: validated.maxUsesPerCustomer,
      currentUses: 0,
      isActive: validated.isActive,
      startDate,
      endDate,
      firstTimeCustomerOnly: validated.firstTimeCustomerOnly,
      applicableProductIds: validated.applicableProductIds || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(payload);

    return {
      ...payload,
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any,
    } as any;
  }

  /**
   * Update an existing coupon (Admin)
   */
  async updateCoupon(code: string, rawInput: unknown): Promise<FirestoreCoupon> {
    const validated = UpdateCouponInputSchema.parse(rawInput);
    const normalized = code.trim().toUpperCase();
    const docRef = this.couponsCol.doc(normalized);

    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error(`Coupon "${code}" not found.`);
    }

    const payload: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (validated.type !== undefined) payload.type = validated.type;
    if (validated.value !== undefined) payload.value = validated.value;
    if (validated.minOrderValueInPaise !== undefined) payload.minOrderValueInPaise = validated.minOrderValueInPaise;
    if (validated.maxDiscountAmountInPaise !== undefined) payload.maxDiscountAmountInPaise = validated.maxDiscountAmountInPaise;
    if (validated.maxTotalUses !== undefined) payload.maxTotalUses = validated.maxTotalUses;
    if (validated.maxUsesPerCustomer !== undefined) payload.maxUsesPerCustomer = validated.maxUsesPerCustomer;
    if (validated.isActive !== undefined) payload.isActive = validated.isActive;
    if (validated.firstTimeCustomerOnly !== undefined) payload.firstTimeCustomerOnly = validated.firstTimeCustomerOnly;
    if (validated.applicableProductIds !== undefined) payload.applicableProductIds = validated.applicableProductIds;

    if (validated.startDate) {
      payload.startDate =
        validated.startDate instanceof Date
          ? Timestamp.fromDate(validated.startDate)
          : Timestamp.fromDate(new Date(validated.startDate));
    }
    if (validated.endDate) {
      payload.endDate =
        validated.endDate instanceof Date
          ? Timestamp.fromDate(validated.endDate)
          : Timestamp.fromDate(new Date(validated.endDate));
    }

    await docRef.update(payload);

    const updatedSnap = await docRef.get();
    return { code: updatedSnap.id, ...updatedSnap.data() } as FirestoreCoupon;
  }

  /**
   * Delete coupon (Admin)
   */
  async deleteCoupon(code: string): Promise<void> {
    const normalized = code.trim().toUpperCase();
    await this.couponsCol.doc(normalized).delete();
  }
}

export const couponService = new CouponService();
