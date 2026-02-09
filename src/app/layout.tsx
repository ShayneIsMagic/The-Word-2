import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ScriptureProvider } from '@/context/ScriptureContext';

export const metadata: Metadata = {
  title: 'The Word - Advanced Scripture Study',
  description: 'A comprehensive scripture study application with Greek and Hebrew analysis, commentary, and cross-references.',
  keywords: 'bible, scripture, study, greek, hebrew, theology, christianity',
  authors: [{ name: 'The Word App' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ScriptureProvider>
            {children}
          </ScriptureProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 