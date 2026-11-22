import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { FirestoreUser, FirestoreAddress, FirestoreSupportNote } from '@/types/firestore/user';
import { AddressSchema, UpdateAddressSchema, type AddressInput, type UpdateAddressInput } from '@/lib/validations/addressSchema';
import { UpdateCustomerProfileSchema, SupportNoteSchema, type UpdateCustomerProfileInput, type SupportNoteInput } from '@/lib/validations/customerProfileSchema';

export class CustomerService {
  private usersCol = adminDb.collection('users');

  /**
   * Auto-provisions or syncs user document in Firestore on registration/login
   */
  async ensureCustomerUserDoc(
    uid: string,
    email: string,
    name?: string,
    phone?: string
  ): Promise<FirestoreUser> {
    const docRef = this.usersCol.doc(uid);
    const snap = await docRef.get();

    if (!snap.exists) {
      const parts = (name || '').trim().split(' ');
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';

      const newUser: Omit<FirestoreUser, 'createdAt' | 'updatedAt'> = {
        uid,
        email,
        phone: phone || '',
        firstName,
        lastName,
        totalOrders: 0,
        totalSpendInPaise: 0,
        isEmailVerified: true,
      };

      await docRef.set({
        ...newUser,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        ...newUser,
        createdAt: TimestampNow(),
        updatedAt: TimestampNow(),
      } as any;
    }

    return { uid: snap.id, ...snap.data() } as FirestoreUser;
  }

  /**
   * Get customer profile and their saved addresses
   */
  async getCustomerProfile(uid: string): Promise<{ user: FirestoreUser; addresses: FirestoreAddress[] } | null> {
    const docRef = this.usersCol.doc(uid);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const user = { uid: snap.id, ...snap.data() } as FirestoreUser;
    const addresses = await this.listAddresses(uid);

    return { user, addresses };
  }

  /**
   * Update personal profile info (forbidding role or financial field elevation)
   */
  async updateCustomerProfile(uid: string, rawInput: unknown): Promise<void> {
    const validated = UpdateCustomerProfileSchema.parse(rawInput);
    const docRef = this.usersCol.doc(uid);

    const updatePayload: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (validated.firstName !== undefined) updatePayload.firstName = validated.firstName;
    if (validated.lastName !== undefined) updatePayload.lastName = validated.lastName;
    if (validated.phone !== undefined) updatePayload.phone = validated.phone;

    await docRef.update(updatePayload);
  }

  /**
   * List all saved addresses for a customer
   */
  async listAddresses(uid: string): Promise<FirestoreAddress[]> {
    const snap = await this.usersCol.doc(uid).collection('addresses').orderBy('createdAt', 'desc').get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as FirestoreAddress));
  }

  /**
   * Add a new shipping/billing address
   */
  async addAddress(uid: string, rawInput: unknown): Promise<FirestoreAddress> {
    const validated = AddressSchema.parse(rawInput);
    const addressCol = this.usersCol.doc(uid).collection('addresses');

    // If marked default, unset existing defaults
    if (validated.isDefaultShipping) {
      await this.unsetExistingDefault(uid, 'isDefaultShipping');
    }
    if (validated.isDefaultBilling) {
      await this.unsetExistingDefault(uid, 'isDefaultBilling');
    }

    const docRef = addressCol.doc();
    const payload = {
      ...validated,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(payload);

    return {
      id: docRef.id,
      ...validated,
      createdAt: TimestampNow(),
      updatedAt: TimestampNow(),
    } as any;
  }

  /**
   * Update an existing address
   */
  async updateAddress(uid: string, addressId: string, rawInput: unknown): Promise<void> {
    const validated = UpdateAddressSchema.parse(rawInput);
    const docRef = this.usersCol.doc(uid).collection('addresses').doc(addressId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error('Address not found.');
    }

    if (validated.isDefaultShipping) {
      await this.unsetExistingDefault(uid, 'isDefaultShipping', addressId);
    }
    if (validated.isDefaultBilling) {
      await this.unsetExistingDefault(uid, 'isDefaultBilling', addressId);
    }

    await docRef.update({
      ...validated,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Delete an address
   */
  async deleteAddress(uid: string, addressId: string): Promise<void> {
    const docRef = this.usersCol.doc(uid).collection('addresses').doc(addressId);
    await docRef.delete();
  }

  /**
   * Admin customer list with search and lifetime value metrics
   */
  async listCustomersForAdmin(search?: string, limit: number = 50) {
    let query: FirebaseFirestore.Query = this.usersCol.orderBy('createdAt', 'desc').limit(limit);
    const snap = await query.get();
    let customers = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as FirestoreUser));

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      customers = customers.filter(
        (c) =>
          c.email?.toLowerCase().includes(q) ||
          c.firstName?.toLowerCase().includes(q) ||
          c.lastName?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      );
    }

    return customers;
  }

  /**
   * Add internal customer support note (Admin only)
   */
  async addSupportNote(
    uid: string,
    author: { id: string; name: string; email: string },
    rawInput: unknown
  ): Promise<FirestoreSupportNote> {
    const validated = SupportNoteSchema.parse(rawInput);
    const notesCol = this.usersCol.doc(uid).collection('supportNotes');
    const docRef = notesCol.doc();

    const payload = {
      authorId: author.id,
      authorName: author.name,
      authorEmail: author.email,
      note: validated.note,
      createdAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(payload);

    return {
      id: docRef.id,
      ...payload,
      createdAt: TimestampNow(),
    } as any;
  }

  /**
   * List internal customer support notes
   */
  async listSupportNotes(uid: string): Promise<FirestoreSupportNote[]> {
    const snap = await this.usersCol.doc(uid).collection('supportNotes').orderBy('createdAt', 'desc').get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreSupportNote));
  }

  /**
   * Get full customer CRM details for admin view (profile, addresses, notes, and orders)
   */
  async getCustomerDetailForAdmin(uid: string) {
    const userSnap = await this.usersCol.doc(uid).get();
    if (!userSnap.exists) return null;

    const user = { uid: userSnap.id, ...userSnap.data() } as FirestoreUser;
    const addresses = await this.listAddresses(uid);
    const supportNotes = await this.listSupportNotes(uid);

    // Fetch customer's orders if any exist in the 'orders' collection
    let recentOrders: any[] = [];
    try {
      const ordersSnap = await adminDb
        .collection('orders')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();

      recentOrders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      // Orders index might not exist or orders collection is empty in early phases
      recentOrders = [];
    }

    return {
      user,
      addresses,
      supportNotes,
      recentOrders,
    };
  }

  private async unsetExistingDefault(uid: string, field: 'isDefaultShipping' | 'isDefaultBilling', excludeId?: string) {
    const snap = await this.usersCol.doc(uid).collection('addresses').where(field, '==', true).get();
    const batch = adminDb.batch();
    snap.docs.forEach((d) => {
      if (d.id !== excludeId) {
        batch.update(d.ref, { [field]: false, updatedAt: FieldValue.serverTimestamp() });
      }
    });
    await batch.commit();
  }
}

function TimestampNow() {
  return { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any;
}

export const customerService = new CustomerService();
