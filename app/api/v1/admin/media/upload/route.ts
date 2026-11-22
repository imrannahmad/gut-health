import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { adminStorage } from '@/lib/firebase/admin';
import { verifyAdminSession, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth/rbac';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = await verifyAdminSession(sessionCookie);

    if (!admin || !hasPermission(admin.role, 'products:write')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const folder = (formData.get('folder') as string) || 'products';

    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const filesToUpload: File[] = rawFiles.length > 0 ? rawFiles : (singleFile ? [singleFile] : []);

    if (filesToUpload.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided for upload' }, { status: 400 });
    }

    const bucket = adminStorage.bucket();
    const uploadedResults: Array<{
      url: string;
      path: string;
      name: string;
      size: number;
      contentType: string;
    }> = [];

    for (const file of filesToUpload) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds maximum allowed limit of 5MB` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type "${file.type}" for "${file.name}". Only JPEG, PNG, WebP, and AVIF are permitted.`,
          },
          { status: 400 }
        );
      }

      // Generate safe, deterministic, non-colliding filename
      const ext = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const randomSuffix = crypto.randomBytes(6).toString('hex');
      const timestamp = Date.now();
      const sanitizedBase = file.name
        .split('.')[0]
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      const destinationPath = `${folder}/${sanitizedBase}_${timestamp}_${randomSuffix}.${ext}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileRef = bucket.file(destinationPath);

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: {
            uploadedBy: admin.email || admin.uid,
            originalName: file.name,
          },
        },
      });

      // Make public or generate public URL
      let publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
      try {
        await fileRef.makePublic();
      } catch (err) {
        // In uniform bucket-level access, signed or standard storage URLs are used
        console.info('[Media Upload] Notice on makePublic:', err);
      }

      uploadedResults.push({
        url: publicUrl,
        path: destinationPath,
        name: file.name,
        size: file.size,
        contentType: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        // Single file backward compatibility
        url: uploadedResults[0]?.url,
        path: uploadedResults[0]?.path,
        size: uploadedResults[0]?.size,
        contentType: uploadedResults[0]?.contentType,
        // Multiple files array
        files: uploadedResults,
      },
    });
  } catch (error) {
    console.error('[API] /api/v1/admin/media/upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
