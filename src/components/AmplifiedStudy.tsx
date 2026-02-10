'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon,
  LanguageIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { 
  useScripture, 
  ALL_BIBLE_BOOKS, 
  AVAILABLE_TRANSLATIONS,
  LICENSED_TRANSLATIONS_NOTE,
  type BibleBook, 
  type SearchResult,
  type TranslationKey 
} from '@/context/ScriptureContext';
import { 
  getJSTFootnote, 
  getCrossReferences, 
  getLDSScriptureUrl,
  getTopicalGuideUrl,
  type CrossReference 
} from '@/lib/lds-scripture-api';

// ============================================================================
// Types
// ============================================================================

interface WordDefinition {
  word: string;
  strongs: string;
  transliteration: string;
  primary_definition: string;
  amplified_options: string[];
  usage_notes: string;
}

interface VerseData {
  book: string;
  chapter: number;
  verse: number;
  englishText: string;
  originalText: string;
  language: 'hebrew' | 'greek' | 'aramaic';
  words?: WordDefinition[];
}

// ============================================================================
// Data - Uses ALL_BIBLE_BOOKS from shared ScriptureContext
// ============================================================================

// Key Hebrew words with amplified definitions
const HEBREW_AMPLIFIED: Record<string, WordDefinition> = {
  'H430': {
    word: 'אֱלֹהִים',
    strongs: 'H430',
    transliteration: 'elohim',
    primary_definition: 'God',
    amplified_options: [
      'God (the one true God)',
      'gods (pagan deities)',
      'judges, rulers (divine representatives)',
      'angels (heavenly beings)',
      'the Almighty'
    ],
    usage_notes: 'Plural form emphasizing majesty. Used 2,600+ times in OT.',
  },
  'H3068': {
    word: 'יְהוָה',
    strongs: 'H3068',
    transliteration: 'YHWH / Yahweh',
    primary_definition: 'LORD',
    amplified_options: [
      'LORD (the self-existent One)',
      'Jehovah (the covenant-keeping God)',
      'the Eternal One',
      'I AM (Exodus 3:14)'
    ],
    usage_notes: "The tetragrammaton. God's personal name, used 6,800+ times.",
  },
  'H1254': {
    word: 'בָּרָא',
    strongs: 'H1254',
    transliteration: 'bara',
    primary_definition: 'to create',
    amplified_options: [
      'to create (ex nihilo - from nothing)',
      'to shape, form',
      'to bring into being',
      'to produce (what is new)'
    ],
    usage_notes: 'Used only of divine creation. Genesis 1:1, 21, 27.',
  },
  'H7225': {
    word: 'רֵאשִׁית',
    strongs: 'H7225',
    transliteration: 'reshit',
    primary_definition: 'beginning',
    amplified_options: [
      'beginning',
      'first (in time)',
      'chief, principal',
      'firstfruits'
    ],
    usage_notes: 'From "rosh" (head). Genesis 1:1 - "In the beginning..."',
  },
};

// Key Greek words with amplified definitions
const GREEK_AMPLIFIED: Record<string, WordDefinition> = {
  'G3056': {
    word: 'λόγος',
    strongs: 'G3056',
    transliteration: 'logos',
    primary_definition: 'Word',
    amplified_options: [
      'Word (divine expression)',
      'reason, logic',
      'message, statement',
      'the Word (Christ as divine revelation)',
      'account, matter'
    ],
    usage_notes: 'John 1:1 - Christ as the eternal Word/Expression of God.',
  },
  'G26': {
    word: 'ἀγάπη',
    strongs: 'G26',
    transliteration: 'agape',
    primary_definition: 'love',
    amplified_options: [
      'love (divine, unconditional)',
      'affection, goodwill',
      'benevolence',
      'love feast (fellowship meal)'
    ],
    usage_notes: "The highest form of love. God's love for humanity.",
  },
  'G4102': {
    word: 'πίστις',
    strongs: 'G4102',
    transliteration: 'pistis',
    primary_definition: 'faith',
    amplified_options: [
      'faith',
      'belief, trust',
      'faithfulness, fidelity',
      'conviction (of truth)',
      'the Christian faith'
    ],
    usage_notes: 'Hebrews 11:1 - substance of things hoped for.',
  },
};

