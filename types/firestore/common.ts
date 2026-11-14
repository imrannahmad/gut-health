import type { Timestamp } from 'firebase/firestore';

export type { Timestamp };

export interface BaseFirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type IndianGstStateCode = string; // e.g. "27" for Maharashtra, "07" for Delhi
