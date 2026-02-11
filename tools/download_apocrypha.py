#!/usr/bin/env python3
"""
Download Apocrypha / Deuterocanonical books from bolls.life API.

Sources discovered:
  - KJV (1611 with Apocrypha) — 15 Apocrypha books, public domain
  - LXXE (Brenton's English Septuagint, 1851) — 15 books, public domain
  - NRSVCE (Catholic Edition, 1993) — 7 books
  - NABRE (New American Bible Revised Ed.) — 7 books
  - CEVD (Contemporary English Version w/ Apocrypha) — 12 books
  - RSV2CE (RSV Catholic Edition) — 7 books
  - LXX (Septuagint Greek) — 14 books in original Greek

Book ID mapping on bolls.life:
  67: 1 Esdras          68: Tobit           69: Judith
  70: Wisdom            71: Sirach          72: Epistle of Jeremiah
  73: Baruch            74: 1 Maccabees     75: 2 Maccabees
  76: 3 Maccabees / Prayer of Manasseh (varies)
  77: 2 Esdras          78: Susanna         79: Bel and the Dragon
  80: 4 Maccabees       81: Esther (Greek)  82: Prayer of Azariah
  83: Prayer of Manasseh  85: Psalms of Solomon  86: Odes
  88: Azariah / Song of Three Young Men
"""

import os
import json
import urllib.request
import ssl
import time
import sys
from typing import Dict, List, Optional, Any

# ============================================================================
# Configuration
# ============================================================================
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                          "public", "lib", "original-texts")

API_BASE = "https://bolls.life"

# SSL context (macOS sometimes has cert issues)
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

