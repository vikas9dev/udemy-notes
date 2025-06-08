"use client";

export default function DarkModeToggle() {
  return (
    <button
      onClick={() => document.documentElement.classList.toggle('dark')}
      className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
    >
      Toggle Dark Mode
    </button>
  );
} 