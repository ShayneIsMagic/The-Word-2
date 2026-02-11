'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface BibleBook {
  id: string;
  name: string;
  testament: 'OT' | 'NT' | 'DC';  // DC = Deuterocanonical / Apocrypha
  chapters: number;
  abbreviation: string;
  category?: string;
}

export interface ApocryphaBook extends BibleBook {
  testament: 'DC';
  bookid: number;  // bolls.life book ID
  originalLanguage: 'hebrew' | 'aramaic' | 'greek';
  originalLanguageNote: string;
  dateComposed: string;
  manuscriptEvidence: string[];
  dssFragments: string[];
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
// Apocrypha / Deuterocanonical Translations
// ============================================================================

export type ApocryphaTranslationKey = 'kjv-apoc' | 'lxxe' | 'nrsvce' | 'nabre' | 'cevd' | 'rsv2ce' | 'lxx-greek';

// ============================================================================
// Dead Sea Scrolls Types
// ============================================================================

export interface DSSSection {
  name: string;
  chapters?: string;
  description?: string;
}

export interface DSSExternalLink {
  label: string;
  url: string;
}

export interface DSSBook {
  id: string;
  name: string;
  abbreviation: string;
  category: string;
  original_language: string;
  translation?: string;
  source?: string;
  license?: string;
  date_composed: string;
  qumran_refs: string;
  sections?: DSSSection[];
  significance?: string;
  external_links?: DSSExternalLink[];
  chapters: Array<{ chapter: number; verses: Array<{ verse: number; text: string }> }>;
  total_chapters: number;
  total_verses: number;
  text_status?: 'metadata_only';
  text_note?: string;
}

export interface DSSCollection {
  info: {
    collection: string;
    books_with_full_text: number;
    books_with_metadata_only: number;
    total_verses: number;
    academic_sources: string[];
    copyright_note: string;
  };
  books: DSSBook[];
}

export interface ApocryphaTranslationInfo {
  key: ApocryphaTranslationKey;
  name: string;
  abbr: string;
  file: string;
  language: 'english' | 'greek';
  license: string;
}

export const APOCRYPHA_TRANSLATIONS: ApocryphaTranslationInfo[] = [
  { key: 'kjv-apoc', name: 'King James Version (1611)', abbr: 'KJV', file: 'apocrypha-kjv.json', language: 'english', license: 'Public Domain' },
  { key: 'lxxe', name: "Brenton's English Septuagint (1851)", abbr: 'LXXE', file: 'apocrypha-lxxe.json', language: 'english', license: 'Public Domain' },
  { key: 'nrsvce', name: 'NRSV Catholic Edition (1993)', abbr: 'NRSVCE', file: 'apocrypha-nrsvce.json', language: 'english', license: 'Copyrighted' },
  { key: 'nabre', name: 'New American Bible Revised Ed.', abbr: 'NABRE', file: 'apocrypha-nabre.json', language: 'english', license: 'Copyrighted' },
  { key: 'cevd', name: 'Contemporary English Version', abbr: 'CEVD', file: 'apocrypha-cevd.json', language: 'english', license: 'Copyrighted' },
  { key: 'rsv2ce', name: 'RSV Catholic Edition', abbr: 'RSV2CE', file: 'apocrypha-rsv2ce.json', language: 'english', license: 'Copyrighted' },
  { key: 'lxx-greek', name: 'Septuagint Greek (Rahlfs)', abbr: 'LXX', file: 'apocrypha-lxx-greek.json', language: 'greek', license: 'Public Domain' },
];

// ============================================================================
// Apocrypha / Deuterocanonical Books (Academic Metadata)
// ============================================================================

export const APOCRYPHA_BOOKS: ApocryphaBook[] = [
  // Historical
  { id: '1-esdras', name: '1 Esdras', testament: 'DC', chapters: 9, abbreviation: '1 Esd', category: 'Historical', bookid: 67, originalLanguage: 'greek', originalLanguageNote: 'Composed in Greek; parallel to Ezra-Nehemiah with additions', dateComposed: '~150 BC', manuscriptEvidence: ['Septuagint codices (Vaticanus, Alexandrinus, Sinaiticus)'], dssFragments: [] },
  { id: 'tobit', name: 'Tobit', testament: 'DC', chapters: 14, abbreviation: 'Tob', category: 'Historical', bookid: 68, originalLanguage: 'aramaic', originalLanguageNote: 'Written in Aramaic; Dead Sea Scrolls fragments confirm (4Q196-200: 4 Aramaic, 1 Hebrew)', dateComposed: '~200 BC', manuscriptEvidence: ['Septuagint (two recensions)', 'Vulgate'], dssFragments: ['4Q196 (Aramaic)', '4Q197 (Aramaic)', '4Q198 (Aramaic)', '4Q199 (Aramaic)', '4Q200 (Hebrew)'] },
  { id: 'judith', name: 'Judith', testament: 'DC', chapters: 16, abbreviation: 'Jdt', category: 'Historical', bookid: 69, originalLanguage: 'hebrew', originalLanguageNote: 'Likely composed in Hebrew (Jerome attested an Aramaic copy); original lost', dateComposed: '~150-100 BC', manuscriptEvidence: ['Septuagint codices', 'Old Latin', 'Vulgate'], dssFragments: [] },
  { id: '1-maccabees', name: '1 Maccabees', testament: 'DC', chapters: 16, abbreviation: '1 Macc', category: 'Historical', bookid: 74, originalLanguage: 'hebrew', originalLanguageNote: 'Composed in Hebrew (attested by Jerome and Origen); Hebrew original lost', dateComposed: '~104-63 BC', manuscriptEvidence: ['Septuagint codices (Sinaiticus, Alexandrinus)', 'Josephus paraphrase'], dssFragments: [] },
  { id: '2-maccabees', name: '2 Maccabees', testament: 'DC', chapters: 15, abbreviation: '2 Macc', category: 'Historical', bookid: 75, originalLanguage: 'greek', originalLanguageNote: 'Composed in Greek; epitome of Jason of Cyrene\'s 5-volume history', dateComposed: '~124-63 BC', manuscriptEvidence: ['Septuagint codices (Alexandrinus, Venetus)'], dssFragments: [] },
  { id: '3-maccabees', name: '3 Maccabees', testament: 'DC', chapters: 7, abbreviation: '3 Macc', category: 'Historical', bookid: 76, originalLanguage: 'greek', originalLanguageNote: 'Composed in Greek; unrelated to the Maccabean revolt despite the name', dateComposed: '~1st century BC', manuscriptEvidence: ['Septuagint (Alexandrinus, Venetus)'], dssFragments: [] },
  { id: '4-maccabees', name: '4 Maccabees', testament: 'DC', chapters: 18, abbreviation: '4 Macc', category: 'Philosophical', bookid: 80, originalLanguage: 'greek', originalLanguageNote: 'Composed in Greek; philosophical discourse on reason vs. passions', dateComposed: '~1st century AD', manuscriptEvidence: ['Septuagint (Sinaiticus, Alexandrinus, Venetus)'], dssFragments: [] },
  { id: '2-esdras', name: '2 Esdras (4 Ezra)', testament: 'DC', chapters: 16, abbreviation: '2 Esd', category: 'Apocalyptic', bookid: 77, originalLanguage: 'hebrew', originalLanguageNote: 'Core (ch. 3-14) composed in Hebrew → Greek (lost) → Latin. Ch. 1-2, 15-16 are later Christian additions', dateComposed: '~100 AD (core)', manuscriptEvidence: ['Latin Vulgate (primary witness)', 'Syriac', 'Ethiopic'], dssFragments: [] },
  // Wisdom
  { id: 'wisdom-of-solomon', name: 'Wisdom of Solomon', testament: 'DC', chapters: 19, abbreviation: 'Wis', category: 'Wisdom', bookid: 70, originalLanguage: 'greek', originalLanguageNote: 'Composed in Greek (Alexandrian provenance); no Semitic original exists', dateComposed: '~50 BC – 40 AD', manuscriptEvidence: ['Septuagint codices', 'Papyrus fragments'], dssFragments: [] },
  { id: 'sirach', name: 'Sirach (Ecclesiasticus)', testament: 'DC', chapters: 51, abbreviation: 'Sir', category: 'Wisdom', bookid: 71, originalLanguage: 'hebrew', originalLanguageNote: 'Written in Hebrew by Ben Sira (~180 BC); ~68% of Hebrew recovered from Cairo Genizah + Dead Sea Scrolls + Masada scroll', dateComposed: '~180 BC', manuscriptEvidence: ['Cairo Genizah MSS A-F', 'Masada scroll', 'Septuagint'], dssFragments: ['2Q18 (Sir 6:20-31)', '11Q5 col. XXI (Sir 51:13-30)'] },
  // Prophetic
  { id: 'baruch', name: 'Baruch', testament: 'DC', chapters: 6, abbreviation: 'Bar', category: 'Prophetic', bookid: 73, originalLanguage: 'hebrew', originalLanguageNote: 'Chapters 1-5 likely composed in Hebrew and Greek; no Semitic original survives', dateComposed: '~200-60 BC (composite)', manuscriptEvidence: ['Septuagint codices'], dssFragments: [] },
  { id: 'epistle-of-jeremiah', name: 'Epistle of Jeremiah', testament: 'DC', chapters: 1, abbreviation: 'EpJer', category: 'Prophetic', bookid: 72, originalLanguage: 'hebrew', originalLanguageNote: 'Likely composed in Hebrew or Aramaic; earliest witness is Greek fragment from Qumran (7Q2)', dateComposed: '~300-100 BC', manuscriptEvidence: ['7Q2 (Greek papyrus from Qumran)', 'Septuagint codices'], dssFragments: ['7Q2 (Greek)'] },
  // Additions to Daniel
  { id: 'prayer-of-azariah', name: 'Prayer of Azariah & Song of Three', testament: 'DC', chapters: 1, abbreviation: 'PrAzar', category: 'Additions to Daniel', bookid: 88, originalLanguage: 'hebrew', originalLanguageNote: 'Likely composed in Hebrew or Aramaic; inserted into Daniel 3:23-24 in Greek/Latin Bibles', dateComposed: '~2nd-1st century BC', manuscriptEvidence: ['Septuagint (Theodotion and OG)', 'Papyrus 967'], dssFragments: [] },
  { id: 'susanna', name: 'Susanna', testament: 'DC', chapters: 1, abbreviation: 'Sus', category: 'Additions to Daniel', bookid: 78, originalLanguage: 'greek', originalLanguageNote: 'Debated origin; wordplay in Greek suggests Greek composition. Daniel ch. 13 in Catholic Bibles', dateComposed: '~2nd-1st century BC', manuscriptEvidence: ['Septuagint (Theodotion preferred)', 'Old Greek'], dssFragments: [] },
  { id: 'bel-and-dragon', name: 'Bel and the Dragon', testament: 'DC', chapters: 1, abbreviation: 'Bel', category: 'Additions to Daniel', bookid: 79, originalLanguage: 'greek', originalLanguageNote: 'Likely composed in Greek or Aramaic; Daniel ch. 14 in Catholic Bibles', dateComposed: '~2nd-1st century BC', manuscriptEvidence: ['Septuagint (Theodotion and OG)', 'Papyrus 967'], dssFragments: [] },
  // Additions
  { id: 'esther-greek', name: 'Additions to Esther', testament: 'DC', chapters: 10, abbreviation: 'AddEsth', category: 'Additions', bookid: 81, originalLanguage: 'greek', originalLanguageNote: 'Greek expansions of Hebrew Esther; adds ~107 verses (prayers, letters, religious content)', dateComposed: '~114 BC or 2nd-1st century BC', manuscriptEvidence: ['Septuagint (two Greek versions)'], dssFragments: [] },
  // Liturgical
  { id: 'prayer-of-manasseh', name: 'Prayer of Manasseh', testament: 'DC', chapters: 1, abbreviation: 'PrMan', category: 'Liturgical', bookid: 83, originalLanguage: 'greek', originalLanguageNote: 'Likely composed in Greek; expansion of 2 Chronicles 33:11-13', dateComposed: '~2nd-1st century BC', manuscriptEvidence: ['Apostolic Constitutions', 'Codex Alexandrinus (in Odes)'], dssFragments: [] },
  // Poetry
  { id: 'psalms-of-solomon', name: 'Psalms of Solomon', testament: 'DC', chapters: 18, abbreviation: 'PsSol', category: 'Poetry', bookid: 85, originalLanguage: 'hebrew', originalLanguageNote: 'Composed in Hebrew; Hebrew original lost. Greek and Syriac survive', dateComposed: '~63-30 BC', manuscriptEvidence: ['Greek manuscripts (11 MSS)', 'Syriac translation'], dssFragments: [] },
  { id: 'odes', name: 'Odes', testament: 'DC', chapters: 14, abbreviation: 'Odes', category: 'Liturgical', bookid: 86, originalLanguage: 'greek', originalLanguageNote: 'Compilation of biblical and extrabiblical prayers/hymns for liturgical use', dateComposed: 'Compilation ~5th century AD; individual odes much earlier', manuscriptEvidence: ['Codex Alexandrinus (appended to Psalms)'], dssFragments: [] },
];

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
  getBooksByTestament: (testament: 'OT' | 'NT' | 'DC') => BibleBook[];
  getVerseCount: (bookName: string, chapter: number) => number;
  getChapterVerses: (bookName: string, chapter: number, translation: TranslationKey) => Array<{ verse: number; originalText: string; englishText: string; superscription?: string }>;
  getVerseData: (bookName: string, chapter: number, verse: number) => { originalText: string; englishText: string; language: string };
  getTranslationVerse: (translation: TranslationKey, bookName: string, chapter: number, verse: number) => string | null;
  getBookByName: (name: string) => BibleBook | null;
  searchVerses: (query: string, limit: number) => SearchResult[];
  // Apocrypha
  showApocrypha: boolean;
  setShowApocrypha: (show: boolean) => void;
  apocryphaLoading: boolean;
  apocryphaLoaded: boolean;
  getApocryphaBooks: () => ApocryphaBook[];
  getApocryphaBookById: (id: string) => ApocryphaBook | null;
  getApocryphaChapterVerses: (bookId: string, chapter: number, translation: ApocryphaTranslationKey) => Array<{ verse: number; text: string; originalText?: string }>;
  getApocryphaVerseCount: (bookId: string, chapter: number) => number;
  getAvailableApocryphaTranslations: (bookId: string) => ApocryphaTranslationInfo[];
  // Dead Sea Scrolls
  showDSS: boolean;
  setShowDSS: (show: boolean) => void;
  dssLoading: boolean;
  dssLoaded: boolean;
  getDSSBooks: () => DSSBook[];
  getDSSBookById: (id: string) => DSSBook | null;
  getDSSChapterVerses: (bookId: string, chapter: number) => Array<{ verse: number; text: string }>;
  getDSSVerseCount: (bookId: string, chapter: number) => number;
  getDSSCollection: () => DSSCollection | null;
}

