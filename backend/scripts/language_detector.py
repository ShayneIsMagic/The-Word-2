#!/usr/bin/env python3
"""
Language Detection Utility for PDF Processing
Uses Unicode pattern matching (from existing repo solution)
Based on: download_hebrew_bible.py line 85

Supports:
- Hebrew (majority of OT)
- Aramaic (Daniel 2:4b-7:28, Ezra 4:8-6:18, 7:12-26, Jeremiah 10:11, Genesis 31:47)
- Greek (NT, Septuagint)
"""

import re
from typing import Dict, List, Tuple, Optional, Set

# Unicode patterns (from existing repo solution in download_hebrew_bible.py)
HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF]+')
GREEK_PATTERN = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]+')
# Imperial Aramaic (unique to Aramaic, not in Hebrew range)
# Note: U+10840-U+1085F requires \U (8-digit) not \u (4-digit)
IMPERIAL_ARAMAIC_PATTERN = re.compile(r'[\U00010840-\U0001085F]+')

# ============================================================================
# Biblical Aramaic Sections (written in Hebrew Square Script)
# These passages use the same Unicode as Hebrew but are Aramaic language
# ============================================================================

ARAMAIC_PASSAGES = {
    # Daniel - Aramaic section
    'daniel': {
        'chapters': [(2, 4, 7, 28)],  # Daniel 2:4b through 7:28
        'verses': set()
    },
    # Ezra - Aramaic sections
    'ezra': {
        'chapters': [],
        'verses': {
            # Ezra 4:8-6:18
            *[(4, v) for v in range(8, 25)],  # Ezra 4:8-24
            *[(5, v) for v in range(1, 18)],  # Ezra 5:1-17
            *[(6, v) for v in range(1, 19)],  # Ezra 6:1-18
            # Ezra 7:12-26
            *[(7, v) for v in range(12, 27)],
        }
    },
    # Jeremiah - Single Aramaic verse
    'jeremiah': {
        'chapters': [],
        'verses': {(10, 11)}
    },
    # Genesis - Two Aramaic words
    'genesis': {
        'chapters': [],
        'verses': {(31, 47)}  # "Jegar Sahadutha"
    }
}

# Common Aramaic vocabulary (distinctive from Hebrew)
# These words appear in Biblical Aramaic but not typically in Hebrew
ARAMAIC_VOCABULARY = {
    'דִּי',      # di - relative pronoun "that/which" (Aramaic) vs אשר (Hebrew)
    'די',       # di - without niqqud
    'מַלְכָּא',   # malka - "the king" (Aramaic emphatic state)
    'מלכא',     # malka - without niqqud
    'אֱלָהּ',    # elah - "God" (Aramaic) vs אלהים (Hebrew)
    'אלה',      # elah - without niqqud
    'קֳדָם',     # qodam - "before" (Aramaic)
    'קדם',      # qodam - without niqqud
    'כְּעַן',    # ke'an - "now" (Aramaic) vs עתה (Hebrew)
    'כען',      # ke'an - without niqqud
    'לָא',      # la - "no/not" (Aramaic negation form)
    'לא',       # la - without niqqud (ambiguous with Hebrew)
    'הֲוָא',     # hava - "was" (Aramaic) vs היה (Hebrew)
    'הוא',      # hava - without niqqud
}


def is_aramaic_passage(book: str, chapter: int, verse: int) -> bool:
    """
    Check if a specific verse is in a known Aramaic passage
    
    Args:
        book: Book name (lowercase, e.g., 'daniel', 'ezra')
        chapter: Chapter number
        verse: Verse number
    
    Returns:
        True if the passage is known to be Aramaic
    """
    book_lower = book.lower().replace(' ', '').replace('-', '')
    
    # Map common variations
    book_map = {
        '1samuel': 'samuel1', '2samuel': 'samuel2',
        '1kings': 'kings1', '2kings': 'kings2',
        '1chronicles': 'chronicles1', '2chronicles': 'chronicles2',
    }
    book_lower = book_map.get(book_lower, book_lower)
    
    if book_lower not in ARAMAIC_PASSAGES:
        return False
    
    passage_info = ARAMAIC_PASSAGES[book_lower]
    
    # Check verse-level matches
    if (chapter, verse) in passage_info.get('verses', set()):
        return True
    
    # Check chapter-range matches (for Daniel)
    for ch_start, v_start, ch_end, v_end in passage_info.get('chapters', []):
        if ch_start <= chapter <= ch_end:
            if chapter == ch_start and verse >= v_start:
                return True
            elif chapter == ch_end and verse <= v_end:
                return True
            elif ch_start < chapter < ch_end:
                return True
    
    return False


