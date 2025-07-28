import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadMultipleToBlob, validateMultipleImageFiles } from '@/lib/blob-storage';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files: File[] = [];

    // Extract files from FormData
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate files
    const validation = validateMultipleImageFiles(files);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: validation.error || 'Invalid files' 
      }, { status: 400 });
    }

    // Upload to Vercel Blob
    const uploadResults = await uploadMultipleToBlob(files, session.user.id);

    return NextResponse.json({
      success: true,
      images: uploadResults,
      count: uploadResults.length
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}