const ScriptureContext = createContext<ScriptureContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

// ============================================================================
// Apocrypha data structure (same as KJV format but with metadata)
// ============================================================================

interface ApocryphaFileBook {
  name: string;
  id: string;
  bookid: number;
  category: string;
  original_language: string;
  original_language_note: string;
  date_composed: string;
  manuscript_evidence: string[];
  dss_fragments: string[];
  chapters: { chapter: number; verses: { verse: number; text: string }[] }[];
}

interface ApocryphaFile {
  translation: string;
  translation_code: string;
  language: string;
  type: string;
  books: ApocryphaFileBook[];
}

export function ScriptureProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Data stores
  const [kjvData, setKjvData] = useState<KJVBible | null>(null);
  const [hebrewData, setHebrewData] = useState<Record<string, string>>({});
  const [greekData, setGreekData] = useState<Record<string, string>>({});
  const [translationCache, setTranslationCache] = useState<Record<string, KJVBible>>({});

  // Apocrypha state
  const [showApocrypha, setShowApocryphaState] = useState(false);
  const [apocryphaLoading, setApocryphaLoading] = useState(false);
  const [apocryphaLoaded, setApocryphaLoaded] = useState(false);
  const [apocryphaCache, setApocryphaCache] = useState<Record<string, ApocryphaFile>>({});

  // Dead Sea Scrolls state (completely separate from Apocrypha)
  const [showDSS, setShowDSSState] = useState(false);
  const [dssLoading, setDSSLoading] = useState(false);
  const [dssLoaded, setDSSLoaded] = useState(false);
  const [dssCollection, setDSSCollection] = useState<DSSCollection | null>(null);

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

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedApoc = localStorage.getItem('showApocrypha');
      if (savedApoc === 'true') setShowApocryphaState(true);
      const savedDSS = localStorage.getItem('showDeadSeaScrolls');
      if (savedDSS === 'true') setShowDSSState(true);
    } catch {
      // localStorage not available
    }
  }, []);

  // Toggle Apocrypha preference
  const setShowApocrypha = useCallback((show: boolean) => {
    setShowApocryphaState(show);
    try { localStorage.setItem('showApocrypha', String(show)); } catch {}
  }, []);

  // Lazy-load Apocrypha data when enabled
  useEffect(() => {
    if (!showApocrypha || apocryphaLoaded || apocryphaLoading) return;

    async function loadApocrypha() {
      setApocryphaLoading(true);
      try {
        // Load KJV Apocrypha (primary English) and LXX Greek (original language) first
        const [kjvApocRes, lxxGreekRes] = await Promise.all([
          fetch('/lib/original-texts/apocrypha-kjv.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/lib/original-texts/apocrypha-lxx-greek.json').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        const cache: Record<string, ApocryphaFile> = {};
        if (kjvApocRes) cache['kjv-apoc'] = kjvApocRes;
        if (lxxGreekRes) cache['lxx-greek'] = lxxGreekRes;
        setApocryphaCache(cache);
        setApocryphaLoaded(true);
      } catch (err) {
        console.error('Error loading Apocrypha data:', err);
        setApocryphaLoaded(true);
      } finally {
        setApocryphaLoading(false);
      }
    }
    loadApocrypha();
  }, [showApocrypha, apocryphaLoaded, apocryphaLoading]);

  // Toggle DSS preference
  const setShowDSS = useCallback((show: boolean) => {
    setShowDSSState(show);
    try { localStorage.setItem('showDeadSeaScrolls', String(show)); } catch {}
  }, []);

  // Lazy-load DSS data when enabled
  useEffect(() => {
    if (!showDSS || dssLoaded || dssLoading) return;

    async function loadDSS() {
      setDSSLoading(true);
      try {
        const res = await fetch('/lib/original-texts/dss-texts.json');
        if (res.ok) {
          const data: DSSCollection = await res.json();
          setDSSCollection(data);
        }
        setDSSLoaded(true);
      } catch (err) {
        console.error('Error loading DSS data:', err);
        setDSSLoaded(true);
      } finally {
        setDSSLoading(false);
      }
    }
    loadDSS();
  }, [showDSS, dssLoaded, dssLoading]);

  // Load an additional Apocrypha translation on demand
  const loadApocryphaTranslation = useCallback(async (key: ApocryphaTranslationKey): Promise<ApocryphaFile | null> => {
    if (apocryphaCache[key]) return apocryphaCache[key];
    const info = APOCRYPHA_TRANSLATIONS.find(t => t.key === key);
    if (!info) return null;
    try {
      const res = await fetch(`/lib/original-texts/${info.file}`);
      if (!res.ok) return null;
      const data = await res.json();
      setApocryphaCache(prev => ({ ...prev, [key]: data }));
      return data;
    } catch {
      return null;
    }
  }, [apocryphaCache]);

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
  const getBooksByTestament = useCallback((testament: 'OT' | 'NT' | 'DC'): BibleBook[] => {
    if (testament === 'DC') return showApocrypha ? APOCRYPHA_BOOKS : [];
    return ALL_BIBLE_BOOKS.filter(b => b.testament === testament);
  }, [showApocrypha]);

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

  // ---- Apocrypha API methods ----

  const getApocryphaBooks = useCallback((): ApocryphaBook[] => {
    if (!showApocrypha) return [];
    return APOCRYPHA_BOOKS;
  }, [showApocrypha]);

  const getApocryphaBookById = useCallback((id: string): ApocryphaBook | null => {
    return APOCRYPHA_BOOKS.find(b => b.id === id) || null;
  }, []);

  const getApocryphaVerseCount = useCallback((bookId: string, chapter: number): number => {
    // Use KJV Apocrypha as the default source for verse counts
    const kjvApoc = apocryphaCache['kjv-apoc'];
    if (!kjvApoc) return 30;
    const book = kjvApoc.books.find(b => b.id === bookId);
    if (!book) return 30;
    const ch = book.chapters.find(c => c.chapter === chapter);
    return ch?.verses.length || 30;
  }, [apocryphaCache]);

  const getApocryphaChapterVerses = useCallback((bookId: string, chapter: number, translation: ApocryphaTranslationKey): Array<{ verse: number; text: string; originalText?: string }> => {
    const result: Array<{ verse: number; text: string; originalText?: string }> = [];

    // Get the requested translation data
    const translationData = apocryphaCache[translation];
    const lxxData = apocryphaCache['lxx-greek'];

    // Find the book in the requested translation
    const book = translationData?.books.find(b => b.id === bookId);
    const lxxBook = lxxData?.books.find(b => b.id === bookId);
    if (!book) {
      // Try loading the translation on demand
      loadApocryphaTranslation(translation);
      return [];
    }

    const ch = book.chapters.find(c => c.chapter === chapter);
    const lxxCh = lxxBook?.chapters.find(c => c.chapter === chapter);
    if (!ch) return [];

    for (const v of ch.verses) {
      const lxxVerse = lxxCh?.verses.find(lv => lv.verse === v.verse);
      result.push({
        verse: v.verse,
        text: v.text,
        originalText: lxxVerse?.text || undefined,
      });
    }

    return result;
  }, [apocryphaCache, loadApocryphaTranslation]);

  const getAvailableApocryphaTranslations = useCallback((bookId: string): ApocryphaTranslationInfo[] => {
    // Check which translations have this specific book
    // For now, return all translations — the UI will handle missing books gracefully
    // We can refine this once we have all data files
    const meta = APOCRYPHA_BOOKS.find(b => b.id === bookId);
    if (!meta) return [];

    // All translations that include this bookid
    // KJV has 15 books, LXXE has 15, NRSVCE/NABRE/RSV2CE have 7, CEVD has 12, LXX has 14
    // For now return all — the API will return empty verses if a book isn't in a translation
    return APOCRYPHA_TRANSLATIONS;
  }, []);

  // ---- Dead Sea Scrolls API methods ----

  const getDSSBooks = useCallback((): DSSBook[] => {
    if (!showDSS || !dssCollection) return [];
    return dssCollection.books;
  }, [showDSS, dssCollection]);

  const getDSSBookById = useCallback((id: string): DSSBook | null => {
    if (!dssCollection) return null;
    return dssCollection.books.find(b => b.id === id) || null;
  }, [dssCollection]);

  const getDSSChapterVerses = useCallback((bookId: string, chapter: number): Array<{ verse: number; text: string }> => {
    if (!dssCollection) return [];
    const book = dssCollection.books.find(b => b.id === bookId);
    if (!book) return [];
    const ch = book.chapters.find(c => c.chapter === chapter);
    if (!ch) return [];
    return ch.verses;
  }, [dssCollection]);

  const getDSSVerseCount = useCallback((bookId: string, chapter: number): number => {
    if (!dssCollection) return 0;
    const book = dssCollection.books.find(b => b.id === bookId);
    if (!book) return 0;
    const ch = book.chapters.find(c => c.chapter === chapter);
    return ch?.verses.length || 0;
  }, [dssCollection]);

  const getDSSCollection = useCallback((): DSSCollection | null => {
    return dssCollection;
  }, [dssCollection]);

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
    // Apocrypha
    showApocrypha,
    setShowApocrypha,
    apocryphaLoading,
    apocryphaLoaded,
    getApocryphaBooks,
    getApocryphaBookById,
    getApocryphaChapterVerses,
    getApocryphaVerseCount,
    getAvailableApocryphaTranslations,
    // Dead Sea Scrolls
    showDSS,
    setShowDSS,
    dssLoading,
    dssLoaded,
    getDSSBooks,
    getDSSBookById,
    getDSSChapterVerses,
    getDSSVerseCount,
    getDSSCollection,
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
      // Apocrypha fallbacks
      showApocrypha: false,
      setShowApocrypha: () => {},
      apocryphaLoading: false,
      apocryphaLoaded: false,
      getApocryphaBooks: () => [],
      getApocryphaBookById: () => null,
      getApocryphaChapterVerses: () => [],
      getApocryphaVerseCount: () => 30,
      getAvailableApocryphaTranslations: () => [],
      // Dead Sea Scrolls fallbacks
      showDSS: false,
      setShowDSS: () => {},
      dssLoading: false,
      dssLoaded: false,
      getDSSBooks: () => [],
      getDSSBookById: () => null,
      getDSSChapterVerses: () => [],
      getDSSVerseCount: () => 0,
      getDSSCollection: () => null,
    };
  }
  return ctx;
}
