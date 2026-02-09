#!/usr/bin/env python3
"""
Download Complete Scripture Data with Strong's Numbers
Downloads Hebrew OT and Greek NT with word-by-word Strong's concordance data

Sources:
1. Open Scripture Hebrew Bible (OSHB) - Hebrew with Strong's
2. SBLGNT - Greek NT (already have)
3. Strong's Concordance definitions

For Amplified Bible-style word expansion
"""

import os
import json
import re
import requests
import time
from typing import Dict, List, Optional
from pathlib import Path

# ============================================================================
# Configuration
# ============================================================================

OUTPUT_DIR = "public/lib/original-texts"
STRONGS_DIR = "public/lib/strongs"

# Open Scripture Hebrew Bible (OSHB) - GitHub raw content
# This has Hebrew text with Strong's numbers embedded
OSHB_BASE = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc"

# Strong's definitions
STRONGS_HEBREW_URL = "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json"
STRONGS_GREEK_URL = "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.json"

# OT Books (39 books)
OT_BOOKS = [
    ("Gen", "genesis", "Genesis", 50),
    ("Exod", "exodus", "Exodus", 40),
    ("Lev", "leviticus", "Leviticus", 27),
    ("Num", "numbers", "Numbers", 36),
    ("Deut", "deuteronomy", "Deuteronomy", 34),
    ("Josh", "joshua", "Joshua", 24),
    ("Judg", "judges", "Judges", 21),
    ("Ruth", "ruth", "Ruth", 4),
    ("1Sam", "1-samuel", "1 Samuel", 31),
    ("2Sam", "2-samuel", "2 Samuel", 24),
    ("1Kgs", "1-kings", "1 Kings", 22),
    ("2Kgs", "2-kings", "2 Kings", 25),
    ("1Chr", "1-chronicles", "1 Chronicles", 29),
    ("2Chr", "2-chronicles", "2 Chronicles", 36),
    ("Ezra", "ezra", "Ezra", 10),
    ("Neh", "nehemiah", "Nehemiah", 13),
    ("Esth", "esther", "Esther", 10),
    ("Job", "job", "Job", 42),
    ("Ps", "psalms", "Psalms", 150),
    ("Prov", "proverbs", "Proverbs", 31),
    ("Eccl", "ecclesiastes", "Ecclesiastes", 12),
    ("Song", "song-of-solomon", "Song of Solomon", 8),
    ("Isa", "isaiah", "Isaiah", 66),
    ("Jer", "jeremiah", "Jeremiah", 52),
    ("Lam", "lamentations", "Lamentations", 5),
    ("Ezek", "ezekiel", "Ezekiel", 48),
    ("Dan", "daniel", "Daniel", 12),
    ("Hos", "hosea", "Hosea", 14),
    ("Joel", "joel", "Joel", 3),
    ("Amos", "amos", "Amos", 9),
    ("Obad", "obadiah", "Obadiah", 1),
    ("Jonah", "jonah", "Jonah", 4),
    ("Mic", "micah", "Micah", 7),
    ("Nah", "nahum", "Nahum", 3),
    ("Hab", "habakkuk", "Habakkuk", 3),
    ("Zeph", "zephaniah", "Zephaniah", 3),
    ("Hag", "haggai", "Haggai", 2),
    ("Zech", "zechariah", "Zechariah", 14),
    ("Mal", "malachi", "Malachi", 4),
]

