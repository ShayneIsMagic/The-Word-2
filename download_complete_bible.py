#!/usr/bin/env python3
"""
Complete Bible Download Script
Downloads all 66 books with:
- Hebrew OT (with Strong's numbers)
- Greek NT (with Strong's numbers)
- Multiple English translations
- Word study data for Amplified-style display

Sources:
- Open Scriptures Hebrew Bible (OSHB) - https://github.com/openscriptures/morphhb
- SBLGNT Greek NT - https://github.com/morphgnt/sblgnt
- Open English Bible - Public domain
- Strong's Concordance data

Target: High fidelity to original text with word-by-word analysis
"""

import os
import json
import re
import sys
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

# ============================================================================
# Data Structures
# ============================================================================

@dataclass
class WordStudy:
    """Amplified-style word study entry"""
    original: str           # Hebrew/Greek word
    transliteration: str    # Romanized spelling
    strongs: str           # Strong's number (H1234 or G1234)
    primary_meaning: str    # Main translation
    alternate_meanings: List[str]  # Other possible translations
    part_of_speech: str    # noun, verb, etc.
    root: Optional[str]    # Root word


@dataclass  
class Verse:
    """Complete verse data structure"""
    book: str
    chapter: int
    verse: int
    # Original language
    original_text: str      # Hebrew/Aramaic or Greek
    original_language: str  # 'hebrew', 'aramaic', 'greek'
    # English translations
    kjv: str
    esv: Optional[str] = None
    niv: Optional[str] = None
    nasb: Optional[str] = None
    # Word study
    words: Optional[List[WordStudy]] = None
    # Cross references
    cross_refs: Optional[List[str]] = None
    # Notes (like LDS footnotes)
    notes: Optional[List[str]] = None


# ============================================================================
# Book Definitions
# ============================================================================

OT_BOOKS = [
    # Torah/Pentateuch
    ("genesis", "Genesis", "Gen", 50),
    ("exodus", "Exodus", "Exod", 40),
    ("leviticus", "Leviticus", "Lev", 27),
    ("numbers", "Numbers", "Num", 36),
    ("deuteronomy", "Deuteronomy", "Deut", 34),
    # Historical Books
    ("joshua", "Joshua", "Josh", 24),
    ("judges", "Judges", "Judg", 21),
    ("ruth", "Ruth", "Ruth", 4),
    ("1-samuel", "1 Samuel", "1Sam", 31),
    ("2-samuel", "2 Samuel", "2Sam", 24),
    ("1-kings", "1 Kings", "1Kgs", 22),
    ("2-kings", "2 Kings", "2Kgs", 25),
    ("1-chronicles", "1 Chronicles", "1Chr", 29),
    ("2-chronicles", "2 Chronicles", "2Chr", 36),
    ("ezra", "Ezra", "Ezra", 10),
    ("nehemiah", "Nehemiah", "Neh", 13),
    ("esther", "Esther", "Esth", 10),
    # Wisdom Literature
    ("job", "Job", "Job", 42),
    ("psalms", "Psalms", "Ps", 150),
    ("proverbs", "Proverbs", "Prov", 31),
    ("ecclesiastes", "Ecclesiastes", "Eccl", 12),
    ("song-of-solomon", "Song of Solomon", "Song", 8),
    # Major Prophets
    ("isaiah", "Isaiah", "Isa", 66),
    ("jeremiah", "Jeremiah", "Jer", 52),
    ("lamentations", "Lamentations", "Lam", 5),
    ("ezekiel", "Ezekiel", "Ezek", 48),
    ("daniel", "Daniel", "Dan", 12),
    # Minor Prophets
    ("hosea", "Hosea", "Hos", 14),
    ("joel", "Joel", "Joel", 3),
    ("amos", "Amos", "Amos", 9),
    ("obadiah", "Obadiah", "Obad", 1),
    ("jonah", "Jonah", "Jonah", 4),
    ("micah", "Micah", "Mic", 7),
    ("nahum", "Nahum", "Nah", 3),
    ("habakkuk", "Habakkuk", "Hab", 3),
    ("zephaniah", "Zephaniah", "Zeph", 3),
    ("haggai", "Haggai", "Hag", 2),
    ("zechariah", "Zechariah", "Zech", 14),
    ("malachi", "Malachi", "Mal", 4),
]

