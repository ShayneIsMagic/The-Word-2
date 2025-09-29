'use client';

import { useState, useMemo } from 'react';
import { 
  getBooks, 
  getVerses, 
  searchScripture, 
  getBookById, 
  getVersesByBook,
  getChapter,
  SearchResult,
  Book,
  Verse 
} from '@/lib/data';
import SearchBar from '@/components/SearchBar';
import VerseCard from '@/components/VerseCard';
import BookGrid from '@/components/BookGrid';
import ChapterNavigator from '@/components/ChapterNavigator';
import ScriptureStudy from '@/components/ScriptureStudy';
import { ThemeToggle } from '@/components/ThemeProvider';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  LanguageIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import VerseComparison from "../components/VerseComparison";
import { sampleVerseData } from "../lib/sampleVerseData";

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'books' | 'search' | 'verses' | 'study'>('books');
  const [showStudyMode, setShowStudyMode] = useState(false);

  const books = getBooks();
  const verses = getVerses();

  const handleSearch = (query: string) => {
    const results = searchScripture(query);
    setSearchResults(results);
    setActiveTab('search');
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSelectedVerse(null);
    setSelectedChapter(1);
    setActiveTab('verses');
  };

  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'book') {
      const book = getBookById(result.id);
      if (book) {
        setSelectedBook(book);
        setActiveTab('verses');
      }
    } else if (result.type === 'verse') {
      const verse = verses.find(v => v.id === result.id);
      if (verse) {
        setSelectedVerse(verse);
        setActiveTab('verses');
      }
    }
  };

  const currentChapterData = useMemo(() => {
    if (!selectedBook) return null;
    return getChapter(selectedBook.id, selectedChapter);
  }, [selectedBook, selectedChapter]);

  const handleBack = () => {
    if (showStudyMode) {
      setShowStudyMode(false);
    } else if (selectedVerse) {
      setSelectedVerse(null);
    } else if (selectedBook) {
      setSelectedBook(null);
      setActiveTab('books');
    }
  };

  const handleStudyMode = () => {
    setShowStudyMode(true);
  };

  // If study mode is active, show the ScriptureStudy component
  if (showStudyMode) {
    return (
      <ScriptureStudy 
        onBack={handleBack}
        selectedBook={selectedBook}
        selectedVerse={selectedVerse}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {(selectedBook || selectedVerse) && (
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="h-8 w-8 text-zb-red-600 dark:text-zb-red-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  The Word
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search scripture..."
                className="w-64"
              />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'books', label: 'Books', icon: BookOpenIcon },
              { id: 'search', label: 'Search', icon: MagnifyingGlassIcon },
              { id: 'verses', label: 'Study', icon: AcademicCapIcon },
              { id: 'study', label: 'Advanced Study', icon: SparklesIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'study') {
                    handleStudyMode();
                  } else {
                    setActiveTab(tab.id as 'books' | 'search' | 'verses');
                  }
                }}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-zb-red-500 text-zb-red-600 dark:text-zb-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Books Tab */}
        {activeTab === 'books' && !selectedBook && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Scripture Library
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Explore the complete Bible with advanced study tools
              </p>
            </div>
            <BookGrid 
              books={books} 
              onBookSelect={handleBookSelect}
            />
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Search Results
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Found {searchResults.length} results
              </p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid gap-4">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultSelect(result)}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {result.content}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.type === 'book' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {result.type === 'book' ? 'Book' : 'Verse'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No search results found. Try searching for a book name, verse reference, or keyword.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verses Tab */}
        {activeTab === 'verses' && selectedBook && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedBook.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{selectedBook.chapters} chapters</span>
                    <span>•</span>
                    <span>{selectedBook.category}</span>
                    <span>•</span>
                    <span>{selectedBook.testament === 'old' ? 'Old Testament' : 'New Testament'}</span>
                  </div>
                </div>
                <button
                  onClick={handleStudyMode}
                  className="px-4 py-2 bg-zb-red-600 hover:bg-zb-red-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>Advanced Study</span>
                </button>
              </div>
            </div>

            {selectedVerse ? (
              <div className="max-w-4xl mx-auto">
                <VerseCard verse={selectedVerse} />
              </div>
            ) : (
              <div className="grid gap-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <LanguageIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Study Tools Available
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                        This book contains {currentChapterData?.verses.length || 0} verses in chapter {selectedChapter} with Greek/Hebrew text and Strong&apos;s numbers. 
                        Click on any verse to explore the original languages and word studies.
                      </p>
                    </div>
                  </div>
                </div>

                <ChapterNavigator
                  bookId={selectedBook.id}
                  totalChapters={selectedBook.chapters}
                  onChapterSelect={setSelectedChapter}
                  currentChapter={selectedChapter}
                  className="mb-6"
                />
                
                <div className="grid gap-4">
                  {currentChapterData?.verses.map((verse) => (
                    <div
                      key={`${selectedBook.id}${selectedChapter}-${verse.number}`}
                      onClick={() => setSelectedVerse({
                        id: `${selectedBook.id}${selectedChapter}-${verse.number}`,
                        book: selectedBook.name,
                        chapter: selectedChapter,
                        verse: verse.number,
                        text: verse.text,
                        translation: 'ESV',
                        greek: verse.greek,
                        hebrew: verse.hebrew,
                        strongs: verse.strongs,
                      })}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {selectedBook.name} {selectedChapter}:{verse.number}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {verse.text}
                      </p>
                      {(verse.greek || verse.hebrew) && (
                        <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <LanguageIcon className="h-4 w-4" />
                          <span>Original text available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Performance Monitor */}
      <PerformanceMonitor />
      <VerseComparison {...sampleVerseData} />
    </div>
  );
} 