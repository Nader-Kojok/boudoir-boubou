import { put, del } from '@vercel/blob';

export interface UploadResult {
  url: string;
  filename: string;
}

export interface UploadOptions {
  userId: string;
  contentType: string;
  originalFilename: string;
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadToBlob(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { userId, contentType, originalFilename } = options;
  
  // Generate unique filename
  const timestamp = Date.now();
  const uniqueFilename = `${userId}/${timestamp}-${originalFilename}`;

  // Upload to Vercel Blob
  const blob = await put(uniqueFilename, file, {
    access: 'public',
    contentType,
  });

  return {
    url: blob.url,
    filename: uniqueFilename,
  };
}

/**
 * Upload multiple files to Vercel Blob storage
 */
export async function uploadMultipleToBlob(
  files: File[],
  userId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => {
    return uploadToBlob(file, {
      userId,
      contentType: file.type,
      originalFilename: file.name,
    });
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error('Error deleting file from blob:', error);
    throw error;
  }
}

/**
 * Delete multiple files from Vercel Blob storage
 */
export async function deleteMultipleFromBlob(urls: string[]): Promise<void> {
  const deletePromises = urls.map(url => deleteFromBlob(url));
  await Promise.all(deletePromises);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 4.5 * 1024 * 1024; // 4.5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 4.5MB.',
    };
  }

  return { isValid: true };
}

/**
 * Validate multiple image files
 */
export function validateMultipleImageFiles(files: File[]): { isValid: boolean; error?: string } {
  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
}