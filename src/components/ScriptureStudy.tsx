'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpenIcon, 
  MagnifyingGlassIcon, 
  AcademicCapIcon,
  LanguageIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  ShareIcon,
  PencilIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LinkIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { getBooks, getVerses, getChapter, Book, Verse } from '@/lib/data';

interface ScriptureStudyProps {
  onBack: () => void;
  selectedBook?: Book | null;
  selectedVerse?: Verse | null;
}

export default function ScriptureStudy({ onBack, selectedBook, selectedVerse }: ScriptureStudyProps) {
  const [currentBook, setCurrentBook] = useState<Book | null>(selectedBook || null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(selectedVerse || null);
  const [showJST, setShowJST] = useState(false);
  const [showGreek, setShowGreek] = useState(false);
  const [showCFM, setShowCFM] = useState(false);
  const [showNA28, setShowNA28] = useState(false);
  const [activeCommentary, setActiveCommentary] = useState<'talmage' | 'prophets' | 'scholars'>('talmage');
  const [loading, setLoading] = useState(false);

  const books = getBooks();
  const verses = getVerses();

  const currentChapterData = currentBook ? getChapter(currentBook.id, currentChapter) : null;

  // Sample data for demonstration
  const commentaries = {
    talmage: {
      'john-3-16': 'The love of God toward the children of men is beyond finite comprehension. That the Father would give His Only Begotten Son demonstrates love in its most sublime manifestation.',
      'matthew-5-16': 'The light referred to is the light of truth, the light of the gospel, which every true believer carries within.'
    },
    prophets: {
      'john-3-16': '"The love of God is the most powerful force in this world or in any world." — President Russell M. Nelson',
      'matthew-5-16': '"You have been born to shine." — President Russell M. Nelson'
    },
    scholars: {
      'john-3-16': 'The Greek construction emphasizes the manner of God\'s love rather than simply the degree of His love.',
      'matthew-5-16': 'The metaphor of light was common in Jewish wisdom literature and represents divine truth.'
    }
  };

  // NT: NA28 English translations (New Testament)
  const na28Translations = {
    'john-3-16': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    'matthew-5-16': 'In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven.',
    'matthew-1-1': 'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.',
    'matthew-1-2': 'Abraham was the father of Isaac, and Isaac the father of Jacob, and Jacob the father of Judah and his brothers.'
  };

  // OT: BHS English translations (Old Testament)
  const bhsTranslations = {
    'genesis-1-1': 'In the beginning God created the heavens and the earth.',
    'genesis-1-2': 'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
    'genesis-1-3': 'And God said, "Let there be light," and there was light.',
    'genesis-2-1': 'Thus the heavens and the earth were completed in all their vast array.',
    'genesis-3-1': 'Now the serpent was more crafty than any other beast of the field that the Lord God had made.'
  };

  // NT: Key Greek words with Hebrew equivalents (New Testament)
  const keyGreekWords = {
    'john-3-16': [
      {
        greek: 'ἠγάπησεν',
        transliteration: 'ēgapēsen',
        english: 'loved',
        hebrew: 'אָהַב',
        hebrewTransliteration: 'ahav',
        definition: 'to love with divine love, agape love',
        strongs: 'G25'
      },
      {
        greek: 'κόσμον',
        transliteration: 'kosmon',
        english: 'world',
        hebrew: 'עוֹלָם',
        hebrewTransliteration: 'olam',
        definition: 'the world, universe, or age',
        strongs: 'G2889'
      },
      {
        greek: 'μονογενῆ',
        transliteration: 'monogenē',
        english: 'only begotten',
        hebrew: 'יָחִיד',
        hebrewTransliteration: 'yachid',
        definition: 'only, unique, one of a kind',
        strongs: 'G3439'
      },
      {
        greek: 'πιστεύων',
        transliteration: 'pisteuōn',
        english: 'believes',
        hebrew: 'הֶאֱמִין',
        hebrewTransliteration: 'he\'emin',
        definition: 'to believe, trust, have faith',
        strongs: 'G4100'
      },
      {
        greek: 'αἰώνιον',
        transliteration: 'aiōnion',
        english: 'eternal',
        hebrew: 'עוֹלָם',
        hebrewTransliteration: 'olam',
        definition: 'eternal, everlasting, age-lasting',
        strongs: 'G166'
      }
    ],
    'matthew-5-16': [
      {
        greek: 'λαμψάτω',
        transliteration: 'lampsatō',
        english: 'let shine',
        hebrew: 'יָאִיר',
        hebrewTransliteration: 'ya\'ir',
        definition: 'to shine, give light',
        strongs: 'G2989'
      },
      {
        greek: 'φῶς',
        transliteration: 'phōs',
        english: 'light',
        hebrew: 'אוֹר',
        hebrewTransliteration: 'or',
        definition: 'light, illumination',
        strongs: 'G5457'
      },
      {
        greek: 'ἔργα',
        transliteration: 'erga',
        english: 'works',
        hebrew: 'מַעֲשִׂים',
        hebrewTransliteration: 'ma\'asim',
        definition: 'works, deeds, actions',
        strongs: 'G2041'
      },
      {
        greek: 'δοξάσωσιν',
        transliteration: 'doxasōsin',
        english: 'glorify',
        hebrew: 'יְכַבְּדוּ',
        hebrewTransliteration: 'yechabbedu',
        definition: 'to glorify, honor, praise',
        strongs: 'G1392'
      }
    ]
  };

  // OT: Key Hebrew words with Greek equivalents (Old Testament)
  const keyHebrewWords = {
    'genesis-1-1': [
      {
        hebrew: 'בְּרֵאשִׁית',
        hebrewTransliteration: 'bereshit',
        english: 'in the beginning',
        greek: 'ἐν ἀρχῇ',
        greekTransliteration: 'en archē',
        definition: 'in the beginning, at the start',
        strongs: 'H7225'
      },
      {
        hebrew: 'בָּרָא',
        hebrewTransliteration: 'bara',
        english: 'created',
        greek: 'ἐποίησεν',
        greekTransliteration: 'epoiēsen',
        definition: 'to create, make, form',
        strongs: 'H1254'
      },
      {
        hebrew: 'אֱלֹהִים',
        hebrewTransliteration: 'elohim',
        english: 'God',
        greek: 'θεὸς',
        greekTransliteration: 'theos',
        definition: 'God, deity, divine being',
        strongs: 'H430'
      },
      {
        hebrew: 'שָׁמַיִם',
        hebrewTransliteration: 'shamayim',
        english: 'heavens',
        greek: 'οὐρανοὺς',
        greekTransliteration: 'ouranous',
        definition: 'heavens, sky, firmament',
        strongs: 'H8064'
      },
      {
        hebrew: 'וָאָרֶץ',
        hebrewTransliteration: 'va\'aretz',
        english: 'and the earth',
        greek: 'τὴν γῆν',
        greekTransliteration: 'tēn gēn',
        definition: 'the earth, land, ground',
        strongs: 'H776'
      }
    ],
    'genesis-1-3': [
      {
        hebrew: 'וַיֹּאמֶר',
        hebrewTransliteration: 'vayomer',
        english: 'and he said',
        greek: 'καὶ εἶπεν',
        greekTransliteration: 'kai eipen',
        definition: 'and he said, spoke',
        strongs: 'H559'
      },
      {
        hebrew: 'יְהִי',
        hebrewTransliteration: 'yehi',
        english: 'let there be',
        greek: 'γενηθήτω',
        greekTransliteration: 'genēthētō',
        definition: 'let there be, may it be',
        strongs: 'H1961'
      },
      {
        hebrew: 'אוֹר',
        hebrewTransliteration: 'or',
        english: 'light',
        greek: 'φῶς',
        greekTransliteration: 'phōs',
        definition: 'light, illumination',
        strongs: 'H216'
      }
    ]
  };

  const crossReferences = [
    { reference: 'Romans 5:8', description: 'God\'s love demonstrated' },
    { reference: '1 John 4:9', description: 'Only begotten Son' },
    { reference: 'Moses 1:39', description: 'God\'s work and glory' },
    { reference: '2 Nephi 26:24', description: 'God loves all' }
  ];

  const handleLoadVerse = () => {
    if (!currentBook) return;
    
    setLoading(true);
    setTimeout(() => {
      const verseData = currentChapterData?.verses.find(v => v.number === currentVerse?.verse);
      if (verseData) {
        setCurrentVerse({
          id: `${currentBook.id}${currentChapter}-${verseData.number}`,
          book: currentBook.name,
          chapter: currentChapter,
          verse: verseData.number,
          text: verseData.text,
          translation: 'KJV',
          greek: verseData.greek,
          hebrew: verseData.hebrew,
          strongs: verseData.strongs,
        });
      }
      setLoading(false);
    }, 500);
  };

  const handleVerseSelect = (verseNumber: number) => {
    if (!currentBook || !currentChapterData) return;
    
    const verseData = currentChapterData.verses.find(v => v.number === verseNumber);
    if (verseData) {
      setCurrentVerse({
        id: `${currentBook.id}${currentChapter}-${verseData.number}`,
        book: currentBook.name,
        chapter: currentChapter,
        verse: verseData.number,
        text: verseData.text,
        translation: 'KJV',
        greek: verseData.greek,
        hebrew: verseData.hebrew,
        strongs: verseData.strongs,
      });
    }
  };

  const getCurrentVerseKey = () => {
    if (!currentBook || !currentVerse) return '';
    return `${currentBook.id.toLowerCase()}-${currentChapter}-${currentVerse.verse}`;
  };

  const isOldTestament = () => {
    return currentBook?.testament === 'old';
  };

  const getTranslationText = () => {
    const verseKey = getCurrentVerseKey();
    if (isOldTestament()) {
      return (bhsTranslations as any)[verseKey] || 'Translation not available for this verse.';
    } else {
      return (na28Translations as any)[verseKey] || 'Translation not available for this verse.';
    }
  };

  const getWordStudyData = () => {
    const verseKey = getCurrentVerseKey();
    if (isOldTestament()) {
      return (keyHebrewWords as any)[verseKey] || [];
    } else {
      return (keyGreekWords as any)[verseKey] || [];
    }
  };

  const handleStudyTool = (tool: string) => {
    switch (tool) {
      case 'note':
        alert('Note feature would open a study journal');
        break;
      case 'bookmark':
        alert('Verse bookmarked! 🔖');
        break;
      case 'share':
        alert('Share link copied! 📤');
        break;
    }
  };

  useEffect(() => {
    if (currentBook && currentChapterData?.verses.length) {
      handleVerseSelect(currentChapterData.verses[0].number);
    }
  }, [currentBook, currentChapter]);

  return (
    <div className="min-h-screen bg-[#faf6f0] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <BookOpenIcon className="h-10 w-10 text-lds-600 dark:text-lds-400" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    📖 LDS Scripture Study
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Study with multiple authorities • Come Follow Me integrated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Book:</label>
              <select 
                value={currentBook?.id || ''}
                onChange={(e) => {
                  const book = books.find(b => b.id === e.target.value);
                  setCurrentBook(book || null);
                  setCurrentChapter(1);
                }}
                className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-lds-500 focus:ring-2 focus:ring-lds-200 dark:focus:ring-lds-800 transition-colors"
              >
                <option value="">Select Book</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>{book.name}</option>
                ))}
              </select>
            </div>

            {currentBook && (
              <>
                <div className="flex items-center space-x-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Chapter:</label>
                  <select 
                    value={currentChapter}
                    onChange={(e) => setCurrentChapter(Number(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-lds-500 focus:ring-2 focus:ring-lds-200 dark:focus:ring-lds-800 transition-colors"
                  >
                    {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Verse:</label>
                  <select 
                    value={currentVerse?.verse || ''}
                    onChange={(e) => handleVerseSelect(Number(e.target.value))}
                    className="px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-lds-500 focus:ring-2 focus:ring-lds-200 dark:focus:ring-lds-800 transition-colors"
                  >
                    {currentChapterData?.verses.map(v => (
                      <option key={v.number} value={v.number}>{v.number}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleLoadVerse}
                  className="px-4 py-2 bg-lds-600 hover:bg-lds-700 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
                >
                  <AcademicCapIcon className="h-4 w-4" />
                  <span>📍 Go to Verse</span>
                </button>
              </>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              <button 
                onClick={() => setShowJST(!showJST)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showJST 
                    ? 'bg-lds-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                JST
              </button>
              <button 
                onClick={() => setShowGreek(!showGreek)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showGreek 
                    ? 'bg-lds-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isOldTestament() ? 'Hebrew' : 'Greek'}
              </button>
              <button 
                onClick={() => setShowNA28(!showNA28)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showNA28 
                    ? 'bg-lds-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isOldTestament() ? 'BHS' : 'NA28'}
              </button>
              <button 
                onClick={() => setShowCFM(!showCFM)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showCFM 
                    ? 'bg-lds-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Come Follow Me
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Verse Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              {currentVerse ? (
                <>
                  {/* Verse Header */}
                  <div className="border-b-4 border-lds-500 pb-4 mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {currentVerse.book} {currentVerse.chapter}:{currentVerse.verse}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      LDS King James Version • Primary Authority
                    </div>
                  </div>

                  {/* Main Scripture Text */}
                  <div className="font-serif text-xl leading-relaxed text-gray-900 dark:text-white mb-6">
                    <span className="font-bold text-lds-600 dark:text-lds-400 mr-2">
                      {currentVerse.verse}
                    </span>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lds-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading verse...</span>
                      </div>
                    ) : (
                      currentVerse.text
                    )}
                  </div>

                  {/* JST Text */}
                  {showJST && (
                    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-lds-green-500 rounded-lg p-6 mb-6">
                      <span className="font-semibold text-lds-green-700 dark:text-lds-green-300 mb-3 block">
                        🔄 Joseph Smith Translation
                      </span>
                      <div className="text-gray-800 dark:text-gray-200">
                        {currentVerse.text}
                      </div>
                      <small className="text-gray-600 dark:text-gray-400 mt-2 block">
                        <strong>Note:</strong> No significant changes in the JST for this verse.
                      </small>
                    </div>
                  )}

                  {/* Original Language Text (Greek for NT, Hebrew for OT) */}
                  {showGreek && (currentVerse.greek || currentVerse.hebrew) && (
                    <div className={`${isOldTestament() ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'} border-l-4 rounded-lg p-6 mb-6`}>
                      <span className={`font-semibold mb-3 block ${isOldTestament() ? 'text-orange-700 dark:text-orange-300' : 'text-purple-700 dark:text-purple-300'}`}>
                        {isOldTestament() ? '📜 Hebrew (BHS)' : '🏛️ Greek (NA28)'}
                      </span>
                      
                      {/* Original Language Text */}
                      <div className={`text-xl mb-4 ${isOldTestament() ? 'font-hebrew text-right text-orange-800 dark:text-orange-200' : 'font-greek text-purple-800 dark:text-purple-200'}`}>
                        {isOldTestament() ? currentVerse.hebrew : currentVerse.greek}
                      </div>
                      
                      {/* Enhanced Word Study */}
                      <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                        <strong className="text-gray-900 dark:text-white mb-3 block">
                          🔍 Key {isOldTestament() ? 'Hebrew' : 'Greek'} Words with {isOldTestament() ? 'Greek' : 'Hebrew'} Equivalents:
                        </strong>
                        <div className="space-y-4">
                          {getWordStudyData().map((word: any, index: number) => (
                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-lg font-semibold ${isOldTestament() ? 'font-hebrew text-orange-600 dark:text-orange-400' : 'font-greek text-purple-600 dark:text-purple-400'}`}>
                                  {isOldTestament() ? word.hebrew : word.greek}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${isOldTestament() ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'}`}>
                                  {word.strongs}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {isOldTestament() ? 'Hebrew' : 'Greek'}: {isOldTestament() ? word.hebrewTransliteration : word.transliteration}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    English: {word.english}
                                  </div>
                                </div>
                                <div>
                                  <div className={`text-lg font-semibold mb-1 ${isOldTestament() ? 'font-greek text-purple-600 dark:text-purple-400' : 'font-hebrew text-orange-600 dark:text-orange-400'}`}>
                                    {isOldTestament() ? word.greek : word.hebrew}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400">
                                    {isOldTestament() ? 'Greek' : 'Hebrew'}: {isOldTestament() ? word.greekTransliteration : word.hebrewTransliteration}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                                <strong>Definition:</strong> {word.definition}
                              </div>
                            </div>
                          ))}
                          {getWordStudyData().length === 0 && (
                            <div className="text-gray-500 dark:text-gray-400 text-sm">
                              Word study not available for this verse.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scholarly English Translation (NA28 for NT, BHS for OT) */}
                  {showNA28 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
                      <span className="font-semibold text-blue-700 dark:text-blue-300 mb-3 block">
                        📖 {isOldTestament() ? 'BHS' : 'NA28'} English Translation
                      </span>
                      <div className="text-gray-800 dark:text-gray-200 italic text-lg leading-relaxed">
                        {getTranslationText()}
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Note:</strong> This is a scholarly English translation based on the {isOldTestament() ? 'Biblia Hebraica Stuttgartensia (BHS) Hebrew text' : 'Nestle-Aland 28th edition Greek text'}, 
                          providing a more literal rendering of the original {isOldTestament() ? 'Hebrew' : 'Greek'}.
                        </div>
                      </div>
                    </div>
                  )}


                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Select a book, chapter, and verse to begin studying
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Come Follow Me Panel */}
            {showCFM && (
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <CalendarIcon className="h-5 w-5" />
                  <h3 className="text-lg font-bold">📅 Come Follow Me</h3>
                </div>
                <div className="bg-white/20 rounded-lg p-3 mb-4 font-semibold">
                  Week 12: March 18-24
                </div>
                <div className="space-y-3">
                  <p><strong>"For God So Loved the World"</strong></p>
                  <p className="text-blue-100">
                    This week we explore God's infinite love and the gift of His Son. Consider how John 3:16 demonstrates both divine justice and mercy.
                  </p>
                  <div className="mt-4">
                    <strong>Discussion Questions:</strong>
                    <ul className="mt-2 ml-4 space-y-1 text-blue-100">
                      <li>• What does "so loved" teach us about God's love?</li>
                      <li>• How does belief lead to eternal life?</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Commentary Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-lds-600 dark:text-lds-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">💬 Commentary</h3>
              </div>
              
              <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {(['talmage', 'prophets', 'scholars'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveCommentary(type)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      activeCommentary === type
                        ? 'bg-lds-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="italic text-gray-800 dark:text-gray-200 mb-3 border-l-4 border-lds-500 pl-4">
                  {(commentaries[activeCommentary] as any)[getCurrentVerseKey()] || 
                   'Commentary not available for this verse.'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>— {activeCommentary === 'talmage' ? 'James E. Talmage, Jesus the Christ' : 
                              activeCommentary === 'prophets' ? 'Modern Prophets' : 'Biblical Scholars'}</strong>
                </p>
              </div>
            </div>

            {/* Cross References */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <LinkIcon className="h-5 w-5 text-lds-600 dark:text-lds-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">🔗 Cross References</h3>
              </div>
              
              <div className="space-y-2">
                {crossReferences.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-semibold text-lds-600 dark:text-lds-400 mr-3">
                      {ref.reference}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {ref.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Tools */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <WrenchScrewdriverIcon className="h-5 w-5 text-lds-600 dark:text-lds-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">🛠️ Study Tools</h3>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => handleStudyTool('note')}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">📝 Add Note</span>
                </button>
                <button
                  onClick={() => handleStudyTool('bookmark')}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <BookmarkIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">🔖 Bookmark</span>
                </button>
                <button
                  onClick={() => handleStudyTool('share')}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <ShareIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">📤 Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapter Verses List */}
        {currentBook && currentChapterData && !currentVerse && (
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Chapter {currentChapter} Verses
              </h3>
              <div className="grid gap-3">
                {currentChapterData.verses.map((verse) => (
                  <div
                    key={verse.number}
                    onClick={() => handleVerseSelect(verse.number)}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {currentBook.name} {currentChapter}:{verse.number}
                    </h4>
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
          </div>
        )}
      </div>
    </div>
  );
} 