NT_BOOKS = [
    # Gospels
    ("matthew", "Matthew", "Matt", 28),
    ("mark", "Mark", "Mark", 16),
    ("luke", "Luke", "Luke", 24),
    ("john", "John", "John", 21),
    # Acts
    ("acts", "Acts", "Acts", 28),
    # Pauline Epistles
    ("romans", "Romans", "Rom", 16),
    ("1-corinthians", "1 Corinthians", "1Cor", 16),
    ("2-corinthians", "2 Corinthians", "2Cor", 13),
    ("galatians", "Galatians", "Gal", 6),
    ("ephesians", "Ephesians", "Eph", 6),
    ("philippians", "Philippians", "Phil", 4),
    ("colossians", "Colossians", "Col", 4),
    ("1-thessalonians", "1 Thessalonians", "1Thess", 5),
    ("2-thessalonians", "2 Thessalonians", "2Thess", 3),
    ("1-timothy", "1 Timothy", "1Tim", 6),
    ("2-timothy", "2 Timothy", "2Tim", 4),
    ("titus", "Titus", "Titus", 3),
    ("philemon", "Philemon", "Phlm", 1),
    # General Epistles
    ("hebrews", "Hebrews", "Heb", 13),
    ("james", "James", "Jas", 5),
    ("1-peter", "1 Peter", "1Pet", 5),
    ("2-peter", "2 Peter", "2Pet", 3),
    ("1-john", "1 John", "1John", 5),
    ("2-john", "2 John", "2John", 1),
    ("3-john", "3 John", "3John", 1),
    ("jude", "Jude", "Jude", 1),
    # Apocalyptic
    ("revelation", "Revelation", "Rev", 22),
]

ALL_BOOKS = OT_BOOKS + NT_BOOKS

# ============================================================================
# Strong's Concordance Data (Key Words)
# ============================================================================

# Hebrew Strong's - Key theological terms
HEBREW_STRONGS = {
    "H430": {
        "original": "אֱלֹהִים",
        "transliteration": "Elohim",
        "primary": "God",
        "alternates": ["gods", "mighty one", "divine being", "supreme God"],
        "pos": "noun",
    },
    "H3068": {
        "original": "יְהוָה",
        "transliteration": "YHWH/Yahweh",
        "primary": "LORD",
        "alternates": ["Jehovah", "the Eternal", "the Self-Existent One"],
        "pos": "proper noun",
    },
    "H1254": {
        "original": "בָּרָא",
        "transliteration": "bara",
        "primary": "create",
        "alternates": ["shape", "form", "fashion", "make from nothing"],
        "pos": "verb",
    },
    "H7225": {
        "original": "רֵאשִׁית",
        "transliteration": "reshith",
        "primary": "beginning",
        "alternates": ["first", "chief", "firstfruits", "starting point"],
        "pos": "noun",
    },
    "H8064": {
        "original": "שָׁמַיִם",
        "transliteration": "shamayim",
        "primary": "heavens",
        "alternates": ["sky", "air", "celestial realm", "visible heavens"],
        "pos": "noun",
    },
    "H776": {
        "original": "אֶרֶץ",
        "transliteration": "erets",
        "primary": "earth",
        "alternates": ["land", "ground", "country", "territory"],
        "pos": "noun",
    },
    "H5315": {
        "original": "נֶפֶשׁ",
        "transliteration": "nephesh",
        "primary": "soul",
        "alternates": ["life", "being", "self", "person", "creature"],
        "pos": "noun",
    },
    "H7307": {
        "original": "רוּחַ",
        "transliteration": "ruach",
        "primary": "spirit",
        "alternates": ["wind", "breath", "mind", "Spirit (of God)"],
        "pos": "noun",
    },
    "H2617": {
        "original": "חֶסֶד",
        "transliteration": "chesed",
        "primary": "lovingkindness",
        "alternates": ["mercy", "steadfast love", "faithfulness", "covenant love", "grace"],
        "pos": "noun",
    },
    "H6666": {
        "original": "צְדָקָה",
        "transliteration": "tsedaqah",
        "primary": "righteousness",
        "alternates": ["justice", "rightness", "what is right", "vindication"],
        "pos": "noun",
    },
    "H539": {
        "original": "אָמַן",
        "transliteration": "aman",
        "primary": "believe",
        "alternates": ["trust", "confirm", "support", "be faithful", "be established"],
        "pos": "verb",
    },
    "H3722": {
        "original": "כָּפַר",
        "transliteration": "kaphar",
        "primary": "atone",
        "alternates": ["cover", "make atonement", "reconcile", "forgive", "purge"],
        "pos": "verb",
    },
    "H4899": {
        "original": "מָשִׁיחַ",
        "transliteration": "mashiach",
        "primary": "Messiah",
        "alternates": ["anointed one", "Christ", "the Anointed"],
        "pos": "noun",
    },
    "H1285": {
        "original": "בְּרִית",
        "transliteration": "berith",
        "primary": "covenant",
        "alternates": ["treaty", "agreement", "alliance", "pledge"],
        "pos": "noun",
    },
    "H8451": {
        "original": "תּוֹרָה",
        "transliteration": "torah",
        "primary": "law",
        "alternates": ["instruction", "teaching", "direction", "guidance"],
        "pos": "noun",
    },
}

