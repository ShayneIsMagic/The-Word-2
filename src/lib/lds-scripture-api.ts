/**
 * LDS Scripture API Integration
 * 
 * Provides access to LDS scriptures including:
 * - JST (Joseph Smith Translation) footnotes
 * - Cross-references
 * - Study helps
 * - Topical Guide links
 * - Bible Dictionary references
 * 
 * Data sourced from churchofjesuschrist.org
 */

// LDS Scripture API Base URLs
const LDS_BASE_URL = 'https://www.churchofjesuschrist.org/study/scriptures';
const LDS_API_BASE = 'https://www.churchofjesuschrist.org/api/content/scriptures';

// Book URL mappings for LDS website
export const LDS_BOOK_URLS: Record<string, string> = {
  // Old Testament
  'Genesis': 'genesis',
  'Exodus': 'exodus',
  'Leviticus': 'lev',
  'Numbers': 'num',
  'Deuteronomy': 'deut',
  'Joshua': 'josh',
  'Judges': 'judg',
  'Ruth': 'ruth',
  '1 Samuel': '1-sam',
  '2 Samuel': '2-sam',
  '1 Kings': '1-kgs',
  '2 Kings': '2-kgs',
  '1 Chronicles': '1-chr',
  '2 Chronicles': '2-chr',
  'Ezra': 'ezra',
  'Nehemiah': 'neh',
  'Esther': 'esth',
  'Job': 'job',
  'Psalms': 'ps',
  'Proverbs': 'prov',
  'Ecclesiastes': 'eccl',
  'Song of Solomon': 'song',
  'Isaiah': 'isa',
  'Jeremiah': 'jer',
  'Lamentations': 'lam',
  'Ezekiel': 'ezek',
  'Daniel': 'dan',
  'Hosea': 'hosea',
  'Joel': 'joel',
  'Amos': 'amos',
  'Obadiah': 'obad',
  'Jonah': 'jonah',
  'Micah': 'micah',
  'Nahum': 'nahum',
  'Habakkuk': 'hab',
  'Zephaniah': 'zeph',
  'Haggai': 'hag',
  'Zechariah': 'zech',
  'Malachi': 'mal',
  // New Testament
  'Matthew': 'matt',
  'Mark': 'mark',
  'Luke': 'luke',
  'John': 'john',
  'Acts': 'acts',
  'Romans': 'rom',
  '1 Corinthians': '1-cor',
  '2 Corinthians': '2-cor',
  'Galatians': 'gal',
  'Ephesians': 'eph',
  'Philippians': 'philip',
  'Colossians': 'col',
  '1 Thessalonians': '1-thes',
  '2 Thessalonians': '2-thes',
  '1 Timothy': '1-tim',
  '2 Timothy': '2-tim',
  'Titus': 'titus',
  'Philemon': 'philem',
  'Hebrews': 'heb',
  'James': 'james',
  '1 Peter': '1-pet',
  '2 Peter': '2-pet',
  '1 John': '1-jn',
  '2 John': '2-jn',
  '3 John': '3-jn',
  'Jude': 'jude',
  'Revelation': 'rev',
};