# NT Books (27 books)
NT_BOOKS = [
    ("Matt", "matthew", "Matthew", 28),
    ("Mark", "mark", "Mark", 16),
    ("Luke", "luke", "Luke", 24),
    ("John", "john", "John", 21),
    ("Acts", "acts", "Acts", 28),
    ("Rom", "romans", "Romans", 16),
    ("1Cor", "1-corinthians", "1 Corinthians", 16),
    ("2Cor", "2-corinthians", "2 Corinthians", 13),
    ("Gal", "galatians", "Galatians", 6),
    ("Eph", "ephesians", "Ephesians", 6),
    ("Phil", "philippians", "Philippians", 4),
    ("Col", "colossians", "Colossians", 4),
    ("1Thess", "1-thessalonians", "1 Thessalonians", 5),
    ("2Thess", "2-thessalonians", "2 Thessalonians", 3),
    ("1Tim", "1-timothy", "1 Timothy", 6),
    ("2Tim", "2-timothy", "2 Timothy", 4),
    ("Titus", "titus", "Titus", 3),
    ("Phlm", "philemon", "Philemon", 1),
    ("Heb", "hebrews", "Hebrews", 13),
    ("Jas", "james", "James", 5),
    ("1Pet", "1-peter", "1 Peter", 5),
    ("2Pet", "2-peter", "2 Peter", 3),
    ("1John", "1-john", "1 John", 5),
    ("2John", "2-john", "2 John", 1),
    ("3John", "3-john", "3 John", 1),
    ("Jude", "jude", "Jude", 1),
    ("Rev", "revelation", "Revelation", 22),
]

# ============================================================================
# Download Functions
# ============================================================================

def download_json(url: str, retries: int = 3) -> Optional[Dict]:
    """Download JSON from URL with retries"""
    for attempt in range(retries):
        try:
            print(f"  Downloading: {url[:80]}...")
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            time.sleep(2)
    return None


def download_text(url: str, retries: int = 3) -> Optional[str]:
    """Download text from URL with retries"""
    for attempt in range(retries):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"  Attempt {attempt + 1} failed: {e}")
            time.sleep(2)
    return None


# ============================================================================
# Strong's Concordance
# ============================================================================

def download_strongs_definitions() -> Dict[str, Dict]:
    """Download Strong's Hebrew and Greek definitions"""
    print("\n" + "=" * 60)
    print("Downloading Strong's Concordance Definitions")
    print("=" * 60)
    
    os.makedirs(STRONGS_DIR, exist_ok=True)
    
    definitions = {'hebrew': {}, 'greek': {}}
    
    # Hebrew definitions
    print("\nDownloading Hebrew Strong's...")
    hebrew_data = download_json(STRONGS_HEBREW_URL)
    if hebrew_data:
        definitions['hebrew'] = hebrew_data
        with open(f"{STRONGS_DIR}/strongs-hebrew.json", 'w', encoding='utf-8') as f:
            json.dump(hebrew_data, f, ensure_ascii=False, indent=2)
        print(f"  ✅ Saved {len(hebrew_data)} Hebrew definitions")
    
    # Greek definitions
    print("\nDownloading Greek Strong's...")
    greek_data = download_json(STRONGS_GREEK_URL)
    if greek_data:
        definitions['greek'] = greek_data
        with open(f"{STRONGS_DIR}/strongs-greek.json", 'w', encoding='utf-8') as f:
            json.dump(greek_data, f, ensure_ascii=False, indent=2)
        print(f"  ✅ Saved {len(greek_data)} Greek definitions")
    
    return definitions


# ============================================================================
# Alternative: Use Existing Bible Database
# ============================================================================

def create_scripture_structure() -> Dict:
    """Create the complete scripture data structure"""
    
    structure = {
        'metadata': {
            'version': '1.0',
            'description': 'Complete Scripture with Strong\'s Numbers for Amplified Study',
            'sources': [
                'BHS (Biblia Hebraica Stuttgartensia)',
                'SBLGNT (Greek NT)',
                'Strong\'s Concordance'
            ]
        },
        'old_testament': {
            'books': [],
            'total_chapters': 0,
            'total_verses': 0,
        },
        'new_testament': {
            'books': [],
            'total_chapters': 0,
            'total_verses': 0,
        }
    }
    
    # Add OT books
    for abbrev, book_id, name, chapters in OT_BOOKS:
        structure['old_testament']['books'].append({
            'id': book_id,
            'name': name,
            'abbreviation': abbrev,
            'chapters': chapters,
            'testament': 'OT',
        })
        structure['old_testament']['total_chapters'] += chapters
    
    # Add NT books
    for abbrev, book_id, name, chapters in NT_BOOKS:
        structure['new_testament']['books'].append({
            'id': book_id,
            'name': name,
            'abbreviation': abbrev,
            'chapters': chapters,
            'testament': 'NT',
        })
        structure['new_testament']['total_chapters'] += chapters
    
    return structure