# Greek Strong's - Key theological terms
GREEK_STRONGS = {
    "G2316": {
        "original": "θεός",
        "transliteration": "theos",
        "primary": "God",
        "alternates": ["divine being", "deity", "the Godhead"],
        "pos": "noun",
    },
    "G2962": {
        "original": "κύριος",
        "transliteration": "kyrios",
        "primary": "Lord",
        "alternates": ["master", "sir", "owner", "ruler"],
        "pos": "noun",
    },
    "G3056": {
        "original": "λόγος",
        "transliteration": "logos",
        "primary": "Word",
        "alternates": ["message", "speech", "reason", "account", "matter"],
        "pos": "noun",
    },
    "G26": {
        "original": "ἀγάπη",
        "transliteration": "agape",
        "primary": "love",
        "alternates": ["divine love", "unconditional love", "charity"],
        "pos": "noun",
    },
    "G4102": {
        "original": "πίστις",
        "transliteration": "pistis",
        "primary": "faith",
        "alternates": ["belief", "trust", "faithfulness", "conviction"],
        "pos": "noun",
    },
    "G5485": {
        "original": "χάρις",
        "transliteration": "charis",
        "primary": "grace",
        "alternates": ["favor", "blessing", "gift", "gratitude"],
        "pos": "noun",
    },
    "G1343": {
        "original": "δικαιοσύνη",
        "transliteration": "dikaiosyne",
        "primary": "righteousness",
        "alternates": ["justice", "justification", "rightness"],
        "pos": "noun",
    },
    "G4991": {
        "original": "σωτηρία",
        "transliteration": "soteria",
        "primary": "salvation",
        "alternates": ["deliverance", "preservation", "safety", "rescue"],
        "pos": "noun",
    },
    "G3340": {
        "original": "μετανοέω",
        "transliteration": "metanoeo",
        "primary": "repent",
        "alternates": ["change one's mind", "turn around", "have a change of heart"],
        "pos": "verb",
    },
    "G907": {
        "original": "βαπτίζω",
        "transliteration": "baptizo",
        "primary": "baptize",
        "alternates": ["immerse", "dip", "wash", "submerge"],
        "pos": "verb",
    },
    "G5547": {
        "original": "Χριστός",
        "transliteration": "Christos",
        "primary": "Christ",
        "alternates": ["Anointed One", "Messiah"],
        "pos": "noun",
    },
    "G4151": {
        "original": "πνεῦμα",
        "transliteration": "pneuma",
        "primary": "spirit",
        "alternates": ["Spirit", "wind", "breath", "ghost"],
        "pos": "noun",
    },
    "G932": {
        "original": "βασιλεία",
        "transliteration": "basileia",
        "primary": "kingdom",
        "alternates": ["reign", "royal power", "dominion"],
        "pos": "noun",
    },
    "G2222": {
        "original": "ζωή",
        "transliteration": "zoe",
        "primary": "life",
        "alternates": ["living", "existence", "eternal life"],
        "pos": "noun",
    },
    "G225": {
        "original": "ἀλήθεια",
        "transliteration": "aletheia",
        "primary": "truth",
        "alternates": ["reality", "sincerity", "truthfulness"],
        "pos": "noun",
    },
}

