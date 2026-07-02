import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Blob storage not configured yet — tell the client to store the image inline
    // (base64) instead, so uploads keep working until BLOB_READ_WRITE_TOKEN is set.
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage not configured', fallback: true }, { status: 501 });
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const key = `products/${crypto.randomUUID()}.${ext}`;

    const blob = await put(key, file, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('File upload error:', error);
    // Let the client fall back to inline base64 rather than failing the save.
    return NextResponse.json({ error: 'Failed to upload file', fallback: true }, { status: 500 });
  }
}
