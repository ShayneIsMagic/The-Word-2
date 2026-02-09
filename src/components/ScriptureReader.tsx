'use client';

import { useState, useEffect } from 'react';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useScripture, ALL_BIBLE_BOOKS, AVAILABLE_TRANSLATIONS, type BibleBook, type TranslationKey } from '@/context/ScriptureContext';
import { ThemeToggle } from '@/components/ThemeProvider';

// ============================================================================
// Translation Categories
// ============================================================================

const PRIMARY_TRANSLATIONS: TranslationKey[] = ['kjv', 'esv', 'net', 'leb', 'geneva', 'jubilee'];
const KJV_FAMILY: TranslationKey[] = ['mkjv', 'kjvpce', 'akjv'];
const LITERAL_TRANSLATIONS: TranslationKey[] = ['litv', 'ylt', 'asv', 'darby'];
const OTHER_TRANSLATIONS: TranslationKey[] = ['bsb', 'jps', 'tyndale', 'drc', 'webster', 'bbe', 'nheb', 'oeb'];

// ============================================================================
// Hebrew/Greek Pronunciation Data
// ============================================================================

const HEBREW_PRONUNCIATION: Record<string, { transliteration: string; pronunciation: string; meaning: string }> = {
  'בְּרֵאשִׁית': { transliteration: 'bereshit', pronunciation: 'beh-ray-SHEET', meaning: 'In the beginning' },
  'בָּרָא': { transliteration: 'bara', pronunciation: 'bah-RAH', meaning: 'created' },
  'אֱלֹהִים': { transliteration: 'elohim', pronunciation: 'eh-loh-HEEM', meaning: 'God (plural of majesty)' },
  'הַשָּׁמַיִם': { transliteration: 'hashamayim', pronunciation: 'hah-shah-MY-eem', meaning: 'the heavens' },
  'הָאָרֶץ': { transliteration: "ha'aretz", pronunciation: 'hah-AH-retz', meaning: 'the earth' },
  'יְהוָה': { transliteration: 'YHWH/Yahweh', pronunciation: 'yah-WEH', meaning: 'LORD (the Eternal One)' },
  'אָדָם': { transliteration: 'adam', pronunciation: 'ah-DAHM', meaning: 'man/Adam' },
  'חַוָּה': { transliteration: 'chavvah', pronunciation: 'khah-VAH', meaning: 'Eve (life-giver)' },
  'תּוֹרָה': { transliteration: 'torah', pronunciation: 'toh-RAH', meaning: 'law/instruction' },
  'שָׁלוֹם': { transliteration: 'shalom', pronunciation: 'shah-LOHM', meaning: 'peace/wholeness' },
};

const GREEK_PRONUNCIATION: Record<string, { transliteration: string; pronunciation: string; meaning: string }> = {
  'λόγος': { transliteration: 'logos', pronunciation: 'LOH-goss', meaning: 'Word/Reason' },
  'θεός': { transliteration: 'theos', pronunciation: 'theh-OSS', meaning: 'God' },
  'ἀγάπη': { transliteration: 'agape', pronunciation: 'ah-GAH-pay', meaning: 'love (divine)' },
  'πίστις': { transliteration: 'pistis', pronunciation: 'PEES-tis', meaning: 'faith/trust' },
  'χάρις': { transliteration: 'charis', pronunciation: 'KHAH-ris', meaning: 'grace' },
  'πνεῦμα': { transliteration: 'pneuma', pronunciation: 'PNYOO-mah', meaning: 'Spirit/breath' },
  'κύριος': { transliteration: 'kyrios', pronunciation: 'KOO-ree-oss', meaning: 'Lord/Master' },
  'Χριστός': { transliteration: 'Christos', pronunciation: 'khris-TOSS', meaning: 'Christ/Anointed One' },
  'σωτηρία': { transliteration: 'soteria', pronunciation: 'soh-tay-REE-ah', meaning: 'salvation' },
  'εὐαγγέλιον': { transliteration: 'euangelion', pronunciation: 'yoo-ang-GEH-lee-on', meaning: 'gospel/good news' },
};

// ============================================================================
// Component
// ============================================================================

