import { generateStructuredNotes } from './gemini';

export interface LectureInfo {
  chapterTitle: string;
  lectureTitle: string;
  content: string;
  objectIndex: number;
}

export interface CourseInfo {
  title: string;
  chapters: Array<{
    title: string;
    objectIndex: number;
    lectures: Array<{
      id: string;
      title: string;
      objectIndex: number;
    }>;
  }>;
}

export async function getCourseInfo(courseId: string, cookie: string): Promise<CourseInfo | null> {
  try {
    const response = await fetch(
      `https://www.udemy.com/api-2.0/courses/${courseId}/subscriber-curriculum-items?curriculum_types=chapter,lecture&page_size=1000&fields[lecture]=title,object_index&fields[chapter]=title,object_index`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
          'Accept': 'application/json, text/plain, */*'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch course info: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];
    
    // Process the curriculum items to organize chapters and lectures
    let currentChapter: { title: string; objectIndex: number; lectures: { id: string; title: string; objectIndex: number }[] } | null = null;
    const chapters: CourseInfo['chapters'] = [];

    for (const item of results) {
      if (item._class === 'chapter') {
        currentChapter = {
          title: item.title,
          objectIndex: item.object_index,
          lectures: []
        };
        chapters.push(currentChapter);
      } else if (item._class === 'lecture' && currentChapter) {
        currentChapter.lectures.push({
          id: item.id.toString(),
          title: item.title,
          objectIndex: item.object_index
        });
      }
    }

    return {
      title: data.course?.title || 'Udemy Course',
      chapters
    };
  } catch (error) {
    console.error(`Error fetching course info for ${courseId}:`, error);
    return null;
  }
}

export async function getLectureInfo(
  courseId: string, 
  lectureId: string, 
  cookie: string
): Promise<LectureInfo | null> {
  try {
    // Get the course structure first to get chapter info
    const courseInfo = await getCourseInfo(courseId, cookie);
    if (!courseInfo) {
      throw new Error('Failed to fetch course structure');
    }

    // Find the chapter and lecture info from the course structure
    let chapterInfo: { title: string; objectIndex: number } | null = null;
    let lectureInfo: { title: string; objectIndex: number } | null = null;

    // Since lectures follow their chapters, we can find both chapter and lecture
    for (const chapter of courseInfo.chapters) {
      const lecture = chapter.lectures.find(l => l.id === lectureId);
      if (lecture) {
        chapterInfo = { title: chapter.title, objectIndex: chapter.objectIndex };
        lectureInfo = { title: lecture.title, objectIndex: lecture.objectIndex };
        break;
      }
    }

    if (!chapterInfo || !lectureInfo) {
      throw new Error(`Could not find chapter/lecture info for lecture ${lectureId}`);
    }

    // Get the lecture captions
    const response = await fetch(
      `https://www.udemy.com/api-2.0/users/me/subscribed-courses/${courseId}/lectures/${lectureId}/?fields[asset]=captions`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookie,
          'Accept': 'application/json, text/plain, */*'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch lecture captions: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Get English captions if available
    let content = '';
    if (data.asset?.captions?.length > 0) {
      // Find the English caption - it should be a complete object with url
      const englishCaption = data.asset.captions.find((c: unknown) => 
        typeof c === 'object' && c !== null && 'locale_id' in c && 'url' in c && 'status' in c &&
        c.locale_id === 'en_US' && c.url && c.status === 1
      );

      if (englishCaption?.url) {
        console.log(`Fetching captions from: ${englishCaption.url}`);
        const captionResponse = await fetch(englishCaption.url);
        if (!captionResponse.ok) {
          throw new Error(`Failed to fetch caption file: ${captionResponse.statusText}`);
        }
        const vttContent = await captionResponse.text();
        
        // Convert VTT content to markdown and generate structured notes
        const markdownContent = convertVttToMarkdown(vttContent);
        content = await generateStructuredNotes(markdownContent, lectureInfo.title);
      } else {
        console.log('No valid English captions found:', data.asset.captions);
      }
    }

    if (!content) {
      content = `## ${lectureInfo.title}\n\nNo captions available for this lecture.`;
    }

    return {
      chapterTitle: chapterInfo.title,
      lectureTitle: lectureInfo.title,
      content,
      objectIndex: lectureInfo.objectIndex
    };
  } catch (error) {
    console.error(`Error fetching lecture info for ${lectureId}:`, error);
    return null;
  }
}

function convertVttToMarkdown(vttContent: string): string {
  // Split VTT content into lines
  const lines = vttContent.split('\n');
  let markdown = '';
  let currentText = '';

  // Skip WebVTT header
  let i = 0;
  while (i < lines.length && !lines[i].includes('-->')) {
    i++;
  }

  // Process each caption
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip timestamp lines and empty lines
    if (line.includes('-->') || line === '') {
      if (currentText) {
        markdown += currentText + '\n\n';
        currentText = '';
      }
      continue;
    }

    // Add non-empty lines to current text
    if (line) {
      currentText += (currentText ? ' ' : '') + line;
    }
  }

  // Add any remaining text
  if (currentText) {
    markdown += currentText + '\n\n';
  }

  return markdown.trim();
} 