// JST (Joseph Smith Translation) footnotes for key verses
// These are the actual JST changes from the LDS Bible
export const JST_FOOTNOTES: Record<string, { jst: string; note: string }> = {
  // Genesis
  'Genesis:1:1': {
    jst: 'And it came to pass that the Lord spake unto Moses, saying: Behold, I reveal unto you concerning this heaven, and this earth; write the words which I speak.',
    note: 'JST Genesis 1:1. The JST provides additional context showing this as a revelation to Moses.',
  },
  'Genesis:1:2': {
    jst: 'And the earth, after it was formed, was empty and desolate, because they had not formed anything but the earth; and darkness reigned upon the face of the deep, and the Spirit of God moved upon the face of the waters.',
    note: 'JST Genesis 1:2. Clarifies the sequence of creation.',
  },
  'Genesis:1:27': {
    jst: 'And I, God, created man in mine own image, in the image of mine Only Begotten created I him; male and female created I them.',
    note: 'JST Genesis 1:27. Adds "Only Begotten" identifying Christ\'s role in creation.',
  },
  'Genesis:2:5': {
    jst: 'And every plant of the field before it was in the earth, and every herb of the field before it grew. For I, the Lord God, created all things, of which I have spoken, spiritually, before they were naturally upon the face of the earth.',
    note: 'JST Genesis 2:5. Establishes the doctrine of spiritual creation preceding physical.',
  },
  'Genesis:6:6': {
    jst: 'And it repented Noah, and his heart was pained that the Lord had made man on the earth, and it grieved him at the heart.',
    note: 'JST Genesis 6:6. Changes "it repented the Lord" to "it repented Noah" - God does not repent.',
  },
  'Genesis:14:25-40': {
    jst: 'And Melchizedek lifted up his voice and blessed Abram... For God having sworn unto Enoch and unto his seed with an oath by himself; that every one being ordained after this order and calling should have power, by faith...',
    note: 'JST Genesis 14:25-40. Extended passage about Melchizedek and his priesthood order.',
  },
  'Genesis:50:24-38': {
    jst: 'And Joseph said unto his brethren, I die, and go unto my fathers; and I go down to my grave with joy. The God of my father Jacob be with you, to deliver you out of affliction in the days of your bondage; for the Lord hath visited me, and I have obtained a promise of the Lord, that out of the fruit of my loins, the Lord God will raise up a righteous branch out of my loins...',
    note: 'JST Genesis 50:24-38. Prophecy of Joseph in Egypt about Moses and a future prophet (Joseph Smith).',
  },
  // Exodus
  'Exodus:4:24': {
    jst: 'And it came to pass, that the Lord appeared unto him as he was in the way, by the inn. The Lord was angry with Moses, and his hand was about to fall upon him, to kill him; for he had not circumcised his son.',
    note: 'JST Exodus 4:24. Clarifies that God sought to kill Moses, not his son.',
  },
  'Exodus:7:1': {
    jst: 'And the Lord said unto Moses, See, I have made thee a prophet to Pharaoh; and Aaron thy brother shall be thy spokesman.',
    note: 'JST Exodus 7:1. Changes "a god to Pharaoh" to "a prophet to Pharaoh".',
  },
  'Exodus:33:20': {
    jst: 'And he said unto Moses, Thou canst not see my face at this time, lest mine anger be kindled against thee also, and I destroy thee, and thy people; for there shall no man among them see me at this time, and live, for they are exceeding sinful. And no sinful man hath at any time, neither shall there be any sinful man at any time, that shall see my face and live.',
    note: 'JST Exodus 33:20. Explains that sinful men cannot see God, not that no man ever can.',
  },
  // Matthew
  'Matthew:3:4-6': {
    jst: 'Now John himself was clothed with camel\'s hair, and had a leathern girdle about his loins; and his meat was locusts and wild honey. Then went out to him Jerusalem, and all Judea, and all the region round about Jordan, and were baptized of him in Jordan, confessing their sins. And he taught them that they should believe on him who should come after him, that is, on Christ.',
    note: 'JST Matthew 3:4-6. Adds that John taught people to believe in Christ.',
  },
  'Matthew:4:1': {
    jst: 'Then Jesus was led up of the Spirit, into the wilderness, to be with God.',
    note: 'JST Matthew 4:1. Jesus went "to be with God" not "to be tempted of the devil".',
  },
  'Matthew:4:5-6': {
    jst: 'Then Jesus was taken up into the holy city, and the Spirit setteth him on the pinnacle of the temple. Then the devil came unto him...',
    note: 'JST Matthew 4:5-6. Clarifies the Spirit took Jesus to the temple, then the devil came.',
  },
  'Matthew:5:21-22': {
    jst: 'Ye have heard that it was said by them of old time, and it is also written before you, that thou shalt not kill; and whosoever shall kill shall be in danger of the judgment of God. But I say unto you, that whosoever is angry with his brother shall be in danger of his judgment...',
    note: 'JST Matthew 5:21-22. Removes "without a cause" - anger itself is the issue.',
  },
  'Matthew:6:13': {
    jst: 'And suffer us not to be led into temptation, but deliver us from evil.',
    note: 'JST Matthew 6:13. Changes "lead us not" to "suffer us not to be led" - God does not tempt.',
  },
  'Matthew:6:25-27': {
    jst: 'And, again, I say unto you, Go ye into the world, and care not for the world; for the world will hate you, and will persecute you, and will turn you out of their synagogues. Nevertheless, ye shall go forth from house to house, teaching the people; and I will go before you. And your heavenly Father will provide for you, whatsoever things ye need for food, what ye shall eat; and for raiment, what ye shall wear or put on.',
    note: 'JST Matthew 6:25-27. Expanded instructions to disciples about missionary work.',
  },
  'Matthew:7:1-2': {
    jst: 'Now these are the words which Jesus taught his disciples that they should say unto the people. Judge not unrighteously, that ye be not judged; but judge righteous judgment.',
    note: 'JST Matthew 7:1-2. Clarifies righteous judgment is acceptable.',
  },
  // John
  'John:1:1': {
    jst: 'In the beginning was the gospel preached through the Son. And the gospel was the word, and the word was with the Son, and the Son was with God, and the Son was of God.',
    note: 'JST John 1:1. Clarifies the relationship between the gospel, the Word (Son), and God.',
  },
  'John:1:18': {
    jst: 'No man hath seen God at any time, except he hath borne record of the Son; for except it is through him no man can be saved.',
    note: 'JST John 1:18. Adds salvation condition to the verse.',
  },
  'John:4:24': {
    jst: 'For unto such hath God promised his Spirit. And they who worship him, must worship in spirit and in truth.',
    note: 'JST John 4:24. Removes "God is a Spirit" which could imply God has no body.',
  },
  // Romans
  'Romans:4:16': {
    jst: 'Therefore ye are justified of faith and works, through grace, to the end the promise might be sure to all the seed; not to them only who are of the law, but to them also who are of the faith of Abraham; who is the father of us all.',
    note: 'JST Romans 4:16. Adds "and works" - faith and works together.',
  },
  'Romans:7:14-15': {
    jst: 'For we know that the commandment is spiritual; but when I was under the law, I was yet carnal, sold under sin. But now I am spiritual; for that which I am commanded to do, I do; and that which I am commanded not to allow, I allow not.',
    note: 'JST Romans 7:14-15. Changes from present struggle to past tense - Paul speaking of his former state.',
  },
  // Hebrews
  'Hebrews:6:1': {
    jst: 'Therefore not leaving the principles of the doctrine of Christ, let us go on unto perfection; not laying again the foundation of repentance from dead works, and of faith toward God.',
    note: 'JST Hebrews 6:1. Changes "leaving" to "not leaving" - don\'t abandon the basics.',
  },
  'Hebrews:7:3': {
    jst: 'For this Melchizedek was ordained a priest after the order of the Son of God, which order was without father, without mother, without descent, having neither beginning of days, nor end of life. And all those who are ordained unto this priesthood are made like unto the Son of God, abiding a priest continually.',
    note: 'JST Hebrews 7:3. Clarifies that the priesthood order (not Melchizedek himself) was without beginning.',
  },
  'Hebrews:11:40': {
    jst: 'God having provided some better things for them through their sufferings, for without sufferings they could not be made perfect.',
    note: 'JST Hebrews 11:40. Emphasis on necessity of suffering for perfection.',
  },
  // 1 John  
  '1 John:4:12': {
    jst: 'No man hath seen God at any time, except them who believe. If we love one another, God dwelleth in us, and his love is perfected in us.',
    note: 'JST 1 John 4:12. Adds exception for believers.',
  },
  // Revelation
  'Revelation:1:6': {
    jst: 'And hath made us kings and priests unto God, his Father. To him be glory and dominion, forever and ever. Amen.',
    note: 'JST Revelation 1:6. Clarifies "his Father" referring to God the Father.',
  },
  'Revelation:5:6': {
    jst: 'And I beheld, and, lo, in the midst of the throne and of the four beasts, and in the midst of the elders, stood a Lamb as it had been slain, having twelve horns and twelve eyes, which are the twelve servants of God, sent forth into all the earth.',
    note: 'JST Revelation 5:6. Changes "seven" to "twelve" horns and eyes, representing twelve apostles.',
  },
};

