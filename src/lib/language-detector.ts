/**
 * Language Detection Utility
 * 
 * Uses Unicode pattern matching (from existing repo solution in download_hebrew_bible.py)
 * to detect Hebrew, Greek, and Aramaic text without external libraries.
 * 
 * Supports:
 * - Hebrew (majority of OT)
 * - Aramaic (Daniel 2:4b-7:28, Ezra 4:8-6:18, 7:12-26, Jeremiah 10:11, Genesis 31:47)
 * - Greek (NT, Septuagint)
 * 
 * Based on: download_hebrew_bible.py line 85
 */

// Unicode ranges for language detection
// Hebrew: U+0590 to U+05FF (from download_hebrew_bible.py line 85)
const HEBREW_PATTERN = /[\u0590-\u05FF]+/g;

// Greek: U+0370-U+03FF (Greek and Coptic) + U+1F00-U+1FFF (Greek Extended)
const GREEK_PATTERN = /[\u0370-\u03FF\u1F00-\u1FFF]+/g;

// Imperial Aramaic: U+10840-U+1085F (unique to Aramaic, not in Hebrew range)
// Note: JavaScript uses \u{10840} for 5+ digit Unicode
const IMPERIAL_ARAMAIC_PATTERN = /[\u{10840}-\u{1085F}]+/gu;

// ============================================================================
// Biblical Aramaic Sections (written in Hebrew Square Script)
// These passages use the same Unicode as Hebrew but are Aramaic language
// ============================================================================

interface AramaicPassageInfo {
  // Chapter ranges as [chStart, vStart, chEnd, vEnd]
  chapterRanges?: [number, number, number, number][];
  // Individual verses as Set of "chapter-verse" strings
  verses?: Set<string>;
}

const ARAMAIC_PASSAGES: Record<string, AramaicPassageInfo> = {
  // Daniel - Aramaic section (Daniel 2:4b through 7:28)
  daniel: {
    chapterRanges: [[2, 4, 7, 28]],
  },
  // Ezra - Aramaic sections
  ezra: {
    verses: new Set([
      // Ezra 4:8-24
      ...Array.from({ length: 17 }, (_, i) => `4-${i + 8}`),
      // Ezra 5:1-17
      ...Array.from({ length: 17 }, (_, i) => `5-${i + 1}`),
      // Ezra 6:1-18
      ...Array.from({ length: 18 }, (_, i) => `6-${i + 1}`),
      // Ezra 7:12-26
      ...Array.from({ length: 15 }, (_, i) => `7-${i + 12}`),
    ]),
  },
  // Jeremiah - Single Aramaic verse
  jeremiah: {
    verses: new Set(['10-11']),
  },
  // Genesis - Two Aramaic words
  genesis: {
    verses: new Set(['31-47']),
  },
};

// Common Aramaic vocabulary (distinctive from Hebrew)
const ARAMAIC_VOCABULARY = [
  'דִּי', 'די',      // di - "that/which" (Aramaic) vs אשר (Hebrew)
  'מַלְכָּא', 'מלכא', // malka - "the king" (Aramaic emphatic state)
  'אֱלָהּ', 'אלה',   // elah - "God" (Aramaic) vs אלהים (Hebrew)
  'קֳדָם', 'קדם',    // qodam - "before" (Aramaic)
  'כְּעַן', 'כען',   // ke'an - "now" (Aramaic) vs עתה (Hebrew)
  'הֲוָא', 'הוא',    // hava - "was" (Aramaic) vs היה (Hebrew)
];

export type DetectedLanguage = 'hebrew' | 'greek' | 'aramaic' | 'unknown';

export interface LanguageDetectionResult {
  language: DetectedLanguage;
  confidence: number;
  matches: string[];
  hebrewCount: number;
  greekCount: number;
  aramaicCount: number;
  aramaicWords: string[];
  isKnownAramaicPassage: boolean;
}

/**
 * Check if a specific verse is in a known Aramaic passage
 */
export function isAramaicPassage(book: string, chapter: number, verse: number): boolean {
  const bookLower = book.toLowerCase().replace(/[\s-]/g, '');
  
  // Map common variations
  const bookMap: Record<string, string> = {
    '1samuel': 'samuel1', '2samuel': 'samuel2',
    '1kings': 'kings1', '2kings': 'kings2',
    '1chronicles': 'chronicles1', '2chronicles': 'chronicles2',
  };
  const normalizedBook = bookMap[bookLower] || bookLower;
  
  const passageInfo = ARAMAIC_PASSAGES[normalizedBook];
  if (!passageInfo) return false;
  
  // Check verse-level matches
  if (passageInfo.verses?.has(`${chapter}-${verse}`)) {
    return true;
  }
  
  // Check chapter-range matches (for Daniel)
  if (passageInfo.chapterRanges) {
    for (const [chStart, vStart, chEnd, vEnd] of passageInfo.chapterRanges) {
      if (chapter >= chStart && chapter <= chEnd) {
        if (chapter === chStart && verse >= vStart) return true;
        if (chapter === chEnd && verse <= vEnd) return true;
        if (chapter > chStart && chapter < chEnd) return true;
      }
    }
  }
  
  return false;
}

/**
 * Detect Aramaic-specific vocabulary in text
 */