def detect_aramaic_vocabulary(text: str) -> Tuple[bool, List[str], float]:
    """
    Detect Aramaic-specific vocabulary in text
    
    Returns:
        (is_likely_aramaic, matched_words, confidence)
    """
    if not text:
        return False, [], 0.0
    
    matched = []
    for word in ARAMAIC_VOCABULARY:
        if word in text:
            matched.append(word)
    
    # Calculate confidence based on matches
    if not matched:
        return False, [], 0.0
    
    # More Aramaic words = higher confidence
    confidence = min(len(matched) / 3, 1.0)  # 3+ words = 100% confidence
    
    return len(matched) >= 1, matched, confidence


def detect_language(text: str, book: str = None, chapter: int = None, verse: int = None) -> Dict[str, any]:
    """
    Detect language from text using Unicode patterns and contextual analysis
    Based on solution from download_hebrew_bible.py line 85
    
    Enhanced with:
    - Aramaic passage detection by verse reference
    - Aramaic vocabulary detection
    - Confidence scoring
    
    Args:
        text: The text to analyze
        book: Optional book name for contextual Aramaic detection
        chapter: Optional chapter number
        verse: Optional verse number
    
    Returns:
        {
            'language': 'hebrew' | 'greek' | 'aramaic' | 'unknown',
            'confidence': float,
            'matches': List[str],
            'hebrew_count': int,
            'greek_count': int,
            'aramaic_count': int,
            'aramaic_words': List[str],  # Matched Aramaic vocabulary
            'is_known_aramaic_passage': bool
        }
    """
    if not text or not isinstance(text, str):
        return {
            'language': 'unknown',
            'confidence': 0.0,
            'matches': [],
            'hebrew_count': 0,
            'greek_count': 0,
            'aramaic_count': 0,
            'aramaic_words': [],
            'is_known_aramaic_passage': False,
        }
    
    # Extract matches using Unicode patterns (from existing repo solution)
    hebrew_matches = HEBREW_PATTERN.findall(text)
    greek_matches = GREEK_PATTERN.findall(text)
    imperial_aramaic_matches = IMPERIAL_ARAMAIC_PATTERN.findall(text)
    
    hebrew_count = len(hebrew_matches)
    greek_count = len(greek_matches)
    imperial_aramaic_count = len(imperial_aramaic_matches)
    
    # Check for known Aramaic passage by verse reference
    is_known_aramaic = False
    if book and chapter and verse:
        is_known_aramaic = is_aramaic_passage(book, chapter, verse)
    
    # Check for Aramaic vocabulary
    has_aramaic_vocab, aramaic_words, vocab_confidence = detect_aramaic_vocabulary(text)
    
    # Determine primary language
    language = 'unknown'
    matches = []
    confidence = 0.0
    aramaic_count = 0
    
    # Priority order:
    # 1. Known Aramaic passage (by reference)
    # 2. Imperial Aramaic characters
    # 3. Aramaic vocabulary detection
    # 4. Hebrew characters
    # 5. Greek characters
    
    if is_known_aramaic and hebrew_count > 0:
        # Known Aramaic passage - Hebrew script contains Aramaic
        language = 'aramaic'
        matches = hebrew_matches
        aramaic_count = hebrew_count
        confidence = 0.95  # High confidence from verse reference
    elif imperial_aramaic_count > 0:
        # Has Imperial Aramaic characters - definitely Aramaic
        aramaic_matches = hebrew_matches + imperial_aramaic_matches
        aramaic_count = len(aramaic_matches)
        language = 'aramaic'
        matches = aramaic_matches
        total = hebrew_count + greek_count + imperial_aramaic_count
        confidence = aramaic_count / total if total > 0 else 1.0
    elif has_aramaic_vocab and hebrew_count > 0 and vocab_confidence > 0.5:
        # Aramaic vocabulary detected with high confidence
        language = 'aramaic'
        matches = hebrew_matches
        aramaic_count = hebrew_count
        confidence = vocab_confidence
    elif hebrew_count > 0:
        # Hebrew characters, no Aramaic indicators
        language = 'hebrew'
        matches = hebrew_matches
        total = hebrew_count + greek_count
        confidence = hebrew_count / total if total > 0 else 1.0
        aramaic_count = 0
    elif greek_count > 0:
        # Greek characters
        language = 'greek'
        matches = greek_matches
        total = hebrew_count + greek_count
        confidence = greek_count / total if total > 0 else 1.0
        aramaic_count = 0
    
    return {
        'language': language,
        'confidence': confidence,
        'matches': matches,
        'hebrew_count': hebrew_count,
        'greek_count': greek_count,
        'aramaic_count': aramaic_count,
        'aramaic_words': aramaic_words,
        'is_known_aramaic_passage': is_known_aramaic,
    }


def has_hebrew(text: str) -> bool:
    """Check if text contains Hebrew characters (from existing repo solution)"""
    return bool(HEBREW_PATTERN.search(text))