// Cross-reference data structure
export interface CrossReference {
  verse: string;
  book: string;
  chapter: number;
  verseNum: number;
  text: string;
  type: 'related' | 'parallel' | 'prophecy-fulfillment' | 'quote';
}

// Sample cross-references (key OT-NT connections)
export const CROSS_REFERENCES: Record<string, CrossReference[]> = {
  'Genesis:1:1': [
    { verse: 'John 1:1', book: 'John', chapter: 1, verseNum: 1, text: 'In the beginning was the Word...', type: 'parallel' },
    { verse: 'Hebrews 1:10', book: 'Hebrews', chapter: 1, verseNum: 10, text: 'And, Thou, Lord, in the beginning hast laid the foundation of the earth...', type: 'parallel' },
    { verse: 'Moses 2:1', book: 'Moses', chapter: 2, verseNum: 1, text: 'And it came to pass that the Lord spake unto Moses...', type: 'related' },
    { verse: 'Abraham 4:1', book: 'Abraham', chapter: 4, verseNum: 1, text: 'And then the Lord said: Let us go down...', type: 'related' },
  ],
  'Isaiah:7:14': [
    { verse: 'Matthew 1:23', book: 'Matthew', chapter: 1, verseNum: 23, text: 'Behold, a virgin shall be with child...', type: 'prophecy-fulfillment' },
    { verse: '2 Nephi 17:14', book: '2 Nephi', chapter: 17, verseNum: 14, text: 'Therefore the Lord himself shall give you a sign...', type: 'parallel' },
  ],
  'Isaiah:53:5': [
    { verse: 'Matthew 8:17', book: 'Matthew', chapter: 8, verseNum: 17, text: 'Himself took our infirmities, and bare our sicknesses.', type: 'prophecy-fulfillment' },
    { verse: '1 Peter 2:24', book: '1 Peter', chapter: 2, verseNum: 24, text: 'Who his own self bare our sins in his own body on the tree...', type: 'prophecy-fulfillment' },
    { verse: 'Mosiah 14:5', book: 'Mosiah', chapter: 14, verseNum: 5, text: 'But he was wounded for our transgressions...', type: 'parallel' },
  ],
  'Psalm:22:1': [
    { verse: 'Matthew 27:46', book: 'Matthew', chapter: 27, verseNum: 46, text: 'My God, my God, why hast thou forsaken me?', type: 'prophecy-fulfillment' },
    { verse: 'Mark 15:34', book: 'Mark', chapter: 15, verseNum: 34, text: 'My God, my God, why hast thou forsaken me?', type: 'prophecy-fulfillment' },
  ],
  'John:3:16': [
    { verse: '1 John 4:9', book: '1 John', chapter: 4, verseNum: 9, text: 'In this was manifested the love of God toward us...', type: 'related' },
    { verse: '2 Nephi 26:24', book: '2 Nephi', chapter: 26, verseNum: 24, text: 'He doeth not anything save it be for the benefit of the world; for he loveth the world...', type: 'related' },
    { verse: 'D&C 34:3', book: 'D&C', chapter: 34, verseNum: 3, text: 'For God so loved the world that he gave his Only Begotten Son...', type: 'quote' },
  ],
};

