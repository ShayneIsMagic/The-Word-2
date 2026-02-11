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
import {
  useScripture,
  ALL_BIBLE_BOOKS,
  AVAILABLE_TRANSLATIONS,
  APOCRYPHA_BOOKS,
  APOCRYPHA_TRANSLATIONS,
  GREEK_TEXT_TRADITIONS,
  type BibleBook,
  type ApocryphaBook,
  type DSSBook,
  type TranslationKey,
  type ApocryphaTranslationKey,
  type GreekTextTradition,
} from '@/context/ScriptureContext';
import { ThemeToggle } from '@/components/ThemeProvider';

// ============================================================================
// Translation Categories
// ============================================================================

const PRIMARY_TRANSLATIONS: TranslationKey[] = ['kjv', 'esv', 'net', 'leb', 'geneva', 'jubilee'];
const KJV_FAMILY: TranslationKey[] = ['mkjv', 'kjvpce', 'akjv'];
const LITERAL_TRANSLATIONS: TranslationKey[] = ['litv', 'ylt', 'asv', 'darby'];
const OTHER_TRANSLATIONS: TranslationKey[] = ['bsb', 'jps', 'drc', 'webster', 'bbe', 'nheb'];
const NON_ENGLISH_TRANSLATIONS: TranslationKey[] = ['french-lxx', 'german-na28'];

// ============================================================================
// Hebrew/Greek Pronunciation Data (expanded with cross-translation comparisons)
// ============================================================================

interface WordData {
  transliteration: string;
  pronunciation: string;
  meaning: string;
  strongs?: string;
  translations?: Record<string, string>; // { KJV: '...', ESV: '...', NET: '...' }
}

