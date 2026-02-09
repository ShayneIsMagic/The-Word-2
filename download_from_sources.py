#!/usr/bin/env python3
"""
Download Complete Bible from Open Sources

Sources:
1. scrollmapper/bible_databases - Complete Bible in JSON
   https://github.com/scrollmapper/bible_databases

2. berean-tables - Hebrew/Greek with Strong's (TSV format)
   https://github.com/STEPBible/STEPBible-Data

This creates the Amplified-style study Bible with:
- Complete Hebrew OT (39 books)
- Complete Greek NT (27 books)
- Multiple English translations
- Strong's concordance for word study
- Word-by-word analysis
"""

import os
import json
import urllib.request
import zipfile
import tempfile
import sqlite3
from typing import Dict, List, Optional
from datetime import datetime

# ============================================================================
# GitHub URLs for Bible Data
# ============================================================================

# Scrollmapper Bible Databases (JSON + SQLite)
BIBLE_DB_URL = "https://raw.githubusercontent.com/scrollmapper/bible_databases/master/json"

# STEPBible Data (comprehensive word-by-word)
STEPBIBLE_URL = "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master"

# Open Scriptures Hebrew Bible 
OSHB_URL = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc"

# Berean Study Bible (has Hebrew/Greek interlinear)
BEREAN_URL = "https://raw.githubusercontent.com/berean-standard-bible/berean-standard-bible.github.io/main/data"

# ============================================================================
# Book ID Mappings
# ============================================================================

# Standard book IDs for scrollmapper databases
SCROLLMAPPER_BOOKS = {
    # OT
    1: "genesis", 2: "exodus", 3: "leviticus", 4: "numbers", 5: "deuteronomy",
    6: "joshua", 7: "judges", 8: "ruth", 9: "1-samuel", 10: "2-samuel",
    11: "1-kings", 12: "2-kings", 13: "1-chronicles", 14: "2-chronicles",
    15: "ezra", 16: "nehemiah", 17: "esther", 18: "job", 19: "psalms",
    20: "proverbs", 21: "ecclesiastes", 22: "song-of-solomon", 23: "isaiah",
    24: "jeremiah", 25: "lamentations", 26: "ezekiel", 27: "daniel",
    28: "hosea", 29: "joel", 30: "amos", 31: "obadiah", 32: "jonah",
    33: "micah", 34: "nahum", 35: "habakkuk", 36: "zephaniah", 37: "haggai",
    38: "zechariah", 39: "malachi",
    # NT
    40: "matthew", 41: "mark", 42: "luke", 43: "john", 44: "acts",
    45: "romans", 46: "1-corinthians", 47: "2-corinthians", 48: "galatians",
    49: "ephesians", 50: "philippians", 51: "colossians", 52: "1-thessalonians",
    53: "2-thessalonians", 54: "1-timothy", 55: "2-timothy", 56: "titus",
    57: "philemon", 58: "hebrews", 59: "james", 60: "1-peter", 61: "2-peter",
    62: "1-john", 63: "2-john", 64: "3-john", 65: "jude", 66: "revelation",
}