# ============================================================================
# Apocrypha Book Metadata (Academic Standard)
# ============================================================================
APOCRYPHA_BOOKS = {
    67: {
        "id": "1-esdras",
        "name": "1 Esdras",
        "category": "Historical",
        "original_language": "greek",
        "original_language_note": "Composed in Greek; parallel to Ezra-Nehemiah with additions",
        "date_composed": "~150 BC",
        "manuscript_evidence": ["Septuagint codices (Vaticanus, Alexandrinus, Sinaiticus)"],
        "dss_fragments": [],
        "chapters": 9,
    },
    68: {
        "id": "tobit",
        "name": "Tobit",
        "category": "Historical",
        "original_language": "aramaic",
        "original_language_note": "Written in Aramaic; Dead Sea Scrolls fragments confirm (4Q196-200: 4 Aramaic, 1 Hebrew)",
        "date_composed": "~200 BC",
        "manuscript_evidence": ["Septuagint (two recensions: Vaticanus short, Sinaiticus long)", "Vulgate"],
        "dss_fragments": ["4Q196 (Aramaic)", "4Q197 (Aramaic)", "4Q198 (Aramaic)", "4Q199 (Aramaic)", "4Q200 (Hebrew)"],
        "chapters": 14,
    },
    69: {
        "id": "judith",
        "name": "Judith",
        "category": "Historical",
        "original_language": "hebrew",
        "original_language_note": "Likely composed in Hebrew (Jerome attested an Aramaic copy); original lost, surviving only in Greek",
        "date_composed": "~150-100 BC",
        "manuscript_evidence": ["Septuagint codices", "Old Latin", "Vulgate (Jerome's Aramaic→Latin)"],
        "dss_fragments": [],
        "chapters": 16,
    },
    70: {
        "id": "wisdom-of-solomon",
        "name": "Wisdom of Solomon",
        "category": "Wisdom",
        "original_language": "greek",
        "original_language_note": "Composed in Greek (Alexandrian provenance); no Semitic original exists",
        "date_composed": "~50 BC – 40 AD",
        "manuscript_evidence": ["Septuagint codices", "Papyrus fragments"],
        "dss_fragments": [],
        "chapters": 19,
    },
    71: {
        "id": "sirach",
        "name": "Sirach (Ecclesiasticus)",
        "category": "Wisdom",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew by Ben Sira (~180 BC); ~68% of Hebrew recovered from Cairo Genizah (1896) + Dead Sea Scrolls + Masada scroll",
        "date_composed": "~180 BC (Hebrew); ~132 BC (Greek translation by grandson)",
        "manuscript_evidence": ["Cairo Genizah MSS A-F", "Masada scroll", "Septuagint (grandson's translation)"],
        "dss_fragments": ["2Q18 (Sir 6:20-31)", "11Q5 col. XXI (Sir 51:13-30)"],
        "chapters": 51,
    },
    72: {
        "id": "epistle-of-jeremiah",
        "name": "Epistle of Jeremiah",
        "category": "Prophetic",
        "original_language": "hebrew",
        "original_language_note": "Likely composed in Hebrew or Aramaic; earliest witness is a Greek fragment from Qumran (7Q2, ~100 BC)",
        "date_composed": "~300-100 BC",
        "manuscript_evidence": ["7Q2 (Greek papyrus fragment from Qumran)", "Septuagint codices"],
        "dss_fragments": ["7Q2 (Greek)"],
        "chapters": 1,
    },
    73: {
        "id": "baruch",
        "name": "Baruch",
        "category": "Prophetic",
        "original_language": "hebrew",
        "original_language_note": "Chapters 1-5 likely composed in Hebrew (ch. 1:1-3:8) and Greek (ch. 3:9-5:9); no Semitic original survives",
        "date_composed": "~200-60 BC (composite work)",
        "manuscript_evidence": ["Septuagint codices"],
        "dss_fragments": [],
        "chapters": 6,  # Some editions: 5 (without Letter of Jeremiah) or 6 (with it as ch. 6)
    },
    74: {
        "id": "1-maccabees",
        "name": "1 Maccabees",
        "category": "Historical",
        "original_language": "hebrew",
        "original_language_note": "Composed in Hebrew (attested by Jerome and Origen); Hebrew original lost, surviving only in Greek",
        "date_composed": "~104-63 BC",
        "manuscript_evidence": ["Septuagint codices (Sinaiticus, Alexandrinus)", "Josephus paraphrase"],
        "dss_fragments": [],
        "chapters": 16,
    },
    75: {
        "id": "2-maccabees",
        "name": "2 Maccabees",
        "category": "Historical",
        "original_language": "greek",
        "original_language_note": "Composed in Greek; epitome of Jason of Cyrene's 5-volume history",
        "date_composed": "~124-63 BC",
        "manuscript_evidence": ["Septuagint codices (Alexandrinus, Venetus)"],
        "dss_fragments": [],
        "chapters": 15,
    },
    76: {
        "id": "3-maccabees",
        "name": "3 Maccabees",
        "category": "Historical",
        "original_language": "greek",
        "original_language_note": "Composed in Greek; despite the name, unrelated to the Maccabean revolt",
        "date_composed": "~1st century BC",
        "manuscript_evidence": ["Septuagint (Alexandrinus, Venetus)"],
        "dss_fragments": [],
        "chapters": 7,
    },
    77: {
        "id": "2-esdras",
        "name": "2 Esdras (4 Ezra)",
        "category": "Apocalyptic",
        "original_language": "hebrew",
        "original_language_note": "Core (ch. 3-14, '4 Ezra') composed in Hebrew → translated to Greek (lost) → surviving in Latin. Ch. 1-2 ('5 Ezra') and 15-16 ('6 Ezra') are later Christian additions in Greek/Latin",
        "date_composed": "~100 AD (core); 2nd-3rd century AD (additions)",
        "manuscript_evidence": ["Latin Vulgate (primary witness)", "Syriac", "Ethiopic", "Georgian", "Arabic"],
        "dss_fragments": [],
        "chapters": 16,
    },
    78: {
        "id": "susanna",
        "name": "Susanna",
        "category": "Additions to Daniel",
        "original_language": "hebrew",
        "original_language_note": "Debated: wordplay in Greek (σχῖνος/σχίσει, πρῖνος/πρίσει) suggests Greek composition, but some scholars argue for a Semitic original. Addition to Daniel (ch. 13 in Catholic Bibles)",
        "date_composed": "~2nd-1st century BC",
        "manuscript_evidence": ["Septuagint (Theodotion recension preferred)", "Old Greek"],
        "dss_fragments": [],
        "chapters": 1,  # or 2 in some editions
    },
    79: {
        "id": "bel-and-dragon",
        "name": "Bel and the Dragon",
        "category": "Additions to Daniel",
        "original_language": "greek",
        "original_language_note": "Likely composed in Greek or possibly Aramaic/Hebrew; addition to Daniel (ch. 14 in Catholic Bibles). Two Greek versions survive (OG and Theodotion)",
        "date_composed": "~2nd-1st century BC",
        "manuscript_evidence": ["Septuagint (Theodotion and OG)", "Papyrus 967"],
        "dss_fragments": [],
        "chapters": 1,
    },
    80: {
        "id": "4-maccabees",
        "name": "4 Maccabees",
        "category": "Philosophical",
        "original_language": "greek",
        "original_language_note": "Composed in Greek; philosophical discourse on reason vs. passions using Maccabean martyrs as examples",
        "date_composed": "~1st century AD",
        "manuscript_evidence": ["Septuagint (Sinaiticus, Alexandrinus, Venetus)"],
        "dss_fragments": [],
        "chapters": 18,
    },
    81: {
        "id": "esther-greek",
        "name": "Additions to Esther",
        "category": "Additions",
        "original_language": "greek",
        "original_language_note": "Greek expansions of the Hebrew book of Esther; adds ~107 verses (prayers, letters, religious content absent from Hebrew Esther)",
        "date_composed": "~114 BC (colophon date) or 2nd-1st century BC",
        "manuscript_evidence": ["Septuagint (two Greek versions: Alpha/AT and B-text)"],
        "dss_fragments": [],
        "chapters": 10,
    },
    82: {
        "id": "prayer-of-azariah",
        "name": "Prayer of Azariah & Song of the Three Young Men",
        "category": "Additions to Daniel",
        "original_language": "hebrew",
        "original_language_note": "Likely composed in Hebrew or Aramaic; inserted into Daniel 3:23-24 in Greek/Latin Bibles. Contains Prayer of Azariah + narrative + Song of the Three",
        "date_composed": "~2nd-1st century BC",
        "manuscript_evidence": ["Septuagint (Theodotion and OG)", "Papyrus 967"],
        "dss_fragments": [],
        "chapters": 1,
    },
    83: {
        "id": "prayer-of-manasseh",
        "name": "Prayer of Manasseh",
        "category": "Liturgical",
        "original_language": "greek",
        "original_language_note": "Likely composed in Greek (possibly Hebrew/Aramaic); expansion of 2 Chronicles 33:11-13. Some scholars see Semitic idioms suggesting a Semitic original",
        "date_composed": "~2nd-1st century BC",
        "manuscript_evidence": ["Apostolic Constitutions", "Codex Alexandrinus (in Odes)", "Syriac Didascalia"],
        "dss_fragments": [],
        "chapters": 1,
    },
    85: {
        "id": "psalms-of-solomon",
        "name": "Psalms of Solomon",
        "category": "Poetry",
        "original_language": "hebrew",
        "original_language_note": "Composed in Hebrew; Hebrew original lost. Greek and Syriac translations survive. Attributed to Solomon but composed by Pharisaic Jews after Pompey's conquest of Jerusalem (63 BC)",
        "date_composed": "~63-30 BC",
        "manuscript_evidence": ["Greek manuscripts (11 MSS)", "Syriac translation"],
        "dss_fragments": [],
        "chapters": 18,
    },
    86: {
        "id": "odes",
        "name": "Odes",
        "category": "Liturgical",
        "original_language": "greek",
        "original_language_note": "Compilation of biblical and extrabiblical prayers/hymns for liturgical use. Includes canticles from Exodus, Deuteronomy, 1 Samuel, Isaiah, Jonah, Habakkuk, Daniel 3 (Azariah), Magnificat, Benedictus, Nunc Dimittis, and Prayer of Manasseh",
        "date_composed": "Compilation ~5th century AD; individual odes much earlier",
        "manuscript_evidence": ["Codex Alexandrinus (appended to Psalms)"],
        "dss_fragments": [],
        "chapters": 14,
    },
    88: {
        "id": "song-of-three-young-men",
        "name": "Song of the Three Young Men",
        "category": "Additions to Daniel",
        "original_language": "hebrew",
        "original_language_note": "See Prayer of Azariah — sometimes listed separately. Part of the Daniel 3 additions",
        "date_composed": "~2nd-1st century BC",
        "manuscript_evidence": ["Septuagint"],
        "dss_fragments": [],
        "chapters": 1,
    },
}

