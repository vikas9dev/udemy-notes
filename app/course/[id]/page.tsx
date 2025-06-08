'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { CurriculumItem } from '../../types/udemy';
import GenerateProgress from '../../components/GenerateProgress';
import { log } from 'console';

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
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-start gap-6">
              <img
                src={courseInfo.image_480x270}
                alt={courseInfo.title}
                className="w-40 h-auto rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {courseInfo.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${courseInfo.completion_ratio}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">
                    {Math.round(courseInfo.completion_ratio)}% complete
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-1">
          <div className="text-sm text-gray-600 mb-2">Select the lectures you want to generate notes for: </div>
          {curriculum.map((chapter) => (
            <Disclosure key={chapter.id}>
              {({ open }) => (
                <div className="border rounded-md bg-white">
                  <Disclosure.Button as="div" className="w-full">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={chapter.lectures.every((l) => selectedLectures.has(l.id))}
                          onChange={() => toggleChapter(chapter.id, chapter.lectures)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      <span
                        className="text-gray-400 text-lg"
                        style={{
                          transform: open ? 'rotate(90deg)' : 'rotate(0)',
                          transition: 'transform 0.2s ease-in-out',
                          display: 'inline-block'
                        }}
                      >
                        ›
                      </span>
                    </button>
                  </Disclosure.Button>

                  <Disclosure.Panel>
                    <div className="bg-gray-50 pl-6 pr-4 py-2 border-t border-gray-200 space-y-1">
                      {chapter.lectures.map((lecture) => (
                        <div
                          key={lecture.id}
                          className="flex items-center gap-2 pl-4 py-1.5 rounded hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLectures.has(lecture.id)}
                            onChange={() => toggleLecture(lecture.id)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 truncate">{lecture.title}</span>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>

                </div>
              )}
            </Disclosure>
          ))}
        </div>
      </div>

      {selectedLectures.size > 0 && (
        <div className="bottom-0 left-0 right-0 bg-white border-t shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedLectures.size} lecture{selectedLectures.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleGenerateNotes}
              className="bg-indigo-600 text-white px-4 py-1.5 text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate Notes
            </button>
          </div>
        </div>
      )}

      <GenerateProgress
        isGenerating={isGenerating}
        onClose={() => setIsGenerating(false)}
        courseId={id}
        lectureIds={Array.from(selectedLectures)}
      />
    </>
  );
} 