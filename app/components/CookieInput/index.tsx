'use client';

import { useState, useEffect } from 'react';
import { UdemyCourse } from '../../types/udemy';

interface CookieInputProps {
  onCoursesLoaded: (courses: UdemyCourse[]) => void;
}

export default function CookieInput({ onCoursesLoaded }: CookieInputProps) {
  const [cookie, setCookie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load cookie from localStorage on mount
    const storedCookie = localStorage.getItem('udemyCookie');
    if (storedCookie) {
      setCookie(storedCookie);
      
      // If we have stored courses, load them immediately
      const storedCourses = localStorage.getItem('storedCourses');
      if (storedCourses) {
        try {
          const courses = JSON.parse(storedCourses);
          onCoursesLoaded(courses);
          // Revalidate in the background
          fetchCourses(storedCookie, true);
        } catch (e) {
          console.error('Failed to parse stored courses:', e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourses = async (cookieValue: string, isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch('/api/udemy/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookie: cookieValue }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('udemyCookie');
          localStorage.removeItem('storedCourses');
          throw new Error('Invalid cookie. Please provide a valid Udemy cookie.');
        }
        throw new Error('Failed to fetch courses. Please try again.');
      }

      const data = await response.json();
      localStorage.setItem('storedCourses', JSON.stringify(data.results));
      onCoursesLoaded(data.results);
    } catch (err: unknown) {
      if (!isBackground) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      }
      console.error('Error fetching courses:', err);
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('udemyCookie', cookie);
    await fetchCourses(cookie);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-12">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 my-6">
        <label htmlFor="cookie" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Udemy Cookie</label>
        <textarea
          id="cookie"
          value={cookie}
          onChange={(e) => setCookie(e.target.value)}
          placeholder="Paste your cookie here..."
          className="w-full border rounded-md p-2 h-24 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          {loading ? 'Loading...' : 'Save & Load Courses'}
        </button>
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}
      </div>
    </form>
  );
} 