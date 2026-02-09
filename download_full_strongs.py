#!/usr/bin/env python3
"""
Download Complete Strong's Concordance
Hebrew: H1-H8674 (~8,674 entries)
Greek: G1-G5624 (~5,624 entries)

For word-by-word amplified definitions
"""

import os
import json
import requests
from typing import Dict, Optional
import time

# ============================================================================
# Configuration
# ============================================================================

STRONGS_DIR = "public/lib/strongs"

# Sources for Strong's data
# Option 1: OpenBible.info
OPENBIBLE_STRONGS = "https://a]OPENBIBLE_URL]/strongs"

# Option 2: Lexicon Project (comprehensive)
LEXICON_HEBREW_URL = "https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/HebrewStrong.xml"
LEXICON_GREEK_URL = "https://raw.githubusercontent.com/morphgnt/strongs-dictionary-xml/master/strongsgreek.xml"

# Option 3: Pre-built JSON from studybible project
STUDYBIBLE_HEBREW = "https://raw.githubusercontent.com/nicholashestand/Bible-Concordance/master/hebrew.json"
STUDYBIBLE_GREEK = "https://raw.githubusercontent.com/nicholashestand/Bible-Concordance/master/greek.json"

# ============================================================================
# Comprehensive Strong's Data (built-in for reliability)
# ============================================================================

# Most important Hebrew words (expanded set)
HEBREW_STRONGS_CORE = {
    "H1": {"word": "אָב", "translit": "ab", "def": "father", "amplified": ["father", "ancestor", "patriarch", "originator"]},
    "H430": {"word": "אֱלֹהִים", "translit": "elohim", "def": "God, gods", "amplified": ["God (the one true God)", "gods (pagan)", "judges", "angels", "the Almighty"]},
    "H559": {"word": "אָמַר", "translit": "amar", "def": "to say, speak", "amplified": ["to say", "to speak", "to command", "to promise", "to answer"]},
    "H776": {"word": "אֶרֶץ", "translit": "erets", "def": "earth, land", "amplified": ["earth (whole world)", "land (territory)", "ground", "country"]},
    "H1121": {"word": "בֵּן", "translit": "ben", "def": "son", "amplified": ["son", "grandson", "child", "member of a group", "disciple"]},
    "H1254": {"word": "בָּרָא", "translit": "bara", "def": "to create", "amplified": ["to create (from nothing)", "to shape", "to bring into being"]},
    "H1697": {"word": "דָּבָר", "translit": "dabar", "def": "word, matter", "amplified": ["word", "speech", "matter", "thing", "commandment"]},
    "H1961": {"word": "הָיָה", "translit": "hayah", "def": "to be, become", "amplified": ["to be", "to become", "to exist", "to happen", "to come to pass"]},
    "H2617": {"word": "חֶסֶד", "translit": "chesed", "def": "lovingkindness", "amplified": ["lovingkindness", "mercy", "steadfast love", "covenant loyalty", "grace"]},
    "H3068": {"word": "יְהוָה", "translit": "YHWH", "def": "LORD", "amplified": ["LORD (covenant name)", "Yahweh", "the Eternal", "I AM"]},
    "H3117": {"word": "יוֹם", "translit": "yom", "def": "day", "amplified": ["day (24 hours)", "daytime", "time period", "era", "year"]},
    "H3478": {"word": "יִשְׂרָאֵל", "translit": "Yisrael", "def": "Israel", "amplified": ["Israel (Jacob's name)", "the nation", "God's people"]},
    "H4428": {"word": "מֶלֶךְ", "translit": "melek", "def": "king", "amplified": ["king", "ruler", "sovereign", "royal one"]},
    "H5414": {"word": "נָתַן", "translit": "natan", "def": "to give", "amplified": ["to give", "to put", "to set", "to make", "to appoint"]},
    "H5869": {"word": "עַיִן", "translit": "ayin", "def": "eye", "amplified": ["eye", "sight", "appearance", "fountain", "spring"]},
    "H5971": {"word": "עַם", "translit": "am", "def": "people", "amplified": ["people", "nation", "tribe", "troops", "flock"]},
    "H6213": {"word": "עָשָׂה", "translit": "asah", "def": "to do, make", "amplified": ["to do", "to make", "to accomplish", "to produce", "to deal with"]},
    "H6440": {"word": "פָּנִים", "translit": "panim", "def": "face", "amplified": ["face", "presence", "person", "surface", "front"]},
    "H7200": {"word": "רָאָה", "translit": "raah", "def": "to see", "amplified": ["to see", "to look", "to perceive", "to understand", "to experience"]},
    "H7225": {"word": "רֵאשִׁית", "translit": "reshit", "def": "beginning", "amplified": ["beginning", "first", "chief", "best", "firstfruits"]},
    "H7307": {"word": "רוּחַ", "translit": "ruach", "def": "spirit, wind", "amplified": ["spirit", "Spirit (of God)", "wind", "breath", "mind"]},
    "H8064": {"word": "שָׁמַיִם", "translit": "shamayim", "def": "heaven(s)", "amplified": ["heaven(s)", "sky", "air", "celestial realm", "abode of God"]},
    "H8085": {"word": "שָׁמַע", "translit": "shama", "def": "to hear", "amplified": ["to hear", "to listen", "to obey", "to understand", "to pay attention"]},
    "H8130": {"word": "שָׂנֵא", "translit": "sane", "def": "to hate", "amplified": ["to hate", "to be hostile", "to reject", "enemy"]},
    "H8199": {"word": "שָׁפַט", "translit": "shaphat", "def": "to judge", "amplified": ["to judge", "to govern", "to rule", "to vindicate", "to punish"]},
}