// Study helps categories
export const STUDY_HELPS = {
  topicalGuide: 'https://www.churchofjesuschrist.org/study/scriptures/tg',
  bibleDictionary: 'https://www.churchofjesuschrist.org/study/scriptures/bd',
  bibleChronology: 'https://www.churchofjesuschrist.org/study/scriptures/bible-chron',
  harmonyOfGospels: 'https://www.churchofjesuschrist.org/study/scriptures/harmony',
  biblePhotos: 'https://www.churchofjesuschrist.org/study/scriptures/bible-photos',
  bibleMaps: 'https://www.churchofjesuschrist.org/study/scriptures/bible-maps',
};

/**
 * Get LDS scripture URL for a given reference
 */
export function getLDSScriptureUrl(book: string, chapter: number, verse?: number): string {
  const bookUrl = LDS_BOOK_URLS[book];
  if (!bookUrl) return '';
  
  const testament = isOldTestament(book) ? 'ot' : 'nt';
  let url = `${LDS_BASE_URL}/${testament}/${bookUrl}/${chapter}`;
  
  if (verse) {
    url += `?id=p${verse}#p${verse}`;
  }
  
  return url + '?lang=eng';
}

/**
 * Check if a book is in the Old Testament
 */
export function isOldTestament(book: string): boolean {
  const otBooks = [
    'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
    'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
    '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
    'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
    'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
    'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
    'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
    'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
  ];
  return otBooks.includes(book);
}

/**
 * Get JST footnote for a verse
 */
export function getJSTFootnote(book: string, chapter: number, verse: number): { jst: string; note: string } | null {
  const key = `${book}:${chapter}:${verse}`;
  return JST_FOOTNOTES[key] || null;
}

/**
 * Get cross-references for a verse
 */
export function getCrossReferences(book: string, chapter: number, verse: number): CrossReference[] {
  const key = `${book}:${chapter}:${verse}`;
  return CROSS_REFERENCES[key] || [];
}

/**
 * Generate Topical Guide search URL
 */
export function getTopicalGuideUrl(topic: string): string {
  const encodedTopic = encodeURIComponent(topic.toLowerCase());
  return `https://www.churchofjesuschrist.org/study/scriptures/tg/${encodedTopic}?lang=eng`;
}

/**
 * Generate Bible Dictionary search URL
 */
export function getBibleDictionaryUrl(term: string): string {
  const encodedTerm = encodeURIComponent(term.toLowerCase());
  return `https://www.churchofjesuschrist.org/study/scriptures/bd/${encodedTerm}?lang=eng`;
}

// Export types
export type { CrossReference };