# ============================================================================
# Translations to download Apocrypha from
# ============================================================================
TRANSLATIONS_TO_DOWNLOAD = {
    # English translations
    "KJV": {
        "file": "apocrypha-kjv.json",
        "full_name": "King James Version (1611 with Apocrypha)",
        "language": "english",
        "year": 1611,
        "license": "Public Domain",
    },
    "LXXE": {
        "file": "apocrypha-lxxe.json",
        "full_name": "Brenton's English Septuagint (1851)",
        "language": "english",
        "year": 1851,
        "license": "Public Domain",
    },
    "NRSVCE": {
        "file": "apocrypha-nrsvce.json",
        "full_name": "New Revised Standard Version Catholic Edition (1993)",
        "language": "english",
        "year": 1993,
        "license": "Copyrighted — National Council of Churches",
    },
    "NABRE": {
        "file": "apocrypha-nabre.json",
        "full_name": "New American Bible Revised Edition",
        "language": "english",
        "year": 2011,
        "license": "Copyrighted — USCCB",
    },
    "CEVD": {
        "file": "apocrypha-cevd.json",
        "full_name": "Contemporary English Version with Deuterocanonicals (2006)",
        "language": "english",
        "year": 2006,
        "license": "Copyrighted — American Bible Society",
    },
    "RSV2CE": {
        "file": "apocrypha-rsv2ce.json",
        "full_name": "Revised Standard Version Catholic Edition",
        "language": "english",
        "year": 1966,
        "license": "Copyrighted — National Council of Churches",
    },
    # Original language
    "LXX": {
        "file": "apocrypha-lxx-greek.json",
        "full_name": "Septuagint (Rahlfs-Hanhart, 2006 revision)",
        "language": "greek",
        "year": -250,  # ~3rd century BC translation
        "license": "Public Domain (text); scholarly edition under academic use",
    },
}


