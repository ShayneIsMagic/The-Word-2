'use client';

import { useState } from 'react';
import { getChapter } from '@/lib/data';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ChapterNavigatorProps {
  bookId: string;
  totalChapters: number;
  onChapterSelect: (chapter: number) => void;
  currentChapter?: number;
  className?: string;
}

export default function ChapterNavigator({
  bookId,
  totalChapters,
  onChapterSelect,
  currentChapter = 1,
  className = ""
}: ChapterNavigatorProps) {
  const [selectedChapter, setSelectedChapter] = useState(currentChapter);

  const handleChapterChange = (chapter: number) => {
    if (chapter >= 1 && chapter <= totalChapters) {
      setSelectedChapter(chapter);
      onChapterSelect(chapter);
    }
  };

  const handlePrevious = () => {
    handleChapterChange(selectedChapter - 1);
  };

  const handleNext = () => {
    handleChapterChange(selectedChapter + 1);
  };

  return (
    <div className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePrevious}
          disabled={selectedChapter <= 1}
          className="p-2 text-gray-500 hover:text-zb-red-600 disabled:text-gray-300 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-zb-red-400 dark:disabled:text-gray-600"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chapter:</span>
          <select
            value={selectedChapter}
            onChange={(e) => handleChapterChange(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-zb-red-500 focus:border-transparent"
          >
            {Array.from({ length: totalChapters }, (_, i) => i + 1).map(chapter => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">of {totalChapters}</span>
        </div>
        
        <button
          onClick={handleNext}
          disabled={selectedChapter >= totalChapters}
          className="p-2 text-gray-500 hover:text-zb-red-600 disabled:text-gray-300 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:text-zb-red-400 dark:disabled:text-gray-600"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {getChapter(bookId, selectedChapter)?.verses.length || 0} verses
      </div>
    </div>
  );
} 