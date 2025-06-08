'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UdemyCourse } from './types/udemy';
import CookieInput from './components/CookieInput';
import CourseGrid from './components/CourseGrid';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState<UdemyCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<UdemyCourse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateNotes = () => {
    if (!selectedCourse) return;
    router.push(`/course/${selectedCourse.id}`);
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Udemy Course Notes Generator</h1>
      
      <CookieInput onCoursesLoaded={setCourses} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-8">
          {error}
        </div>
      )}

      {courses.length > 0 && (
        <div className="space-y-8">
          <CourseGrid
            courses={courses}
            selectedCourseId={selectedCourse?.id || null}
            onCourseSelect={setSelectedCourse}
          />

          <div className="sticky bottom-0 bg-white border-t py-4 mt-8 -mx-8 px-8">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedCourse ? (
                  <span>Selected: <strong>{selectedCourse.title}</strong></span>
                ) : (
                  <span>Select a course to generate notes</span>
                )}
              </div>
              <button
                onClick={handleGenerateNotes}
                disabled={!selectedCourse}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Select Lectures</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 