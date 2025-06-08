import JSZip from 'jszip';
import { getCourseInfo, getLectureInfo } from './udemy';

export async function generateZipFile(
  courseId: string,
  lectureIds: string[],
  courseTitle: string,
  cookie: string
): Promise<Blob> {
  const zip = new JSZip();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sanitizedCourseTitle = courseTitle.replace(/[^a-zA-Z0-9]/g, '-');
  const parentFolder = `${sanitizedCourseTitle}-${timestamp}`;

  try {
    // Get course structure first
    const courseInfo = await getCourseInfo(courseId, cookie);
    if (!courseInfo) {
      throw new Error('Failed to fetch course structure');
    }

    // Create a map to organize lectures by chapter
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

    // Sort chapters by their order in the course structure
    const sortedChapters = courseInfo.chapters
      .filter(chapter => lecturesByChapter.has(chapter.title))
      .sort((a, b) => a.objectIndex - b.objectIndex);

    // Create folders and files in the ZIP
    for (const chapter of sortedChapters) {
      const chapterFolder = zip.folder(`${parentFolder}/${formatIndex(chapter.objectIndex)}-${sanitizeFileName(chapter.title)}`);
      if (!chapterFolder) continue;

      // Get lectures for this chapter and sort them
      const lectures = lecturesByChapter.get(chapter.title) || [];
      lectures.sort((a, b) => a.objectIndex - b.objectIndex);

      for (const lecture of lectures) {
        chapterFolder.file(
          `${formatIndex(lecture.objectIndex)}-${sanitizeFileName(lecture.title)}.md`,
          lecture.content
        );
      }
    }

    return zip.generateAsync({ type: 'blob' });
  } catch (error) {
    console.error('Error generating ZIP:', error);
    throw error;
  }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

function formatIndex(index: number): string {
  return index.toString().padStart(2, '0');
} 