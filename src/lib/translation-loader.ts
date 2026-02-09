/**
 * Translation Loader
 * 
 * Loads translation data from JSON files in public/lib/original-texts/
 * Available translations: ESV, Greek NT, Hebrew OT
 */

// Cache for loaded translations
const translationCache: Record<string, Record<string, string>> = {};

/**
 * Load ESV translation data
 */
export async function loadESV(): Promise<Record<string, string>> {
  if (translationCache['esv']) {
    return translationCache['esv'];
  }
  
  try {
    const response = await fetch('/lib/original-texts/esv-bible.json');
    if (!response.ok) {
      console.warn('ESV translation file not found');
      return {};
    }
    const data = await response.json();
    translationCache['esv'] = data;
    return data;
  } catch (error) {
    console.error('Error loading ESV translation:', error);
    return {};
  }
}

/**
 * Load Greek NT translation data
 */
export async function loadGreekNT(): Promise<Record<string, string>> {
  if (translationCache['greek-nt']) {
    return translationCache['greek-nt'];
  }
  
  try {
    const response = await fetch('/lib/original-texts/greek-nt-clean.json');
    if (!response.ok) {
      console.warn('Greek NT file not found');
      return {};
    }
    const data = await response.json();
    translationCache['greek-nt'] = data;
    return data;
  } catch (error) {
    console.error('Error loading Greek NT:', error);
    return {};
  }
}

/**
 * Load Hebrew OT translation data
 */
export async function loadHebrewOT(): Promise<Record<string, string>> {
  if (translationCache['hebrew-ot']) {
    return translationCache['hebrew-ot'];
  }
  
  try {
    const response = await fetch('/lib/original-texts/hebrew-ot-mechon.json');
    if (!response.ok) {
      console.warn('Hebrew OT file not found');
      return {};
    }
    const data = await response.json();
    translationCache['hebrew-ot'] = data;
    return data;
  } catch (error) {
    console.error('Error loading Hebrew OT:', error);
    return {};
  }
}

/**
 * Get a verse from ESV translation
 */
export async function getESVVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const esv = await loadESV();
  const key = `${bookId}-${chapter}-${verse}`;
  return esv[key] || null;
}

/**
 * Get Greek text for a NT verse
 */
export async function getGreekVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const greek = await loadGreekNT();
  const key = `${bookId}-${chapter}-${verse}`;
  return greek[key] || null;
}

/**
 * Get Hebrew text for an OT verse
 */
export async function getHebrewVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const hebrew = await loadHebrewOT();
  const key = `${bookId}-${chapter}-${verse}`;
  return hebrew[key] || null;
}

/**
 * Get all available translations for a verse
 */
export async function getVerseTranslations(bookId: string, chapter: number, verse: number, testament: 'old' | 'new'): Promise<{
  esv: string | null;
  greek: string | null;
  hebrew: string | null;
}> {
  const [esv, greek, hebrew] = await Promise.all([
    getESVVerse(bookId, chapter, verse),
    testament === 'new' ? getGreekVerse(bookId, chapter, verse) : Promise.resolve(null),
    testament === 'old' ? getHebrewVerse(bookId, chapter, verse) : Promise.resolve(null),
  ]);
  
  return { esv, greek, hebrew };
}

/**
 * Get ESV text for an entire chapter
 */
export async function getESVChapter(bookId: string, chapter: number): Promise<Array<{ verse: number; text: string }>> {
  const esv = await loadESV();
  const verses: Array<{ verse: number; text: string }> = [];
  
  // Find all verses for this chapter
  const prefix = `${bookId}-${chapter}-`;
  for (const [key, text] of Object.entries(esv)) {
    if (key.startsWith(prefix)) {
      const verseNum = parseInt(key.replace(prefix, ''), 10);
      if (!isNaN(verseNum)) {
        verses.push({ verse: verseNum, text });
      }
    }
  }
  
  // Sort by verse number
  verses.sort((a, b) => a.verse - b.verse);
  return verses;
}

/**
 * Check if ESV data is available for a book
 */
export async function hasESVData(bookId: string): Promise<boolean> {
  const esv = await loadESV();
  return Object.keys(esv).some(key => key.startsWith(`${bookId}-`));
}

/**
 * Check if Greek NT data is available for a book
 */
export async function hasGreekData(bookId: string): Promise<boolean> {
  const greek = await loadGreekNT();
  return Object.keys(greek).some(key => key.startsWith(`${bookId}-`));
}

/**
 * Get translation stats
 */
export async function getTranslationStats(): Promise<{
  esv: { books: number; verses: number };
  greek: { books: number; verses: number };
  hebrew: { books: number; verses: number };
}> {
  const [esv, greek, hebrew] = await Promise.all([
    loadESV(),
    loadGreekNT(),
    loadHebrewOT(),
  ]);
  
  const countBooks = (data: Record<string, string>) => {
    const books = new Set<string>();
    for (const key of Object.keys(data)) {
      const bookId = key.split('-').slice(0, -2).join('-');
      books.add(bookId);
    }
    return books.size;
  };
  
  return {
    esv: { books: countBooks(esv), verses: Object.keys(esv).length },
    greek: { books: countBooks(greek), verses: Object.keys(greek).length },
    hebrew: { books: countBooks(hebrew), verses: Object.keys(hebrew).length },
  };
}



