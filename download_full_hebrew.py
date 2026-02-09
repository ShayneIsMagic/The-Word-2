#!/usr/bin/env python3
"""
Download Complete Hebrew Old Testament
From Open Scriptures Hebrew Bible (OSHB) - morphhb repository

This provides:
- Complete Hebrew text for all 39 OT books
- All 23,145 verses
- Unicode Hebrew with vowels (niqqud)
"""

import os
import json
import requests
import xml.etree.ElementTree as ET
from typing import Dict, List, Optional
from pathlib import Path
import time

# ============================================================================
# Configuration
# ============================================================================

OUTPUT_DIR = "public/lib/original-texts"

# Open Scriptures Hebrew Bible - OSIS XML files
# These contain the complete BHS text with morphology
OSHB_BASE = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc"

# Book mapping: OSHB filename -> (book_id, full_name, chapters)
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

# Alternative: Direct text from Tanach.us (simpler format)
TANACH_BASE = "https://www.tanach.us/TextFiles"

# ============================================================================
# Download Functions
# ============================================================================

def download_oshb_book(abbrev: str) -> Optional[str]:
    """Download OSIS XML for a book from OSHB"""
    url = f"{OSHB_BASE}/{abbrev}.xml"
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"    ❌ Failed to download {abbrev}: {e}")
        return None


def parse_oshb_xml(xml_content: str) -> Dict[str, Dict[str, str]]:
    """
    Parse OSHB OSIS XML to extract verses
    Returns: { "chapter": { "verse": "hebrew_text" } }
    """
    verses = {}
    
    try:
        # OSIS XML namespace
        ns = {'osis': 'http://www.bibletechnologies.net/2003/OSIS/namespace'}
        root = ET.fromstring(xml_content)
        
        # Find all verse elements
        for verse in root.findall('.//osis:verse', ns):
            osisID = verse.get('osisID', '')
            if not osisID:
                continue
            
            # Parse osisID like "Gen.1.1"
            parts = osisID.split('.')
            if len(parts) >= 3:
                chapter = parts[1]
                verse_num = parts[2]
                
                # Extract Hebrew text from word elements
                words = []
                for w in verse.findall('.//osis:w', ns):
                    if w.text:
                        words.append(w.text)
                
                hebrew_text = ' '.join(words)
                
                if chapter not in verses:
                    verses[chapter] = {}
                verses[chapter][verse_num] = hebrew_text
                
    except ET.ParseError as e:
        print(f"    XML Parse error: {e}")
    
    return verses


# ============================================================================
# Alternative: Use getbible.net API (simpler)
# ============================================================================

def download_from_getbible(book_id: str, book_name: str, chapters: int) -> Dict:
    """
    Download Hebrew text from getbible.net API
    This is a simpler approach with JSON output
    """
    base_url = "https://getbible.net/v2/codex"  # Codex = Hebrew Bible
    
    book_data = {
        "name": book_name,
        "chapters": {}
    }
    
    # Map our book IDs to getbible book numbers
    book_num_map = {
        "genesis": 1, "exodus": 2, "leviticus": 3, "numbers": 4, "deuteronomy": 5,
        "joshua": 6, "judges": 7, "ruth": 8, "1-samuel": 9, "2-samuel": 10,
        "1-kings": 11, "2-kings": 12, "1-chronicles": 13, "2-chronicles": 14,
        "ezra": 15, "nehemiah": 16, "esther": 17, "job": 18, "psalms": 19,
        "proverbs": 20, "ecclesiastes": 21, "song-of-solomon": 22, "isaiah": 23,
        "jeremiah": 24, "lamentations": 25, "ezekiel": 26, "daniel": 27,
        "hosea": 28, "joel": 29, "amos": 30, "obadiah": 31, "jonah": 32,
        "micah": 33, "nahum": 34, "habakkuk": 35, "zephaniah": 36, "haggai": 37,
        "zechariah": 38, "malachi": 39
    }
    
    book_num = book_num_map.get(book_id, 0)
    if book_num == 0:
        return book_data
    
    for ch in range(1, chapters + 1):
        try:
            url = f"{base_url}/{book_num}/{ch}.json"
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                chapter_data = response.json()
                book_data["chapters"][str(ch)] = {}
                
                if "verses" in chapter_data:
                    for verse in chapter_data["verses"]:
                        v_num = str(verse.get("verse", ""))
                        v_text = verse.get("text", "")
                        if v_num and v_text:
                            book_data["chapters"][str(ch)][v_num] = v_text
                            
            time.sleep(0.1)  # Rate limiting
        except Exception as e:
            print(f"      Ch {ch} failed: {e}")
    
    return book_data


