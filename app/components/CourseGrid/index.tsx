'use client';

import { useState, useMemo } from 'react';
import { UdemyCourse } from '../../../types/udemy';

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
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="p-2 border rounded-md bg-white"
        >
          <option value="last_accessed">Recently Accessed</option>
          <option value="completion">Completion</option>
        </select>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCourses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-lg overflow-hidden flex hover:bg-gray-50 ${
              selectedCourseId === course.id
                ? 'ring-2 ring-indigo-500 bg-indigo-50'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center px-4">
              <input
                type="radio"
                name="courseSelection"
                id={`course-${course.id}`}
                checked={selectedCourseId === course.id}
                onChange={() => onCourseSelect(course)}
                className="h-4 w-4 text-indigo-600 cursor-pointer"
              />
            </div>
            <label 
              htmlFor={`course-${course.id}`}
              className="flex-grow flex cursor-pointer"
            >
              <div className="w-48 h-32 flex-shrink-0">
                <img
                  src={course.image_240x135}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <h3 className="font-medium text-lg line-clamp-2">{course.title}</h3>
                <div className="flex items-center mt-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-28 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${course.completion_ratio}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {course.completion_ratio}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </label>
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