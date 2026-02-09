'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LanguageIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { getChapter } from '@/lib/genesis-matthew';
import { detectLanguage } from '@/lib/language-detector';

// Book metadata
const BOOK_DATA: Record<string, { name: string; chapters: number; testament: 'old' | 'new' }> = {
  'genesis': { name: 'Genesis', chapters: 50, testament: 'old' },
  'exodus': { name: 'Exodus', chapters: 40, testament: 'old' },
  'leviticus': { name: 'Leviticus', chapters: 27, testament: 'old' },
  'numbers': { name: 'Numbers', chapters: 36, testament: 'old' },
  'deuteronomy': { name: 'Deuteronomy', chapters: 34, testament: 'old' },
  'joshua': { name: 'Joshua', chapters: 24, testament: 'old' },
  'judges': { name: 'Judges', chapters: 21, testament: 'old' },
  'ruth': { name: 'Ruth', chapters: 4, testament: 'old' },
  '1-samuel': { name: '1 Samuel', chapters: 31, testament: 'old' },
  '2-samuel': { name: '2 Samuel', chapters: 24, testament: 'old' },
  '1-kings': { name: '1 Kings', chapters: 22, testament: 'old' },
  '2-kings': { name: '2 Kings', chapters: 25, testament: 'old' },
  '1-chronicles': { name: '1 Chronicles', chapters: 29, testament: 'old' },
  '2-chronicles': { name: '2 Chronicles', chapters: 36, testament: 'old' },
  'ezra': { name: 'Ezra', chapters: 10, testament: 'old' },
  'nehemiah': { name: 'Nehemiah', chapters: 13, testament: 'old' },
  'esther': { name: 'Esther', chapters: 10, testament: 'old' },
  'job': { name: 'Job', chapters: 42, testament: 'old' },
  'psalms': { name: 'Psalms', chapters: 150, testament: 'old' },
  'proverbs': { name: 'Proverbs', chapters: 31, testament: 'old' },
  'ecclesiastes': { name: 'Ecclesiastes', chapters: 12, testament: 'old' },
  'song-of-solomon': { name: 'Song of Solomon', chapters: 8, testament: 'old' },
  'isaiah': { name: 'Isaiah', chapters: 66, testament: 'old' },
  'jeremiah': { name: 'Jeremiah', chapters: 52, testament: 'old' },
  'lamentations': { name: 'Lamentations', chapters: 5, testament: 'old' },
  'ezekiel': { name: 'Ezekiel', chapters: 48, testament: 'old' },
  'daniel': { name: 'Daniel', chapters: 12, testament: 'old' },
  'hosea': { name: 'Hosea', chapters: 14, testament: 'old' },
  'joel': { name: 'Joel', chapters: 3, testament: 'old' },
  'amos': { name: 'Amos', chapters: 9, testament: 'old' },
  'obadiah': { name: 'Obadiah', chapters: 1, testament: 'old' },
  'jonah': { name: 'Jonah', chapters: 4, testament: 'old' },
  'micah': { name: 'Micah', chapters: 7, testament: 'old' },
  'nahum': { name: 'Nahum', chapters: 3, testament: 'old' },
  'habakkuk': { name: 'Habakkuk', chapters: 3, testament: 'old' },
  'zephaniah': { name: 'Zephaniah', chapters: 3, testament: 'old' },
  'haggai': { name: 'Haggai', chapters: 2, testament: 'old' },
  'zechariah': { name: 'Zechariah', chapters: 14, testament: 'old' },
  'malachi': { name: 'Malachi', chapters: 4, testament: 'old' },
  'matthew': { name: 'Matthew', chapters: 28, testament: 'new' },
  'mark': { name: 'Mark', chapters: 16, testament: 'new' },
  'luke': { name: 'Luke', chapters: 24, testament: 'new' },
  'john': { name: 'John', chapters: 21, testament: 'new' },
  'acts': { name: 'Acts', chapters: 28, testament: 'new' },
  'romans': { name: 'Romans', chapters: 16, testament: 'new' },
  '1-corinthians': { name: '1 Corinthians', chapters: 16, testament: 'new' },
  '2-corinthians': { name: '2 Corinthians', chapters: 13, testament: 'new' },
  'galatians': { name: 'Galatians', chapters: 6, testament: 'new' },
  'ephesians': { name: 'Ephesians', chapters: 6, testament: 'new' },
  'philippians': { name: 'Philippians', chapters: 4, testament: 'new' },
  'colossians': { name: 'Colossians', chapters: 4, testament: 'new' },
  '1-thessalonians': { name: '1 Thessalonians', chapters: 5, testament: 'new' },
  '2-thessalonians': { name: '2 Thessalonians', chapters: 3, testament: 'new' },
  '1-timothy': { name: '1 Timothy', chapters: 6, testament: 'new' },
  '2-timothy': { name: '2 Timothy', chapters: 4, testament: 'new' },
  'titus': { name: 'Titus', chapters: 3, testament: 'new' },
  'philemon': { name: 'Philemon', chapters: 1, testament: 'new' },
  'hebrews': { name: 'Hebrews', chapters: 13, testament: 'new' },
  'james': { name: 'James', chapters: 5, testament: 'new' },
  '1-peter': { name: '1 Peter', chapters: 5, testament: 'new' },
  '2-peter': { name: '2 Peter', chapters: 3, testament: 'new' },
  '1-john': { name: '1 John', chapters: 5, testament: 'new' },
  '2-john': { name: '2 John', chapters: 1, testament: 'new' },
  '3-john': { name: '3 John', chapters: 1, testament: 'new' },
  'jude': { name: 'Jude', chapters: 1, testament: 'new' },
  'revelation': { name: 'Revelation', chapters: 22, testament: 'new' },
};

