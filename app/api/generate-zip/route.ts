import archiver from 'archiver';
import { PassThrough, Readable } from 'stream';
import { Progress } from '../../types/progress';
import { getCourseInfo } from '../../utils/udemy';

// Helper function to send progress updates
async function sendProgress(writer: WritableStreamDefaultWriter, progress: Progress) {
  await writer.write(new TextEncoder().encode(`data: ${JSON.stringify(progress)}\n\n`));
}

// Helper function to process a single lecture
async function processLecture(lectureId: string) {
  try {
    // Simulate lecture processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      chapter: `Chapter ${Math.floor(Math.random() * 10) + 1}`,
      lecture: `Lecture ${lectureId}`,
      content: `# Lecture ${lectureId}\n\nSample content for lecture ${lectureId}`
    };
  } catch (error) {
    console.error(`Error processing lecture ${lectureId}:`, error);
    return null;
  }
}

async function processLectures(
  courseId: string,
  lectureIds: string[],
  writer: WritableStreamDefaultWriter
): Promise<PassThrough> {
  const processedLectures = [];
  let currentChapter = '';
  
  try {
    // Get course title from the API
    const courseInfo = await getCourseInfo(courseId);
    const courseTitle = courseInfo?.title || 'Udemy Course';
    console.log('Course title:', courseTitle);

    // Create timestamp and sanitize course title for folder names
    const timestamp = Date.now().toString();
    const sanitizedCourseTitle = courseTitle.replace(/[^a-z0-9-\s]/gi, '').replace(/\s+/g, '-').toLowerCase().trim();
    const parentFolderName = `${sanitizedCourseTitle}-${timestamp}`;

    // Create ZIP stream
    const passThrough = new PassThrough();
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Pipe archive data to the PassThrough stream
    archive.pipe(passThrough);

    // Handle archive warnings and errors
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        console.error('Archive error:', err);
        throw err;
      }
    });

    archive.on('error', function(err) {
      console.error('Archive error:', err);
      throw err;
    });

    // Process each lecture
    for (let i = 0; i < lectureIds.length; i++) {
      const lectureId = lectureIds[i];
      try {
        const result = await processLecture(lectureId);
        if (result) {
          processedLectures.push(result);
          
          // Update progress
          if (result.chapter !== currentChapter) {
            currentChapter = result.chapter;
            console.log('Processing new chapter:', currentChapter);
          }

          await sendProgress(writer, {
            progress: Math.round((i + 1) / lectureIds.length * 100),
            status: 'processing',
            message: `Processing lecture ${i + 1} of ${lectureIds.length}`,
            chapter: result.chapter,
            lecture: result.lecture
          });
          
          // Add file to ZIP with proper structure
          const fileName = `${parentFolderName}/${result.chapter}/${result.lecture}.md`
            .replace(/[^a-z0-9-/\s]/gi, '')
            .replace(/\s+/g, '-')
            .toLowerCase();
          
          archive.append(result.content, { name: fileName });
        }
      } catch (error) {
        console.error('Error processing lecture:', error);
        await sendProgress(writer, {
          progress: Math.round((i + 1) / lectureIds.length * 100),
          status: 'error',
          message: 'Error processing lecture',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Finalize the archive
    await archive.finalize();

    // Send final progress update
    await sendProgress(writer, {
      progress: 100,
      status: 'completed',
      message: 'Notes have been generated and downloaded successfully!'
    });

    return passThrough;
  } catch (error) {
    console.error('Error in processLectures:', error);
    await sendProgress(writer, {
      progress: 0,
      status: 'error',
      message: 'Failed to process lectures',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

export async function POST(request: Request) {
  const { courseId, lectureIds } = await request.json();

  // Validate input
  if (!courseId || !Array.isArray(lectureIds) || lectureIds.length === 0) {
    return new Response('Invalid request parameters', { status: 400 });
  }

  try {
    // Create SSE stream for progress updates
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process lectures and get ZIP stream
    const zipStream = await processLectures(courseId, lectureIds, writer);

    // Convert PassThrough to Web Stream
    const webStream = Readable.toWeb(zipStream) as ReadableStream;

    // Return the ZIP file directly
    return new Response(webStream, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="udemy-notes.zip"',
      },
    });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 