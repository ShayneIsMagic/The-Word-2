'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
  abbreviation: string;
  category?: string;
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export type TranslationKey = 'kjv' | 'esv' | 'asv' | 'bbe' | 'bsb' | 'darby' | 'drc' | 'geneva' | 'jps' | 'jubilee' | 'leb' | 'litv' | 'mkjv' | 'net' | 'nheb' | 'oeb' | 'tyndale' | 'webster' | 'ylt' | 'akjv' | 'kjvpce';

export interface TranslationInfo {
  key: TranslationKey;
  name: string;
  abbr: string;
  file: string;
  description?: string;
}

// ============================================================================
// Constants
// ============================================================================

export const AVAILABLE_TRANSLATIONS: TranslationInfo[] = [
  { key: 'kjv', name: 'King James Version', abbr: 'KJV', file: 'kjv-complete.json', description: 'LDS Standard Bible' },
  { key: 'esv', name: 'English Standard Version', abbr: 'ESV', file: 'esv-bible.json', description: 'Modern literal translation' },
  { key: 'asv', name: 'American Standard Version', abbr: 'ASV', file: 'asv-bible.json' },
  { key: 'bsb', name: 'Berean Standard Bible', abbr: 'BSB', file: 'bsb-bible.json' },
  { key: 'net', name: 'New English Translation', abbr: 'NET', file: 'net-bible.json' },
  { key: 'bbe', name: 'Bible in Basic English', abbr: 'BBE', file: 'bbe-bible.json' },
  { key: 'darby', name: 'Darby Translation', abbr: 'Darby', file: 'darby-bible.json' },
  { key: 'drc', name: 'Douay-Rheims Catholic', abbr: 'DRC', file: 'drc-bible.json' },
  { key: 'geneva', name: 'Geneva Bible 1599', abbr: 'Geneva', file: 'geneva-1599.json' },
  { key: 'jps', name: 'JPS Tanakh 1917', abbr: 'JPS', file: 'jps-bible.json' },
  { key: 'jubilee', name: 'Jubilee Bible', abbr: 'JUB', file: 'jubilee-bible.json' },
  { key: 'leb', name: 'Lexham English Bible', abbr: 'LEB', file: 'leb-bible.json' },
  { key: 'litv', name: 'Literal Translation', abbr: 'LITV', file: 'litv-bible.json' },
  { key: 'mkjv', name: 'Modern KJV', abbr: 'MKJV', file: 'mkjv-bible.json' },
  { key: 'nheb', name: 'New Heart English Bible', abbr: 'NHEB', file: 'nheb-bible.json' },
  // Hidden: OEB (67% empty) and Tyndale (75% empty) — re-enable when data is complete
  // { key: 'oeb', name: 'Open English Bible', abbr: 'OEB', file: 'oeb-bible.json' },
  // { key: 'tyndale', name: 'Tyndale Bible', abbr: 'Tyndale', file: 'tyndale-bible.json' },
  { key: 'webster', name: "Webster's Bible", abbr: 'Webster', file: 'webster-bible.json' },
  { key: 'ylt', name: "Young's Literal Translation", abbr: 'YLT', file: 'ylt-bible.json' },
  { key: 'akjv', name: 'American KJV', abbr: 'AKJV', file: 'akjv-bible.json' },
  { key: 'kjvpce', name: 'KJV Pure Cambridge', abbr: 'KJVPCE', file: 'kjvpce-bible.json' },
];

export const LICENSED_TRANSLATIONS_NOTE = `Some translations (NIV, NRSV, NASB, NA28, UBS) are copyrighted and cannot be bundled.
Use external links to read these on their respective websites.
All translations included in this app are public domain or openly licensed.`;

// ============================================================================
// All 66 Bible Books
// ============================================================================

