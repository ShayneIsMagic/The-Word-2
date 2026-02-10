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
import { 
  useScripture, 
  ALL_BIBLE_BOOKS, 
  AVAILABLE_TRANSLATIONS, 
  type TranslationKey 
} from '@/context/ScriptureContext';
import { detectLanguage } from '@/lib/language-detector';
import { 
  getJSTFootnote, 
  getCrossReferences, 
  getLDSScriptureUrl 
} from '@/lib/lds-scripture-api';

export default function ChapterPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const chapter = parseInt(params.chapter as string, 10);
  const scripture = useScripture();

  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationKey>('kjv');
  const [showJST, setShowJST] = useState(true);

  // Find book from shared context
  const bookData = ALL_BIBLE_BOOKS.find(b => b.id === bookId);
  const isOldTestament = bookData?.testament === 'OT';

  // Get verses from ScriptureContext (real backend data)
  const verses = bookData 
    ? scripture.getChapterVerses(bookData.name, chapter, selectedTranslation)
    : [];

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
            
            {/* Translation Selector + Toggle */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value as TranslationKey)}
                className="px-3 py-1 text-sm border border-white/30 rounded-lg bg-white/10 text-white"
              >
                {AVAILABLE_TRANSLATIONS.map(t => (
                  <option key={t.key} value={t.key} className="text-gray-900">{t.abbr}</option>
                ))}
              </select>
              
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className={`p-2 rounded-lg transition-colors ${showOriginal ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'}`}
                title={isOldTestament ? 'Show Hebrew' : 'Show Greek'}
              >
                <LanguageIcon className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowJST(!showJST)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  showJST ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
                title="Joseph Smith Translation"
              >
                📜 JST
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
          {scripture.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00457c]"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chapter...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Psalm Introduction */}
              {verses[0]?.superscription && (
                <div className="p-4 rounded-lg bg-[#faf9f6] dark:bg-gray-700/50 border-l-4 border-[#00457c] dark:border-blue-500 mb-2">
                  <p className={`text-base italic leading-relaxed ${
                    isOldTestament ? 'text-right font-hebrew text-gray-700 dark:text-gray-200' : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {verses[0].superscription}
                  </p>
                </div>
              )}

              {verses.map((verse) => {
                const detectedLang = verse.originalText ? detectLanguage(verse.originalText) : null;
                const jst = showJST && bookData ? getJSTFootnote(bookData.name, chapter, verse.verse) : null;
                const refs = bookData ? getCrossReferences(bookData.name, chapter, verse.verse) : [];
                
                return (
                  <div
                    key={verse.verse}
                    id={`verse-${verse.verse}`}
                    onClick={() => setSelectedVerse(selectedVerse === verse.verse ? null : verse.verse)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedVerse === verse.verse
                        ? 'bg-[#e8f4fc] dark:bg-blue-900/30 border-l-4 border-[#00457c]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {/* English Verse Text */}
                    <p className="text-gray-900 dark:text-white leading-relaxed font-serif">
                      <span className="font-bold mr-2 text-[#00457c] dark:text-blue-400">
                        {verse.verse}
                      </span>
                      {verse.englishText || `[${bookData.name} ${chapter}:${verse.verse}]`}
                    </p>
                    
                    {/* Original Language (if toggled) */}
                    {showOriginal && verse.originalText && (
                      <div className="mt-2 p-3 rounded-lg bg-[#e8f4fc] dark:bg-blue-900/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {isOldTestament ? 'Hebrew (WLC)' : 'Greek (TR)'}
                          </span>
                          {detectedLang && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              ✓ {detectedLang.language}
                            </span>
                          )}
                        </div>
                        <p className={`text-lg leading-relaxed ${isOldTestament ? 'font-hebrew text-right text-[#003366] dark:text-blue-200' : 'font-greek text-[#003366] dark:text-blue-200'}`}>
                          {verse.originalText}
                        </p>
                      </div>
                    )}

                    {/* JST Footnote */}
                    {jst && selectedVerse === verse.verse && (
                      <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">📜 JST (Joseph Smith Translation)</p>
                        <p className="text-sm italic text-blue-900 dark:text-blue-100">&quot;{jst.jst}&quot;</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{jst.note}</p>
                      </div>
                    )}

                    {/* Cross-References */}
                    {refs.length > 0 && selectedVerse === verse.verse && (
                      <div className="mt-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">🔗 Cross-References</p>
                        <div className="space-y-1">
                          {refs.map((ref, idx) => (
                            <p key={idx} className="text-xs text-green-800 dark:text-green-200">
                              <span className="font-semibold">{ref.verse}</span> — {ref.text}
                            </p>
                          ))}
                        </div>
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
              href={getLDSScriptureUrl(bookData.name, chapter)}
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
          
          <div className="flex space-x-3">
            <Link
              href="/bible"
              className="px-4 py-2 text-[#00457c] dark:text-blue-400 hover:text-[#003366] dark:hover:text-blue-300"
            >
              All Books
            </Link>
            <Link
              href="/reader"
              className="px-4 py-2 text-[#00457c] dark:text-blue-400 hover:text-[#003366] dark:hover:text-blue-300"
            >
              3-Column Reader
            </Link>
          </div>
          
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