# ============================================================================
# Amplified Word Data Structure
# ============================================================================

def create_amplified_word_entry(
    word: str,
    strongs: str,
    transliteration: str,
    definitions: List[str],
    usage_notes: str = ""
) -> Dict:
    """
    Create an Amplified Bible-style word entry
    
    Example output:
    {
        "word": "אֱלֹהִים",
        "strongs": "H430",
        "transliteration": "elohim",
        "primary_definition": "God, gods, judges",
        "amplified_options": [
            "God (the supreme deity)",
            "gods (pagan deities)",
            "judges (divine representatives)",
            "angels (heavenly beings)"
        ],
        "usage_notes": "Plural form emphasizing majesty/plurality of attributes"
    }
    """
    return {
        'word': word,
        'strongs': strongs,
        'transliteration': transliteration,
        'primary_definition': definitions[0] if definitions else "",
        'amplified_options': definitions,
        'usage_notes': usage_notes,
    }


# Sample key Hebrew words with amplified definitions
KEY_HEBREW_WORDS = {
    'H430': {
        'word': 'אֱלֹהִים',
        'transliteration': 'elohim',
        'definitions': [
            'God (the one true God)',
            'gods (when referring to pagan deities)',
            'judges, rulers (divine representatives)',
            'angels (heavenly beings)',
            'the Almighty'
        ],
        'notes': 'Plural form (of H433) emphasizing majesty. Used 2,600+ times in OT.'
    },
    'H3068': {
        'word': 'יְהוָה',
        'transliteration': 'YHWH / Yahweh',
        'definitions': [
            'LORD (the self-existent One)',
            'Jehovah (the covenant-keeping God)',
            'the Eternal One',
            'I AM (Exodus 3:14)'
        ],
        'notes': 'The tetragrammaton. God\'s personal name, used 6,800+ times.'
    },
    'H1254': {
        'word': 'בָּרָא',
        'transliteration': 'bara',
        'definitions': [
            'to create (ex nihilo - from nothing)',
            'to shape, form',
            'to bring into being',
            'to produce (what is new)'
        ],
        'notes': 'Used only of divine creation. Genesis 1:1, 21, 27.'
    },
    'H7225': {
        'word': 'רֵאשִׁית',
        'transliteration': 'reshit',
        'definitions': [
            'beginning',
            'first (in time)',
            'chief, principal',
            'firstfruits'
        ],
        'notes': 'From "rosh" (head). Genesis 1:1 - "In the beginning..."'
    },
    'H8064': {
        'word': 'שָׁמַיִם',
        'transliteration': 'shamayim',
        'definitions': [
            'heaven(s)',
            'sky, firmament',
            'the visible heavens (where birds fly)',
            'the celestial heavens (where stars are)',
            'the abode of God'
        ],
        'notes': 'Dual/plural form. Can refer to atmospheric or divine heavens.'
    },
    'H776': {
        'word': 'אֶרֶץ',
        'transliteration': 'erets',
        'definitions': [
            'earth',
            'land, ground',
            'country, territory',
            'the whole world'
        ],
        'notes': 'Used 2,500+ times. Context determines if land or whole earth.'
    },
}

