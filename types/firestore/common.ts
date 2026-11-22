import type { Timestamp as ClientTimestamp } from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';

export type Timestamp = ClientTimestamp | AdminTimestamp;

export interface BaseFirestoreDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type IndianGstStateCode = string; // e.g. "27" for Maharashtra, "07" for Delhi
