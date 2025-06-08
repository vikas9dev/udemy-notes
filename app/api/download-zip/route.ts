import { NextResponse } from 'next/server';
import archiver from 'archiver';
import { Readable, PassThrough } from 'stream';
import { getNotes, generateStorageKey } from '../../utils/tempStorage';

export async function GET(request: Request) {
  console.log('Download endpoint called');
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const timestamp = searchParams.get('timestamp');

  console.log('Download request parameters:', {
    courseId,
    timestamp
  });

  if (!courseId || !timestamp) {
    console.error('Missing required parameters:', { courseId, timestamp });
    return new Response('Missing required parameters', { status: 400 });
  }

  try {
    // Get stored notes
    const storageKey = generateStorageKey(courseId, timestamp);
    const notesData = getNotes(storageKey);

    if (!notesData || !notesData.notes.length) {
      console.error('No notes found for key:', storageKey);
      return new Response('Notes not found or expired', { status: 404 });
    }

    const { courseTitle, notes } = notesData;
    const sanitizedCourseTitle = sanitizeFileName(courseTitle);
    const parentFolderName = `${sanitizedCourseTitle}-${timestamp}`;
    
    console.log('Creating ZIP archive for course:', courseTitle);
    console.log('Parent folder name:', parentFolderName);
    
    // Create a PassThrough stream that we can pipe to
    const passThrough = new PassThrough();
    
    // Create and configure the archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Pipe archive data to the PassThrough stream
    archive.pipe(passThrough);

    // Handle archive warnings
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        console.error('Archive error:', err);
        throw err;
      }
    });

    // Handle archive errors
    archive.on('error', function(err) {
      console.error('Archive error:', err);
      throw err;
    });

    // Add files to the archive with proper structure
    console.log('Adding files to archive');
    
    // Create a map to track unique chapter names
    const chapterNames = new Set<string>();
    notes.forEach(note => chapterNames.add(note.chapter));
    
    // Add files organized by chapter
    notes.forEach((note) => {
      const fileName = `${parentFolderName}/${sanitizeFileName(note.chapter)}/${sanitizeFileName(note.lecture)}.md`;
      console.log('Adding file:', fileName);
      archive.append(note.content, { name: fileName });
    });

    // Finalize the archive
    console.log('Finalizing archive');
    await archive.finalize();

    const filename = `${parentFolderName}.zip`;
    console.log('Sending response with filename:', filename);

    // Convert the PassThrough stream to a Response
    return new Response(Readable.toWeb(passThrough) as ReadableStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating ZIP:', error);
    return new Response('Failed to generate ZIP file', { status: 500 });
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9-\s]/gi, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .toLowerCase()
    .trim();
} 