export const ALL_BIBLE_BOOKS: BibleBook[] = [
  // Old Testament - Law
  { id: 'genesis', name: 'Genesis', testament: 'OT', chapters: 50, abbreviation: 'Gen', category: 'Law' },
  { id: 'exodus', name: 'Exodus', testament: 'OT', chapters: 40, abbreviation: 'Exod', category: 'Law' },
  { id: 'leviticus', name: 'Leviticus', testament: 'OT', chapters: 27, abbreviation: 'Lev', category: 'Law' },
  { id: 'numbers', name: 'Numbers', testament: 'OT', chapters: 36, abbreviation: 'Num', category: 'Law' },
  { id: 'deuteronomy', name: 'Deuteronomy', testament: 'OT', chapters: 34, abbreviation: 'Deut', category: 'Law' },
  // Old Testament - History
  { id: 'joshua', name: 'Joshua', testament: 'OT', chapters: 24, abbreviation: 'Josh', category: 'History' },
  { id: 'judges', name: 'Judges', testament: 'OT', chapters: 21, abbreviation: 'Judg', category: 'History' },
  { id: 'ruth', name: 'Ruth', testament: 'OT', chapters: 4, abbreviation: 'Ruth', category: 'History' },
  { id: '1-samuel', name: '1 Samuel', testament: 'OT', chapters: 31, abbreviation: '1 Sam', category: 'History' },
  { id: '2-samuel', name: '2 Samuel', testament: 'OT', chapters: 24, abbreviation: '2 Sam', category: 'History' },
  { id: '1-kings', name: '1 Kings', testament: 'OT', chapters: 22, abbreviation: '1 Kgs', category: 'History' },
  { id: '2-kings', name: '2 Kings', testament: 'OT', chapters: 25, abbreviation: '2 Kgs', category: 'History' },
  { id: '1-chronicles', name: '1 Chronicles', testament: 'OT', chapters: 29, abbreviation: '1 Chr', category: 'History' },
  { id: '2-chronicles', name: '2 Chronicles', testament: 'OT', chapters: 36, abbreviation: '2 Chr', category: 'History' },
  { id: 'ezra', name: 'Ezra', testament: 'OT', chapters: 10, abbreviation: 'Ezra', category: 'History' },
  { id: 'nehemiah', name: 'Nehemiah', testament: 'OT', chapters: 13, abbreviation: 'Neh', category: 'History' },
  { id: 'esther', name: 'Esther', testament: 'OT', chapters: 10, abbreviation: 'Esth', category: 'History' },
  // Old Testament - Poetry/Wisdom
  { id: 'job', name: 'Job', testament: 'OT', chapters: 42, abbreviation: 'Job', category: 'Poetry' },
  { id: 'psalms', name: 'Psalms', testament: 'OT', chapters: 150, abbreviation: 'Ps', category: 'Poetry' },
  { id: 'proverbs', name: 'Proverbs', testament: 'OT', chapters: 31, abbreviation: 'Prov', category: 'Poetry' },
  { id: 'ecclesiastes', name: 'Ecclesiastes', testament: 'OT', chapters: 12, abbreviation: 'Eccl', category: 'Poetry' },
  { id: 'song-of-solomon', name: 'Song of Solomon', testament: 'OT', chapters: 8, abbreviation: 'Song', category: 'Poetry' },
  // Old Testament - Major Prophets
  { id: 'isaiah', name: 'Isaiah', testament: 'OT', chapters: 66, abbreviation: 'Isa', category: 'Major Prophets' },
  { id: 'jeremiah', name: 'Jeremiah', testament: 'OT', chapters: 52, abbreviation: 'Jer', category: 'Major Prophets' },
  { id: 'lamentations', name: 'Lamentations', testament: 'OT', chapters: 5, abbreviation: 'Lam', category: 'Major Prophets' },
  { id: 'ezekiel', name: 'Ezekiel', testament: 'OT', chapters: 48, abbreviation: 'Ezek', category: 'Major Prophets' },
  { id: 'daniel', name: 'Daniel', testament: 'OT', chapters: 12, abbreviation: 'Dan', category: 'Major Prophets' },
  // Old Testament - Minor Prophets
  { id: 'hosea', name: 'Hosea', testament: 'OT', chapters: 14, abbreviation: 'Hos', category: 'Minor Prophets' },
  { id: 'joel', name: 'Joel', testament: 'OT', chapters: 3, abbreviation: 'Joel', category: 'Minor Prophets' },
  { id: 'amos', name: 'Amos', testament: 'OT', chapters: 9, abbreviation: 'Amos', category: 'Minor Prophets' },
  { id: 'obadiah', name: 'Obadiah', testament: 'OT', chapters: 1, abbreviation: 'Obad', category: 'Minor Prophets' },
  { id: 'jonah', name: 'Jonah', testament: 'OT', chapters: 4, abbreviation: 'Jonah', category: 'Minor Prophets' },
  { id: 'micah', name: 'Micah', testament: 'OT', chapters: 7, abbreviation: 'Mic', category: 'Minor Prophets' },
  { id: 'nahum', name: 'Nahum', testament: 'OT', chapters: 3, abbreviation: 'Nah', category: 'Minor Prophets' },
  { id: 'habakkuk', name: 'Habakkuk', testament: 'OT', chapters: 3, abbreviation: 'Hab', category: 'Minor Prophets' },
  { id: 'zephaniah', name: 'Zephaniah', testament: 'OT', chapters: 3, abbreviation: 'Zeph', category: 'Minor Prophets' },
  { id: 'haggai', name: 'Haggai', testament: 'OT', chapters: 2, abbreviation: 'Hag', category: 'Minor Prophets' },
  { id: 'zechariah', name: 'Zechariah', testament: 'OT', chapters: 14, abbreviation: 'Zech', category: 'Minor Prophets' },
  { id: 'malachi', name: 'Malachi', testament: 'OT', chapters: 4, abbreviation: 'Mal', category: 'Minor Prophets' },
  // New Testament - Gospels
  { id: 'matthew', name: 'Matthew', testament: 'NT', chapters: 28, abbreviation: 'Matt', category: 'Gospel' },
  { id: 'mark', name: 'Mark', testament: 'NT', chapters: 16, abbreviation: 'Mark', category: 'Gospel' },
  { id: 'luke', name: 'Luke', testament: 'NT', chapters: 24, abbreviation: 'Luke', category: 'Gospel' },
  { id: 'john', name: 'John', testament: 'NT', chapters: 21, abbreviation: 'John', category: 'Gospel' },
  // New Testament - History
  { id: 'acts', name: 'Acts', testament: 'NT', chapters: 28, abbreviation: 'Acts', category: 'History' },
  // New Testament - Pauline Epistles
  { id: 'romans', name: 'Romans', testament: 'NT', chapters: 16, abbreviation: 'Rom', category: 'Epistle' },
  { id: '1-corinthians', name: '1 Corinthians', testament: 'NT', chapters: 16, abbreviation: '1 Cor', category: 'Epistle' },
  { id: '2-corinthians', name: '2 Corinthians', testament: 'NT', chapters: 13, abbreviation: '2 Cor', category: 'Epistle' },
  { id: 'galatians', name: 'Galatians', testament: 'NT', chapters: 6, abbreviation: 'Gal', category: 'Epistle' },
  { id: 'ephesians', name: 'Ephesians', testament: 'NT', chapters: 6, abbreviation: 'Eph', category: 'Epistle' },
  { id: 'philippians', name: 'Philippians', testament: 'NT', chapters: 4, abbreviation: 'Phil', category: 'Epistle' },
  { id: 'colossians', name: 'Colossians', testament: 'NT', chapters: 4, abbreviation: 'Col', category: 'Epistle' },
  { id: '1-thessalonians', name: '1 Thessalonians', testament: 'NT', chapters: 5, abbreviation: '1 Thess', category: 'Epistle' },
  { id: '2-thessalonians', name: '2 Thessalonians', testament: 'NT', chapters: 3, abbreviation: '2 Thess', category: 'Epistle' },
  { id: '1-timothy', name: '1 Timothy', testament: 'NT', chapters: 6, abbreviation: '1 Tim', category: 'Epistle' },
  { id: '2-timothy', name: '2 Timothy', testament: 'NT', chapters: 4, abbreviation: '2 Tim', category: 'Epistle' },
  { id: 'titus', name: 'Titus', testament: 'NT', chapters: 3, abbreviation: 'Titus', category: 'Epistle' },
  { id: 'philemon', name: 'Philemon', testament: 'NT', chapters: 1, abbreviation: 'Phlm', category: 'Epistle' },
  // New Testament - General Epistles
  { id: 'hebrews', name: 'Hebrews', testament: 'NT', chapters: 13, abbreviation: 'Heb', category: 'Epistle' },
  { id: 'james', name: 'James', testament: 'NT', chapters: 5, abbreviation: 'Jas', category: 'Epistle' },
  { id: '1-peter', name: '1 Peter', testament: 'NT', chapters: 5, abbreviation: '1 Pet', category: 'Epistle' },
  { id: '2-peter', name: '2 Peter', testament: 'NT', chapters: 3, abbreviation: '2 Pet', category: 'Epistle' },
  { id: '1-john', name: '1 John', testament: 'NT', chapters: 5, abbreviation: '1 John', category: 'Epistle' },
  { id: '2-john', name: '2 John', testament: 'NT', chapters: 1, abbreviation: '2 John', category: 'Epistle' },
  { id: '3-john', name: '3 John', testament: 'NT', chapters: 1, abbreviation: '3 John', category: 'Epistle' },
  { id: 'jude', name: 'Jude', testament: 'NT', chapters: 1, abbreviation: 'Jude', category: 'Epistle' },
  // New Testament - Prophecy
  { id: 'revelation', name: 'Revelation', testament: 'NT', chapters: 22, abbreviation: 'Rev', category: 'Prophecy' },
];

