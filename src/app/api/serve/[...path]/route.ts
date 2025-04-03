import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = join(process.cwd(), 'uploads', ...params.path);

    // Basic security check to prevent directory traversal
    if (!filePath.startsWith(join(process.cwd(), 'uploads'))) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read file
    const file = await readFile(filePath);

    // Determine content type
    let contentType = 'application/octet-stream';
    if (filePath.endsWith('.mp4')) contentType = 'video/mp4';
    else if (filePath.endsWith('.pdf')) contentType = 'application/pdf';
    else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
    else if (filePath.endsWith('.png')) contentType = 'image/png';

    // Return file with appropriate headers
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
} 