const HEBREW_PRONUNCIATION: Record<string, WordData> = {
  // ── Genesis Key Words ──
  'בְּרֵאשִׁית': { transliteration: 'bereshit', pronunciation: 'beh-ray-SHEET', meaning: 'In the beginning', strongs: 'H7225', translations: { KJV: 'In the beginning', ESV: 'In the beginning', NET: 'In the beginning', LEB: 'In the beginning', YLT: 'In the beginning' } },
  'בָּרָא': { transliteration: 'bara', pronunciation: 'bah-RAH', meaning: 'created (ex nihilo)', strongs: 'H1254', translations: { KJV: 'created', ESV: 'created', NET: 'created', LEB: 'created', LITV: 'created' } },
  'אֱלֹהִים': { transliteration: 'elohim', pronunciation: 'eh-loh-HEEM', meaning: 'God (plural of majesty)', strongs: 'H430', translations: { KJV: 'God', ESV: 'God', NET: 'God', JPS: 'G-d', Geneva: 'God' } },
  'הַשָּׁמַיִם': { transliteration: 'hashamayim', pronunciation: 'hah-shah-MY-eem', meaning: 'the heavens', strongs: 'H8064', translations: { KJV: 'the heaven', ESV: 'the heavens', NET: 'the sky', LEB: 'the heavens', BSB: 'the heavens' } },
  'הָאָרֶץ': { transliteration: "ha'aretz", pronunciation: 'hah-AH-retz', meaning: 'the earth/land', strongs: 'H776', translations: { KJV: 'the earth', ESV: 'the earth', NET: 'the earth', LEB: 'the earth', JPS: 'the earth' } },
  'וְאֵת': { transliteration: "ve'et", pronunciation: 'veh-ETT', meaning: 'and (direct object marker)', strongs: 'H853' },
  'תֹהוּ': { transliteration: 'tohu', pronunciation: 'TOH-hoo', meaning: 'formless, void, chaos', strongs: 'H8414', translations: { KJV: 'without form', ESV: 'without form', NET: 'without shape', LEB: 'formless', LITV: 'without form' } },
  'וָבֹהוּ': { transliteration: 'vavohu', pronunciation: 'vah-VOH-hoo', meaning: 'and void, emptiness', strongs: 'H922', translations: { KJV: 'and void', ESV: 'and void', NET: 'and empty', LEB: 'and void', LITV: 'and entering' } },
  'רוּחַ': { transliteration: 'ruach', pronunciation: 'ROO-akh', meaning: 'Spirit, wind, breath', strongs: 'H7307', translations: { KJV: 'Spirit', ESV: 'Spirit', NET: 'Spirit', LEB: 'spirit', BSB: 'Spirit' } },
  'אוֹר': { transliteration: 'or', pronunciation: 'OHR', meaning: 'light', strongs: 'H216', translations: { KJV: 'light', ESV: 'light', NET: 'light', LEB: 'light', Geneva: 'light' } },
  // ── Divine Names & Titles ──
  'יְהוָה': { transliteration: 'YHWH/Yahweh', pronunciation: 'yah-WEH', meaning: 'LORD (the Eternal One)', strongs: 'H3068', translations: { KJV: 'LORD', ESV: 'LORD', NET: 'LORD', JPS: 'HaShem', LEB: 'Yahweh' } },
  'אֲדֹנָי': { transliteration: 'Adonai', pronunciation: 'ah-doh-NYE', meaning: 'Lord, Master, Sovereign', strongs: 'H136', translations: { KJV: 'Lord', ESV: 'Lord', NET: 'Lord', JPS: 'Lord', LEB: 'Lord' } },
  'אֵל': { transliteration: 'El', pronunciation: 'ELL', meaning: 'God (mighty one)', strongs: 'H410', translations: { KJV: 'God', ESV: 'God', NET: 'God', LEB: 'God', YLT: 'God' } },
  'שַׁדַּי': { transliteration: 'Shaddai', pronunciation: 'shah-DYE', meaning: 'Almighty, All-Sufficient', strongs: 'H7706', translations: { KJV: 'Almighty', ESV: 'Almighty', NET: 'Sovereign', LEB: 'Almighty', BSB: 'Almighty' } },
  // ── People & Patriarchs ──
  'אָדָם': { transliteration: 'adam', pronunciation: 'ah-DAHM', meaning: 'man, mankind, Adam', strongs: 'H120', translations: { KJV: 'man/Adam', ESV: 'man/Adam', NET: 'man/Adam', LEB: 'human', JPS: 'man' } },
  'חַוָּה': { transliteration: 'chavvah', pronunciation: 'khah-VAH', meaning: 'Eve (life-giver)', strongs: 'H2332', translations: { KJV: 'Eve', ESV: 'Eve', NET: 'Eve', LEB: 'Eve', JPS: 'Eve' } },
  'אַבְרָהָם': { transliteration: 'Avraham', pronunciation: 'ahv-rah-HAHM', meaning: 'Abraham (father of multitudes)', strongs: 'H85' },
  'יִשְׂרָאֵל': { transliteration: 'Yisrael', pronunciation: 'yis-rah-EL', meaning: 'Israel (wrestles with God)', strongs: 'H3478' },
  'מֹשֶׁה': { transliteration: 'Moshe', pronunciation: 'moh-SHEH', meaning: 'Moses (drawn out)', strongs: 'H4872' },
  'דָּוִד': { transliteration: 'David', pronunciation: 'dah-VEED', meaning: 'David (beloved)', strongs: 'H1732' },
  // ── Core Theological Terms ──
  'תּוֹרָה': { transliteration: 'torah', pronunciation: 'toh-RAH', meaning: 'law, instruction, teaching', strongs: 'H8451', translations: { KJV: 'law', ESV: 'law', NET: 'law', LEB: 'law', JPS: 'Torah' } },
  'שָׁלוֹם': { transliteration: 'shalom', pronunciation: 'shah-LOHM', meaning: 'peace, wholeness, well-being', strongs: 'H7965', translations: { KJV: 'peace', ESV: 'peace', NET: 'peace', LEB: 'peace', JPS: 'peace' } },
  'חֶסֶד': { transliteration: 'chesed', pronunciation: 'KHEH-sed', meaning: 'steadfast love, mercy, lovingkindness', strongs: 'H2617', translations: { KJV: 'mercy', ESV: 'steadfast love', NET: 'loyal love', LEB: 'loyal love', JPS: 'lovingkindness' } },
  'אֱמֶת': { transliteration: 'emet', pronunciation: 'eh-METT', meaning: 'truth, faithfulness', strongs: 'H571', translations: { KJV: 'truth', ESV: 'faithfulness', NET: 'faithfulness', LEB: 'truth', JPS: 'truth' } },
  'צֶדֶק': { transliteration: 'tsedeq', pronunciation: 'TSEH-dek', meaning: 'righteousness, justice', strongs: 'H6664', translations: { KJV: 'righteousness', ESV: 'righteousness', NET: 'justice', LEB: 'righteousness', JPS: 'righteousness' } },
  'מִשְׁפָּט': { transliteration: 'mishpat', pronunciation: 'mish-PAHT', meaning: 'justice, judgment, ordinance', strongs: 'H4941', translations: { KJV: 'judgment', ESV: 'justice', NET: 'justice', LEB: 'justice', JPS: 'justice' } },
  'בְּרִית': { transliteration: 'berit', pronunciation: 'beh-REET', meaning: 'covenant, treaty', strongs: 'H1285', translations: { KJV: 'covenant', ESV: 'covenant', NET: 'covenant', LEB: 'covenant', JPS: 'covenant' } },
  'כָּבוֹד': { transliteration: 'kavod', pronunciation: 'kah-VOHD', meaning: 'glory, honor, weight', strongs: 'H3519', translations: { KJV: 'glory', ESV: 'glory', NET: 'glory', LEB: 'glory', JPS: 'glory' } },
  'נֶפֶשׁ': { transliteration: 'nephesh', pronunciation: 'NEH-fesh', meaning: 'soul, life, being', strongs: 'H5315', translations: { KJV: 'soul', ESV: 'soul', NET: 'life', LEB: 'soul', BSB: 'soul' } },
  'לֵב': { transliteration: 'lev', pronunciation: 'LEHV', meaning: 'heart, mind, inner being', strongs: 'H3820', translations: { KJV: 'heart', ESV: 'heart', NET: 'heart', LEB: 'heart', JPS: 'heart' } },
  'קָדוֹשׁ': { transliteration: 'qadosh', pronunciation: 'kah-DOHSH', meaning: 'holy, set apart, sacred', strongs: 'H6918', translations: { KJV: 'holy', ESV: 'holy', NET: 'holy', LEB: 'holy', JPS: 'holy' } },
  'גָּאַל': { transliteration: 'gaal', pronunciation: 'gah-AHL', meaning: 'to redeem, act as kinsman', strongs: 'H1350', translations: { KJV: 'redeem', ESV: 'redeem', NET: 'redeem', LEB: 'redeem', JPS: 'redeem' } },
  'יָשַׁע': { transliteration: 'yasha', pronunciation: 'yah-SHAH', meaning: 'to save, deliver', strongs: 'H3467', translations: { KJV: 'save', ESV: 'save', NET: 'deliver', LEB: 'save', JPS: 'save' } },
  'מָשִׁיחַ': { transliteration: 'mashiach', pronunciation: 'mah-SHEE-akh', meaning: 'anointed one, Messiah', strongs: 'H4899', translations: { KJV: 'anointed', ESV: 'anointed', NET: 'anointed one', LEB: 'anointed one', JPS: 'anointed' } },
  'נָבִיא': { transliteration: 'navi', pronunciation: 'nah-VEE', meaning: 'prophet, spokesperson', strongs: 'H5030', translations: { KJV: 'prophet', ESV: 'prophet', NET: 'prophet', LEB: 'prophet', JPS: 'prophet' } },
  // ── Psalms Common Words ──
  'הַלְלוּיָהּ': { transliteration: 'halleluyah', pronunciation: 'hah-leh-loo-YAH', meaning: 'Praise the LORD!', strongs: 'H1984+H3050' },
  'סֶלָה': { transliteration: 'selah', pronunciation: 'SEH-lah', meaning: 'pause, reflect (musical term)', strongs: 'H5542' },
  'מִזְמוֹר': { transliteration: 'mizmor', pronunciation: 'miz-MOHR', meaning: 'psalm, song (with instruments)', strongs: 'H4210' },
  'תְּהִלָּה': { transliteration: 'tehillah', pronunciation: 'teh-hil-LAH', meaning: 'praise, song of praise', strongs: 'H8416' },
};