# ============================================================================
# Alternative: Scripture API (most reliable)
# ============================================================================

def download_from_scripture_api():
    """
    Download from scripture.api.bible (requires API key)
    Or use local BHS data
    """
    pass


# ============================================================================
# Build from existing Greek NT pattern
# ============================================================================

def create_hebrew_ot_from_web():
    """
    Create complete Hebrew OT by downloading from multiple sources
    """
    print("=" * 60)
    print("Downloading Complete Hebrew Old Testament")
    print("=" * 60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    hebrew_ot = {
        "metadata": {
            "version": "1.0",
            "source": "Open Scriptures Hebrew Bible (BHS)",
            "language": "hebrew",
            "total_books": 39,
            "encoding": "UTF-8"
        },
        "books": {}
    }
    
    total_verses = 0
    
    for abbrev, book_id, book_name, chapters in OT_BOOKS:
        print(f"\n📖 {book_name} ({chapters} chapters)...")
        
        # Try OSHB first
        xml_content = download_oshb_book(abbrev)
        
        if xml_content:
            verses = parse_oshb_xml(xml_content)
            if verses:
                hebrew_ot["books"][book_id] = {
                    "name": book_name,
                    "abbreviation": abbrev,
                    "chapters": verses
                }
                
                # Count verses
                book_verses = sum(len(ch_verses) for ch_verses in verses.values())
                total_verses += book_verses
                print(f"    ✅ {book_verses} verses")
            else:
                print(f"    ⚠️ No verses parsed")
        else:
            # Fallback: try getbible.net
            print(f"    Trying alternative source...")
            book_data = download_from_getbible(book_id, book_name, chapters)
            
            if book_data["chapters"]:
                hebrew_ot["books"][book_id] = book_data
                book_verses = sum(len(ch) for ch in book_data["chapters"].values())
                total_verses += book_verses
                print(f"    ✅ {book_verses} verses (from getbible)")
            else:
                print(f"    ❌ Could not download")
        
        time.sleep(0.5)  # Rate limiting
    
    # Save
    output_file = f"{OUTPUT_DIR}/hebrew-ot-complete.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(hebrew_ot, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Total books: {len(hebrew_ot['books'])}")
    print(f"Total verses: {total_verses}")
    print(f"Saved to: {output_file}")
    
    return hebrew_ot


# ============================================================================
# Quick Alternative: Use existing tanach.us text files
# ============================================================================

def download_tanach_text():
    """
    Download plain Hebrew text from tanach.us
    Format: Simple verse-per-line text files
    """
    print("\n📥 Downloading from tanach.us...")
    
    hebrew_data = {}
    
    # Tanach.us book codes
    tanach_codes = {
        "genesis": "c01",
        "exodus": "c02", 
        "leviticus": "c03",
        # ... etc
    }
    
    for book_id, code in tanach_codes.items():
        url = f"{TANACH_BASE}/{code}.txt"
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                # Parse text file format
                text = response.text
                # Process lines...
                hebrew_data[book_id] = text
                print(f"  ✅ {book_id}")
        except Exception as e:
            print(f"  ❌ {book_id}: {e}")
    
    return hebrew_data


# ============================================================================
# Main
# ============================================================================

def main():
    print("\n" + "=" * 70)
    print("  HEBREW OLD TESTAMENT DOWNLOAD")
    print("  For Amplified Bible-Style Study")
    print("=" * 70)
    
    # Create the complete Hebrew OT
    hebrew_ot = create_hebrew_ot_from_web()
    
    # Also update the existing mechon file with new data
    mechon_file = f"{OUTPUT_DIR}/hebrew-ot-mechon.json"
    if os.path.exists(mechon_file):
        print(f"\n📝 Updating {mechon_file}...")
        try:
            with open(mechon_file, 'r', encoding='utf-8') as f:
                existing = json.load(f)
            
            # Merge new data into existing
            for book_id, book_data in hebrew_ot.get("books", {}).items():
                if book_id not in existing:
                    existing[book_id] = book_data
            
            with open(mechon_file, 'w', encoding='utf-8') as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
            print("  ✅ Updated")
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    print("\n✅ Hebrew OT download complete!")
    print(f"   Access at: http://localhost:3002/amplified")


if __name__ == "__main__":
    main()