// NOTE: SAMPLE_VERSES removed — all verse data now comes from ScriptureContext
// which loads real data from the 21 translation JSON files + Hebrew OT + Greek NT.

// ============================================================================
// Component
// ============================================================================

interface AmplifiedStudyProps {
  onBack?: () => void;
}

export default function AmplifiedStudy({ onBack }: AmplifiedStudyProps) {
  // Use shared scripture context - data is loaded once at app level
  const scripture = useScripture();
  
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number>(1);
  const [currentVerse, setCurrentVerse] = useState<VerseData | null>(null);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookList, setShowBookList] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [viewMode, setViewMode] = useState<'verse' | 'chapter'>('verse');
  const [selectedTranslation, setSelectedTranslation] = useState<TranslationKey>('kjv');
  const [showCompare, setShowCompare] = useState(false);
  const [showJST, setShowJST] = useState(true); // JST enabled by default for LDS study
  const [showCrossRefs, setShowCrossRefs] = useState(true);
  const [showLicenseInfo, setShowLicenseInfo] = useState(false);

  // Filter books by testament using shared context
  const filteredBooks = scripture.getBooksByTestament(selectedTestament);

  // Get max verses from shared context
  const maxVerses = selectedBook 
    ? scripture.getVerseCount(selectedBook.name, selectedChapter)
    : 1;

  // Get chapter verses from shared context for full chapter view
  const chapterVerses = selectedBook && viewMode === 'chapter'
    ? scripture.getChapterVerses(selectedBook.name, selectedChapter, selectedTranslation)
    : [];

  // Load verse when selection changes - uses shared context
  const loadVerse = useCallback(async () => {
    if (!selectedBook || !scripture.isLoaded) return;

    const isOT = selectedBook.testament === 'OT';
    
    // Get verse data from shared context
    const verseData = scripture.getVerseData(selectedBook.name, selectedChapter, selectedVerse);
    const originalText = verseData.originalText;
    // Use selected translation
    const englishText = scripture.getTranslationVerse(selectedTranslation, selectedBook.name, selectedChapter, selectedVerse) || verseData.englishText;

    // Find matching amplified words
    const words: WordDefinition[] = [];
    if (isOT) {
      // Check for Hebrew amplified words
      Object.values(HEBREW_AMPLIFIED).forEach(word => {
        if (originalText.includes(word.word)) {
          words.push(word);
        }
      });
    } else {
      // Check for Greek amplified words
      Object.values(GREEK_AMPLIFIED).forEach(word => {
        if (originalText.includes(word.word)) {
          words.push(word);
        }
      });
    }

    setCurrentVerse({
      book: selectedBook.name,
      chapter: selectedChapter,
      verse: selectedVerse,
      englishText: englishText || `[${selectedBook.name} ${selectedChapter}:${selectedVerse}]`,
      originalText: originalText || (isOT ? '[Hebrew text loading...]' : '[Greek text loading...]'),
      language: verseData.language as 'hebrew' | 'greek' | 'aramaic',
      words: words.length > 0 ? words : undefined,
    });
  }, [selectedBook, selectedChapter, selectedVerse, selectedTranslation, scripture]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadVerse handles deps
  useEffect(() => {
    loadVerse();
  }, [loadVerse]);

  // Set default book to Genesis when data loads
  useEffect(() => {
    if (scripture.isLoaded && !selectedBook) {
      const genesis = scripture.getBookByName('Genesis');
      if (genesis) {
        setSelectedBook(genesis);
        setSelectedTestament('OT');
        setSelectedChapter(1);
        setSelectedVerse(1);
      }
    }
  }, [scripture.isLoaded, selectedBook, scripture]);

  // Keyword search using shared context
  const performSearch = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const results = scripture.searchVerses(query, 50);
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
    setIsSearching(false);
  }, [scripture]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    if (value.length >= 3) {
      setTimeout(() => performSearch(value), 300);
    } else {
      setShowSearchResults(false);
    }
  };

  // Navigate to search result
  const goToSearchResult = (result: SearchResult) => {
    const book = scripture.getBookByName(result.book);
    if (book) {
      setSelectedBook(book);
      setSelectedTestament(book.testament);
      setSelectedChapter(result.chapter);
      setSelectedVerse(result.verse);
      setShowSearchResults(false);
      setSearchQuery('');
      setViewMode('verse');
    }
  };

  // Search filter for books
  const searchFilteredBooks = filteredBooks.filter(book =>
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-[#1a202c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-amber-200 dark:border-amber-900 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              )}
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    📖 Amplified Scripture Study
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    High-fidelity original text with word-by-word definitions
                    {scripture.isLoading && <span className="ml-2 text-amber-600">⏳ Loading data...</span>}
                    {scripture.isLoaded && (
                      <span className="ml-2 text-green-600">✅ 66 books loaded</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search verses (e.g., 'love', 'faith')..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.length >= 3) {
                    performSearch(searchQuery);
                  }
                }}
                className="pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-colors w-80"
              />
              {isSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">⏳</span>
              )}
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-amber-300 dark:border-amber-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      🔍 Found {searchResults.length} results for &quot;{searchQuery}&quot;
                    </span>
                  </div>
                  {searchResults.map((result, idx) => (
                    <button
                      key={`${result.book}-${result.chapter}-${result.verse}-${idx}`}
                      onClick={() => goToSearchResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                        {result.book} {result.chapter}:{result.verse}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {result.text.substring(0, 150)}{result.text.length > 150 ? '...' : ''}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Book Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sticky top-6">
              {/* Testament Tabs */}
              <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setSelectedTestament('OT')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTestament === 'OT'
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Old Testament ({ALL_BIBLE_BOOKS.filter(b => b.testament === 'OT').length})
                </button>
                <button
                  onClick={() => setSelectedTestament('NT')}
                  className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                    selectedTestament === 'NT'
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  New Testament ({ALL_BIBLE_BOOKS.filter(b => b.testament === 'NT').length})
                </button>
              </div>

              {/* Book List */}
              <div className="max-h-[60vh] overflow-y-auto space-y-1">
                {searchFilteredBooks.map(book => (
                  <button
                    key={book.id}
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                      setSelectedVerse(1);
                      setShowBookList(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedBook?.id === book.id
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="font-medium">{book.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
                      ({book.chapters} ch)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Chapter/Verse Navigation */}
            {selectedBook && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">📚 {selectedBook.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Chapter:</label>
                    <select
                      value={selectedChapter}
                      onChange={(e) => {
                        setSelectedChapter(Number(e.target.value));
                        setSelectedVerse(1);
                      }}
                      className="px-3 py-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500"
                    >
                      {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => (
                        <option key={ch} value={ch}>{ch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Verse:</label>
                    <select
                      value={selectedVerse}
                      onChange={(e) => setSelectedVerse(Number(e.target.value))}
                      className="px-3 py-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500"
                    >
                      {Array.from({ length: maxVerses }, (_, i) => i + 1).map(v => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">of {maxVerses}</span>
                  </div>
                  
                  {/* Translation Selector */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Translation:</label>
                    <select
                      value={selectedTranslation}
                      onChange={(e) => setSelectedTranslation(e.target.value as TranslationKey)}
                      className="px-3 py-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500"
                    >
                      {AVAILABLE_TRANSLATIONS.map((t) => (
                        <option key={t.key} value={t.key}>{t.abbr}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowJST(!showJST)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showJST 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      title="Joseph Smith Translation"
                    >
                      📜 JST
                    </button>
                    <button
                      onClick={() => setShowCrossRefs(!showCrossRefs)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showCrossRefs 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      title="Cross-References"
                    >
                      🔗 Refs
                    </button>
                    <button
                      onClick={() => setShowCompare(!showCompare)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        showCompare 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Compare All
                    </button>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2 ml-auto">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode('verse')}
                        className={`px-3 py-1 text-sm font-medium transition-colors ${
                          viewMode === 'verse'
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Single Verse
                      </button>
                      <button
                        onClick={() => setViewMode('chapter')}
                        className={`px-3 py-1 text-sm font-medium transition-colors ${
                          viewMode === 'chapter'
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        📖 Full Chapter
                      </button>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedBook.testament === 'OT'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {selectedBook.testament === 'OT' ? 'Hebrew/Aramaic' : 'Greek'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER VIEW */}
            {viewMode === 'chapter' && selectedBook && chapterVerses.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Chapter Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">
                    📖 {selectedBook.name} Chapter {selectedChapter}
                  </h2>
                  <p className="text-amber-100 text-sm">
                    {chapterVerses.length} verses • {selectedBook.testament === 'OT' ? 'Hebrew' : 'Greek'} + English
                  </p>
                </div>

                <div className="p-6">
                  {/* Side-by-Side Headers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <LanguageIcon className="h-5 w-5 text-amber-600" />
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {selectedBook.testament === 'OT' ? 'Hebrew (WLC)' : 'Greek (TR)'}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpenIcon className="h-5 w-5 text-amber-600" />
                      <h3 className="font-bold text-gray-900 dark:text-white">English ({selectedTranslation.toUpperCase()})</h3>
                    </div>
                  </div>

                  {/* Verses */}
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                    {chapterVerses.map((v) => (
                      <div 
                        key={v.verse}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg transition-colors cursor-pointer ${
                          selectedVerse === v.verse 
                            ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-400' 
                            : 'bg-gray-50 dark:bg-gray-900 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                        }`}
                        onClick={() => {
                          setSelectedVerse(v.verse);
                          setViewMode('verse');
                        }}
                      >
                        {/* Original Text */}
                        <div className={`${
                          selectedBook.testament === 'OT' ? 'text-right font-hebrew' : 'font-greek'
                        } text-gray-800 dark:text-gray-200`}>
                          <span className="text-amber-600 font-bold mr-2">{v.verse}</span>
                          {v.originalText || '[Loading...]'}
                        </div>
                        
                        {/* English */}
                        <div className="text-gray-800 dark:text-gray-200 font-serif">
                          <span className="text-amber-600 font-bold mr-2">{v.verse}</span>
                          {v.englishText || '[Loading...]'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SINGLE VERSE VIEW */}
            {viewMode === 'verse' && currentVerse && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Verse Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                  <h2 className="text-2xl font-bold text-white">
                    {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                  </h2>
                  <p className="text-amber-100 text-sm">
                    Original {currentVerse.language === 'hebrew' ? 'Hebrew' : currentVerse.language === 'aramaic' ? 'Aramaic' : 'Greek'} with Amplified English
                  </p>
                </div>

                <div className="p-6">
                  {/* Side-by-Side Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Text */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2 mb-4">
                        <LanguageIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {currentVerse.language === 'hebrew' ? 'Hebrew (BHS)' : 
                           currentVerse.language === 'aramaic' ? 'Aramaic' : 'Greek (SBLGNT)'}
                        </h3>
                      </div>
                      <p className={`text-xl leading-relaxed ${
                        currentVerse.language === 'hebrew' || currentVerse.language === 'aramaic'
                          ? 'text-right font-hebrew'
                          : 'font-greek'
                      } text-gray-800 dark:text-gray-200`}>
                        {currentVerse.originalText}
                      </p>
                    </div>

                    {/* English Translation */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center space-x-2 mb-4">
                        <BookOpenIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          English ({selectedTranslation.toUpperCase()})
                        </h3>
                      </div>
                      <p className="text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-serif">
                        {currentVerse.englishText}
                      </p>
                    </div>
                  </div>

                  {/* JST (Joseph Smith Translation) Section */}
                  {showJST && selectedBook && (() => {
                    const jst = getJSTFootnote(selectedBook.name, selectedChapter, selectedVerse);
                    if (!jst) return null;
                    return (
                      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-2xl">📜</span>
                          <h3 className="font-bold text-blue-900 dark:text-blue-100">
                            JST (Joseph Smith Translation)
                          </h3>
                          <span className="px-2 py-1 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full font-semibold">
                            Inspired Revision
                          </span>
                        </div>
                        <p className="text-lg leading-relaxed text-blue-900 dark:text-blue-100 font-serif italic mb-3">
                          "{jst.jst}"
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 border-t border-blue-200 dark:border-blue-700 pt-3">
                          📌 {jst.note}
                        </p>
                        <a 
                          href={getLDSScriptureUrl(selectedBook.name, selectedChapter, selectedVerse)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline"
                        >
                          View on ChurchofJesusChrist.org →
                        </a>
                      </div>
                    );
                  })()}

                  {/* Cross-References Section */}
                  {showCrossRefs && selectedBook && (() => {
                    const refs = getCrossReferences(selectedBook.name, selectedChapter, selectedVerse);
                    if (refs.length === 0) return null;
                    return (
                      <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-300 dark:border-green-700">
                        <div className="flex items-center space-x-2 mb-4">
                          <span className="text-xl">🔗</span>
                          <h3 className="font-bold text-green-900 dark:text-green-100">
                            Cross-References ({refs.length})
                          </h3>
                        </div>
                        <div className="grid gap-2">
                          {refs.map((ref, idx) => (
                            <div key={idx} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                              <span className={`px-2 py-1 text-xs rounded font-medium ${
                                ref.type === 'prophecy-fulfillment' ? 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200' :
                                ref.type === 'parallel' ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                                ref.type === 'quote' ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200' :
                                'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {ref.type === 'prophecy-fulfillment' ? '⭐ Fulfillment' :
                                 ref.type === 'parallel' ? '📖 Parallel' :
                                 ref.type === 'quote' ? '💬 Quote' : '🔗 Related'}
                              </span>
                              <div>
                                <span className="font-semibold text-green-800 dark:text-green-200">{ref.verse}</span>
                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">{ref.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <a 
                          href={getTopicalGuideUrl(selectedBook.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 underline"
                        >
                          Explore Topical Guide →
                        </a>
                      </div>
                    );
                  })()}

                  {/* Compare All Translations */}
                  {showCompare && selectedBook && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <LanguageIcon className="h-5 w-5 mr-2 text-amber-600" />
                        📖 Compare All Translations - {selectedBook.name} {selectedChapter}:{selectedVerse}
                      </h3>
                      
                      {/* License Info Toggle */}
                      <button 
                        onClick={() => setShowLicenseInfo(!showLicenseInfo)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 mb-3 underline"
                      >
                        {showLicenseInfo ? 'Hide' : 'Show'} licensing info for NIV, NRSV, NASB, NA28, UBS
                      </button>
                      
                      {showLicenseInfo && (
                        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 whitespace-pre-line">
                          {LICENSED_TRANSLATIONS_NOTE}
                        </div>
                      )}
                      
                      <div className="grid gap-3">
                        {AVAILABLE_TRANSLATIONS.map((t) => {
                          const text = scripture.getTranslationVerse(t.key, selectedBook.name, selectedChapter, selectedVerse);
                          if (!text) return null;
                          return (
                            <div key={t.key} className={`rounded-lg p-4 border ${
                              t.key === 'kjv' 
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' 
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-bold ${
                                    t.key === 'kjv' ? 'text-amber-700 dark:text-amber-400' : 'text-amber-600 dark:text-amber-400'
                                  }`}>
                                    {t.abbr}
                                  </span>
                                  {t.key === 'kjv' && (
                                    <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                                      LDS Standard
                                    </span>
                                  )}
                                  {t.description && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      ({t.description})
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{t.name}</span>
                              </div>
                              <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Amplified Word Definitions */}
                  {currentVerse.words && currentVerse.words.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                        <InformationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                        📝 Key Words with Amplified Definitions
                      </h3>
                      
                      <div className="space-y-3">
                        {currentVerse.words.map((word, index) => (
                          <div 
                            key={index}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedWord(expandedWord === word.strongs ? null : word.strongs)}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <div className="flex items-center space-x-4">
                                <span className={`text-xl ${
                                  currentVerse.language === 'greek' ? 'font-greek' : 'font-hebrew'
                                } text-amber-700 dark:text-amber-400`}>
                                  {word.word}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                  ({word.transliteration})
                                </span>
                                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-mono rounded">
                                  {word.strongs}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  = {word.primary_definition}
                                </span>
                              </div>
                              {expandedWord === word.strongs ? (
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            
                            {expandedWord === word.strongs && (
                              <div className="px-4 pb-4 bg-amber-50 dark:bg-amber-900/10">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  <strong>Amplified meanings:</strong>
                                </p>
                                <ul className="space-y-2">
                                  {word.amplified_options.map((option, i) => (
                                    <li key={i} className="flex items-start">
                                      <span className="text-amber-500 mr-2">•</span>
                                      <span className="text-gray-700 dark:text-gray-300">{option}</span>
                                    </li>
                                  ))}
                                </ul>
                                {word.usage_notes && (
                                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-3">
                                    📌 {word.usage_notes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No verse selected */}
            {!selectedBook && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select a Book to Begin
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose from {ALL_BIBLE_BOOKS.length} books across the Old and New Testaments
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

