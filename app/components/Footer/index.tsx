export default function Footer() {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Udemy Notes. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="https://github.com/yourusername/udemy-notes"
                className="text-gray-400 hover:text-gray-500"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 