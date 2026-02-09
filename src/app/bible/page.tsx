'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpenIcon, 
  ArrowLeftIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

// All 66 Bible books organized by testament and category
const BIBLE_BOOKS = {
  'OT': {
    'Law': [
      { id: 'genesis', name: 'Genesis', chapters: 50, abbr: 'Gen' },
      { id: 'exodus', name: 'Exodus', chapters: 40, abbr: 'Exod' },
      { id: 'leviticus', name: 'Leviticus', chapters: 27, abbr: 'Lev' },
      { id: 'numbers', name: 'Numbers', chapters: 36, abbr: 'Num' },
      { id: 'deuteronomy', name: 'Deuteronomy', chapters: 34, abbr: 'Deut' },
    ],
    'History': [
      { id: 'joshua', name: 'Joshua', chapters: 24, abbr: 'Josh' },
      { id: 'judges', name: 'Judges', chapters: 21, abbr: 'Judg' },
      { id: 'ruth', name: 'Ruth', chapters: 4, abbr: 'Ruth' },
      { id: '1-samuel', name: '1 Samuel', chapters: 31, abbr: '1 Sam' },
      { id: '2-samuel', name: '2 Samuel', chapters: 24, abbr: '2 Sam' },
      { id: '1-kings', name: '1 Kings', chapters: 22, abbr: '1 Kgs' },
      { id: '2-kings', name: '2 Kings', chapters: 25, abbr: '2 Kgs' },
      { id: '1-chronicles', name: '1 Chronicles', chapters: 29, abbr: '1 Chr' },
      { id: '2-chronicles', name: '2 Chronicles', chapters: 36, abbr: '2 Chr' },
      { id: 'ezra', name: 'Ezra', chapters: 10, abbr: 'Ezra' },
      { id: 'nehemiah', name: 'Nehemiah', chapters: 13, abbr: 'Neh' },
      { id: 'esther', name: 'Esther', chapters: 10, abbr: 'Esth' },
    ],
    'Poetry': [
      { id: 'job', name: 'Job', chapters: 42, abbr: 'Job' },
      { id: 'psalms', name: 'Psalms', chapters: 150, abbr: 'Ps' },
      { id: 'proverbs', name: 'Proverbs', chapters: 31, abbr: 'Prov' },
      { id: 'ecclesiastes', name: 'Ecclesiastes', chapters: 12, abbr: 'Eccl' },
      { id: 'song-of-solomon', name: 'Song of Solomon', chapters: 8, abbr: 'Song' },
    ],
    'Major Prophets': [
      { id: 'isaiah', name: 'Isaiah', chapters: 66, abbr: 'Isa' },
      { id: 'jeremiah', name: 'Jeremiah', chapters: 52, abbr: 'Jer' },
      { id: 'lamentations', name: 'Lamentations', chapters: 5, abbr: 'Lam' },
      { id: 'ezekiel', name: 'Ezekiel', chapters: 48, abbr: 'Ezek' },
      { id: 'daniel', name: 'Daniel', chapters: 12, abbr: 'Dan' },
    ],
    'Minor Prophets': [
      { id: 'hosea', name: 'Hosea', chapters: 14, abbr: 'Hos' },
      { id: 'joel', name: 'Joel', chapters: 3, abbr: 'Joel' },
      { id: 'amos', name: 'Amos', chapters: 9, abbr: 'Amos' },
      { id: 'obadiah', name: 'Obadiah', chapters: 1, abbr: 'Obad' },
      { id: 'jonah', name: 'Jonah', chapters: 4, abbr: 'Jonah' },
      { id: 'micah', name: 'Micah', chapters: 7, abbr: 'Mic' },
      { id: 'nahum', name: 'Nahum', chapters: 3, abbr: 'Nah' },
      { id: 'habakkuk', name: 'Habakkuk', chapters: 3, abbr: 'Hab' },
      { id: 'zephaniah', name: 'Zephaniah', chapters: 3, abbr: 'Zeph' },
      { id: 'haggai', name: 'Haggai', chapters: 2, abbr: 'Hag' },
      { id: 'zechariah', name: 'Zechariah', chapters: 14, abbr: 'Zech' },
      { id: 'malachi', name: 'Malachi', chapters: 4, abbr: 'Mal' },
    ],
  },
  'NT': {
    'Gospels': [
      { id: 'matthew', name: 'Matthew', chapters: 28, abbr: 'Matt' },
      { id: 'mark', name: 'Mark', chapters: 16, abbr: 'Mark' },
      { id: 'luke', name: 'Luke', chapters: 24, abbr: 'Luke' },
      { id: 'john', name: 'John', chapters: 21, abbr: 'John' },
    ],
    'History': [
      { id: 'acts', name: 'Acts', chapters: 28, abbr: 'Acts' },
    ],
    'Pauline Epistles': [
      { id: 'romans', name: 'Romans', chapters: 16, abbr: 'Rom' },
      { id: '1-corinthians', name: '1 Corinthians', chapters: 16, abbr: '1 Cor' },
      { id: '2-corinthians', name: '2 Corinthians', chapters: 13, abbr: '2 Cor' },
      { id: 'galatians', name: 'Galatians', chapters: 6, abbr: 'Gal' },
      { id: 'ephesians', name: 'Ephesians', chapters: 6, abbr: 'Eph' },
      { id: 'philippians', name: 'Philippians', chapters: 4, abbr: 'Phil' },
      { id: 'colossians', name: 'Colossians', chapters: 4, abbr: 'Col' },
      { id: '1-thessalonians', name: '1 Thessalonians', chapters: 5, abbr: '1 Thess' },
      { id: '2-thessalonians', name: '2 Thessalonians', chapters: 3, abbr: '2 Thess' },
      { id: '1-timothy', name: '1 Timothy', chapters: 6, abbr: '1 Tim' },
      { id: '2-timothy', name: '2 Timothy', chapters: 4, abbr: '2 Tim' },
      { id: 'titus', name: 'Titus', chapters: 3, abbr: 'Titus' },
      { id: 'philemon', name: 'Philemon', chapters: 1, abbr: 'Phlm' },
    ],
    'General Epistles': [
      { id: 'hebrews', name: 'Hebrews', chapters: 13, abbr: 'Heb' },
      { id: 'james', name: 'James', chapters: 5, abbr: 'Jas' },
      { id: '1-peter', name: '1 Peter', chapters: 5, abbr: '1 Pet' },
      { id: '2-peter', name: '2 Peter', chapters: 3, abbr: '2 Pet' },
      { id: '1-john', name: '1 John', chapters: 5, abbr: '1 John' },
      { id: '2-john', name: '2 John', chapters: 1, abbr: '2 John' },
      { id: '3-john', name: '3 John', chapters: 1, abbr: '3 John' },
      { id: 'jude', name: 'Jude', chapters: 1, abbr: 'Jude' },
    ],
    'Prophecy': [
      { id: 'revelation', name: 'Revelation', chapters: 22, abbr: 'Rev' },
    ],
  },
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'Law': 'bg-lds-100 text-lds-800 dark:bg-lds-900/30 dark:text-lds-200',
  'History': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  'Poetry': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  'Major Prophets': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  'Minor Prophets': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  'Gospels': 'bg-lds-100 text-lds-800 dark:bg-lds-900/30 dark:text-lds-200',
  'Pauline Epistles': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
  'General Epistles': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-200',
  'Prophecy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
};

