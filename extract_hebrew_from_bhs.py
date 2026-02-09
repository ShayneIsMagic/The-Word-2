#!/usr/bin/env python3
"""
Extract Hebrew from BHS-ESV Interlinear PDF
Extracts Hebrew text and saves to public/lib/original-texts/hebrew-ot-mechon.json
"""

import os
import re
import json
import sys
from typing import Dict, List, Tuple

# Try to import pdfminer
try:
    from pdfminer.high_level import extract_text
except ImportError:
    print("ERROR: pdfminer.six not installed.")
    print("Run: pip install pdfminer.six")
    sys.exit(1)

# Add backend scripts to path for language detection
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'scripts'))
try:
    from language_detector import detect_language, extract_hebrew
except ImportError:
    # Fallback
    def detect_language(text):
        return {'language': 'unknown', 'confidence': 0.0, 'matches': []}
    def extract_hebrew(text):
        return ' '.join(re.findall(r'[\u0590-\u05FF]+', text))

# Configuration
BHS_PDF_FILES = [
    "BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf",  # Best for Hebrew
    "BHS-ESV Interlinear OT-OCR.pdf",
    "BHS-ESV Interlinear OT.pdf",
]

OUTPUT_FILE = "public/lib/original-texts/hebrew-ot-mechon.json"

# Hebrew Unicode pattern
HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF\u05B0-\u05BC\u05C1-\u05C2\u05C4-\u05C5\u05C7]+')

# OT book chapter counts
OT_BOOKS = {
    'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
    'joshua': 24, 'judges': 21, 'ruth': 4, '1-samuel': 31, '2-samuel': 24,
    '1-kings': 22, '2-kings': 25, '1-chronicles': 29, '2-chronicles': 36,
    'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42, 'psalms': 150,
    'proverbs': 31, 'ecclesiastes': 12, 'song-of-solomon': 8, 'isaiah': 66,
    'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
    'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4, 'micah': 7,
    'nahum': 3, 'habakkuk': 3, 'zephaniah': 3, 'haggai': 2, 'zechariah': 14, 'malachi': 4
}


def find_bhs_pdf() -> str:
    """Find the best BHS PDF file to use"""
    for pdf in BHS_PDF_FILES:
        if os.path.exists(pdf):
            return pdf
    print("ERROR: No BHS PDF found. Expected one of:")
    for pdf in BHS_PDF_FILES:
        print(f"  - {pdf}")
    sys.exit(1)


def extract_hebrew_text(pdf_path: str) -> str:
    """Extract all text from PDF"""
    print(f"Extracting text from {pdf_path}...")
    text = extract_text(pdf_path)
    print(f"Extracted {len(text)} characters")
    return text


def parse_verses_from_text(text: str) -> Dict[str, str]:
    """
    Parse Hebrew verses from extracted text
    Returns dict with keys like 'genesis-1-1' and Hebrew text values
    """
    verses = {}
    
    # Extract Hebrew text segments
    hebrew_segments = HEBREW_PATTERN.findall(text)
    print(f"Found {len(hebrew_segments)} Hebrew text segments")
    
    # For BHS-ESV interlinear, we need to associate Hebrew with verse refs
    # Look for verse patterns like "1:1", "1:2", etc.
    
    # Split text into lines for better parsing
    lines = text.split('\n')
    
    current_book = 'genesis'
    current_chapter = 1
    current_verse = 0
    
    verse_pattern = re.compile(r'(\d+):(\d+)')
    book_patterns = [
        (r'genesis|בראשית', 'genesis'),
        (r'exodus|שמות', 'exodus'),
        (r'leviticus|ויקרא', 'leviticus'),
        (r'numbers|במדבר', 'numbers'),
        (r'deuteronomy|דברים', 'deuteronomy'),
    ]
    
    for line in lines:
        # Check for book headers
        for pattern, book_id in book_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                current_book = book_id
                current_chapter = 1
                current_verse = 0
                break
        
        # Check for chapter:verse references
        verse_match = verse_pattern.search(line)
        if verse_match:
            current_chapter = int(verse_match.group(1))
            current_verse = int(verse_match.group(2))
        
        # Extract Hebrew from this line
        hebrew_in_line = HEBREW_PATTERN.findall(line)
        if hebrew_in_line and current_verse > 0:
            key = f"{current_book}-{current_chapter}-{current_verse}"
            hebrew_text = ' '.join(hebrew_in_line)
            if key not in verses:
                verses[key] = hebrew_text
            else:
                # Append if we already have some text
                verses[key] += ' ' + hebrew_text
    
    return verses


