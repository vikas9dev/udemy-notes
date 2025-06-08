export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full mt-auto border-t py-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        &copy; {year} Udemy Notes. All rights reserved. |
        <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline ml-1">GitHub</a> |
        <a href="#" className="hover:underline ml-1">Privacy</a> |
        <a href="#" className="hover:underline ml-1">Terms</a>
      </div>
    </footer>
  );
} 