// ============================================================================
// Helper: name → id mapping
// ============================================================================

function bookNameToId(name: string): string {
  const found = ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase());
  return found?.id || name.toLowerCase().replace(/\s+/g, '-');
}

// ============================================================================
// Hebrew ↔ English Verse Alignment
// ============================================================================
// The Hebrew (Masoretic) versification differs from English (KJV) versification.
// Most notably: Psalm superscriptions are verse 1 in Hebrew but unnumbered in English.
// When Hebrew has N+1 verses vs KJV N verses, Hebrew verse 1 is the superscription
// and Hebrew verse 2 = English verse 1. We detect this and offset accordingly.
//
// For JPS (which follows Hebrew numbering), we apply the reverse: JPS verse 1 is
// the superscription, and JPS verse 2 = KJV verse 1.

// Translations that follow Hebrew (Masoretic) verse numbering for Psalms
const HEBREW_VERSIFICATION_TRANSLATIONS: TranslationKey[] = ['jps'];

function getHebrewVerseOffset(
  bookName: string,
  chapter: number,
  hebrewVerseCount: number,
  englishVerseCount: number
): number {
  // Only applies to Psalms (the primary source of superscription offsets)
  if (bookName.toLowerCase() !== 'psalms') return 0;
  const diff = hebrewVerseCount - englishVerseCount;
  // If Hebrew has 1 or 2 more verses, it's a superscription offset
  if (diff === 1 || diff === 2) return diff;
  return 0;
}