def create_sample_hebrew_data() -> Dict[str, str]:
    """
    Create sample Hebrew data for common verses
    This provides immediate data while full extraction is being developed
    """
    return {
        # Genesis 1
        "genesis-1-1": "בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ",
        "genesis-1-2": "וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ וְחֹשֶׁךְ עַל־פְּנֵי תְהוֹם וְרוּחַ אֱלֹהִים מְרַחֶפֶת עַל־פְּנֵי הַמָּיִם",
        "genesis-1-3": "וַיֹּאמֶר אֱלֹהִים יְהִי אוֹר וַיְהִי־אוֹר",
        "genesis-1-4": "וַיַּרְא אֱלֹהִים אֶת־הָאוֹר כִּי־טוֹב וַיַּבְדֵּל אֱלֹהִים בֵּין הָאוֹר וּבֵין הַחֹשֶׁךְ",
        "genesis-1-5": "וַיִּקְרָא אֱלֹהִים לָאוֹר יוֹם וְלַחֹשֶׁךְ קָרָא לָיְלָה וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם אֶחָד",
        "genesis-1-6": "וַיֹּאמֶר אֱלֹהִים יְהִי רָקִיעַ בְּתוֹךְ הַמָּיִם וִיהִי מַבְדִּיל בֵּין מַיִם לָמָיִם",
        "genesis-1-7": "וַיַּעַשׂ אֱלֹהִים אֶת־הָרָקִיעַ וַיַּבְדֵּל בֵּין הַמַּיִם אֲשֶׁר מִתַּחַת לָרָקִיעַ וּבֵין הַמַּיִם אֲשֶׁר מֵעַל לָרָקִיעַ וַיְהִי־כֵן",
        "genesis-1-8": "וַיִּקְרָא אֱלֹהִים לָרָקִיעַ שָׁמָיִם וַיְהִי־עֶרֶב וַיְהִי־בֹקֶר יוֹם שֵׁנִי",
        "genesis-1-9": "וַיֹּאמֶר אֱלֹהִים יִקָּווּ הַמַּיִם מִתַּחַת הַשָּׁמַיִם אֶל־מָקוֹם אֶחָד וְתֵרָאֶה הַיַּבָּשָׁה וַיְהִי־כֵן",
        "genesis-1-10": "וַיִּקְרָא אֱלֹהִים לַיַּבָּשָׁה אֶרֶץ וּלְמִקְוֵה הַמַּיִם קָרָא יַמִּים וַיַּרְא אֱלֹהִים כִּי־טוֹב",
        # Exodus 20:1-5 (Ten Commandments)
        "exodus-20-1": "וַיְדַבֵּר אֱלֹהִים אֵת כָּל־הַדְּבָרִים הָאֵלֶּה לֵאמֹר",
        "exodus-20-2": "אָנֹכִי יְהוָה אֱלֹהֶיךָ אֲשֶׁר הוֹצֵאתִיךָ מֵאֶרֶץ מִצְרַיִם מִבֵּית עֲבָדִים",
        "exodus-20-3": "לֹא יִהְיֶה־לְךָ אֱלֹהִים אֲחֵרִים עַל־פָּנָי",
        # Psalm 23
        "psalms-23-1": "יְהוָה רֹעִי לֹא אֶחְסָר",
        "psalms-23-2": "בִּנְאוֹת דֶּשֶׁא יַרְבִּיצֵנִי עַל־מֵי מְנֻחוֹת יְנַהֲלֵנִי",
        "psalms-23-3": "נַפְשִׁי יְשׁוֹבֵב יַנְחֵנִי בְמַעְגְּלֵי־צֶדֶק לְמַעַן שְׁמוֹ",
        "psalms-23-4": "גַּם כִּי־אֵלֵךְ בְּגֵיא צַלְמָוֶת לֹא־אִירָא רָע כִּי־אַתָּה עִמָּדִי שִׁבְטְךָ וּמִשְׁעַנְתֶּךָ הֵמָּה יְנַחֲמֻנִי",
        "psalms-23-5": "תַּעֲרֹךְ לְפָנַי שֻׁלְחָן נֶגֶד צֹרְרָי דִּשַּׁנְתָּ בַשֶּׁמֶן רֹאשִׁי כּוֹסִי רְוָיָה",
        "psalms-23-6": "אַךְ טוֹב וָחֶסֶד יִרְדְּפוּנִי כָּל־יְמֵי חַיָּי וְשַׁבְתִּי בְּבֵית־יְהוָה לְאֹרֶךְ יָמִים",
        # Isaiah 53
        "isaiah-53-1": "מִי הֶאֱמִין לִשְׁמֻעָתֵנוּ וּזְרוֹעַ יְהוָה עַל־מִי נִגְלָתָה",
        "isaiah-53-2": "וַיַּעַל כַּיּוֹנֵק לְפָנָיו וְכַשֹּׁרֶשׁ מֵאֶרֶץ צִיָּה לֹא־תֹאַר לוֹ וְלֹא הָדָר וְנִרְאֵהוּ וְלֹא־מַרְאֶה וְנֶחְמְדֵהוּ",
        "isaiah-53-3": "נִבְזֶה וַחֲדַל אִישִׁים אִישׁ מַכְאֹבוֹת וִידוּעַ חֹלִי וּכְמַסְתֵּר פָּנִים מִמֶּנּוּ נִבְזֶה וְלֹא חֲשַׁבְנֻהוּ",
        "isaiah-53-4": "אָכֵן חֳלָיֵנוּ הוּא נָשָׂא וּמַכְאֹבֵינוּ סְבָלָם וַאֲנַחְנוּ חֲשַׁבְנֻהוּ נָגוּעַ מֻכֵּה אֱלֹהִים וּמְעֻנֶּה",
        "isaiah-53-5": "וְהוּא מְחֹלָל מִפְּשָׁעֵנוּ מְדֻכָּא מֵעֲוֺנֹתֵינוּ מוּסַר שְׁלוֹמֵנוּ עָלָיו וּבַחֲבֻרָתוֹ נִרְפָּא־לָנוּ",
        "isaiah-53-6": "כֻּלָּנוּ כַּצֹּאן תָּעִינוּ אִישׁ לְדַרְכּוֹ פָּנִינוּ וַיהוָה הִפְגִּיעַ בּוֹ אֵת עֲוֺן כֻּלָּנוּ",
        # Proverbs 3:5-6
        "proverbs-3-5": "בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן",
        "proverbs-3-6": "בְּכָל־דְּרָכֶיךָ דָעֵהוּ וְהוּא יְיַשֵּׁר אֹרְחֹתֶיךָ",
        # Daniel 9:25
        "daniel-9-25": "וְתֵדַע וְתַשְׂכֵּל מִן־מֹצָא דָבָר לְהָשִׁיב וְלִבְנוֹת יְרוּשָׁלַםִ עַד־מָשִׁיחַ נָגִיד שָׁבֻעִים שִׁבְעָה וְשָׁבֻעִים שִׁשִּׁים וּשְׁנַיִם",
    }


