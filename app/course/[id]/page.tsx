'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Disclosure } from '@headlessui/react';
import { CurriculumItem } from '../../types/udemy';
import GenerateProgress from '../../components/GenerateProgress';

interface ChapterData {
  id: number;
  title: string;
  lectures: CurriculumItem[];
}

interface CourseInfo {
  title: string;
  image_480x270: string;
  completion_ratio: number;
}

interface PageProps {
  // params: { id: string };
  params: Promise<{ id: string }>;
}

export default function CoursePage({ params }: PageProps) {
  const resolvedParams = use(params);
const id = resolvedParams?.id;
  const [curriculum, setCurriculum] = useState<ChapterData[]>([]);
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [selectedLectures, setSelectedLectures] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const cookie = localStorage.getItem('udemyCookie');
        if (!cookie) {
          throw new Error('No cookie found. Please go back and enter your Udemy cookie.');
        }

        // Fetch course info
        const courseResponse = await fetch('/api/udemy/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cookie }),
        });

        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course information');
        }

        const coursesData = await courseResponse.json();
        const course = coursesData.results.find((c: any) => c.id.toString() === id);
        if (course) {
          setCourseInfo({
            title: course.title,
            image_480x270: course.image_480x270,
            completion_ratio: course.completion_ratio,
          });
        }

        // Fetch curriculum
        const curriculumResponse = await fetch('/api/udemy/curriculum', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId: id, cookie }),
        });

        if (!curriculumResponse.ok) {
          throw new Error('Failed to fetch curriculum');
        }

        const data = await curriculumResponse.json();

        // Organize curriculum into chapters
        const chapters: ChapterData[] = [];
        let currentChapter: ChapterData | null = null;

        data.results.forEach((item: CurriculumItem) => {
          if (item._class === 'chapter') {
            currentChapter = {
              id: item.id,
              title: item.title,
              lectures: [],
            };
            chapters.push(currentChapter);
          } else if (item._class === 'lecture' && currentChapter) {
            currentChapter.lectures.push(item);
          }
        });

        setCurriculum(chapters);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const toggleChapter = (chapterId: number, lectures: CurriculumItem[]) => {
    const lectureIds = lectures.map(l => l.id);
    const newSelected = new Set(selectedLectures);

    // Check if all lectures in this chapter are selected
    const allSelected = lectures.every(l => selectedLectures.has(l.id));
    console.log('Chapter toggle - All selected:', allSelected);
    console.log('Current selected lectures:', Array.from(selectedLectures));
    console.log("selectedLectures.size", selectedLectures.size); // should show non-zero value

    if (allSelected) {
      // Unselect all lectures in this chapter
      lectureIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all lectures in this chapter
      lectureIds.forEach(id => newSelected.add(id));
    }

    console.log('New selected lectures:', Array.from(newSelected));
    setSelectedLectures(newSelected);
  };

  const toggleLecture = (lectureId: number) => {
    const newSelected = new Set(selectedLectures);
    console.log('Lecture toggle - Current selected:', Array.from(selectedLectures));
    console.log('Toggling lecture:', lectureId);

    if (newSelected.has(lectureId)) {
      newSelected.delete(lectureId);
    } else {
      newSelected.add(lectureId);
    }

    console.log('New selected lectures:', Array.from(newSelected));
    setSelectedLectures(newSelected);
  };

  useEffect(() => {
    console.log('Selected lectures updated:', Array.from(selectedLectures));
  }, [selectedLectures]);

  const handleGenerateNotes = () => {
    if (selectedLectures.size === 0) return;
    setIsGenerating(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading curriculum...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading course...</div>
      </div>
    );
  }  

  return (
    <>
      {courseInfo && (
        <div className="bg-white dark:bg-gray-800 border-b rounded-lg shadow p-6 mb-6">
          <div className="flex items-start gap-6">
            <img
              src={courseInfo.image_480x270}
              alt={courseInfo.title}
              className="w-40 h-auto rounded-md"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {courseInfo.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${courseInfo.completion_ratio}%` }} />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-300">{courseInfo.completion_ratio}% Complete</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        {curriculum.map((chapter) => (
          <details key={chapter.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-2 bg-white dark:bg-gray-800">
            <summary className="font-medium text-gray-900 dark:text-white flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={chapter.lectures.every(l => selectedLectures.has(l.id))}
                onChange={() => toggleChapter(chapter.id, chapter.lectures)}
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              {chapter.title}
            </summary>
            <div className="ml-4 mt-2 space-y-1">
              {chapter.lectures.map((lecture) => (
                <label key={lecture.id} className="flex items-center text-gray-800 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLectures.has(lecture.id)}
                    onChange={() => toggleLecture(lecture.id)}
                    className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  {lecture.title}
                </label>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t py-4 -mx-8 px-8 flex justify-end">
        <button
          onClick={handleGenerateNotes}
          disabled={selectedLectures.size === 0}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg font-semibold shadow"
        >
          Generate Notes
        </button>
      </div>

      <GenerateProgress
        isGenerating={isGenerating}
        onClose={() => setIsGenerating(false)}
        courseId={id}
        lectureIds={Array.from(selectedLectures)}
      />
    </>
  );
} 