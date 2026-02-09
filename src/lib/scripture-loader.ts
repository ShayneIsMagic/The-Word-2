/**
 * Scripture Loader
 * 
 * Loads Bible data from JSON files in public/lib/original-texts/
 * Provides utilities for accessing KJV, Hebrew OT, and Greek NT data.
 * 
 * Data formats:
 *   KJV (kjv-complete.json): { translation: string, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
 *   Hebrew OT (hebrew-ot-mechon.json): { "genesis-1-1": "Hebrew text", ... }
 *   Greek NT (greek-nt-clean.json): { "matthew-1-1": "Greek text", ... }
 */

// Cache for loaded data
const cache: Record<string, unknown> = {};

/**
 * Load a JSON file from public/lib/original-texts/
 */
async function loadJSON<T>(filename: string): Promise<T | null> {
  if (cache[filename]) return cache[filename] as T;
  
  try {
    const response = await fetch(`/lib/original-texts/${filename}`);
    if (!response.ok) {
      console.warn(`Scripture file not found: ${filename}`);
      return null;
    }
    const data = await response.json();
    cache[filename] = data;
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// ============================================================================
// KJV Types & Loader
// ============================================================================

export interface KJVVerse { verse: number; text: string; }
export interface KJVChapter { chapter: number; verses: KJVVerse[]; }
export interface KJVBook { name: string; chapters: KJVChapter[]; }
export interface KJVBible { translation: string; books: KJVBook[]; }

/**
 * Load the complete KJV Bible
 */
export async function loadKJV(): Promise<KJVBible | null> {
  return loadJSON<KJVBible>('kjv-complete.json');
}

/**
 * Get a KJV verse
 */
export async function getKJVVerse(bookName: string, chapter: number, verse: number): Promise<string | null> {
  const kjv = await loadKJV();
  if (!kjv) return null;
  
  const book = kjv.books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (!book) return null;
  
  const ch = book.chapters.find(c => c.chapter === chapter);
  if (!ch) return null;
  
  const v = ch.verses.find(vv => vv.verse === verse);
  return v?.text || null;
}

/**
 * Get all verses from a KJV chapter
 */
export async function getKJVChapter(bookName: string, chapter: number): Promise<KJVVerse[]> {
  const kjv = await loadKJV();
  if (!kjv) return [];
  
  const book = kjv.books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (!book) return [];
  
  const ch = book.chapters.find(c => c.chapter === chapter);
  return ch?.verses || [];
}

// ============================================================================
// Hebrew OT Loader
// ============================================================================

/**
 * Load Hebrew OT (key format: "genesis-1-1" → Hebrew text)
 */
export async function loadHebrewOT(): Promise<Record<string, string>> {
  const data = await loadJSON<Record<string, string>>('hebrew-ot-mechon.json');
  return data || {};
}

/**
 * Get Hebrew text for a verse
 */
export async function getHebrewVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const hebrew = await loadHebrewOT();
  return hebrew[`${bookId}-${chapter}-${verse}`] || null;
}

// ============================================================================
// Greek NT Loader
// ============================================================================

/**
 * Load Greek NT (key format: "matthew-1-1" → Greek text)
 */
export async function loadGreekNT(): Promise<Record<string, string>> {
  const data = await loadJSON<Record<string, string>>('greek-nt-clean.json');
  return data || {};
}

/**
 * Get Greek text for a verse
 */
export async function getGreekVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const greek = await loadGreekNT();
  return greek[`${bookId}-${chapter}-${verse}`] || null;
}

// ============================================================================
// Any Translation Loader
// ============================================================================

/**
 * Load any Bible translation by filename
 */
export async function loadTranslation(filename: string): Promise<KJVBible | null> {
  return loadJSON<KJVBible>(filename);
}

/**
 * Get a verse from any loaded translation
 */
export async function getTranslationVerse(filename: string, bookName: string, chapter: number, verse: number): Promise<string | null> {
  const bible = await loadTranslation(filename);
  if (!bible) return null;
  
  const book = bible.books.find(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (!book) return null;
  
  const ch = book.chapters.find(c => c.chapter === chapter);
  if (!ch) return null;
  
  const v = ch.verses.find(vv => vv.verse === verse);
  return v?.text || null;
}

// ============================================================================
// Search
// ============================================================================

export interface ScriptureSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

/**
 * Search the KJV Bible for a query string
 */
export async function searchKJV(query: string, limit = 50): Promise<ScriptureSearchResult[]> {
  const kjv = await loadKJV();
  if (!kjv || !query) return [];
  
  const q = query.toLowerCase();
  const results: ScriptureSearchResult[] = [];
  
  for (const book of kjv.books) {
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
}

/**
 * Get verse count for a chapter
 */
export async function getVerseCount(bookName: string, chapter: number): Promise<number> {
  const verses = await getKJVChapter(bookName, chapter);
  return verses.length || 30;
}

/**
 * Clear the data cache
 */
export function clearCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}