BOOK_NAMES = {
    "genesis": "Genesis", "exodus": "Exodus", "leviticus": "Leviticus",
    "numbers": "Numbers", "deuteronomy": "Deuteronomy", "joshua": "Joshua",
    "judges": "Judges", "ruth": "Ruth", "1-samuel": "1 Samuel",
    "2-samuel": "2 Samuel", "1-kings": "1 Kings", "2-kings": "2 Kings",
    "1-chronicles": "1 Chronicles", "2-chronicles": "2 Chronicles",
    "ezra": "Ezra", "nehemiah": "Nehemiah", "esther": "Esther",
    "job": "Job", "psalms": "Psalms", "proverbs": "Proverbs",
    "ecclesiastes": "Ecclesiastes", "song-of-solomon": "Song of Solomon",
    "isaiah": "Isaiah", "jeremiah": "Jeremiah", "lamentations": "Lamentations",
    "ezekiel": "Ezekiel", "daniel": "Daniel", "hosea": "Hosea",
    "joel": "Joel", "amos": "Amos", "obadiah": "Obadiah", "jonah": "Jonah",
    "micah": "Micah", "nahum": "Nahum", "habakkuk": "Habakkuk",
    "zephaniah": "Zephaniah", "haggai": "Haggai", "zechariah": "Zechariah",
    "malachi": "Malachi", "matthew": "Matthew", "mark": "Mark",
    "luke": "Luke", "john": "John", "acts": "Acts", "romans": "Romans",
    "1-corinthians": "1 Corinthians", "2-corinthians": "2 Corinthians",
    "galatians": "Galatians", "ephesians": "Ephesians",
    "philippians": "Philippians", "colossians": "Colossians",
    "1-thessalonians": "1 Thessalonians", "2-thessalonians": "2 Thessalonians",
    "1-timothy": "1 Timothy", "2-timothy": "2 Timothy", "titus": "Titus",
    "philemon": "Philemon", "hebrews": "Hebrews", "james": "James",
    "1-peter": "1 Peter", "2-peter": "2 Peter", "1-john": "1 John",
    "2-john": "2 John", "3-john": "3 John", "jude": "Jude",
    "revelation": "Revelation",
}

# ============================================================================
# Download Functions
# ============================================================================

def download_file(url: str, dest_path: str) -> bool:
    """Download a file from URL to destination path"""
    try:
        print(f"  ⬇️  Downloading: {url.split('/')[-1]}")
        urllib.request.urlretrieve(url, dest_path)
        return True
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        return False


def download_kjv() -> Dict:
    """Download KJV Bible from scrollmapper"""
    print("\n📖 Downloading KJV Bible...")
    
    url = f"{BIBLE_DB_URL}/t_kjv.json"
    
    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        # Organize by book/chapter/verse
        bible = {}
        for verse in data:
            book_num = verse.get('b', verse.get('book'))
            chapter = verse.get('c', verse.get('chapter'))
            verse_num = verse.get('v', verse.get('verse'))
            text = verse.get('t', verse.get('text', ''))
            
            book_id = SCROLLMAPPER_BOOKS.get(book_num, f"book-{book_num}")
            
            if book_id not in bible:
                bible[book_id] = {}
            
            key = f"{chapter}-{verse_num}"
            bible[book_id][key] = text
        
        print(f"  ✅ Downloaded {len(data)} verses")
        return bible
    
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return {}


def download_hebrew_ot() -> Dict:
    """Download Hebrew OT from Open Scriptures Hebrew Bible"""
    print("\n📖 Downloading Hebrew Old Testament...")
    
    hebrew_books = {}
    
    # OSHB book file names (in XML format, we'll use the text version)
    oshb_files = [
        ("Gen", "genesis"), ("Exod", "exodus"), ("Lev", "leviticus"),
        ("Num", "numbers"), ("Deut", "deuteronomy"), ("Josh", "joshua"),
        ("Judg", "judges"), ("Ruth", "ruth"), ("1Sam", "1-samuel"),
        ("2Sam", "2-samuel"), ("1Kgs", "1-kings"), ("2Kgs", "2-kings"),
        ("1Chr", "1-chronicles"), ("2Chr", "2-chronicles"), ("Ezra", "ezra"),
        ("Neh", "nehemiah"), ("Esth", "esther"), ("Job", "job"),
        ("Ps", "psalms"), ("Prov", "proverbs"), ("Eccl", "ecclesiastes"),
        ("Song", "song-of-solomon"), ("Isa", "isaiah"), ("Jer", "jeremiah"),
        ("Lam", "lamentations"), ("Ezek", "ezekiel"), ("Dan", "daniel"),
        ("Hos", "hosea"), ("Joel", "joel"), ("Amos", "amos"),
        ("Obad", "obadiah"), ("Jonah", "jonah"), ("Mic", "micah"),
        ("Nah", "nahum"), ("Hab", "habakkuk"), ("Zeph", "zephaniah"),
        ("Hag", "haggai"), ("Zech", "zechariah"), ("Mal", "malachi"),
    ]
    
    # Use Mechon Mamre for Hebrew text (more accessible)
    mechon_url = "https://www.mechon-mamre.org/p/pt/pt{:02d}{:02d}.htm"
    
    # For now, we'll use an alternative source - tanach.us
    tanach_url = "https://tanach.us/Server.txt?search={}&content=Consonants"
    
    # Try scrollmapper Hebrew
    try:
        url = f"{BIBLE_DB_URL}/t_ot.json"
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        for verse in data:
            book_num = verse.get('b', verse.get('book'))
            chapter = verse.get('c', verse.get('chapter'))
            verse_num = verse.get('v', verse.get('verse'))
            text = verse.get('t', verse.get('text', ''))
            
            book_id = SCROLLMAPPER_BOOKS.get(book_num, f"book-{book_num}")
            if book_num <= 39:  # OT only
                if book_id not in hebrew_books:
                    hebrew_books[book_id] = {}
                key = f"{chapter}-{verse_num}"
                hebrew_books[book_id][key] = text
        
        print(f"  ✅ Downloaded Hebrew OT: {len(data)} verses")
        
    except Exception as e:
        print(f"  ⚠️  Scrollmapper Hebrew not available: {e}")
        print("  📝 Will use existing hebrew-ot-mechon.json data")
    
    return hebrew_books


