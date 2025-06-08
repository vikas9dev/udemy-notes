'use client';

import { useState, useEffect } from 'react';
import { UdemyCourse } from '../../../types/udemy';

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
    } catch (err: any) {
      if (!isBackground) {
        setError(err.message);
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
      <div className="flex flex-col space-y-2">
        <label htmlFor="cookie" className="text-sm font-medium">
          Udemy Cookie
        </label>
        <textarea
          id="cookie"
          value={cookie}
          onChange={(e) => setCookie(e.target.value)}
          placeholder="Paste your Udemy cookie here"
          className="p-2 border rounded-md w-full h-24 font-mono text-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
      >
        {loading ? 'Loading...' : 'Save & Load Courses'}
      </button>
      {error && (
        <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
    </form>
  );
} 