const GREEK_PRONUNCIATION: Record<string, WordData> = {
  // ── Core Gospel Words ──
  'λόγος': { transliteration: 'logos', pronunciation: 'LOH-goss', meaning: 'Word, Reason, divine expression', strongs: 'G3056', translations: { KJV: 'Word', ESV: 'Word', NET: 'Word', LEB: 'Word', BSB: 'Word' } },
  'θεός': { transliteration: 'theos', pronunciation: 'theh-OSS', meaning: 'God', strongs: 'G2316', translations: { KJV: 'God', ESV: 'God', NET: 'God', LEB: 'God', BSB: 'God' } },
  'Ἰησοῦς': { transliteration: 'Iesous', pronunciation: 'ee-ay-SOOS', meaning: 'Jesus (Yahweh saves)', strongs: 'G2424' },
  'Χριστός': { transliteration: 'Christos', pronunciation: 'khris-TOSS', meaning: 'Christ, Anointed One, Messiah', strongs: 'G5547', translations: { KJV: 'Christ', ESV: 'Christ', NET: 'Christ', LEB: 'Christ', BSB: 'Christ' } },
  'κύριος': { transliteration: 'kyrios', pronunciation: 'KOO-ree-oss', meaning: 'Lord, Master, Owner', strongs: 'G2962', translations: { KJV: 'Lord', ESV: 'Lord', NET: 'Lord', LEB: 'Lord', BSB: 'Lord' } },
  // ── Salvation & Faith ──
  'ἀγάπη': { transliteration: 'agape', pronunciation: 'ah-GAH-pay', meaning: 'love (divine, unconditional)', strongs: 'G26', translations: { KJV: 'love/charity', ESV: 'love', NET: 'love', LEB: 'love', BSB: 'love' } },
  'πίστις': { transliteration: 'pistis', pronunciation: 'PEES-tis', meaning: 'faith, trust, belief', strongs: 'G4102', translations: { KJV: 'faith', ESV: 'faith', NET: 'faith', LEB: 'faith', BSB: 'faith' } },
  'χάρις': { transliteration: 'charis', pronunciation: 'KHAH-ris', meaning: 'grace, favor, gift', strongs: 'G5485', translations: { KJV: 'grace', ESV: 'grace', NET: 'grace', LEB: 'grace', BSB: 'grace' } },
  'σωτηρία': { transliteration: 'soteria', pronunciation: 'soh-tay-REE-ah', meaning: 'salvation, deliverance', strongs: 'G4991', translations: { KJV: 'salvation', ESV: 'salvation', NET: 'salvation', LEB: 'salvation', BSB: 'salvation' } },
  'μετάνοια': { transliteration: 'metanoia', pronunciation: 'meh-TAH-noy-ah', meaning: 'repentance, change of mind', strongs: 'G3341', translations: { KJV: 'repentance', ESV: 'repentance', NET: 'repentance', LEB: 'repentance', BSB: 'repentance' } },
  'δικαιοσύνη': { transliteration: 'dikaiosyne', pronunciation: 'dih-kai-oh-SOO-nay', meaning: 'righteousness, justice', strongs: 'G1343', translations: { KJV: 'righteousness', ESV: 'righteousness', NET: 'righteousness', LEB: 'righteousness', BSB: 'righteousness' } },
  'ἁμαρτία': { transliteration: 'hamartia', pronunciation: 'hah-mar-TEE-ah', meaning: 'sin (missing the mark)', strongs: 'G266', translations: { KJV: 'sin', ESV: 'sin', NET: 'sin', LEB: 'sin', BSB: 'sin' } },
  // ── Holy Spirit & Church ──
  'πνεῦμα': { transliteration: 'pneuma', pronunciation: 'PNYOO-mah', meaning: 'Spirit, spirit, breath, wind', strongs: 'G4151', translations: { KJV: 'Spirit/Ghost', ESV: 'Spirit', NET: 'Spirit', LEB: 'Spirit', BSB: 'Spirit' } },
  'ἐκκλησία': { transliteration: 'ekklesia', pronunciation: 'ek-klay-SEE-ah', meaning: 'church, assembly, congregation', strongs: 'G1577', translations: { KJV: 'church', ESV: 'church', NET: 'church', LEB: 'church/assembly', BSB: 'church' } },
  'βαπτίζω': { transliteration: 'baptizo', pronunciation: 'bap-TID-zoh', meaning: 'to baptize, immerse, wash', strongs: 'G907', translations: { KJV: 'baptize', ESV: 'baptize', NET: 'baptize', LEB: 'baptize', BSB: 'baptize' } },
  // ── Key NT Concepts ──
  'εὐαγγέλιον': { transliteration: 'euangelion', pronunciation: 'yoo-ang-GEH-lee-on', meaning: 'gospel, good news', strongs: 'G2098', translations: { KJV: 'gospel', ESV: 'gospel', NET: 'gospel', LEB: 'good news', BSB: 'gospel' } },
  'βασιλεία': { transliteration: 'basileia', pronunciation: 'bah-sih-LAY-ah', meaning: 'kingdom, reign, rule', strongs: 'G932', translations: { KJV: 'kingdom', ESV: 'kingdom', NET: 'kingdom', LEB: 'kingdom', BSB: 'kingdom' } },
  'ζωή': { transliteration: 'zoe', pronunciation: 'dzoh-AY', meaning: 'life (especially eternal life)', strongs: 'G2222', translations: { KJV: 'life', ESV: 'life', NET: 'life', LEB: 'life', BSB: 'life' } },
  'ἀλήθεια': { transliteration: 'aletheia', pronunciation: 'ah-LAY-thay-ah', meaning: 'truth, reality', strongs: 'G225', translations: { KJV: 'truth', ESV: 'truth', NET: 'truth', LEB: 'truth', BSB: 'truth' } },
  'δόξα': { transliteration: 'doxa', pronunciation: 'DOK-sah', meaning: 'glory, honor, splendor', strongs: 'G1391', translations: { KJV: 'glory', ESV: 'glory', NET: 'glory', LEB: 'glory', BSB: 'glory' } },
  'ἔργον': { transliteration: 'ergon', pronunciation: 'EHR-gon', meaning: 'work, deed, action', strongs: 'G2041', translations: { KJV: 'work', ESV: 'work', NET: 'work', LEB: 'work', BSB: 'work' } },
  'ἁγιος': { transliteration: 'hagios', pronunciation: 'HAH-gee-oss', meaning: 'holy, sacred, set apart', strongs: 'G40', translations: { KJV: 'holy/saint', ESV: 'holy/saint', NET: 'holy', LEB: 'holy', BSB: 'holy' } },
  'ἐλπίς': { transliteration: 'elpis', pronunciation: 'el-PEES', meaning: 'hope, expectation', strongs: 'G1680', translations: { KJV: 'hope', ESV: 'hope', NET: 'hope', LEB: 'hope', BSB: 'hope' } },
  'εἰρήνη': { transliteration: 'eirene', pronunciation: 'ay-RAY-nay', meaning: 'peace (Heb. shalom)', strongs: 'G1515', translations: { KJV: 'peace', ESV: 'peace', NET: 'peace', LEB: 'peace', BSB: 'peace' } },
  'παράκλητος': { transliteration: 'parakletos', pronunciation: 'pah-RAH-klay-toss', meaning: 'Comforter, Advocate, Helper', strongs: 'G3875', translations: { KJV: 'Comforter', ESV: 'Helper', NET: 'Advocate', LEB: 'Advocate', BSB: 'Advocate' } },
};