# ============================================================================
# Sample Complete Verses with Word Study
# ============================================================================

def create_sample_complete_data() -> Dict:
    """Create sample data with full word study for key verses"""
    
    data = {
        "metadata": {
            "version": "1.0",
            "created": datetime.now().isoformat(),
            "description": "Complete Bible with word study - Amplified style",
            "books_ot": len(OT_BOOKS),
            "books_nt": len(NT_BOOKS),
        },
        "books": {},
        "strongs_hebrew": HEBREW_STRONGS,
        "strongs_greek": GREEK_STRONGS,
    }
    
    # Initialize all books
    for book_id, book_name, abbrev, chapters in ALL_BOOKS:
        testament = "OT" if (book_id, book_name, abbrev, chapters) in OT_BOOKS else "NT"
        data["books"][book_id] = {
            "id": book_id,
            "name": book_name,
            "abbreviation": abbrev,
            "chapters": chapters,
            "testament": testament,
            "language": "hebrew" if testament == "OT" else "greek",
            "verses": {}
        }
    
    # Add Genesis 1:1-5 with full word study
    genesis_verses = {
        "1-1": {
            "original": "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
            "language": "hebrew",
            "kjv": "In the beginning God created the heaven and the earth.",
            "esv": "In the beginning, God created the heavens and the earth.",
            "amplified": "In the beginning [before all time] God (Elohim—Father, Son, Holy Spirit) created [by forming from nothing] the heavens and the earth.",
            "words": [
                {"strongs": "H7225", "original": "בְּרֵאשִׁית", "english": "In the beginning"},
                {"strongs": "H1254", "original": "בָּרָא", "english": "created"},
                {"strongs": "H430", "original": "אֱלֹהִים", "english": "God"},
                {"strongs": "H853", "original": "אֵת", "english": "(direct object marker)"},
                {"strongs": "H8064", "original": "הַשָּׁמַיִם", "english": "the heavens"},
                {"strongs": "H853", "original": "וְאֵת", "english": "and (marker)"},
                {"strongs": "H776", "original": "הָאָרֶץ", "english": "the earth"},
            ],
            "notes": [
                "H430 Elohim is plural in form, used with singular verbs - a hint of the Trinity",
                "H1254 bara - to create from nothing, used only of divine creation"
            ]
        },
        "1-2": {
            "original": "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
            "language": "hebrew",
            "kjv": "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.",
            "esv": "The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.",
            "amplified": "The earth was formless and void [a waste—empty and dark], and darkness was upon the face of the deep [primeval ocean]. The Spirit of God was moving (hovering, brooding) over the face of the waters.",
            "words": [
                {"strongs": "H776", "original": "וְהָאָרֶץ", "english": "And the earth"},
                {"strongs": "H1961", "original": "הָיְתָה", "english": "was"},
                {"strongs": "H8414", "original": "תֹהוּ", "english": "formless/without form"},
                {"strongs": "H922", "original": "וָבֹהוּ", "english": "and void/empty"},
                {"strongs": "H7307", "original": "וְרוּחַ", "english": "And the Spirit"},
                {"strongs": "H430", "original": "אֱלֹהִים", "english": "of God"},
                {"strongs": "H7363", "original": "מְרַחֶפֶת", "english": "was hovering/moving"},
            ],
            "notes": [
                "H7307 ruach - Spirit, wind, or breath. Here clearly the Spirit of God.",
                "H7363 rachaph - to hover, brood (like a bird over its nest)"
            ]
        },
        "1-3": {
            "original": "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר",
            "language": "hebrew",
            "kjv": "And God said, Let there be light: and there was light.",
            "esv": "And God said, \"Let there be light,\" and there was light.",
            "amplified": "And God said, \"Let there be light\"; and there was light [the creation of light was immediate].",
            "words": [
                {"strongs": "H559", "original": "וַיֹּאמֶר", "english": "And said"},
                {"strongs": "H430", "original": "אֱלֹהִים", "english": "God"},
                {"strongs": "H1961", "original": "יְהִי", "english": "Let there be"},
                {"strongs": "H216", "original": "אוֹר", "english": "light"},
                {"strongs": "H1961", "original": "וַיְהִי", "english": "and there was"},
                {"strongs": "H216", "original": "אוֹר", "english": "light"},
            ],
            "notes": [
                "H216 or - light, both physical light and metaphorical enlightenment"
            ]
        },
    }
    
    data["books"]["genesis"]["verses"] = genesis_verses
    
    # Add John 1:1-5 with full word study
    john_verses = {
        "1-1": {
            "original": "Ἐν ἀρχῇ ἦν ὁ λόγος, καὶ ὁ λόγος ἦν πρὸς τὸν θεόν, καὶ θεὸς ἦν ὁ λόγος.",
            "language": "greek",
            "kjv": "In the beginning was the Word, and the Word was with God, and the Word was God.",
            "esv": "In the beginning was the Word, and the Word was with God, and the Word was God.",
            "amplified": "In the beginning [before all time] was the Word (Christ), and the Word was with God, and the Word was God Himself.",
            "words": [
                {"strongs": "G1722", "original": "Ἐν", "english": "In"},
                {"strongs": "G746", "original": "ἀρχῇ", "english": "the beginning"},
                {"strongs": "G1510", "original": "ἦν", "english": "was"},
                {"strongs": "G3588", "original": "ὁ", "english": "the"},
                {"strongs": "G3056", "original": "λόγος", "english": "Word"},
                {"strongs": "G2316", "original": "θεόν", "english": "God"},
            ],
            "notes": [
                "G3056 logos - Word, also reason, message. John identifies Jesus as the eternal Word.",
                "The Greek grammar emphasizes the Word's deity while distinguishing persons."
            ]
        },
        "1-14": {
            "original": "Καὶ ὁ λόγος σὰρξ ἐγένετο καὶ ἐσκήνωσεν ἐν ἡμῖν",
            "language": "greek",
            "kjv": "And the Word was made flesh, and dwelt among us",
            "esv": "And the Word became flesh and dwelt among us",
            "amplified": "And the Word (Christ) became flesh and lived among us [as a human being], and we saw His glory",
            "words": [
                {"strongs": "G3056", "original": "λόγος", "english": "Word"},
                {"strongs": "G4561", "original": "σὰρξ", "english": "flesh"},
                {"strongs": "G1096", "original": "ἐγένετο", "english": "became"},
                {"strongs": "G4637", "original": "ἐσκήνωσεν", "english": "dwelt/tabernacled"},
            ],
            "notes": [
                "G4637 skenoo - to pitch a tent, tabernacle. Christ 'pitched his tent' among us.",
                "This is the doctrine of the Incarnation - God becoming man."
            ]
        },
    }
    
    data["books"]["john"]["verses"] = john_verses
    
    # Add Psalm 23 with word study
    psalm23_verses = {
        "1-1": {
            "original": "מִזְמוֹר לְדָוִד יְהוָה רֹעִי לֹא אֶחְסָר",
            "language": "hebrew",
            "kjv": "The LORD is my shepherd; I shall not want.",
            "esv": "The LORD is my shepherd; I shall not want.",
            "amplified": "The LORD is my Shepherd [to feed, to guide, and to shield me], I shall not lack [anything].",
            "words": [
                {"strongs": "H3068", "original": "יְהוָה", "english": "The LORD (YHWH)"},
                {"strongs": "H7462", "original": "רֹעִי", "english": "my shepherd"},
                {"strongs": "H3808", "original": "לֹא", "english": "not"},
                {"strongs": "H2637", "original": "אֶחְסָר", "english": "I shall lack/want"},
            ],
            "notes": [
                "H3068 YHWH - The divine name, often translated LORD (all caps)",
                "H7462 ra'ah - to shepherd, tend, feed. David the shepherd knew this intimately."
            ]
        },
    }
    
    data["books"]["psalms"]["verses"] = psalm23_verses
    
    return data


