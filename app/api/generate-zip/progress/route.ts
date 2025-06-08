import { NextResponse } from 'next/server';
import { Progress } from '../../../types/progress';
import { getCourseInfo, getLectureInfo } from '../../../utils/udemy';
import { generateZipFile } from '../../../utils/zipGenerator';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const lectureIds = searchParams.get('lectureIds')?.split(',');
  
  // Get cookie from header
  const headerCookie = request.headers.get('X-Udemy-Cookie');
  if (!courseId || !lectureIds?.length || !headerCookie) {
    return new Response('Missing required parameters', { status: 400 });
  }

  // Create SSE response headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  // Create a transform stream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Function to send progress updates
  const sendProgress = async (progress: Progress) => {
    try {
      await writer.write(
        new TextEncoder().encode(`data: ${JSON.stringify(progress)}\n\n`)
      );
    } catch (error) {
      console.error('Error sending progress:', error);
    }
  };

  // Start processing in the background
  (async () => {
    try {
      // Get course info for proper naming
      const courseInfo = await getCourseInfo(courseId, headerCookie);
      if (!courseInfo) {
        throw new Error('Failed to fetch course info');
      }

      await sendProgress({
        progress: 0,
        status: 'processing',
        message: 'Starting to process lectures...'
      });

      // Process each lecture
      for (let i = 0; i < lectureIds.length; i++) {
        const lectureId = lectureIds[i];
        try {
          // Get lecture info
          const lectureInfo = await getLectureInfo(courseId, lectureId, headerCookie);
          if (!lectureInfo) {
            throw new Error(`Failed to process lecture ${lectureId}`);
          }

          // Send progress update
          await sendProgress({
            progress: Math.round(((i + 1) / lectureIds.length) * 100),
            status: 'processing',
            message: `Processing lecture ${i + 1} of ${lectureIds.length}`,
            chapter: lectureInfo.chapterTitle,
            lecture: lectureInfo.lectureTitle
          });

        } catch (error) {
          console.error(`Error processing lecture ${lectureId}:`, error);
          await sendProgress({
            progress: Math.round(((i + 1) / lectureIds.length) * 100),
            status: 'error',
            message: `Failed to process lecture ${lectureId}`,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Send completion status
      await sendProgress({
        progress: 100,
        status: 'completed',
        message: 'All lectures have been processed successfully!'
      });

    } catch (error) {
      console.error('Error in background processing:', error);
      await sendProgress({
        progress: 0,
        status: 'error',
        message: 'Failed to process lectures',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, { headers });
} 