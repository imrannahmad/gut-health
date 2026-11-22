import { adminDb } from '@/lib/firebase/admin';
import { FieldValue, type Transaction } from 'firebase-admin/firestore';

/**
 * Sequential Collision-Safe Order ID Generator
 * Format: GG-YYMM-XXXXXX (e.g. GG-2611-000001)
 *
 * NOTE ON GAPLESS ALLOCATION:
 * E-commerce order numbers are sequential but intentionally non-gapless.
 * If a checkout session expires or an online advance payment fails/aborts,
 * that allocated counter is preserved in audit logs or skipped to prevent
 * collision and maintain monotonic temporal ordering.
 * Statutory gapless numbering (CGST Rule 46) is handled independently
 * at invoice generation time (e.g. GG/26-27/00001).
 */
export async function generateSequentialOrderId(externalTransaction?: Transaction): Promise<string> {
  const now = new Date();
  const fullYear = now.getFullYear();
  const yy = String(fullYear).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${yy}${mm}`;
  const counterDocId = `orders_${fullYear}${mm}`;

  const counterRef = adminDb.collection('counters').doc(counterDocId);

  const allocateSequence = async (tx: Transaction): Promise<string> => {
    const snap = await tx.get(counterRef);
    const currentSeq = snap.exists ? (snap.data()?.currentSequence || 0) : 0;
    const nextSeq = currentSeq + 1;

    tx.set(
      counterRef,
      {
        yearMonth,
        currentSequence: nextSeq,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const seqPadded = String(nextSeq).padStart(6, '0');
    return `GG-${yearMonth}-${seqPadded}`;
  };

  if (externalTransaction) {
    return allocateSequence(externalTransaction);
  }

  return adminDb.runTransaction(allocateSequence);
}