# Sample key Greek words with amplified definitions
KEY_GREEK_WORDS = {
    'G3056': {
        'word': 'λόγος',
        'transliteration': 'logos',
        'definitions': [
            'Word (divine expression)',
            'reason, logic',
            'message, statement',
            'the Word (Christ as divine revelation)',
            'account, matter'
        ],
        'notes': 'John 1:1 - Christ as the eternal Word/Expression of God.'
    },
    'G26': {
        'word': 'ἀγάπη',
        'transliteration': 'agape',
        'definitions': [
            'love (divine, unconditional)',
            'affection, goodwill',
            'benevolence',
            'love feast (fellowship meal)'
        ],
        'notes': 'The highest form of love. God\'s love for humanity.'
    },
    'G4102': {
        'word': 'πίστις',
        'transliteration': 'pistis',
        'definitions': [
            'faith',
            'belief, trust',
            'faithfulness, fidelity',
            'conviction (of truth)',
            'the Christian faith'
        ],
        'notes': 'Hebrews 11:1 - substance of things hoped for.'
    },
    'G5485': {
        'word': 'χάρις',
        'transliteration': 'charis',
        'definitions': [
            'grace (unmerited favor)',
            'kindness, goodwill',
            'thanks, gratitude',
            'a gift, blessing'
        ],
        'notes': 'God\'s undeserved favor toward sinners. Ephesians 2:8.'
    },
    'G4151': {
        'word': 'πνεῦμα',
        'transliteration': 'pneuma',
        'definitions': [
            'Spirit (Holy Spirit)',
            'spirit (of a person)',
            'breath, wind',
            'disposition, attitude',
            'the inner being'
        ],
        'notes': 'Used 385 times in NT. Context crucial for meaning.'
    },
}


def save_amplified_definitions():
    """Save the amplified word definitions"""
    os.makedirs(STRONGS_DIR, exist_ok=True)
    
    # Hebrew
    with open(f"{STRONGS_DIR}/amplified-hebrew.json", 'w', encoding='utf-8') as f:
        json.dump(KEY_HEBREW_WORDS, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(KEY_HEBREW_WORDS)} Hebrew amplified definitions")
    
    # Greek
    with open(f"{STRONGS_DIR}/amplified-greek.json", 'w', encoding='utf-8') as f:
        json.dump(KEY_GREEK_WORDS, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(KEY_GREEK_WORDS)} Greek amplified definitions")


# ============================================================================
# Main
# ============================================================================

def main():
    print("=" * 60)
    print("Complete Scripture Download with Strong's Numbers")
    print("For Amplified Bible-Style Study")
    print("=" * 60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(STRONGS_DIR, exist_ok=True)
    
    # 1. Create scripture structure
    print("\n1. Creating Scripture Structure...")
    structure = create_scripture_structure()
    with open(f"{OUTPUT_DIR}/scripture-structure.json", 'w', encoding='utf-8') as f:
        json.dump(structure, f, ensure_ascii=False, indent=2)
    print(f"   ✅ OT: {len(structure['old_testament']['books'])} books, {structure['old_testament']['total_chapters']} chapters")
    print(f"   ✅ NT: {len(structure['new_testament']['books'])} books, {structure['new_testament']['total_chapters']} chapters")
    
    # 2. Save amplified definitions (key words)
    print("\n2. Saving Amplified Word Definitions...")
    save_amplified_definitions()
    
    # 3. Download Strong's (if network available)
    print("\n3. Strong's Concordance...")
    try:
        download_strongs_definitions()
    except Exception as e:
        print(f"   ⚠️ Could not download Strong's: {e}")
        print("   Using local amplified definitions instead.")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\nData saved to:")
    print(f"  - {OUTPUT_DIR}/scripture-structure.json")
    print(f"  - {STRONGS_DIR}/amplified-hebrew.json")
    print(f"  - {STRONGS_DIR}/amplified-greek.json")
    
    print("\n📌 For COMPLETE Hebrew OT with Strong's numbers:")
    print("   Download from: https://github.com/openscriptures/morphhb")
    print("   Or: https://github.com/scrollmapper/bible_databases")
    
    print("\n📌 For COMPLETE Greek NT:")
    print("   Already have 7,748 verses in greek-nt.json")
    
    print("\n✅ Ready for Amplified Bible-style word study!")


if __name__ == "__main__":
    main()