// ============================================================================
// Component
// ============================================================================

export default function ScriptureReader() {
  const scripture = useScripture();

  // Navigation State
  const [selectedTestament, setSelectedTestament] = useState<'OT' | 'NT' | 'DC' | 'DSS'>('OT');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedDSSBook, setSelectedDSSBook] = useState<DSSBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<'books' | 'tools'>('books');

  // Translation State
  const [primaryTranslation, setPrimaryTranslation] = useState<TranslationKey>('kjv');
  const [showParallel, setShowParallel] = useState(true);
  const [parallelTranslation, setParallelTranslation] = useState<TranslationKey>('esv');

  // Apocrypha Translation State
  const [apocryphaTranslation, setApocryphaTranslation] = useState<ApocryphaTranslationKey>('kjv-apoc');

  // Tools State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showPronunciation, setShowPronunciation] = useState(true);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we're viewing Apocrypha or DSS
  const isApocrypha = selectedTestament === 'DC';
  const isDSS = selectedTestament === 'DSS';

  // Get books by testament
  const filteredBooks = selectedTestament === 'DC'
    ? scripture.getApocryphaBooks()
    : selectedTestament === 'DSS'
      ? [] // DSS uses its own book list
      : scripture.getBooksByTestament(selectedTestament as 'OT' | 'NT');

  // Get DSS books (separate list)
  const dssBooks = scripture.getDSSBooks();

  // Get chapter verses (canonical or apocrypha)
  const chapterVerses = selectedBook && !isApocrypha && !isDSS
    ? scripture.getChapterVerses(selectedBook.name, selectedChapter, primaryTranslation)
    : [];

  // Get Apocrypha verses if applicable
  const apocryphaVerses = isApocrypha && selectedBook
    ? scripture.getApocryphaChapterVerses(selectedBook.id, selectedChapter, apocryphaTranslation)
    : [];

  // Get LXX Greek for the Apocrypha book (original language)
  const apocryphaGreekVerses = isApocrypha && selectedBook
    ? scripture.getApocryphaChapterVerses(selectedBook.id, selectedChapter, 'lxx-greek')
    : [];

  // Get DSS verses if applicable
  const dssVerses = isDSS && selectedDSSBook
    ? scripture.getDSSChapterVerses(selectedDSSBook.id, selectedChapter)
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

  // Get pronunciation data — tries exact match first, then partial match
  const getPronunciationData = (word: string, testament: 'OT' | 'NT'): WordData | null => {
    const dict = testament === 'OT' ? HEBREW_PRONUNCIATION : GREEK_PRONUNCIATION;
    // Exact match
    if (dict[word]) return dict[word];
    // Partial match: the original text word may have cantillation marks stripped, or vice versa
    const stripped = word.replace(/[\u0591-\u05C7]/g, ''); // strip Hebrew accents/cantillation
    for (const [key, data] of Object.entries(dict)) {
      const keyStripped = key.replace(/[\u0591-\u05C7]/g, '');
      if (keyStripped === stripped || key.includes(word) || word.includes(key)) {
        return data;
      }
    }
    return null;
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
                OT (39)
              </button>
              {scripture.showApocrypha && (
                <button
                  onClick={() => setSelectedTestament('DC')}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    selectedTestament === 'DC'
                      ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-b-2 border-amber-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  DC ({APOCRYPHA_BOOKS.length})
                </button>
              )}
              <button
                onClick={() => setSelectedTestament('NT')}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  selectedTestament === 'NT'
                    ? 'bg-[#e8f4fc] dark:bg-blue-900/30 text-[#00457c] dark:text-blue-300 border-b-2 border-[#00457c]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                NT (27)
              </button>
              {scripture.showDSS && (
                <button
                  onClick={() => setSelectedTestament('DSS')}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    selectedTestament === 'DSS'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-b-2 border-emerald-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  DSS
                </button>
              )}
            </div>

            {/* Book List */}
            <div className="flex-1 overflow-y-auto">
              {/* Category grouping for Apocrypha */}
              {selectedTestament === 'DC' && (() => {
                const categories = [...new Set((filteredBooks as ApocryphaBook[]).map(b => b.category))];
                return categories.map(cat => (
                  <div key={cat}>
                    <div className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider border-b border-amber-200 dark:border-amber-700">
                      {cat}
                    </div>
                    {(filteredBooks as ApocryphaBook[]).filter(b => b.category === cat).map((book) => (
                      <div key={book.id} className="border-b border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => { setSelectedBook(book); setSelectedChapter(1); }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors text-sm ${
                            selectedBook?.id === book.id
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-semibold'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div>
                            <span>{book.name}</span>
                            <span className="ml-2 text-[10px] text-gray-400 dark:text-gray-500 uppercase">
                              {book.originalLanguage}
                            </span>
                          </div>
                          <ChevronRightIcon className="h-3 w-3 text-gray-400" />
                        </button>
                        {selectedBook?.id === book.id && (
                          <>
                            {/* Academic metadata */}
                            <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-900/10 text-xs space-y-1 border-b border-amber-100 dark:border-amber-800">
                              <p className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Orig:</span> {book.originalLanguageNote}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Date:</span> {book.dateComposed}
                              </p>
                              {book.dssFragments.length > 0 && (
                                <p className="text-green-600 dark:text-green-400">
                                  📜 DSS: {book.dssFragments.join(', ')}
                                </p>
                              )}
                            </div>
                            {/* Chapter Grid */}
                            <div className="px-3 pb-3 grid grid-cols-6 gap-1 bg-gray-50 dark:bg-gray-800">
                              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((ch) => (
                                <button
                                  key={ch}
                                  onClick={() => setSelectedChapter(ch)}
                                  className={`w-full h-7 text-xs rounded transition-colors ${
                                    selectedChapter === ch
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  {ch}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ));
              })()}

              {/* DSS Book List */}
              {selectedTestament === 'DSS' && (() => {
                const categories = [...new Set(dssBooks.map(b => b.category))];
                return categories.map(cat => (
                  <div key={cat}>
                    <div className="px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider border-b border-emerald-200 dark:border-emerald-700">
                      {cat}
                    </div>
                    {dssBooks.filter(b => b.category === cat).map((book) => (
                      <div key={book.id} className="border-b border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => { setSelectedDSSBook(book); setSelectedBook(null); setSelectedChapter(1); }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors text-sm ${
                            selectedDSSBook?.id === book.id
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="block truncate">{book.name}</span>
                            <span className="block text-[10px] text-gray-400 dark:text-gray-500">
                              {book.abbreviation} • {book.original_language}
                              {book.total_verses > 0 ? ` • ${book.total_verses} verses` : ' • metadata'}
                            </span>
                          </div>
                          {book.total_verses > 0 ? (
                            <ChevronRightIcon className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded flex-shrink-0">INFO</span>
                          )}
                        </button>
                        {selectedDSSBook?.id === book.id && (
                          <>
                            {/* DSS Academic metadata */}
                            <div className="px-4 py-2 bg-emerald-50/50 dark:bg-emerald-900/10 text-xs space-y-1 border-b border-emerald-100 dark:border-emerald-800">
                              <p className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Date:</span> {book.date_composed}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Qumran:</span> {book.qumran_refs}
                              </p>
                              {book.translation && (
                                <p className="text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">Trans:</span> {book.translation}
                                </p>
                              )}
                              {book.text_status === 'metadata_only' && (
                                <p className="text-orange-500 dark:text-orange-400 text-[10px]">
                                  ⚠️ Full text under copyright — summaries &amp; links provided
                                </p>
                              )}
                            </div>
                            {/* Chapter Grid (only for books with content) */}
                            {book.total_verses > 0 && (
                              <div className="px-3 pb-3 grid grid-cols-8 gap-1 bg-gray-50 dark:bg-gray-800">
                                {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => (
                                  <button
                                    key={ch}
                                    onClick={() => setSelectedChapter(ch)}
                                    className={`w-full h-7 text-xs rounded transition-colors ${
                                      selectedChapter === ch
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {ch}
                                  </button>
                                ))}
                              </div>
                            )}
                            {/* External links */}
                            {book.external_links && book.external_links.length > 0 && (
                              <div className="px-4 pb-2 space-y-1">
                                {book.external_links.map((link, i) => (
                                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                                    className="block text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                                    🔗 {link.label}
                                  </a>
                                ))}
                              </div>
                            )}
                            {/* Sections info */}
                            {book.sections && book.sections.length > 0 && (
                              <div className="px-4 pb-3">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Sections:</p>
                                <div className="space-y-0.5">
                                  {book.sections.map((sec, i) => (
                                    <div key={i} className="text-xs text-gray-600 dark:text-gray-400">
                                      <span className="font-medium">{sec.name}</span>
                                      {sec.chapters && <span className="text-gray-400"> (Ch. {sec.chapters})</span>}
                                      {sec.description && <span className="text-gray-400"> — {sec.description}</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ));
              })()}

              {/* Standard book list for OT/NT */}
              {selectedTestament !== 'DC' && selectedTestament !== 'DSS' && filteredBooks.map((book) => (
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
                    <optgroup label="🌍 Non-English">
                      {NON_ENGLISH_TRANSLATIONS.map(key => {
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
                      <optgroup label="🌍 Non-English">
                        {NON_ENGLISH_TRANSLATIONS.map(key => {
                          const info = getTranslationInfo(key);
                          return info ? <option key={key} value={key}>{info.abbr} - {info.name}</option> : null;
                        })}
                      </optgroup>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Apocrypha / Deuterocanonical Toggle */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2 flex items-center space-x-2">
                <span className="text-lg">📜</span>
                <span>Deuterocanonical / Apocrypha</span>
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                Show Apocrypha, Pseudepigrapha, and additional books between OT &amp; NT
              </p>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Show Apocrypha</label>
                <button
                  onClick={() => scripture.setShowApocrypha(!scripture.showApocrypha)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    scripture.showApocrypha ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    scripture.showApocrypha ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {scripture.showApocrypha && scripture.apocryphaLoading && (
                <p className="text-xs text-amber-500 mt-2 animate-pulse">Loading Apocrypha data...</p>
              )}
              {scripture.showApocrypha && scripture.apocryphaLoaded && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  ✅ {APOCRYPHA_BOOKS.length} books loaded • {APOCRYPHA_TRANSLATIONS.length} translations
                </p>
              )}

              {/* Apocrypha Translation Picker (only when viewing DC books) */}
              {isApocrypha && scripture.showApocrypha && (
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                  <label className="text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">Apocrypha Translation</label>
                  <select
                    value={apocryphaTranslation}
                    onChange={(e) => setApocryphaTranslation(e.target.value as ApocryphaTranslationKey)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-amber-500"
                  >
                    {APOCRYPHA_TRANSLATIONS.filter(t => t.language === 'english').map(t => (
                      <option key={t.key} value={t.key}>{t.abbr} — {t.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dead Sea Scrolls Toggle */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center space-x-2">
                <span className="text-lg">🏺</span>
                <span>Dead Sea Scrolls</span>
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">
                Ancient manuscripts from Qumran (1947–1956). Includes 1 Enoch, Jubilees, and sectarian scrolls.
              </p>
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 dark:text-gray-300">Show DSS</label>
                <button
                  onClick={() => scripture.setShowDSS(!scripture.showDSS)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    scripture.showDSS ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    scripture.showDSS ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              {scripture.showDSS && scripture.dssLoading && (
                <p className="text-xs text-emerald-500 mt-2 animate-pulse">Loading DSS data...</p>
              )}
              {scripture.showDSS && scripture.dssLoaded && (() => {
                const coll = scripture.getDSSCollection();
                return coll ? (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    ✅ {coll.info.books_with_full_text} texts with content • {coll.info.books_with_metadata_only} metadata-only • {coll.info.total_verses} verses
                  </p>
                ) : null;
              })()}
            </div>

            {/* Pronunciation Tool */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-[#00457c] dark:text-blue-300 mb-3 flex items-center space-x-2">
                <SpeakerWaveIcon className="h-4 w-4" />
                <span>{selectedBook?.testament === 'OT' ? 'Hebrew' : selectedBook?.testament === 'DC' ? 'Original Language' : 'Greek'} Tools</span>
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

              {/* Greek Text Tradition Selector (NT only) */}
              {selectedBook?.testament === 'NT' && (
                <div className="mb-3">
                  <label className="text-sm text-gray-700 dark:text-gray-300 mb-1 block">Greek Text Tradition</label>
                  <select
                    value={scripture.greekTextTradition}
                    onChange={(e) => scripture.setGreekTextTradition(e.target.value as GreekTextTradition)}
                    className="w-full text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-3 py-1.5 text-gray-800 dark:text-gray-200"
                  >
                    {GREEK_TEXT_TRADITIONS.map(t => (
                      <option key={t.key} value={t.key}>{t.abbr} — {t.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {GREEK_TEXT_TRADITIONS.find(t => t.key === scripture.greekTextTradition)?.description}
                  </p>
                </div>
              )}

              {/* Selected Word Display */}
              {selectedWord && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-[#00457c]/30">
                  <p className={`text-2xl mb-2 ${selectedBook?.testament === 'OT' ? 'font-hebrew text-right' : 'font-greek'} dark:text-gray-100`}>
                    {selectedWord}
                  </p>
                  {(() => {
                    const pronData = getPronunciationData(selectedWord, selectedBook?.testament || 'OT');
                    if (!pronData) return <p className="text-xs text-gray-500">No data for this word yet. Click a highlighted word.</p>;
                    return (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono font-bold text-[#00457c] dark:text-blue-300">{pronData.transliteration}</span>
                          {pronData.strongs && (
                            <span className="text-[10px] bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-300">{pronData.strongs}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">/{pronData.pronunciation}/</p>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{pronData.meaning}</p>
                        {/* Cross-translation comparison */}
                        {pronData.translations && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Translated As:</p>
                            <div className="space-y-0.5">
                              {Object.entries(pronData.translations).map(([abbr, text]) => (
                                <div key={abbr} className="flex justify-between text-xs">
                                  <span className="font-semibold text-[#00457c] dark:text-blue-300 w-12">{abbr}</span>
                                  <span className="text-gray-600 dark:text-gray-300 text-right flex-1">{text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Quick Reference - Scrollable list of key words */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Key Words ({selectedBook?.testament === 'OT' ? 'Hebrew' : 'Greek'}):
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {Object.entries(selectedBook?.testament === 'OT' ? HEBREW_PRONUNCIATION : GREEK_PRONUNCIATION).map(([word, data]) => (
                    <button
                      key={word}
                      onClick={() => setSelectedWord(word)}
                      className={`w-full text-left p-2 rounded text-xs transition-colors ${
                        selectedWord === word 
                          ? 'bg-[#00457c] text-white' 
                          : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-[#e8f4fc] dark:hover:bg-blue-900/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm ${selectedBook?.testament === 'OT' ? 'font-hebrew' : 'font-greek'}`}>{word}</span>
                        <span className={`font-mono text-[10px] ${selectedWord === word ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>{data.strongs || ''}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`font-mono ${selectedWord === word ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>{data.transliteration}</span>
                        <span className={`${selectedWord === word ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>{data.meaning.split(',')[0]}</span>
                      </div>
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

        {/* ======== DEAD SEA SCROLLS VIEW ======== */}
        {isDSS ? (
          <>
            {/* DSS Header */}
            <div className="border-b border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
              {selectedDSSBook ? (
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                    <span className="text-lg">🏺</span>
                    <span>{selectedDSSBook.name}</span>
                    {selectedDSSBook.total_verses > 0 && (
                      <span className="text-sm font-normal text-emerald-600/70 dark:text-emerald-400/70 ml-2">
                        Chapter {selectedChapter} of {selectedDSSBook.total_chapters}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                    {selectedDSSBook.original_language} • {selectedDSSBook.date_composed} • {selectedDSSBook.qumran_refs}
                    {selectedDSSBook.translation && ` • Translation: ${selectedDSSBook.translation}`}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                    <span className="text-lg">🏺</span>
                    <span>Dead Sea Scrolls &amp; Pseudepigrapha</span>
                  </h3>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                    Select a text from the sidebar to begin reading
                  </p>
                </div>
              )}
            </div>

            {/* DSS Content */}
            <div className="flex-1 overflow-y-auto">
              {scripture.dssLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-emerald-600 mx-auto mb-4" />
                    <p className="text-emerald-700 dark:text-emerald-300">Loading Dead Sea Scrolls...</p>
                  </div>
                </div>
              ) : !selectedDSSBook ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
                    <p className="text-4xl mb-4">🏺</p>
                    <p className="text-lg font-serif mb-2">Ancient Manuscripts</p>
                    <p className="text-sm">Select a text from the sidebar. Books with 📖 have full readable text. Others have scholarly metadata and external links.</p>
                  </div>
                </div>
              ) : selectedDSSBook.text_status === 'metadata_only' ? (
                /* Metadata-only view for copyrighted texts */
                <div className="max-w-2xl mx-auto p-8 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-emerald-200 dark:border-emerald-700">
                    <h2 className="text-2xl font-serif text-emerald-700 dark:text-emerald-300 mb-1">{selectedDSSBook.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedDSSBook.abbreviation} • {selectedDSSBook.original_language} • {selectedDSSBook.date_composed}</p>
                    
                    {selectedDSSBook.significance && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Significance</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{selectedDSSBook.significance}</p>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Qumran References</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedDSSBook.qumran_refs}</p>
                    </div>

                    {selectedDSSBook.sections && selectedDSSBook.sections.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Sections</h4>
                        <div className="space-y-2">
                          {selectedDSSBook.sections.map((sec, i) => (
                            <div key={i} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                              <p className="font-medium text-sm text-emerald-700 dark:text-emerald-300">{sec.name}</p>
                              {sec.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sec.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDSSBook.text_note && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                        <p className="text-xs text-orange-700 dark:text-orange-300">⚠️ {selectedDSSBook.text_note}</p>
                      </div>
                    )}

                    {selectedDSSBook.external_links && selectedDSSBook.external_links.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">External Resources</h4>
                        <div className="space-y-1">
                          {selectedDSSBook.external_links.map((link, i) => (
                            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                              className="block text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                              🔗 {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : dssVerses.length > 0 ? (
                /* Full text view */
                <div className="max-w-3xl mx-auto p-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    {/* Section info for current chapter */}
                    {selectedDSSBook.sections && (() => {
                      const sec = selectedDSSBook.sections.find(s => {
                        if (!s.chapters) return false;
                        const [start, end] = s.chapters.split('-').map(Number);
                        return selectedChapter >= start && selectedChapter <= (end || start);
                      });
                      return sec ? (
                        <div className="mb-4 pb-4 border-b border-emerald-200 dark:border-emerald-700">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{sec.name}</p>
                        </div>
                      ) : null;
                    })()}

                    <div className="space-y-4">
                      {dssVerses.map((verse) => (
                        <p key={verse.verse} className="leading-relaxed text-[#333] dark:text-gray-200 font-serif text-base">
                          <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold font-sans mr-2 align-super">
                            {verse.verse}
                          </span>
                          {verse.text}
                        </p>
                      ))}
                    </div>

                    {/* Chapter nav */}
                    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                        disabled={selectedChapter <= 1}
                        className="px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Previous Chapter
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Chapter {selectedChapter} of {selectedDSSBook.total_chapters}
                      </span>
                      <button
                        onClick={() => setSelectedChapter(Math.min(selectedDSSBook.total_chapters, selectedChapter + 1))}
                        disabled={selectedChapter >= selectedDSSBook.total_chapters}
                        className="px-4 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next Chapter →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">🏺</p>
                    <p>No verse data available for this chapter.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : isApocrypha ? (
          <>
            {/* Apocrypha Column Headers */}
            <div className="grid grid-cols-2 border-b border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
              <div className="px-4 py-3 border-r border-amber-200 dark:border-amber-700">
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center space-x-2">
                  <span className="text-lg">🔤</span>
                  <span>Septuagint Greek (LXX)</span>
                </h3>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Original Language • {(selectedBook as ApocryphaBook)?.originalLanguage || 'Greek'}
                </p>
              </div>
              <div className="px-4 py-3">
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 flex items-center space-x-2">
                  <span className="text-lg">📖</span>
                  <span>{APOCRYPHA_TRANSLATIONS.find(t => t.key === apocryphaTranslation)?.abbr || 'English'}</span>
                </h3>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  {APOCRYPHA_TRANSLATIONS.find(t => t.key === apocryphaTranslation)?.name}
                </p>
              </div>
            </div>

            {/* Apocrypha Book Info Bar */}
            {selectedBook && (
              <div className="px-4 py-2 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300">
                <span className="font-semibold">{selectedBook.name}</span>
                <span className="mx-2">•</span>
                <span>Written in <strong>{(selectedBook as ApocryphaBook).originalLanguage}</strong></span>
                <span className="mx-2">•</span>
                <span>{(selectedBook as ApocryphaBook).dateComposed}</span>
                {(selectedBook as ApocryphaBook).dssFragments?.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 dark:text-green-400">📜 Dead Sea Scrolls fragments exist</span>
                  </>
                )}
              </div>
            )}

            {/* Apocrypha Content - 2 Columns */}
            <div className="flex-1 overflow-y-auto">
              {scripture.apocryphaLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-600 mx-auto mb-4" />
                    <p className="text-amber-700 dark:text-amber-300">Loading Apocrypha...</p>
                  </div>
                </div>
              ) : apocryphaVerses.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg mb-2">📜</p>
                    <p>No data available for this chapter in the selected translation.</p>
                    <p className="text-sm mt-1">Try a different translation (KJV or Brenton&apos;s LXX have the most books).</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 min-h-full">
                  {/* LXX Greek Column */}
                  <div className="bg-[#faf9f6] dark:bg-[#2d3748] border-r border-amber-200 dark:border-amber-700 p-4">
                    <div className="space-y-3">
                      {apocryphaGreekVerses.length > 0 ? apocryphaGreekVerses.map((verse) => (
                        <div key={verse.verse} className="group">
                          <p className="leading-relaxed font-greek text-base text-[#333] dark:text-gray-100">
                            <span className="text-amber-700 dark:text-amber-300 font-sans text-xs font-bold mr-1 align-super">
                              {verse.verse}
                            </span>
                            {verse.text || (
                              <span className="text-gray-400 italic text-sm font-sans">[Not available in LXX]</span>
                            )}
                          </p>
                        </div>
                      )) : apocryphaVerses.map((verse) => (
                        <div key={verse.verse} className="group">
                          <p className="leading-relaxed font-greek text-base text-[#333] dark:text-gray-100">
                            <span className="text-amber-700 dark:text-amber-300 font-sans text-xs font-bold mr-1 align-super">
                              {verse.verse}
                            </span>
                            {verse.originalText || (
                              <span className="text-gray-400 italic text-sm font-sans">[Greek not available]</span>
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* English Translation Column */}
                  <div className="bg-white dark:bg-[#1a202c] p-4">
                    <div className="space-y-3">
                      {apocryphaVerses.map((verse) => (
                        <p key={verse.verse} className="leading-relaxed text-[#333] dark:text-gray-200 font-serif text-base">
                          <span className="text-amber-700 dark:text-amber-300 text-xs font-bold font-sans mr-1 align-super">
                            {verse.verse}
                          </span>
                          {verse.text || (
                            <span className="text-gray-400 italic text-sm">[Not available]</span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* ======== CANONICAL SCRIPTURE VIEW (existing) ======== */}
            {/* Column Headers */}
            <div className={`grid ${showParallel ? 'grid-cols-3' : 'grid-cols-2'} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2d3748]`}>
              <div className="px-4 py-3 border-r border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-[#00457c] dark:text-blue-300 flex items-center space-x-2">
                  <span className="text-lg">🔤</span>
                  <span>{selectedBook?.testament === 'OT' ? 'Hebrew (WLC)' : `Greek (${GREEK_TEXT_TRADITIONS.find(t => t.key === scripture.greekTextTradition)?.abbr || 'SBLGNT'})`}</span>
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
                    {/* Psalm Introduction / Superscription */}
                    {chapterVerses[0]?.superscription && (
                      <div className="pb-3 mb-2 border-b border-gray-200 dark:border-gray-600">
                        <p className={`text-base italic text-gray-600 dark:text-gray-300 leading-relaxed ${
                          selectedBook?.testament === 'OT' ? 'text-right font-hebrew' : 'font-greek'
                        }`}>
                          {chapterVerses[0].superscription}
                        </p>
                      </div>
                    )}
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
                              <div className="mt-1 p-2 bg-white dark:bg-gray-700 rounded border-l-4 border-[#00457c] text-sm space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono font-bold text-[#00457c] dark:text-blue-300">{pronData.transliteration}</span>
                                  {pronData.strongs && <span className="text-[10px] bg-gray-100 dark:bg-gray-600 px-1 rounded">{pronData.strongs}</span>}
                                  <span className="text-gray-400 dark:text-gray-500">•</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">/{pronData.pronunciation}/</span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-200">{pronData.meaning}</p>
                                {pronData.translations && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries(pronData.translations).slice(0, 4).map(([abbr, text]) => (
                                      <span key={abbr} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                        {abbr}: {text}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
          </>
        )}
      </main>
      </div>
    </div>
  );
}