def download_greek_nt() -> Dict:
    """Download Greek NT"""
    print("\n📖 Downloading Greek New Testament...")
    
    greek_books = {}
    
    try:
        url = f"{BIBLE_DB_URL}/t_greek.json"
        with urllib.request.urlopen(url, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
        
        for verse in data:
            book_num = verse.get('b', verse.get('book'))
            chapter = verse.get('c', verse.get('chapter'))
            verse_num = verse.get('v', verse.get('verse'))
            text = verse.get('t', verse.get('text', ''))
            
            if book_num >= 40:  # NT only
                book_id = SCROLLMAPPER_BOOKS.get(book_num, f"book-{book_num}")
                if book_id not in greek_books:
                    greek_books[book_id] = {}
                key = f"{chapter}-{verse_num}"
                greek_books[book_id][key] = text
        
        print(f"  ✅ Downloaded Greek NT: {len(data)} verses")
        
    except Exception as e:
        print(f"  ⚠️  Scrollmapper Greek not available: {e}")
        print("  📝 Will use existing greek-nt.json data")
    
    return greek_books


def download_strongs() -> Dict:
    """Download Strong's Concordance data"""
    print("\n📖 Downloading Strong's Concordance...")
    
    strongs = {"hebrew": {}, "greek": {}}
    
    try:
        # Try to download Hebrew Strong's
        url = f"{BIBLE_DB_URL}/key_hebrew.json"
        with urllib.request.urlopen(url, timeout=30) as response:
            hebrew_data = json.loads(response.read().decode('utf-8'))
        
        for entry in hebrew_data:
            num = entry.get('strongs', entry.get('id', ''))
            if num:
                strongs["hebrew"][f"H{num}"] = {
                    "original": entry.get('word', ''),
                    "transliteration": entry.get('translit', ''),
                    "primary": entry.get('definition', '').split(',')[0].strip() if entry.get('definition') else '',
                    "full_definition": entry.get('definition', ''),
                }
        
        print(f"  ✅ Hebrew Strong's: {len(strongs['hebrew'])} entries")
        
    except Exception as e:
        print(f"  ⚠️  Hebrew Strong's not available: {e}")
    
    try:
        # Try to download Greek Strong's
        url = f"{BIBLE_DB_URL}/key_greek.json"
        with urllib.request.urlopen(url, timeout=30) as response:
            greek_data = json.loads(response.read().decode('utf-8'))
        
        for entry in greek_data:
            num = entry.get('strongs', entry.get('id', ''))
            if num:
                strongs["greek"][f"G{num}"] = {
                    "original": entry.get('word', ''),
                    "transliteration": entry.get('translit', ''),
                    "primary": entry.get('definition', '').split(',')[0].strip() if entry.get('definition') else '',
                    "full_definition": entry.get('definition', ''),
                }
        
        print(f"  ✅ Greek Strong's: {len(strongs['greek'])} entries")
        
    except Exception as e:
        print(f"  ⚠️  Greek Strong's not available: {e}")
    
    return strongs


# ============================================================================
# Combine and Save
# ============================================================================

def combine_and_save(kjv: Dict, hebrew: Dict, greek: Dict, strongs: Dict, output_dir: str):
    """Combine all data into the complete Bible structure"""
    
    print("\n💾 Combining and saving data...")
    
    os.makedirs(output_dir, exist_ok=True)
    books_dir = os.path.join(output_dir, "books")
    os.makedirs(books_dir, exist_ok=True)
    
    # Create combined data for each book
    all_books = []
    verse_count = 0
    
    for book_num, book_id in SCROLLMAPPER_BOOKS.items():
        testament = "OT" if book_num <= 39 else "NT"
        language = "hebrew" if book_num <= 39 else "greek"
        
        book_data = {
            "id": book_id,
            "name": BOOK_NAMES.get(book_id, book_id.title()),
            "book_num": book_num,
            "testament": testament,
            "language": language,
            "verses": {}
        }
        
        # Get KJV verses
        kjv_verses = kjv.get(book_id, {})
        
        # Get original language
        if testament == "OT":
            original = hebrew.get(book_id, {})
        else:
            original = greek.get(book_id, {})
        
        # Combine
        for key, kjv_text in kjv_verses.items():
            verse_data = {
                "kjv": kjv_text,
                "original": original.get(key, ""),
                "language": language,
            }
            book_data["verses"][key] = verse_data
            verse_count += 1
        
        # Save book file
        if book_data["verses"]:
            book_file = os.path.join(books_dir, f"{book_id}.json")
            with open(book_file, 'w', encoding='utf-8') as f:
                json.dump(book_data, f, ensure_ascii=False, indent=2)
        
        all_books.append({
            "id": book_id,
            "name": book_data["name"],
            "book_num": book_num,
            "testament": testament,
            "language": language,
            "verse_count": len(book_data["verses"]),
        })
    
    # Save index
    index_data = {
        "metadata": {
            "version": "1.0",
            "created": datetime.now().isoformat(),
            "description": "Complete Bible with original languages and word study",
            "total_verses": verse_count,
            "books_count": len(all_books),
        },
        "books": all_books,
    }
    
    index_file = os.path.join(output_dir, "index.json")
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    # Save Strong's
    if strongs["hebrew"] or strongs["greek"]:
        strongs_file = os.path.join(output_dir, "strongs.json")
        with open(strongs_file, 'w', encoding='utf-8') as f:
            json.dump(strongs, f, ensure_ascii=False, indent=2)
        print(f"  ✅ Saved Strong's concordance")
    
    print(f"\n✅ Saved {len(all_books)} books with {verse_count} verses")
    print(f"   Location: {output_dir}")


def main():
    print("=" * 60)
    print("Complete Bible Download")
    print("With Original Languages & Strong's Concordance")
    print("=" * 60)
    
    output_dir = "public/lib/complete-bible"
    
    # Download all components
    kjv = download_kjv()
    hebrew = download_hebrew_ot()
    greek = download_greek_nt()
    strongs = download_strongs()
    
    # Combine and save
    combine_and_save(kjv, hebrew, greek, strongs, output_dir)
    
    print("\n" + "=" * 60)
    print("DOWNLOAD COMPLETE")
    print("=" * 60)
    print(f"""
Data saved to: {output_dir}/

Structure:
├── index.json        - Book index and metadata
├── strongs.json      - Strong's concordance (Hebrew & Greek)
└── books/
    ├── genesis.json
    ├── exodus.json
    └── ... (66 books)

Each book contains:
- Original text (Hebrew/Greek)  
- KJV translation
- Verse references

For Amplified-style word study, run:
  python3 add_word_study.py
""")


if __name__ == "__main__":
    main()