// ============================================================================
// KJV data structure (kjv-complete.json)
// ============================================================================

interface KJVVerse { verse: number; text: string; }
interface KJVChapter { chapter: number; verses: KJVVerse[]; }
interface KJVBook { name: string; chapters: KJVChapter[]; }
interface KJVBible { translation: string; books: KJVBook[]; }

// ============================================================================
// Context value type
// ============================================================================

interface ScriptureContextValue {
  isLoading: boolean;
  isLoaded: boolean;
  getBooksByTestament: (testament: 'OT' | 'NT') => BibleBook[];
  getVerseCount: (bookName: string, chapter: number) => number;
  getChapterVerses: (bookName: string, chapter: number, translation: TranslationKey) => Array<{ verse: number; originalText: string; englishText: string }>;
  getVerseData: (bookName: string, chapter: number, verse: number) => { originalText: string; englishText: string; language: string };
  getTranslationVerse: (translation: TranslationKey, bookName: string, chapter: number, verse: number) => string | null;
  getBookByName: (name: string) => BibleBook | null;
  searchVerses: (query: string, limit: number) => SearchResult[];
}

const ScriptureContext = createContext<ScriptureContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function ScriptureProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Data stores
  const [kjvData, setKjvData] = useState<KJVBible | null>(null);
  const [hebrewData, setHebrewData] = useState<Record<string, string>>({});
  const [greekData, setGreekData] = useState<Record<string, string>>({});
  const [translationCache, setTranslationCache] = useState<Record<string, KJVBible>>({});

  // Load core data on mount
  useEffect(() => {
    async function loadCoreData() {
      setIsLoading(true);
      try {
        const [kjvRes, hebrewRes, greekRes] = await Promise.all([
          fetch('/lib/original-texts/kjv-complete.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/lib/original-texts/hebrew-ot-complete.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/lib/original-texts/greek-nt-clean.json').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (kjvRes) setKjvData(kjvRes);

        // Hebrew OT is books/chapters/verses format — flatten to Record<string, string>
        if (hebrewRes?.books) {
          const flat: Record<string, string> = {};
          for (const book of hebrewRes.books) {
            const id = bookNameToId(book.name);
            for (const ch of book.chapters) {
              for (const v of ch.verses) {
                flat[`${id}-${ch.chapter}-${v.verse}`] = v.text;
              }
            }
          }
          setHebrewData(flat);
        }

        // Greek NT is already flat Record<string, string>
        if (greekRes) setGreekData(greekRes);

        setIsLoaded(true);
      } catch (err) {
        console.error('Error loading scripture data:', err);
        setIsLoaded(true); // Still mark loaded so the UI isn't stuck
      } finally {
        setIsLoading(false);
      }
    }
    loadCoreData();
  }, []);

  // Load an additional translation on demand
  const loadTranslation = useCallback(async (key: TranslationKey): Promise<KJVBible | null> => {
    if (key === 'kjv') return kjvData;
    if (translationCache[key]) return translationCache[key];

    const info = AVAILABLE_TRANSLATIONS.find(t => t.key === key);
    if (!info) return null;

    try {
      const res = await fetch(`/lib/original-texts/${info.file}`);
      if (!res.ok) return null;
      const data = await res.json();
      setTranslationCache(prev => ({ ...prev, [key]: data }));
      return data;
    } catch {
      return null;
    }
  }, [kjvData, translationCache]);

  // ---- Helper: find a verse in a KJVBible structure ----
  const findVerse = useCallback((bible: KJVBible | null, bookName: string, chapter: number, verse: number): string | null => {
    if (!bible) return null;
    const book = bible.books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (!book) return null;
    const ch = book.chapters.find(c => c.chapter === chapter);
    if (!ch) return null;
    const v = ch.verses.find(vv => vv.verse === verse);
    return v?.text || null;
  }, []);

  // ---- Helper: get verse count for a chapter ----
  const getVerseCount = useCallback((bookName: string, chapter: number): number => {
    if (!kjvData) return 30; // Default fallback
    const book = kjvData.books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (!book) return 30;
    const ch = book.chapters.find(c => c.chapter === chapter);
    return ch?.verses.length || 30;
  }, [kjvData]);

  // ---- API methods ----
  const getBooksByTestament = useCallback((testament: 'OT' | 'NT'): BibleBook[] => {
    return ALL_BIBLE_BOOKS.filter(b => b.testament === testament);
  }, []);

  const getBookByName = useCallback((name: string): BibleBook | null => {
    return ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase() === name.toLowerCase()) || null;
  }, []);

  const getVerseData = useCallback((bookName: string, chapter: number, verse: number): { originalText: string; englishText: string; language: string } => {
    const bookId = bookNameToId(bookName);
    const key = `${bookId}-${chapter}-${verse}`;
    const book = ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    const isOT = book?.testament === 'OT';

    const originalText = isOT ? (hebrewData[key] || '') : (greekData[key] || '');
    const englishText = findVerse(kjvData, bookName, chapter, verse) || '';
    const language = isOT ? 'hebrew' : 'greek';

    return { originalText, englishText, language };
  }, [hebrewData, greekData, kjvData, findVerse]);

  const getTranslationVerse = useCallback((translation: TranslationKey, bookName: string, chapter: number, verse: number): string | null => {
    if (translation === 'kjv') {
      return findVerse(kjvData, bookName, chapter, verse);
    }
    const cached = translationCache[translation];
    if (cached) {
      return findVerse(cached, bookName, chapter, verse);
    }
    // Trigger async load for next render
    loadTranslation(translation);
    return null;
  }, [kjvData, translationCache, findVerse, loadTranslation]);

  const getChapterVerses = useCallback((bookName: string, chapter: number, translation: TranslationKey): Array<{ verse: number; originalText: string; englishText: string; superscription?: string }> => {
    const bookId = bookNameToId(bookName);
    const book = ALL_BIBLE_BOOKS.find(b => b.name.toLowerCase() === bookName.toLowerCase());
    const isOT = book?.testament === 'OT';
    const englishCount = getVerseCount(bookName, chapter);
    const result: Array<{ verse: number; originalText: string; englishText: string; superscription?: string }> = [];

    // Calculate Hebrew verse offset (Psalms superscriptions)
    let hebrewOffset = 0;
    if (isOT && bookName.toLowerCase() === 'psalms') {
      // Count actual Hebrew verses for this chapter
      let hebrewCount = 0;
      for (let v = 1; v <= englishCount + 3; v++) {
        if (hebrewData[`${bookId}-${chapter}-${v}`]) hebrewCount = v;
      }
      hebrewOffset = getHebrewVerseOffset(bookName, chapter, hebrewCount, englishCount);
    }

    // Check if the selected translation follows Hebrew versification (e.g., JPS)
    const translationFollowsHebrew = HEBREW_VERSIFICATION_TRANSLATIONS.includes(translation);

    // If Hebrew has a superscription (offset > 0), include it as metadata on verse 1
    const superscriptionText = hebrewOffset > 0 ? (hebrewData[`${bookId}-${chapter}-1`] || '') : '';

    for (let v = 1; v <= englishCount; v++) {
      // Hebrew verse number: offset by the superscription count
      const hebrewVerseNum = v + hebrewOffset;
      const hebrewKey = `${bookId}-${chapter}-${hebrewVerseNum}`;
      const originalText = isOT ? (hebrewData[hebrewKey] || '') : (greekData[`${bookId}-${chapter}-${v}`] || '');

      // English text: for JPS, adjust verse number since JPS follows Hebrew numbering
      let englishText: string;
      if (translationFollowsHebrew && hebrewOffset > 0) {
        // JPS verse 2 = KJV verse 1, etc.
        englishText = getTranslationVerse(translation, bookName, chapter, hebrewVerseNum) || findVerse(kjvData, bookName, chapter, v) || '';
      } else {
        englishText = getTranslationVerse(translation, bookName, chapter, v) || findVerse(kjvData, bookName, chapter, v) || '';
      }

      result.push({
        verse: v,
        originalText,
        englishText,
        ...(v === 1 && superscriptionText ? { superscription: superscriptionText } : {}),
      });
    }

    return result;
  }, [hebrewData, greekData, kjvData, getVerseCount, getTranslationVerse, findVerse]);

  const searchVerses = useCallback((query: string, limit: number): SearchResult[] => {
    if (!kjvData || !query || query.length < 2) return [];
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    for (const book of kjvData.books) {
      for (const ch of book.chapters) {
        for (const v of ch.verses) {
          if (v.text.toLowerCase().includes(q)) {
            results.push({
              book: book.name,
              chapter: ch.chapter,
              verse: v.verse,
              text: v.text,
            });
            if (results.length >= limit) return results;
          }
        }
      }
    }

    return results;
  }, [kjvData]);

  const value: ScriptureContextValue = {
    isLoading,
    isLoaded,
    getBooksByTestament,
    getVerseCount,
    getChapterVerses,
    getVerseData,
    getTranslationVerse,
    getBookByName,
    searchVerses,
  };

  return (
    <ScriptureContext.Provider value={value}>
      {children}
    </ScriptureContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useScripture(): ScriptureContextValue {
  const ctx = useContext(ScriptureContext);
  if (!ctx) {
    // Return a no-op context if not wrapped (graceful fallback)
    return {
      isLoading: true,
      isLoaded: false,
      getBooksByTestament: () => [],
      getVerseCount: () => 30,
      getChapterVerses: () => [],
      getVerseData: () => ({ originalText: '', englishText: '', language: 'hebrew' }),
      getTranslationVerse: () => null,
      getBookByName: () => null,
      searchVerses: () => [],
    };
  }
  return ctx;
}
