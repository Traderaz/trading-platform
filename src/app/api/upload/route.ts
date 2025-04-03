import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// This will be replaced with cloud storage configuration later
const UPLOAD_DIR = join(process.cwd(), 'uploads');
const VIDEO_DIR = join(UPLOAD_DIR, 'videos');
const ATTACHMENTS_DIR = join(UPLOAD_DIR, 'attachments');

// Ensure upload directories exist
async function ensureDirectories() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
  if (!existsSync(VIDEO_DIR)) {
    await mkdir(VIDEO_DIR, { recursive: true });
  }
  if (!existsSync(ATTACHMENTS_DIR)) {
    await mkdir(ATTACHMENTS_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video' or 'attachment'
    const lessonId = formData.get('lessonId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size for videos (3GB limit)
    if (type === 'video' && file.size > 3 * 1024 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video file size must be less than 3GB' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Ensure directories exist
    await ensureDirectories();

    // Determine upload directory and URL path
    const uploadDir = type === 'video' ? VIDEO_DIR : ATTACHMENTS_DIR;
    const urlPath = type === 'video' ? '/uploads/videos' : '/uploads/attachments';

    // Save the file
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the URL for the uploaded file
    const fileUrl = `${urlPath}/${fileName}`;

    return NextResponse.json({
      url: fileUrl,
      fileName: fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 