export default function BiblePage() {
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>('OT');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const categories = BIBLE_BOOKS[selectedTestament];

  // Filter books by search query
  const matchesSearch = (name: string, abbr: string) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || abbr.toLowerCase().includes(q);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#1a202c]">
      {/* Header */}
      <header className="bg-[#00457c] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/10">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-8 w-8 text-white" />
                <div>
                  <h1 className="text-xl font-bold">Scripture Reader</h1>
                  <p className="text-xs text-white/70">66 Books • Old &amp; New Testament</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 w-48"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Testament Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex">
            <button
              onClick={() => setSelectedTestament('OT')}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors border-b-2 ${
                selectedTestament === 'OT'
                  ? 'border-[#00457c] text-[#00457c] dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              Old Testament (39 Books)
            </button>
            <button
              onClick={() => setSelectedTestament('NT')}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors border-b-2 ${
                selectedTestament === 'NT'
                  ? 'border-[#00457c] text-[#00457c] dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              New Testament (27 Books)
            </button>
          </div>
        </div>
      </div>

      {/* Book Categories */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {Object.entries(categories).map(([category, books]) => {
          const filteredBooks = books.filter(b => matchesSearch(b.name, b.abbr));
          if (filteredBooks.length === 0) return null;

          return (
            <div key={category}>
              <div className="flex items-center space-x-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{category}</h2>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800'}`}>
                  {filteredBooks.length} books
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="relative">
                    <button
                      onClick={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        expandedBook === book.id
                          ? 'bg-[#e8f4fc] dark:bg-blue-900/30 border-[#00457c] dark:border-blue-500 shadow-md'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#00457c] dark:hover:border-blue-500 hover:shadow-md'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{book.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{book.chapters} chapters</div>
                    </button>

                    {/* Chapter selector dropdown */}
                    {expandedBook === book.id && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl p-3 max-h-48 overflow-y-auto">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Select chapter:</p>
                        <div className="grid grid-cols-5 gap-1">
                          {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
                            <Link
                              key={ch}
                              href={`/bible/${book.id}/${ch}`}
                              className="text-center py-1.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#00457c] hover:text-white dark:hover:bg-blue-600 transition-colors"
                            >
                              {ch}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </main>

      {/* Quick Access Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              📖 The Word — Scripture Reader
            </p>
            <div className="flex space-x-3">
              <Link href="/" className="text-sm text-[#00457c] dark:text-blue-400 hover:underline">Home</Link>
              <Link href="/amplified" className="text-sm text-[#00457c] dark:text-blue-400 hover:underline">Amplified Study</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
