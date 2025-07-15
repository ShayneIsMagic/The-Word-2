'use client';

import { useState } from 'react';
import { Verse } from '@/lib/data';
import { BookOpenIcon, LanguageIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface VerseCardProps {
  verse: Verse;
  className?: string;
}

export default function VerseCard({ 
  verse, 
  className = "" 
}: VerseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {verse.book} {verse.chapter}:{verse.verse}
        </h3>
        <div className="flex space-x-2">
          {(verse.greek || verse.hebrew) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
                             className="p-1 text-gray-500 hover:text-zb-red-600 dark:text-gray-400 dark:hover:text-zb-red-400"
              title="Toggle original text"
            >
              <LanguageIcon className="h-4 w-4" />
            </button>
          )}
          {verse.strongs && verse.strongs.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
                             className="p-1 text-gray-500 hover:text-zb-green-600 dark:text-gray-400 dark:hover:text-zb-green-400"
              title="Toggle Strong's numbers"
            >
              <AcademicCapIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
        {verse.text}
      </p>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        <span className="inline-flex items-center">
          <BookOpenIcon className="h-4 w-4 mr-1" />
          {verse.translation}
        </span>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-3 border-t pt-3 border-gray-200 dark:border-gray-700">
          {verse.greek && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Greek Text</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-greek leading-relaxed">
                {verse.greek}
              </p>
            </div>
          )}
          
          {verse.hebrew && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hebrew Text</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-hebrew leading-relaxed text-right">
                {verse.hebrew}
              </p>
            </div>
          )}
          
          {verse.strongs && verse.strongs.length > 0 && (
            <div>
                             <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strong&apos;s Numbers</h4>
              <div className="flex flex-wrap gap-1">
                {verse.strongs.map((strong, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 text-xs bg-zb-red-100 text-zb-red-800 rounded dark:bg-zb-red-900 dark:text-zb-red-200"
                  >
                    {strong}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 