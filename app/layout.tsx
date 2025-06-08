import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Udemy Notes Generator',
  description: 'Generate structured notes from your Udemy courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 font-sans`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-full flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
} 