# ============================================================================
# Download Functions
# ============================================================================

def api_get(path: str) -> Any:
    """Fetch JSON from bolls.life API."""
    url = f"{API_BASE}{path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (TheWord Scripture App)'})
    with urllib.request.urlopen(req, context=SSL_CTX) as resp:
        return json.loads(resp.read().decode('utf-8'))


def get_apocrypha_book_ids(translation: str) -> List[int]:
    """Get list of Apocrypha book IDs available in a translation."""
    books = api_get(f"/get-books/{translation}/")
    return [b['bookid'] for b in books if b['bookid'] > 66]


def download_chapter(translation: str, book_id: int, chapter: int) -> List[Dict]:
    """Download a single chapter from bolls.life."""
    try:
        data = api_get(f"/get-chapter/{translation}/{book_id}/{chapter}/")
        if isinstance(data, list):
            return [{"verse": v.get("verse", 0), "text": v.get("text", "")} for v in data]
    except Exception as e:
        print(f"      ❌ Error: {e}")
    return []


def download_apocrypha_translation(translation: str, config: Dict) -> Dict:
    """Download all Apocrypha books for a single translation."""
    print(f"\n{'=' * 60}")
    print(f"📖 {config['full_name']}")
    print(f"   Translation code: {translation}")
    print(f"{'=' * 60}")

    # Get available Apocrypha book IDs for this translation
    available_ids = get_apocrypha_book_ids(translation)
    print(f"   Available Apocrypha books: {len(available_ids)} — IDs: {available_ids}")

    result = {
        "translation": config["full_name"],
        "translation_code": translation,
        "language": config["language"],
        "year": config["year"],
        "license": config["license"],
        "type": "apocrypha",
        "books": []
    }

    total_verses = 0
    for book_id in available_ids:
        meta = APOCRYPHA_BOOKS.get(book_id)
        if not meta:
            print(f"   ⚠️  Unknown book ID {book_id}, skipping")
            continue

        book_name = meta["name"]
        expected_chapters = meta["chapters"]

        print(f"\n   📜 {book_name} (ID {book_id}, {expected_chapters} chapters)")

        book_entry = {
            "name": book_name,
            "id": meta["id"],
            "bookid": book_id,
            "category": meta["category"],
            "original_language": meta["original_language"],
            "original_language_note": meta["original_language_note"],
            "date_composed": meta["date_composed"],
            "manuscript_evidence": meta["manuscript_evidence"],
            "dss_fragments": meta["dss_fragments"],
            "chapters": []
        }

        # Try downloading up to expected_chapters + a few extra (some editions differ)
        for ch in range(1, expected_chapters + 5):
            verses = download_chapter(translation, book_id, ch)
            if not verses:
                if ch > expected_chapters:
                    break  # Expected end
                print(f"      Ch {ch}: empty (may not exist in this edition)")
                continue

            book_entry["chapters"].append({
                "chapter": ch,
                "verses": verses
            })
            verse_count = len(verses)
            total_verses += verse_count
            print(f"      Ch {ch}: {verse_count} verses ✅")
            time.sleep(0.15)  # Rate limiting

        actual_chapters = len(book_entry["chapters"])
        book_verses = sum(len(ch["verses"]) for ch in book_entry["chapters"])
        print(f"      → {actual_chapters} chapters, {book_verses} verses total")

        result["books"].append(book_entry)

    total_books = len(result["books"])
    print(f"\n   ✅ {translation}: {total_books} books, {total_verses} verses downloaded")
    return result


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  APOCRYPHA / DEUTEROCANONICAL BOOKS DOWNLOADER             ║")
    print("║  Sources: bolls.life API                                    ║")
    print("║  Translations: KJV, LXXE, NRSVCE, NABRE, CEVD, RSV2CE, LXX║")
    print("╚══════════════════════════════════════════════════════════════╝")

    # Check which translations to download
    translations_to_process = list(TRANSLATIONS_TO_DOWNLOAD.items())
    
    # Allow filtering via command line
    if len(sys.argv) > 1:
        requested = [a.upper() for a in sys.argv[1:]]
        translations_to_process = [(k, v) for k, v in translations_to_process if k in requested]
        print(f"\n  Filtering to: {[k for k, _ in translations_to_process]}")

    grand_total_books = 0
    grand_total_verses = 0

    for translation, config in translations_to_process:
        try:
            data = download_apocrypha_translation(translation, config)
            
            # Save to file
            output_path = os.path.join(OUTPUT_DIR, config["file"])
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            books = len(data["books"])
            verses = sum(len(ch["verses"]) for b in data["books"] for ch in b["chapters"])
            size_mb = os.path.getsize(output_path) / (1024 * 1024)
            
            grand_total_books += books
            grand_total_verses += verses
            
            print(f"\n   💾 Saved: {config['file']} ({size_mb:.1f} MB)")

        except Exception as e:
            print(f"\n   ❌ FAILED {translation}: {e}")
            import traceback
            traceback.print_exc()

        # Brief pause between translations
        time.sleep(1)

    print(f"\n{'=' * 60}")
    print(f"COMPLETE: {grand_total_books} total books, {grand_total_verses} total verses")
    print(f"across {len(translations_to_process)} translations")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()

