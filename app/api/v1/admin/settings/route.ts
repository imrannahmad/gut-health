import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifyAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';
import { FieldValue } from 'firebase-admin/firestore';

async function getAdminUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(sessionCookie);
}

export async function GET(_request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch store config
    const configSnap = await adminDb.collection('settings').doc('store_config').get();
    const configData = configSnap.exists ? configSnap.data() : {};

    // 2. Fetch admin user profile details
    let ownerName = 'Imran Ahmad';
    const adminDoc = await adminDb.collection('admins').doc(admin.uid).get();
    if (adminDoc.exists && adminDoc.data()?.name) {
      ownerName = adminDoc.data()?.name.replace(/\s*\(Owner\)\s*/i, '').trim();
    }

    const payload = {
      storeName: configData?.storeName || 'GutGlow',
      storeTagline: configData?.storeTagline || 'Thoughtful gut wellness for everyday living.',
      legalBusinessName: configData?.legalBusinessName || 'GutGlow Wellness Private Limited',
      ownerName,
      ownerEmail: admin.email || 'imrannahmd@gmail.com',
      supportEmail: configData?.supportEmail || 'care@gutglow.com',
      supportPhone: configData?.supportPhone || '+91 98765 43210',
      instagramUrl: configData?.instagramUrl || 'https://instagram.com/gutglowofficial',
      currency: configData?.currency || 'INR',
      fssaiLicenseNumber: configData?.fssaiLicenseNumber || '11524998000123',
      gstin: configData?.gstin || '27AABCU9603R1ZM',
      hsnCode: configData?.hsnCode || '2106 90 99',
      defaultGstRateBasisPoints: configData?.defaultGstRateBasisPoints || 1800,
      minShelfLifeMonthsAtDispatch: configData?.minShelfLifeMonthsAtDispatch || 6,
      partialCodAdvanceAmountInPaise: configData?.partialCodAdvanceAmountInPaise || 15000,
      warehouseAddress: configData?.warehouseAddress || {
        line1: 'Plot 42, Logistics Park, Bhiwandi',
        city: 'Thane',
        state: 'Maharashtra',
        pincode: '421302',
        country: 'India',
      },
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error('[API] /api/v1/admin/settings GET error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const {
      storeName,
      storeTagline,
      legalBusinessName,
      ownerName,
      supportEmail,
      supportPhone,
      instagramUrl,
      fssaiLicenseNumber,
      gstin,
      hsnCode,
      defaultGstRateBasisPoints,
      minShelfLifeMonthsAtDispatch,
      warehouseAddress,
    } = body;

    // 1. Update store_config
    const updatePayload: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (storeName !== undefined) updatePayload.storeName = String(storeName).trim();
    if (storeTagline !== undefined) updatePayload.storeTagline = String(storeTagline).trim();
    if (legalBusinessName !== undefined) updatePayload.legalBusinessName = String(legalBusinessName).trim();
    if (supportEmail !== undefined) updatePayload.supportEmail = String(supportEmail).trim();
    if (supportPhone !== undefined) updatePayload.supportPhone = String(supportPhone).trim();
    if (instagramUrl !== undefined) updatePayload.instagramUrl = String(instagramUrl).trim();
    if (fssaiLicenseNumber !== undefined) updatePayload.fssaiLicenseNumber = String(fssaiLicenseNumber).trim();
    if (gstin !== undefined) updatePayload.gstin = String(gstin).trim();
    if (hsnCode !== undefined) updatePayload.hsnCode = String(hsnCode).trim();
    if (defaultGstRateBasisPoints !== undefined) updatePayload.defaultGstRateBasisPoints = Number(defaultGstRateBasisPoints);
    if (minShelfLifeMonthsAtDispatch !== undefined) updatePayload.minShelfLifeMonthsAtDispatch = Number(minShelfLifeMonthsAtDispatch);
    if (warehouseAddress && typeof warehouseAddress === 'object') {
      updatePayload.warehouseAddress = warehouseAddress;
    }

    await adminDb.collection('settings').doc('store_config').set(updatePayload, { merge: true });

    // 2. If ownerName was updated, update in admins collection & auth displayName
    if (ownerName && typeof ownerName === 'string') {
      const cleanOwnerName = ownerName.trim();
      await adminDb.collection('admins').doc(admin.uid).set(
        {
          name: cleanOwnerName,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      try {
        await adminAuth.updateUser(admin.uid, {
          displayName: cleanOwnerName,
        });
      } catch (authErr) {
        console.warn('[Admin Settings] Auth displayName update notice:', authErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/settings POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