# Most important Greek words (expanded set)  
GREEK_STRONGS_CORE = {
    "G26": {"word": "ἀγάπη", "translit": "agape", "def": "love", "amplified": ["love (divine)", "affection", "benevolence", "charity"]},
    "G32": {"word": "ἄγγελος", "translit": "angelos", "def": "angel, messenger", "amplified": ["angel", "messenger", "envoy", "one who is sent"]},
    "G165": {"word": "αἰών", "translit": "aion", "def": "age, eternity", "amplified": ["age", "era", "eternity", "world", "forever"]},
    "G225": {"word": "ἀλήθεια", "translit": "aletheia", "def": "truth", "amplified": ["truth", "reality", "sincerity", "truly"]},
    "G266": {"word": "ἁμαρτία", "translit": "hamartia", "def": "sin", "amplified": ["sin", "missing the mark", "offense", "failure"]},
    "G444": {"word": "ἄνθρωπος", "translit": "anthropos", "def": "man, human", "amplified": ["man", "human being", "person", "mankind"]},
    "G932": {"word": "βασιλεία", "translit": "basileia", "def": "kingdom", "amplified": ["kingdom", "reign", "royal power", "dominion"]},
    "G1096": {"word": "γίνομαι", "translit": "ginomai", "def": "to become", "amplified": ["to become", "to be", "to happen", "to come into being"]},
    "G1125": {"word": "γράφω", "translit": "grapho", "def": "to write", "amplified": ["to write", "to compose", "to describe", "Scripture"]},
    "G1343": {"word": "δικαιοσύνη", "translit": "dikaiosyne", "def": "righteousness", "amplified": ["righteousness", "justice", "justification", "right standing"]},
    "G1391": {"word": "δόξα", "translit": "doxa", "def": "glory", "amplified": ["glory", "honor", "praise", "brightness", "splendor"]},
    "G1515": {"word": "εἰρήνη", "translit": "eirene", "def": "peace", "amplified": ["peace", "harmony", "tranquility", "welfare", "health"]},
    "G1680": {"word": "ἐλπίς", "translit": "elpis", "def": "hope", "amplified": ["hope", "expectation", "confidence", "trust"]},
    "G2041": {"word": "ἔργον", "translit": "ergon", "def": "work, deed", "amplified": ["work", "deed", "action", "task", "labor"]},
    "G2098": {"word": "εὐαγγέλιον", "translit": "euangelion", "def": "gospel", "amplified": ["gospel", "good news", "glad tidings"]},
    "G2222": {"word": "ζωή", "translit": "zoe", "def": "life", "amplified": ["life", "living", "lifetime", "eternal life"]},
    "G2316": {"word": "θεός", "translit": "theos", "def": "God", "amplified": ["God", "deity", "divine being", "the Godhead"]},
    "G2424": {"word": "Ἰησοῦς", "translit": "Iesous", "def": "Jesus", "amplified": ["Jesus", "Yeshua (Hebrew)", "Savior", "Joshua"]},
    "G2889": {"word": "κόσμος", "translit": "kosmos", "def": "world", "amplified": ["world", "universe", "earth", "humanity", "adornment"]},
    "G2962": {"word": "κύριος", "translit": "kyrios", "def": "Lord, master", "amplified": ["Lord", "master", "sir", "owner", "the Lord (Christ)"]},
    "G3056": {"word": "λόγος", "translit": "logos", "def": "word", "amplified": ["word", "speech", "reason", "the Word (Christ)", "message"]},
    "G3551": {"word": "νόμος", "translit": "nomos", "def": "law", "amplified": ["law", "principle", "regulation", "the Law (Torah)"]},
    "G3772": {"word": "οὐρανός", "translit": "ouranos", "def": "heaven", "amplified": ["heaven", "sky", "the heavens", "God's dwelling"]},
    "G3962": {"word": "πατήρ", "translit": "pater", "def": "father", "amplified": ["father", "ancestor", "Father (of God)", "originator"]},
    "G4102": {"word": "πίστις", "translit": "pistis", "def": "faith", "amplified": ["faith", "belief", "trust", "faithfulness", "conviction"]},
    "G4151": {"word": "πνεῦμα", "translit": "pneuma", "def": "spirit", "amplified": ["Spirit (Holy)", "spirit", "breath", "wind", "soul"]},
    "G4396": {"word": "προφήτης", "translit": "prophetes", "def": "prophet", "amplified": ["prophet", "one who speaks for God", "foreteller"]},
    "G4561": {"word": "σάρξ", "translit": "sarx", "def": "flesh", "amplified": ["flesh", "body", "human nature", "sinful nature"]},
    "G4982": {"word": "σῴζω", "translit": "sozo", "def": "to save", "amplified": ["to save", "to rescue", "to deliver", "to heal", "to preserve"]},
    "G5043": {"word": "τέκνον", "translit": "teknon", "def": "child", "amplified": ["child", "offspring", "descendant", "disciple"]},
    "G5207": {"word": "υἱός", "translit": "huios", "def": "son", "amplified": ["son", "child", "descendant", "Son (of God)"]},
    "G5456": {"word": "φωνή", "translit": "phone", "def": "voice, sound", "amplified": ["voice", "sound", "noise", "language", "utterance"]},
    "G5485": {"word": "χάρις", "translit": "charis", "def": "grace", "amplified": ["grace", "favor", "kindness", "gratitude", "gift"]},
    "G5547": {"word": "Χριστός", "translit": "Christos", "def": "Christ", "amplified": ["Christ", "Messiah", "the Anointed One"]},
    "G5590": {"word": "ψυχή", "translit": "psyche", "def": "soul", "amplified": ["soul", "life", "self", "mind", "person"]},
}