export function detectAramaicVocabulary(text: string): { found: boolean; words: string[]; confidence: number } {
  if (!text) return { found: false, words: [], confidence: 0 };
  
  const matched: string[] = [];
  for (const word of ARAMAIC_VOCABULARY) {
    if (text.includes(word)) {
      matched.push(word);
    }
  }
  
  if (matched.length === 0) return { found: false, words: [], confidence: 0 };
  
  // More Aramaic words = higher confidence (3+ = 100%)
  const confidence = Math.min(matched.length / 3, 1.0);
  return { found: true, words: matched, confidence };
}

/**
 * Detect language from text using Unicode patterns and contextual analysis
 * Based on solution from download_hebrew_bible.py
 * 
 * Enhanced with:
 * - Aramaic passage detection by verse reference
 * - Aramaic vocabulary detection
 * - Confidence scoring
 */
export function detectLanguage(
  text: string,
  book?: string,
  chapter?: number,
  verse?: number
): LanguageDetectionResult {
  if (!text || typeof text !== 'string') {
    return {
      language: 'unknown',
      confidence: 0,
      matches: [],
      hebrewCount: 0,
      greekCount: 0,
      aramaicCount: 0,
      aramaicWords: [],
      isKnownAramaicPassage: false,
    };
  }

  // Extract matches using Unicode patterns (from existing repo solution)
  const hebrewMatches = text.match(HEBREW_PATTERN) || [];
  const greekMatches = text.match(GREEK_PATTERN) || [];
  const imperialAramaicMatches = text.match(IMPERIAL_ARAMAIC_PATTERN) || [];

  const hebrewCount = hebrewMatches.length;
  const greekCount = greekMatches.length;
  const imperialAramaicCount = imperialAramaicMatches.length;

  // Check for known Aramaic passage by verse reference
  const isKnownAramaic = book && chapter && verse ? isAramaicPassage(book, chapter, verse) : false;

  // Check for Aramaic vocabulary
  const { found: hasAramaicVocab, words: aramaicWords, confidence: vocabConfidence } = detectAramaicVocabulary(text);

  // Determine primary language
  let language: DetectedLanguage = 'unknown';
  let matches: string[] = [];
  let confidence = 0;
  let aramaicCount = 0;

  // Priority order:
  // 1. Known Aramaic passage (by reference)
  // 2. Imperial Aramaic characters
  // 3. Aramaic vocabulary detection
  // 4. Hebrew characters
  // 5. Greek characters

  if (isKnownAramaic && hebrewCount > 0) {
    // Known Aramaic passage - Hebrew script contains Aramaic
    language = 'aramaic';
    matches = hebrewMatches;
    aramaicCount = hebrewCount;
    confidence = 0.95; // High confidence from verse reference
  } else if (imperialAramaicCount > 0) {
    // Has Imperial Aramaic characters - definitely Aramaic
    matches = [...hebrewMatches, ...imperialAramaicMatches];
    aramaicCount = matches.length;
    language = 'aramaic';
    const total = hebrewCount + greekCount + imperialAramaicCount;
    confidence = aramaicCount / total;
  } else if (hasAramaicVocab && hebrewCount > 0 && vocabConfidence > 0.5) {
    // Aramaic vocabulary detected with high confidence
    language = 'aramaic';
    matches = hebrewMatches;
    aramaicCount = hebrewCount;
    confidence = vocabConfidence;
  } else if (hebrewCount > 0) {
    // Hebrew characters, no Aramaic indicators
    language = 'hebrew';
    matches = hebrewMatches;
    const total = hebrewCount + greekCount;
    confidence = total > 0 ? hebrewCount / total : 1;
    aramaicCount = 0;
  } else if (greekCount > 0) {
    // Greek characters
    language = 'greek';
    matches = greekMatches;
    const total = hebrewCount + greekCount;
    confidence = total > 0 ? greekCount / total : 1;
    aramaicCount = 0;
  }

  return {
    language,
    confidence,
    matches,
    hebrewCount,
    greekCount,
    aramaicCount,
    aramaicWords,
    isKnownAramaicPassage: isKnownAramaic,
  };
}

/**
 * Check if text contains Hebrew characters
 * Uses pattern from download_hebrew_bible.py line 85
 */
export function hasHebrew(text: string): boolean {
  return HEBREW_PATTERN.test(text);
}

/**
 * Check if text contains Greek characters
 */
export function hasGreek(text: string): boolean {
  return GREEK_PATTERN.test(text);
}

/**
 * Check if text contains Aramaic characters (Imperial Aramaic)
 */
export function hasAramaic(text: string): boolean {
  return IMPERIAL_ARAMAIC_PATTERN.test(text);
}

/**
 * Extract only Hebrew text from mixed content
 * Based on download_hebrew_bible.py line 86
 */
export function extractHebrew(text: string): string {
  const matches = text.match(HEBREW_PATTERN) || [];
  return matches.join(' ');
}

/**
 * Extract only Greek text from mixed content
 */
export function extractGreek(text: string): string {
  const matches = text.match(GREEK_PATTERN) || [];
  return matches.join(' ');
}

/**
 * Extract only Aramaic text from mixed content (Hebrew + Imperial Aramaic)
 */
export function extractAramaic(text: string): string {
  const imperialMatches = text.match(IMPERIAL_ARAMAIC_PATTERN) || [];
  const hebrewMatches = text.match(HEBREW_PATTERN) || [];
  if (imperialMatches.length > 0) {
    // Has Imperial Aramaic - return Hebrew + Imperial
    return [...hebrewMatches, ...imperialMatches].join(' ');
  } else {
    // No Imperial Aramaic - return empty (it's Hebrew, not Aramaic)
    return '';
  }
}