export default function ScriptureReader() {
  const scripture = useScripture();

  // Navigation State
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT'>('OT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'books' | 'tools'>('books');

  // Translation State
  const [primaryTranslation, setPrimaryTranslation] = useState<TranslationKey>('kjv');
  const [showParallel, setShowParallel] = useState(true);
  const [parallelTranslation, setParallelTranslation] = useState<TranslationKey>('esv');

  // Tools State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showPronunciation, setShowPronunciation] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Get books by testament
  const filteredBooks = scripture.getBooksByTestament(selectedTestament);

  // Get chapter verses
  const chapterVerses = selectedBook 
    ? scripture.getChapterVerses(selectedBook.name, selectedChapter, primaryTranslation)
    : [];

  // Set default book
  useEffect(() => {
    if (scripture.isLoaded && !selectedBook) {
      setSelectedBook(ALL_BIBLE_BOOKS[0]);
    }
  }, [scripture.isLoaded, selectedBook]);

  // Get translation info
  const getTranslationInfo = (key: TranslationKey) => {
    return AVAILABLE_TRANSLATIONS.find(t => t.key === key);
  };

  // Word click handler
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  // Get pronunciation data
  const getPronunciationData = (word: string, testament: 'OT' | 'NT') => {
    if (testament === 'OT') {
      return HEBREW_PRONUNCIATION[word] || null;
    } else {
      return GREEK_PRONUNCIATION[word] || null;
    }
  };

  if (scripture.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f0] dark:bg-[#1a202c]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#00457c] mx-auto mb-4" />
          <p className="text-xl font-serif text-[#333] dark:text-gray-200">Loading Scriptures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] dark:bg-gray-900 flex flex-col">
      {/* ================================================================== */}
      {/* TOP HEADER - Matches Home Page Styling */}
      {/* ================================================================== */}
      <header className="bg-[#00457c] text-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <a href="/" className="p-2 text-white/70 hover:text-white transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
              </a>
              <div className="flex items-center space-x-2">
                <BookOpenIcon className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-serif font-bold text-white">
                  The Word
                </h1>
              </div>
              {selectedBook && (
                <div className="hidden sm:block text-white/70 text-lg font-serif ml-4 border-l border-white/30 pl-4">
                  {selectedBook.name} {selectedChapter}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <a
                href="/"
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                📖 Home
              </a>
              <a
                href="/bible"
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                📚 All 66 Books
              </a>
              <a
                href="/amplified"
                className="px-3 py-2 text-sm font-medium text-white/90 hover:text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                🎓 Amplified Study
              </a>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border-0 rounded-lg text-sm w-48 bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTENT AREA - Sidebar + Scripture */}
      {/* ================================================================== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================================================================== */}
        {/* LEFT SIDEBAR - Books/Chapters + Tools */}
        {/* ================================================================== */}
        <aside className="w-80 bg-white dark:bg-[#2d3748] border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Sidebar Tabs: Books | Tools */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarTab('books')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
              sidebarTab === 'books'
                ? 'bg-[#00457c] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BookOpenIcon className="h-4 w-4" />
            <span>Books</span>
          </button>
          <button
            onClick={() => setSidebarTab('tools')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center space-x-2 transition-colors ${
              sidebarTab === 'tools'
                ? 'bg-[#00457c] text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <AcademicCapIcon className="h-4 w-4" />
            <span>Tools</span>
          </button>
        </div>

        {/* BOOKS TAB */}
        {sidebarTab === 'books' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Testament Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedTestament('OT')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  selectedTestament === 'OT'
                    ? 'bg-[#e8f4fc] dark:bg-blue-900/30 text-[#00457c] dark:text-blue-300 border-b-2 border-[#00457c]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Old Testament (39)
              </button>
              <button
                onClick={() => setSelectedTestament('NT')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  selectedTestament === 'NT'
                    ? 'bg-[#e8f4fc] dark:bg-blue-900/30 text-[#00457c] dark:text-blue-300 border-b-2 border-[#00457c]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                New Testament (27)
              </button>
            </div>

            {/* Book List */}
            <div className="flex-1 overflow-y-auto">
              {filteredBooks.map((book) => (
                <div key={book.id} className="border-b border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setSelectedChapter(1);
                    }}
                    className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors text-sm ${
                      selectedBook?.id === book.id
                        ? 'bg-[#e8f4fc] dark:bg-blue-900/30 text-[#00457c] dark:text-blue-300 font-semibold'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{book.name}</span>
                    <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                  </button>

                  {/* Chapter Grid */}
                  {selectedBook?.id === book.id && (
                    <div className="px-3 pb-3 grid grid-cols-6 gap-1 bg-gray-50 dark:bg-gray-800">
                      {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setSelectedChapter(ch)}
                          className={`w-full h-7 text-xs rounded transition-colors ${
                            selectedChapter === ch
                              ? 'bg-[#00457c] text-white'
                              : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-[#e8f4fc] dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {sidebarTab === 'tools' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Translation Settings */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-[#00457c] dark:text-blue-300 mb-3 flex items-center space-x-2">
                <LanguageIcon className="h-4 w-4" />
                <span>Translations</span>
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Primary</label>
                  <select
                    value={primaryTranslation}
                    onChange={(e) => setPrimaryTranslation(e.target.value as TranslationKey)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#00457c]"
                  >
                    <optgroup label="📌 Primary">
                      {PRIMARY_TRANSLATIONS.map(key => {
                        const info = getTranslationInfo(key);
                        return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                      })}
                    </optgroup>
                    <optgroup label="👑 KJV Family">
                      {KJV_FAMILY.map(key => {
                        const info = getTranslationInfo(key);
                        return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                      })}
                    </optgroup>
                    <optgroup label="📖 Literal">
                      {LITERAL_TRANSLATIONS.map(key => {
                        const info = getTranslationInfo(key);
                        return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                      })}
                    </optgroup>
                    <optgroup label="📚 Other">
                      {OTHER_TRANSLATIONS.map(key => {
                        const info = getTranslationInfo(key);
                        return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                      })}
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Show Parallel</label>
                  <button
                    onClick={() => setShowParallel(!showParallel)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      showParallel ? 'bg-[#00457c]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      showParallel ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {showParallel && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parallel</label>
                    <select
                      value={parallelTranslation}
                      onChange={(e) => setParallelTranslation(e.target.value as TranslationKey)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-[#00457c]"
                    >
                      <optgroup label="📌 Primary">
                        {PRIMARY_TRANSLATIONS.map(key => {
                          const info = getTranslationInfo(key);
                          return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                        })}
                      </optgroup>
                      <optgroup label="👑 KJV Family">
                        {KJV_FAMILY.map(key => {
                          const info = getTranslationInfo(key);
                          return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                        })}
                      </optgroup>
                      <optgroup label="📖 Literal">
                        {LITERAL_TRANSLATIONS.map(key => {
                          const info = getTranslationInfo(key);
                          return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                        })}
                      </optgroup>
                      <optgroup label="📚 Other">
                        {OTHER_TRANSLATIONS.map(key => {
                          const info = getTranslationInfo(key);
                          return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                        })}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Pronunciation Tool */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-[#00457c] dark:text-blue-300 mb-3 flex items-center space-x-2">
                <SpeakerWaveIcon className="h-4 w-4" />
                <span>{selectedBook?.testament === 'OT' ? 'Hebrew' : 'Greek'} Tools</span>
              </h3>

              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-gray-700 dark:text-gray-300">Show Pronunciation</label>
                <button
                  onClick={() => setShowPronunciation(!showPronunciation)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showPronunciation ? 'bg-[#00457c]' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    showPronunciation ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Selected Word Display */}
              {selectedWord && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-[#00457c]/30">
                  <p className={`text-2xl mb-2 ${selectedBook?.testament === 'OT' ? 'font-hebrew text-right' : 'font-greek'} dark:text-gray-100`}>
                    {selectedWord}
                  </p>
                  {(() => {
                    const pronData = getPronunciationData(selectedWord, selectedBook?.testament || 'OT');
                    if (!pronData) return <p className="text-xs text-gray-500">Click a word in the original text</p>;
                    return (
                      <div className="space-y-1">
                        <p className="text-sm font-mono text-[#00457c] dark:text-blue-300">{pronData.transliteration}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">/{pronData.pronunciation}/</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{pronData.meaning}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Quick Reference */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick Reference:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(selectedBook?.testament === 'OT' ? HEBREW_PRONUNCIATION : GREEK_PRONUNCIATION).slice(0, 4).map(([word, data]) => (
                    <button
                      key={word}
                      onClick={() => setSelectedWord(word)}
                      className={`text-left p-2 rounded text-xs transition-colors ${
                        selectedWord === word 
                          ? 'bg-[#00457c] text-white' 
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-[#e8f4fc] dark:hover:bg-blue-900/30'
                      }`}
                    >
                      <p className={`text-sm ${selectedBook?.testament === 'OT' ? 'font-hebrew text-right' : 'font-greek'}`}>{word}</p>
                      <p className={`font-mono ${selectedWord === word ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{data.transliteration}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ================================================================== */}
      {/* MAIN CONTENT - 3 Column Scripture View */}
      {/* ================================================================== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Column Headers */}
        <div className={`grid ${showParallel ? 'grid-cols-3' : 'grid-cols-2'} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748]`}>
          <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-[#00457c] dark:text-blue-300 flex items-center space-x-2">
              <span className="text-lg">🔤</span>
              <span>{selectedBook?.testament === 'OT' ? 'Hebrew (WLC)' : 'Greek (TR)'}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Original Language</p>
          </div>
          <div className={`px-4 py-3 ${showParallel ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
            <h3 className="font-semibold text-[#00457c] dark:text-blue-300 flex items-center space-x-2">
              <span className="text-lg">📖</span>
              <span>{getTranslationInfo(primaryTranslation)?.abbr || 'Primary'}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getTranslationInfo(primaryTranslation)?.name}</p>
          </div>
          {showParallel && (
            <div className="px-4 py-3">
              <h3 className="font-semibold text-[#00457c] dark:text-blue-300 flex items-center space-x-2">
                <span className="text-lg">📖</span>
                <span>{getTranslationInfo(parallelTranslation)?.abbr || 'Parallel'}</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getTranslationInfo(parallelTranslation)?.name}</p>
            </div>
          )}
        </div>

        {/* Scripture Content - 3 Columns */}
        <div className="flex-1 overflow-y-auto">
          <div className={`grid ${showParallel ? 'grid-cols-3' : 'grid-cols-2'} min-h-full`}>
            
            {/* Column 1: Original Language */}
            <div className="bg-[#faf9f6] dark:bg-[#2d3748] border-r border-gray-200 dark:border-gray-700 p-4">
              <div className="space-y-3">
                {chapterVerses.map((verse) => (
                  <div key={verse.verse} className="group">
                    <div className={`leading-relaxed ${
                      selectedBook?.testament === 'OT' 
                        ? 'text-right font-hebrew text-lg' 
                        : 'font-greek text-base'
                    } text-[#333] dark:text-gray-100`}>
                      <span className="text-[#00457c] dark:text-blue-300 font-sans text-xs font-bold mr-1 align-super">
                        {verse.verse}
                      </span>
                      {verse.originalText ? (
                        verse.originalText.split(/\s+/).map((word, i) => (
                          <span
                            key={i}
                            onClick={() => handleWordClick(word)}
                            className={`cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-700 px-0.5 rounded transition-colors ${
                              selectedWord === word ? 'bg-yellow-300 dark:bg-yellow-600' : ''
                            }`}
                          >
                            {word}{' '}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-sm font-sans">
                          [Loading...]
                        </span>
                      )}
                    </div>

                    {/* Inline Pronunciation (when word is selected from this verse) */}
                    {showPronunciation && selectedWord && verse.originalText?.includes(selectedWord) && (
                      (() => {
                        const pronData = getPronunciationData(selectedWord, selectedBook?.testament || 'OT');
                        if (!pronData) return null;
                        return (
                          <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border-l-4 border-[#00457c] text-sm">
                            <span className="font-mono text-[#00457c] dark:text-blue-300">{pronData.transliteration}</span>
                            <span className="text-gray-500 dark:text-gray-400 mx-2">•</span>
                            <span className="text-gray-700 dark:text-gray-200">{pronData.meaning}</span>
                          </div>
                        );
                      })()
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Primary Translation */}
            <div className={`bg-white dark:bg-[#1a202c] p-4 ${showParallel ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
              <div className="space-y-3">
                {chapterVerses.map((verse) => (
                  <p key={verse.verse} className="leading-relaxed text-[#333] dark:text-gray-200 font-serif text-base">
                    <span className="text-[#00457c] dark:text-blue-300 text-xs font-bold font-sans mr-1 align-super">
                      {verse.verse}
                    </span>
                    {verse.englishText || (
                      <span className="text-gray-400 italic text-sm">
                        [Not available]
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Column 3: Parallel Translation */}
            {showParallel && (
              <div className="bg-[#fafafa] dark:bg-[#2d3748] p-4">
                <div className="space-y-3">
                  {chapterVerses.map((verse) => {
                    const parallelText = scripture.getTranslationVerse(
                      parallelTranslation,
                      selectedBook?.name || '',
                      selectedChapter,
                      verse.verse
                    );
                    return (
                      <p key={verse.verse} className="leading-relaxed text-[#333] dark:text-gray-200 font-serif text-base">
                        <span className="text-[#00457c] dark:text-blue-300 text-xs font-bold font-sans mr-1 align-super">
                          {verse.verse}
                        </span>
                        {parallelText || (
                          <span className="text-gray-400 italic text-sm">
                            [Not available]
                          </span>
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
