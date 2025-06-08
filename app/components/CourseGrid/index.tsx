'use client';

import { useState, useMemo } from 'react';
import { UdemyCourse } from '../../../types/udemy';
import Image from 'next/image';

interface CourseGridProps {
  courses: UdemyCourse[];
  selectedCourseId: number | null;
  onCourseSelect: (course: UdemyCourse) => void;
}

type SortOption = 'completion' | 'last_accessed';

export default function CourseGrid({ courses, selectedCourseId, onCourseSelect }: CourseGridProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('last_accessed');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredAndSortedCourses = useMemo(() => {
    let result = courses;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort courses
    result = [...result].sort((a, b) => {
      if (sortBy === 'completion') {
        return b.completion_ratio - a.completion_ratio;
      }
      // For last_accessed, we'll use the order they come in
      return 0;
    });

    return result;
  }, [courses, search, sortBy]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage);
  const paginatedCourses = filteredAndSortedCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full p-4 border rounded-md"
          />
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="m-4 p-4 border rounded-md bg-white"
        >
          <option value="last_accessed">Recently Accessed</option>
          <option value="completion">Completion</option>
        </select>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {paginatedCourses.map((course) => (
          <div
            key={course.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer relative border-2 flex items-center gap-6 ${selectedCourseId === course.id ? 'border-indigo-600 ring-2 ring-indigo-400' : 'border-transparent'}`}
            onClick={() => onCourseSelect(course)}
          >
            <input
              type="radio"
              name="courseSelection"
              id={`course-${course.id}`}
              checked={selectedCourseId === course.id}
              onChange={() => onCourseSelect(course)}
              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 flex-shrink-0"
              onClick={e => e.stopPropagation()}
            />
            <Image
              src={course.image_240x135}
              alt={course.title}
              width={96}
              height={64}
              className="w-24 h-16 rounded-md object-cover flex-shrink-0 flex-grow-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-extrabold text-gray-800 dark:text-white truncate text-left text-xl mb-1 break-words">{course.title}</span>
              <div className="flex flex-col gap-1 mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${course.completion_ratio}%` }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap text-left mt-1">Completed: {course.completion_ratio}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 