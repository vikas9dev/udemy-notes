import { NextResponse } from 'next/server';
import { generateZipFile } from '../../../utils/zipGenerator';
import { getCourseInfo, getLectureInfo } from '../../../utils/udemy';
import JSZip from 'jszip';

export async function POST(request: Request) {
  try {
    const { courseId, lectureIds } = await request.json();
    const cookie = request.headers.get('X-Udemy-Cookie');

    if (!courseId || !lectureIds?.length || !cookie) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get course info for proper naming
    const courseInfo = await getCourseInfo(courseId, cookie);
    if (!courseInfo) {
      throw new Error('Failed to fetch course info');
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedCourseTitle = courseInfo.title.replace(/[^a-zA-Z0-9]/g, '-');
    const parentFolder = `${sanitizedCourseTitle}-${timestamp}`;

    // Create ZIP file
    const zip = new JSZip();

    // Process lectures and organize by chapter
    const lecturesByChapter = new Map<string, Array<{
      id: string;
      title: string;
      content: string;
      objectIndex: number;
    }>>();

    // Process each lecture
    for (const lectureId of lectureIds) {
      const lectureInfo = await getLectureInfo(courseId, lectureId, cookie);
      if (!lectureInfo) continue;

      const { chapterTitle, lectureTitle, content, objectIndex } = lectureInfo;
      
      if (!lecturesByChapter.has(chapterTitle)) {
        lecturesByChapter.set(chapterTitle, []);
      }
      
      lecturesByChapter.get(chapterTitle)?.push({
        id: lectureId,
        title: lectureTitle,
        content,
        objectIndex
      });
    }

    // Sort chapters and create folder structure
    const sortedChapters = courseInfo.chapters
      .filter(chapter => lecturesByChapter.has(chapter.title))
      .sort((a, b) => a.objectIndex - b.objectIndex);

    for (const chapter of sortedChapters) {
      const chapterFolder = zip.folder(`${parentFolder}/${formatIndex(chapter.objectIndex)}-${sanitizeFileName(chapter.title)}`);
      if (!chapterFolder) continue;

      // Get lectures for this chapter and sort them
      const lectures = lecturesByChapter.get(chapter.title) || [];
      lectures.sort((a, b) => a.objectIndex - b.objectIndex);

      // Add lecture files to the chapter folder
      for (const lecture of lectures) {
        const fileName = `${formatIndex(lecture.objectIndex)}-${sanitizeFileName(lecture.title)}.md`;
        chapterFolder.file(fileName, lecture.content);
      }
    }

    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    // Return the ZIP file
    return new Response(zipBlob, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${sanitizedCourseTitle}-${timestamp}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error generating ZIP file:', error);
    return NextResponse.json(
      { error: 'Failed to generate ZIP file' },
      { status: 500 }
    );
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase()
    .trim();
}

function formatIndex(index: number): string {
  return index.toString().padStart(2, '0');
} 