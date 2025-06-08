import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="flex justify-between items-center h-20"> {/* Increased height */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                Udemy Notes
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              My Courses
            </Link>
            <Link
              href="/settings"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
