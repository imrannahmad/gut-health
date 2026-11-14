import type { Timestamp, IndianGstStateCode } from './common';

export interface FirestoreUser {
  uid: string; // Document ID: Firebase Auth UID
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  totalOrders: number;
  totalSpendInPaise: number; // Integer paise
  lastOrderDate?: Timestamp;
  isEmailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreAddress {
  id: string; // Document ID: auto-generated
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  stateCode: IndianGstStateCode;
  pincode: string; // 6-digit Indian PIN code
  country: 'India';
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type AdminRole =
  | 'super_admin'
  | 'order_manager'
  | 'product_manager'
  | 'support_manager';

export interface FirestoreAdmin {
  uid: string; // Document ID: Firebase Auth UID
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
