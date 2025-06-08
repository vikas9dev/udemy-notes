import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Udemy Notes Generator</h1>
      <nav className="space-x-4 text-sm text-indigo-600 dark:text-indigo-400">
      <Link href="/" className="hover:underline">Home</Link>
        <Link href="#" className="hover:underline">My Courses</Link>
        <Link href="#" className="hover:underline">Settings</Link>
      </nav>
    </header>
  );
}
