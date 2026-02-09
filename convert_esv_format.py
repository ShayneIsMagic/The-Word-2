#!/usr/bin/env python3
"""
Convert ESV flat format to nested book/chapter/verse structure
"""

import json
import re
from collections import defaultdict

# Read the flat ESV file
with open('public/lib/original-texts/esv-bible.json', 'r', encoding='utf-8') as f:
    flat_data = json.load(f)

# Book name mapping (lowercase to proper case)
BOOK_NAMES = {
    'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus',
    'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua',
    'judges': 'Judges', 'ruth': 'Ruth', '1-samuel': '1 Samuel', '2-samuel': '2 Samuel',
    '1-kings': '1 Kings', '2-kings': '2 Kings', '1-chronicles': '1 Chronicles',
    '2-chronicles': '2 Chronicles', 'ezra': 'Ezra', 'nehemiah': 'Nehemiah',
    'esther': 'Esther', 'job': 'Job', 'psalms': 'Psalms', 'proverbs': 'Proverbs',
    'ecclesiastes': 'Ecclesiastes', 'song-of-solomon': 'Song of Solomon',
    'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
    'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel',
    'amos': 'Amos', 'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah',
    'nahum': 'Nahum', 'habakkuk': 'Habakkuk', 'zephaniah': 'Zephaniah',
    'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
    'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
    'acts': 'Acts', 'romans': 'Romans', '1-corinthians': '1 Corinthians',
    '2-corinthians': '2 Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
    'philippians': 'Philippians', 'colossians': 'Colossians',
    '1-thessalonians': '1 Thessalonians', '2-thessalonians': '2 Thessalonians',
    '1-timothy': '1 Timothy', '2-timothy': '2 Timothy', 'titus': 'Titus',
    'philemon': 'Philemon', 'hebrews': 'Hebrews', 'james': 'James',
    '1-peter': '1 Peter', '2-peter': '2 Peter', '1-john': '1 John',
    '2-john': '2 John', '3-john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation'
}

# Parse all keys and organize by book/chapter/verse
books_data = defaultdict(lambda: defaultdict(list))

for key, text in flat_data.items():
    # Parse key like "genesis-1-1" or "1-samuel-1-1"
    match = re.match(r'^(.+)-(\d+)-(\d+)$', key)
    if match:
        book_key = match.group(1)
        chapter = int(match.group(2))
        verse = int(match.group(3))
        
        book_name = BOOK_NAMES.get(book_key, book_key.replace('-', ' ').title())
        books_data[book_name][chapter].append({
            'verse': verse,
            'text': text
        })

# Build the nested structure
result = {
    'translation': 'ESV: English Standard Version',
    'books': []
}

# Sort books in biblical order
book_order = list(BOOK_NAMES.values())

for book_name in book_order:
    if book_name in books_data:
        chapters = []
        for chapter_num in sorted(books_data[book_name].keys()):
            verses = sorted(books_data[book_name][chapter_num], key=lambda v: v['verse'])
            chapters.append({
                'chapter': chapter_num,
                'verses': verses
            })
        
        result['books'].append({
            'name': book_name,
            'chapters': chapters
        })

# Write the converted file
with open('public/lib/original-texts/esv-bible.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"✓ Converted ESV to nested format")
print(f"  Books: {len(result['books'])}")
total_verses = sum(len(ch['verses']) for b in result['books'] for ch in b['chapters'])
print(f"  Total verses: {total_verses}")



