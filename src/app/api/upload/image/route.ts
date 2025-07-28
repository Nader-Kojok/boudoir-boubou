import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const contentType = request.headers.get('content-type');
    
    if (!contentType || !allowedTypes.includes(contentType)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Generate unique filename with user ID and timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${session.user.id}/${timestamp}-${filename}`;

    // Check if request body exists
    if (!request.body) {
      return NextResponse.json({ error: 'No file data received' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, request.body, {
      access: 'public',
      contentType,
    });

    return NextResponse.json({
      url: blob.url,
      filename: uniqueFilename,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Handle file size limit (4.5MB for server uploads)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4.5mb',
    },
  },
};