def has_greek(text: str) -> bool:
    """Check if text contains Greek characters"""
    return bool(GREEK_PATTERN.search(text))


def has_aramaic(text: str) -> bool:
    """Check if text contains Aramaic characters (Imperial Aramaic)"""
    return bool(IMPERIAL_ARAMAIC_PATTERN.search(text))


def extract_hebrew(text: str) -> str:
    """
    Extract only Hebrew text from mixed content
    Based on download_hebrew_bible.py line 86
    """
    matches = HEBREW_PATTERN.findall(text)
    return ' '.join(matches)


def extract_greek(text: str) -> str:
    """Extract only Greek text from mixed content"""
    matches = GREEK_PATTERN.findall(text)
    return ' '.join(matches)


def extract_aramaic(text: str) -> str:
    """Extract only Aramaic text from mixed content (Hebrew + Imperial Aramaic)"""
    # Check if has Imperial Aramaic
    imperial_matches = IMPERIAL_ARAMAIC_PATTERN.findall(text)
    hebrew_matches = HEBREW_PATTERN.findall(text)
    if imperial_matches:
        # Has Imperial Aramaic - return Hebrew + Imperial
        return ' '.join(hebrew_matches + imperial_matches)
    else:
        # No Imperial Aramaic - return empty (it's Hebrew, not Aramaic)
        return ''


# Example usage
if __name__ == "__main__":
    print("=" * 60)
    print("Language Detection Tests")
    print("=" * 60)
    
    # Test 1: Hebrew detection (from existing repo solution)
    print("\n1. Hebrew Detection:")
    hebrew_text = "בְּרֵאשִׁית בָּרָא אֱלֹהִים"
    result = detect_language(hebrew_text, book="genesis", chapter=1, verse=1)
    print(f"   Text: {hebrew_text}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"   Known Aramaic passage: {result['is_known_aramaic_passage']}")
    
    # Test 2: Greek detection
    print("\n2. Greek Detection:")
    greek_text = "Ἐν ἀρχῇ ἦν ὁ λόγος"
    result = detect_language(greek_text)
    print(f"   Text: {greek_text}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    
    # Test 3: Aramaic by verse reference (Daniel 2:4)
    print("\n3. Aramaic by Verse Reference (Daniel 2:4):")
    # This text uses Hebrew script but is Aramaic language
    aramaic_text = "מַלְכָּא לְעָלְמִין חֱיִי"  # "O king, live forever" (Daniel 2:4)
    result = detect_language(aramaic_text, book="daniel", chapter=2, verse=4)
    print(f"   Text: {aramaic_text}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"   Known Aramaic passage: {result['is_known_aramaic_passage']}")
    
    # Test 4: Aramaic vocabulary detection
    print("\n4. Aramaic Vocabulary Detection:")
    aramaic_vocab_text = "די מַלְכָּא אֱלָהּ"  # Contains Aramaic words
    result = detect_language(aramaic_vocab_text)
    print(f"   Text: {aramaic_vocab_text}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"   Aramaic words found: {result['aramaic_words']}")
    
    # Test 5: Ezra Aramaic section
    print("\n5. Ezra Aramaic Section (Ezra 4:8):")
    ezra_text = "רְחוּם בְּעֵל־טְעֵם וְשִׁמְשַׁי"
    result = detect_language(ezra_text, book="ezra", chapter=4, verse=8)
    print(f"   Text: {ezra_text}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"   Known Aramaic passage: {result['is_known_aramaic_passage']}")
    
    # Test 6: Hebrew (not Aramaic) section of Daniel
    print("\n6. Hebrew Section of Daniel (Daniel 1:1):")
    daniel_hebrew = "בִּשְׁנַת שָׁלוֹשׁ לְמַלְכוּת יְהוֹיָקִים"
    result = detect_language(daniel_hebrew, book="daniel", chapter=1, verse=1)
    print(f"   Text: {daniel_hebrew}")
    print(f"   Detected: {result['language']} (confidence: {result['confidence']:.2f})")
    print(f"   Known Aramaic passage: {result['is_known_aramaic_passage']}")
    
    # Summary
    print("\n" + "=" * 60)
    print("Aramaic Passages in OT:")
    print("=" * 60)
    print("  • Daniel 2:4b - 7:28")
    print("  • Ezra 4:8 - 6:18")
    print("  • Ezra 7:12-26")
    print("  • Jeremiah 10:11")
    print("  • Genesis 31:47 (two words)")
    print()
    print("Detection uses:")
    print("  1. Known passage reference (highest confidence)")
    print("  2. Imperial Aramaic Unicode characters")
    print("  3. Aramaic vocabulary patterns")
    print("  4. Fallback to Hebrew for Hebrew-script text")