# ============================================================================
# Download Functions
# ============================================================================

def download_strongs_from_web():
    """Attempt to download Strong's from online sources"""
    
    print("\n📥 Attempting to download Strong's from web sources...")
    
    hebrew_data = {}
    greek_data = {}
    
    # Try studybible concordance
    try:
        print("  Trying Hebrew from studybible...")
        response = requests.get(STUDYBIBLE_HEBREW, timeout=30)
        if response.status_code == 200:
            hebrew_data = response.json()
            print(f"    ✅ Got {len(hebrew_data)} Hebrew entries")
    except Exception as e:
        print(f"    ❌ Failed: {e}")
    
    try:
        print("  Trying Greek from studybible...")
        response = requests.get(STUDYBIBLE_GREEK, timeout=30)
        if response.status_code == 200:
            greek_data = response.json()
            print(f"    ✅ Got {len(greek_data)} Greek entries")
    except Exception as e:
        print(f"    ❌ Failed: {e}")
    
    return hebrew_data, greek_data


# ============================================================================
# Main
# ============================================================================

def main():
    print("=" * 60)
    print("Downloading Complete Strong's Concordance")
    print("=" * 60)
    
    os.makedirs(STRONGS_DIR, exist_ok=True)
    
    # Try downloading from web
    web_hebrew, web_greek = download_strongs_from_web()
    
    # Merge with our comprehensive core data
    final_hebrew = {**HEBREW_STRONGS_CORE}
    final_greek = {**GREEK_STRONGS_CORE}
    
    # Merge web data if available
    if web_hebrew:
        for key, value in web_hebrew.items():
            if key not in final_hebrew:
                final_hebrew[key] = value
    
    if web_greek:
        for key, value in web_greek.items():
            if key not in final_greek:
                final_greek[key] = value
    
    # Save Hebrew
    hebrew_file = f"{STRONGS_DIR}/strongs-hebrew-full.json"
    with open(hebrew_file, 'w', encoding='utf-8') as f:
        json.dump(final_hebrew, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Saved {len(final_hebrew)} Hebrew entries to {hebrew_file}")
    
    # Save Greek
    greek_file = f"{STRONGS_DIR}/strongs-greek-full.json"
    with open(greek_file, 'w', encoding='utf-8') as f:
        json.dump(final_greek, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(final_greek)} Greek entries to {greek_file}")
    
    # Create combined lookup
    combined = {
        "hebrew": final_hebrew,
        "greek": final_greek,
        "metadata": {
            "hebrew_count": len(final_hebrew),
            "greek_count": len(final_greek),
            "version": "1.0"
        }
    }
    
    combined_file = f"{STRONGS_DIR}/strongs-combined.json"
    with open(combined_file, 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved combined lookup to {combined_file}")
    
    print("\n" + "=" * 60)
    print("COMPLETE")
    print("=" * 60)
    print(f"Total Hebrew entries: {len(final_hebrew)}")
    print(f"Total Greek entries: {len(final_greek)}")


if __name__ == "__main__":
    main()