def main():
    print("="*60)
    print("Hebrew Extraction from BHS PDF")
    print("="*60)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Check if BHS PDF exists
    pdf_found = False
    for pdf in BHS_PDF_FILES:
        if os.path.exists(pdf):
            pdf_found = True
            print(f"✅ Found: {pdf}")
            break
        else:
            print(f"❌ Not found: {pdf}")
    
    if pdf_found:
        # Try to extract from PDF
        try:
            pdf_path = find_bhs_pdf()
            text = extract_hebrew_text(pdf_path)
            verses = parse_verses_from_text(text)
            
            if len(verses) > 10:
                print(f"✅ Extracted {len(verses)} Hebrew verses from PDF")
            else:
                print("⚠️ PDF extraction found few verses, using sample data")
                verses = create_sample_hebrew_data()
        except Exception as e:
            print(f"⚠️ PDF extraction failed: {e}")
            print("Using sample Hebrew data instead")
            verses = create_sample_hebrew_data()
    else:
        print("\n⚠️ No BHS PDF found. Using sample Hebrew data.")
        print("   To get full Hebrew data, add BHS-ESV Interlinear OT.pdf to project root")
        verses = create_sample_hebrew_data()
    
    # Save to JSON
    print(f"\nSaving {len(verses)} Hebrew verses to {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(verses, f, ensure_ascii=False, indent=2)
    
    print("✅ Done!")
    print(f"\nSample entries:")
    for key in list(verses.keys())[:5]:
        print(f"  {key}: {verses[key][:50]}...")


if __name__ == "__main__":
    main()