interface VerseData {
  number: number;
  text: string;
  hebrew?: string;
  greek?: string;
  strongs?: string[];
}

export default function ChapterPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapter = parseInt(params.chapter as string, 10);
  
  const [verses, setVerses] = useState<VerseData[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState('KJV');
  const [loading, setLoading] = useState(true);

  const bookData = BOOK_DATA[bookId];
  const isOldTestament = bookData?.testament === 'old';

  useEffect(() => {
    setLoading(true);
    // Try to get chapter data from local data
    const chapterData = getChapter(bookId, chapter);
    
    if (chapterData && chapterData.verses.length > 0) {
      setVerses(chapterData.verses);
    } else {
      // Generate placeholder verses for books not yet populated
      const placeholderVerses: VerseData[] = Array.from({ length: 25 }, (_, i) => ({
        number: i + 1,
        text: `[Verse ${i + 1} - Data not yet loaded. Visit churchofjesuschrist.org or bible.com for this content.]`,
      }));
      setVerses(placeholderVerses);
    }
    setLoading(false);
  }, [bookId, chapter]);

  if (!bookData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Book Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The book &quot;{bookId}&quot; was not found.</p>
          <Link href="/bible" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            ← Back to Bible
          </Link>
        </div>
      </div>
    );
  }

  const prevChapter = chapter > 1 ? chapter - 1 : null;
  const nextChapter = chapter < bookData.chapters ? chapter + 1 : null;

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#1a202c]">
      {/* Header */}
      <header className="bg-[#00457c] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/bible" className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {bookData.name} {chapter}
                </h1>
                <p className="text-xs text-white/70">
                  {isOldTestament ? 'Old Testament' : 'New Testament'} • {verses.length} verses
                </p>
              </div>
            </div>
            
            {/* Translation Selector */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="px-3 py-1 text-sm border border-white/30 rounded-lg bg-white/10 text-white"
              >
                <option value="KJV" className="text-gray-900">KJV</option>
                <option value="ESV" className="text-gray-900">ESV</option>
                <option value="NIV" className="text-gray-900">NIV</option>
                <option value="NASB" className="text-gray-900">NASB</option>
              </select>
              
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`p-2 rounded-lg transition-colors ${showOriginal ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
                title={isOldTestament ? 'Show Hebrew' : 'Show Greek'}
              >
                <LanguageIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chapter Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
          {prevChapter ? (
            <Link
              href={`/bible/${bookId}/${prevChapter}`}
              className="flex items-center space-x-1 text-sm text-[#00457c] dark:text-blue-400 hover:text-[#003366] dark:hover:text-blue-300"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span>Chapter {prevChapter}</span>
            </Link>
          ) : (
            <div />
          )}
          
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Chapter {chapter} of {bookData.chapters}
          </span>
          
          {nextChapter ? (
            <Link
              href={`/bible/${bookId}/${nextChapter}`}
              className="flex items-center space-x-1 text-sm text-[#00457c] dark:text-blue-400 hover:text-[#003366] dark:hover:text-blue-300"
            >
              <span>Chapter {nextChapter}</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Verses */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#faf9f6] dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00457c]"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chapter...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {verses.map((verse) => {
                const originalText = verse.hebrew || verse.greek || '';
                const detectedLang = originalText ? detectLanguage(originalText) : null;
                
                return (
                  <div
                    key={verse.number}
                    id={`verse-${verse.number}`}
                    onClick={() => setSelectedVerse(selectedVerse === verse.number ? null : verse.number)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedVerse === verse.number
                        ? 'bg-[#e8f4fc] dark:bg-blue-900/30 border-l-4 border-[#00457c]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {/* Verse Text */}
                    <p className="text-gray-900 dark:text-white leading-relaxed font-serif">
                      <span className="font-bold mr-2 text-[#00457c] dark:text-blue-400">
                        {verse.number}
                      </span>
                      {verse.text}
                    </p>
                    
                    {/* Original Language (if toggled) */}
                    {showOriginal && originalText && (
                      <div className="mt-2 p-3 rounded-lg bg-[#e8f4fc] dark:bg-blue-900/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {isOldTestament ? 'Hebrew (BHS)' : 'Greek (NA28)'}
                          </span>
                          {detectedLang && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              ✓ Detected: {detectedLang.language}
                            </span>
                          )}
                        </div>
                        <p className={`text-lg leading-relaxed ${isOldTestament ? 'font-hebrew text-right text-[#003366] dark:text-blue-200' : 'font-greek text-[#003366] dark:text-blue-200'}`}>
                          {originalText}
                        </p>
                      </div>
                    )}
                    
                    {/* Strong's Numbers (if verse selected) */}
                    {selectedVerse === verse.number && verse.strongs && verse.strongs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {verse.strongs.map((strong, idx) => (
                          <a
                            key={idx}
                            href={`https://www.blueletterbible.org/lexicon/${strong}/kjv/wlc/0-1/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 text-xs rounded-full bg-[#e8f4fc] dark:bg-blue-800 text-[#00457c] dark:text-blue-200 hover:opacity-80"
                          >
                            {strong}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* External Links */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">View this chapter on trusted sources:</p>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://www.churchofjesuschrist.org/study/scriptures/${isOldTestament ? 'ot' : 'nt'}/${bookId}/${chapter}?lang=eng`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 flex items-center space-x-2"
            >
              <BookOpenIcon className="h-4 w-4" />
              <span>Church of Jesus Christ</span>
            </a>
            <a
              href={`https://www.bible.com/bible/1/${bookData.name.toLowerCase().replace(/\s+/g, '')}.${chapter}.KJV`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50 flex items-center space-x-2"
            >
              <BookOpenIcon className="h-4 w-4" />
              <span>Bible.com</span>
            </a>
            <a
              href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(bookData.name)}+${chapter}&version=NIV`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800/50 flex items-center space-x-2"
            >
              <AcademicCapIcon className="h-4 w-4" />
              <span>Bible Gateway</span>
            </a>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {prevChapter ? (
            <Link
              href={`/bible/${bookId}/${prevChapter}`}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              <span>Prev</span>
            </Link>
          ) : (
            <div />
          )}
          
          <Link
            href="/bible"
            className="px-4 py-2 text-[#00457c] dark:text-blue-400 hover:text-[#003366] dark:hover:text-blue-300"
          >
            All Books
          </Link>
          
          {nextChapter ? (
            <Link
              href={`/bible/${bookId}/${nextChapter}`}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white bg-[#00457c] hover:bg-[#003366]"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}