# ============================================================================
# Export Functions
# ============================================================================

def save_complete_bible(data: Dict, output_dir: str = "public/lib/complete-bible"):
    """Save complete Bible data to JSON files"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Save main index
    index_file = os.path.join(output_dir, "index.json")
    index_data = {
        "metadata": data["metadata"],
        "books": [
            {
                "id": book_id,
                "name": book_data["name"],
                "abbreviation": book_data["abbreviation"],
                "chapters": book_data["chapters"],
                "testament": book_data["testament"],
                "language": book_data["language"],
            }
            for book_id, book_data in data["books"].items()
        ],
    }
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved index: {index_file}")
    
    # Save Strong's concordance
    strongs_file = os.path.join(output_dir, "strongs.json")
    strongs_data = {
        "hebrew": data["strongs_hebrew"],
        "greek": data["strongs_greek"],
    }
    with open(strongs_file, 'w', encoding='utf-8') as f:
        json.dump(strongs_data, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved Strong's concordance: {strongs_file}")
    
    # Save each book
    books_dir = os.path.join(output_dir, "books")
    os.makedirs(books_dir, exist_ok=True)
    
    for book_id, book_data in data["books"].items():
        if book_data.get("verses"):
            book_file = os.path.join(books_dir, f"{book_id}.json")
            with open(book_file, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False, indent=2)
            print(f"  📖 Saved: {book_id}.json")
    
    print(f"\n✅ Complete Bible data saved to: {output_dir}")


def main():
    print("=" * 60)
    print("Complete Bible Download & Structure")
    print("With Amplified-style Word Study")
    print("=" * 60)
    
    # Create sample complete data
    print("\nCreating Bible data structure...")
    data = create_sample_complete_data()
    
    print(f"\n📊 Summary:")
    print(f"   OT Books: {len(OT_BOOKS)}")
    print(f"   NT Books: {len(NT_BOOKS)}")
    print(f"   Hebrew Strong's entries: {len(HEBREW_STRONGS)}")
    print(f"   Greek Strong's entries: {len(GREEK_STRONGS)}")
    
    # Save data
    print("\n💾 Saving files...")
    save_complete_bible(data)
    
    # Instructions for full download
    print("\n" + "=" * 60)
    print("NEXT STEPS FOR FULL BIBLE DATA")
    print("=" * 60)
    print("""
To download complete Hebrew OT with Strong's numbers:

1. Open Scriptures Hebrew Bible (OSHB):
   https://github.com/openscriptures/morphhb
   - Full Hebrew OT with morphology and Strong's

2. STEP Bible Data:
   https://github.com/STEPBible/STEPBible-Data
   - Comprehensive word-by-word analysis
   - Strong's concordance mappings

3. Scrollmapper Bible Databases:
   https://github.com/scrollmapper/bible_databases
   - SQL databases with Hebrew, Greek, and English

Run: python3 download_from_sources.py (to be created)
""")


if __name__ == "__main__":
    main()

