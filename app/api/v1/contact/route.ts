import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { contactSchema } from '@/lib/validations';

/**
 * GET /api/v1/contact
 * Public endpoint to fetch active customer support channels & fulfillment hub info
 */
export async function GET() {
  try {
    const configSnap = await adminDb.collection('settings').doc('store_config').get();
    const configData = configSnap.exists ? configSnap.data() : {};

    const supportEmail = configData?.supportEmail || 'care@gutglow.com';
    const supportPhone = configData?.supportPhone || '+91 7292929137';
    const instagramUrl = configData?.instagramUrl || 'https://instagram.com/gutglowofficial';
    const warehouseAddress = configData?.warehouseAddress || {
      line1: 'Plot 42, Logistics Park, Bhiwandi',
      city: 'Thane',
      state: 'Maharashtra',
      pincode: '421302',
      country: 'India',
    };

    return NextResponse.json({
      success: true,
      data: {
        supportEmail,
        supportPhone,
        instagramUrl,
        warehouseAddress,
        hours: 'Mon–Fri, 9:30 AM – 6:30 PM IST',
      },
    });
  } catch (error) {
    console.error('[API /api/v1/contact] GET error:', error);
    // Graceful fallback defaults
    return NextResponse.json({
      success: true,
      data: {
        supportEmail: 'care@gutglow.com',
        supportPhone: '+91 7292929137',
        instagramUrl: 'https://instagram.com/gutglowofficial',
        warehouseAddress: {
          line1: 'Plot 42, Logistics Park, Bhiwandi',
          city: 'Thane',
          state: 'Maharashtra',
          pincode: '421302',
          country: 'India',
        },
        hours: 'Mon–Fri, 9:30 AM – 6:30 PM IST',
      },
    });
  }
}

/**
 * POST /api/v1/contact
 * Public endpoint to submit customer support inquiries & leads
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0]?.message || 'Invalid form submission';
      return NextResponse.json({ success: false, error: firstIssue }, { status: 400 });
    }

    const { name, email, phone, subject, message } = validation.data;

    // Generate unique human-readable query ID
    const queryId = `QRY-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newQuery = {
      id: queryId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      adminNotes: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection('support_queries').doc(queryId).set(newQuery);

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been submitted successfully. Our support team will get back to you shortly.',
      queryId,
    });
  } catch (error) {
    console.error('[API /api/v1/contact] POST error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
