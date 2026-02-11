#!/usr/bin/env python3
"""
Download Dead Sea Scrolls & Related Pseudepigrapha Texts
=========================================================

Sources:
  - bolls.life API (for any available translations)
  - Public domain translations of key texts:
    * 1 Enoch (R.H. Charles, 1917) — public domain
    * Jubilees (R.H. Charles, 1902) — public domain
    * Community Rule (1QS) — academic public domain translations
    * War Scroll (1QM) — academic public domain translations
    * Temple Scroll (11QT) — excerpts
    * Psalm 151 — already in LXX, but include standalone
    * Genesis Apocryphon (1QapGen) — excerpts
    * Copper Scroll (3Q15) — excerpts
    * Thanksgiving Hymns (1QH) — selections

These are kept SEPARATE from the Apocrypha files.
Output: public/lib/original-texts/dss-*.json
"""

import os
import json
import urllib.request
import ssl
from typing import Dict, List, Optional
from datetime import datetime


# ============================================================================
# API
# ============================================================================

BOLLS_LIFE_API_BASE = "https://bolls.life/api/"


def fetch_json(url: str) -> Optional[dict]:
    """Fetch JSON from a URL, with SSL workaround."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"    ⚠️  Error fetching {url}: {e}")
        return None


def fetch_text(url: str) -> Optional[str]:
    """Fetch raw text from a URL."""
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read().decode()
    except Exception as e:
        print(f"    ⚠️  Error fetching {url}: {e}")
        return None


# ============================================================================
# Check bolls.life for pseudepigrapha / DSS-adjacent texts
# ============================================================================

def check_bolls_translations():
    """Check which translations on bolls.life have pseudepigrapha."""
    print("Checking bolls.life for DSS-related translations...")
    
    # Known translations that may have 1 Enoch, Jubilees, etc.
    # CJB (Complete Jewish Bible), NRSVUE, etc.
    translations_to_check = ["CJB", "NRSVUE", "RSV", "NABRE", "NRSVCE", "KJV"]
    
    for code in translations_to_check:
        url = f"{BOLLS_LIFE_API_BASE}get-books/{code}/"
        data = fetch_json(url)
        if data:
            # Look for books with IDs > 66 (canonical) that aren't standard apocrypha
            extra_books = [b for b in data if b.get('bookid', b.get('id', 0)) > 86]
            if extra_books:
                print(f"  {code}: Found {len(extra_books)} extra books beyond standard apocrypha:")
                for b in extra_books:
                    print(f"    - ID {b.get('bookid', b.get('id', '?'))}: {b.get('name', '?')} ({b.get('chapters', '?')} ch)")
            else:
                print(f"  {code}: No DSS/pseudepigrapha books found")


# ============================================================================
# Download 1 Enoch from bolls.life (Ethiopian Orthodox canon)
# ============================================================================

def download_enoch_from_bolls():
    """
    Try to download 1 Enoch from bolls.life.
    The Ethiopian Bible (ETH) includes 1 Enoch.
    """
    print("\n📜 Attempting to download 1 Enoch...")
    
    # Try Ethiopian Bible first
    for code in ["ETH", "ETHHB"]:
        url = f"{BOLLS_LIFE_API_BASE}get-books/{code}/"
        data = fetch_json(url)
        if data:
            # Look for Enoch
            for book in data:
                name = book.get('name', '').lower()
                if 'enoch' in name or 'henok' in name:
                    print(f"  Found: {book['name']} in {code} (ID {book.get('bookid', book.get('id', '?'))})")
                    return download_book_from_bolls(code, book)
    
    print("  ⚠️  1 Enoch not found on bolls.life, using public domain source...")
    return None


def download_book_from_bolls(translation_code: str, book_info: dict) -> Optional[dict]:
    """Download a complete book from bolls.life."""
    book_id = book_info.get('bookid', book_info.get('id'))
    chapters = book_info.get('chapters', 0)
    book_name = book_info.get('name', 'Unknown')
    
    print(f"  Downloading {book_name} ({chapters} chapters) from {translation_code}...")
    
    book_data = {
        "name": book_name,
        "chapters": []
    }
    
    for ch in range(1, chapters + 1):
        url = f"{BOLLS_LIFE_API_BASE}get-chapter/{translation_code}/{book_id}/{ch}/"
        data = fetch_json(url)
        if data and isinstance(data, list):
            verses = [{"verse": v.get('verse', i+1), "text": v.get('text', '')} for i, v in enumerate(data)]
            book_data["chapters"].append({"chapter": ch, "verses": verses})
            print(f"    Ch {ch}: {len(verses)} verses ✅")
        else:
            print(f"    Ch {ch}: ❌")
    
    total_verses = sum(len(c['verses']) for c in book_data['chapters'])
    print(f"  → {len(book_data['chapters'])} chapters, {total_verses} verses")
    return book_data


# ============================================================================
# 1 Enoch — R.H. Charles (1917) Public Domain
# ============================================================================

def get_enoch_public_domain() -> dict:
    """
    Download 1 Enoch from a public domain source.
    Try sacred-texts.com or similar.
    """
    print("\n📜 Sourcing 1 Enoch (R.H. Charles, 1917)...")
    
    # Try getbible.net which has 1 Enoch
    url = "https://raw.githubusercontent.com/nicholasgasior/gnt-data/master/1enoch/chapters.json"
    data = fetch_json(url)
    
    if not data:
        # Try alternative: use the pseudepigrapha project on GitHub
        # Wesley Center for Applied Theology has public domain translations
        print("  Trying alternative sources...")
        
        # Fallback: construct from known chapter/verse structure
        # 1 Enoch has 108 chapters in 5 sections
        return _build_enoch_metadata()
    
    return data


def _build_enoch_metadata() -> dict:
    """Build 1 Enoch metadata structure (text to be populated)."""
    return {
        "name": "1 Enoch (Book of Enoch)",
        "id": "1-enoch",
        "sections": [
            {"name": "Book of the Watchers", "chapters": list(range(1, 37))},
            {"name": "Book of Parables (Similitudes)", "chapters": list(range(37, 72))},
            {"name": "Astronomical Book", "chapters": list(range(72, 83))},
            {"name": "Book of Dreams", "chapters": list(range(83, 91))},
            {"name": "Epistle of Enoch", "chapters": list(range(91, 109))},
        ],
        "total_chapters": 108,
        "chapters": []
    }


# ============================================================================
# Comprehensive DSS Download
# ============================================================================

def download_all_dss(output_dir: str):
    """Download all available Dead Sea Scrolls texts."""
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("DEAD SEA SCROLLS — Data Acquisition")
    print("=" * 60)
    
    # Step 1: Check what bolls.life has
    check_bolls_translations()
    
    # Step 2: Try to get 1 Enoch and Jubilees from various sources
    all_scrolls = {
        "info": {
            "collection": "Dead Sea Scrolls & Related Pseudepigrapha",
            "date_compiled": datetime.now().isoformat(),
            "note": "Separate from canonical and deuterocanonical texts. These are ancient manuscripts discovered at Qumran (1947-1956) and related Second Temple Jewish literature.",
            "academic_sources": [
                "R.H. Charles, The Apocrypha and Pseudepigrapha of the Old Testament (1913/1917)",
                "Florentino García Martínez & Eibert J.C. Tigchelaar, The Dead Sea Scrolls Study Edition (1997-1998)",
                "Geza Vermes, The Complete Dead Sea Scrolls in English (1962/2004)",
                "James H. Charlesworth, The Old Testament Pseudepigrapha (1983/1985)"
            ]
        },
        "scrolls": []
    }
    
    # ── 1 Enoch ──
    print("\n" + "=" * 60)
    print("📜 1 ENOCH (Book of Enoch)")
    print("=" * 60)
    print("  Original: Ge'ez (Ethiopic), fragments in Aramaic (Qumran)")
    print("  DSS: 4Q201-212 (11 Aramaic fragments covering most of the book)")
    print("  Translation: R.H. Charles (1917) — Public Domain")
    
    enoch_data = download_enoch_from_bolls()
    if not enoch_data:
        enoch_data = _build_enoch_metadata()
    
    all_scrolls["scrolls"].append({
        "id": "1-enoch",
        "name": "1 Enoch (Book of Enoch)",
        "category": "Pseudepigrapha",
        "original_language": "aramaic",
        "original_language_note": "Written in Aramaic; complete text preserved only in Ge'ez (Ethiopic). 11 Aramaic fragments found at Qumran (4Q201-212)",
        "date_composed": "~300-100 BC (composite work)",
        "qumran_references": ["4Q201 (4QEn-a)", "4Q202 (4QEn-b)", "4Q204 (4QEn-c)", "4Q205 (4QEn-d)", "4Q206 (4QEn-e)", "4Q207 (4QEn-f)", "4Q208-211 (4QEnastr a-d)", "4Q212 (4QEn-g)"],
        "sections": [
            {"name": "Book of the Watchers (1-36)", "description": "Fall of the Watchers, Enoch's journeys through heaven and earth"},
            {"name": "Book of Parables (37-71)", "description": "Messianic 'Son of Man' visions — NOT found at Qumran"},
            {"name": "Astronomical Book (72-82)", "description": "Solar calendar — oldest section, heavily attested at Qumran"},
            {"name": "Book of Dreams (83-90)", "description": "Animal Apocalypse — history as allegory"},
            {"name": "Epistle of Enoch (91-108)", "description": "Apocalypse of Weeks, ethical exhortation"},
        ],
        "total_chapters": 108,
        "significance": "Quoted in Jude 14-15 and 2 Peter. Foundational for Jewish and Christian apocalypticism. The 'Son of Man' tradition influenced NT Christology.",
        "data": enoch_data.get("chapters", []) if isinstance(enoch_data, dict) else []
    })
    
    # ── Jubilees ──
    print("\n" + "=" * 60)
    print("📜 JUBILEES (Little Genesis)")
    print("=" * 60)
    print("  Original: Hebrew (attested at Qumran); complete in Ge'ez")
    print("  DSS: 4Q216-228, 1Q17-18, 2Q19-20, 3Q5, 4Q482-483, 11Q12")
    print("  Translation: R.H. Charles (1902) — Public Domain")
    
    all_scrolls["scrolls"].append({
        "id": "jubilees",
        "name": "Jubilees (Little Genesis)",
        "category": "Pseudepigrapha",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; 15+ fragments found at Qumran confirming Hebrew original. Complete text preserved only in Ge'ez (Ethiopic)",
        "date_composed": "~160-150 BC",
        "qumran_references": ["4Q216-228 (4QJub a-n)", "1Q17-18 (1QJub a-b)", "2Q19-20 (2QJub a-b)", "3Q5 (3QJub)", "4Q482-483", "11Q12 (11QJub)"],
        "total_chapters": 50,
        "sections": [
            {"name": "Creation to Abraham (1-23)", "description": "Retelling of Genesis with precise jubilee dating"},
            {"name": "Abraham to Moses (24-50)", "description": "Patriarchal narratives with halakhic expansions"},
        ],
        "significance": "Rewrites Genesis-Exodus on a 49-year jubilee calendar. Authoritative at Qumran (cited as scripture). Preserves the 364-day solar calendar used by the Qumran community.",
        "data": []
    })
    
    # ── Community Rule (1QS) ──
    print("\n" + "=" * 60)
    print("📜 COMMUNITY RULE (1QS — Serekh ha-Yahad)")
    print("=" * 60)
    print("  Original: Hebrew (complete scroll from Cave 1)")
    print("  Unique to Qumran — no other ancient witnesses")
    
    all_scrolls["scrolls"].append({
        "id": "community-rule",
        "name": "Community Rule (1QS)",
        "category": "Sectarian",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; complete scroll found in Cave 1. Additional copies: 4Q255-264 (4QS a-j), 5Q11",
        "date_composed": "~100 BC (with earlier sources)",
        "qumran_references": ["1QS (complete, 11 columns)", "4Q255-264 (4QS a-j, fragmentary copies)", "5Q11"],
        "total_columns": 11,
        "sections": [
            {"name": "Preamble (I.1-15)", "description": "Purpose of the community"},
            {"name": "Entrance Ceremony (I.16-III.12)", "description": "Covenant renewal liturgy, blessings and curses"},
            {"name": "Treatise on Two Spirits (III.13-IV.26)", "description": "Dualistic theology — Spirit of Truth vs. Spirit of Deceit"},
            {"name": "Community Rules (V.1-VII.25)", "description": "Regulations for communal life, meals, assembly, and discipline"},
            {"name": "The Maskil's Hymn (VIII.1-X.8)", "description": "The instructor's role and the community as a spiritual temple"},
            {"name": "Final Hymn (X.9-XI.22)", "description": "Praise, confession, and trust in God's righteousness"},
        ],
        "significance": "Primary rule book of the Qumran community. The 'Two Spirits' doctrine influenced early Christian dualism (light vs. darkness in John's Gospel). Reveals how a Jewish sect organized communal living centuries before Christian monasticism.",
        "data": []
    })
    
    # ── War Scroll (1QM) ──
    print("\n" + "=" * 60)
    print("📜 WAR SCROLL (1QM — Milhamah)")
    print("=" * 60)
    print("  Original: Hebrew (nearly complete scroll from Cave 1)")
    
    all_scrolls["scrolls"].append({
        "id": "war-scroll",
        "name": "War Scroll (1QM)",
        "category": "Sectarian",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; nearly complete scroll from Cave 1 (19 columns). Fragments: 4Q491-497 (4QM a-f)",
        "date_composed": "~late 1st century BC",
        "qumran_references": ["1QM (19 columns)", "4Q491 (4QM-a)", "4Q492 (4QM-b)", "4Q493 (4QM-c)", "4Q494 (4QM-d)", "4Q495 (4QM-e)", "4Q496 (4QM-f)", "4Q497"],
        "total_columns": 19,
        "sections": [
            {"name": "Introduction (Col. I)", "description": "The 40-year war of the Sons of Light against the Sons of Darkness"},
            {"name": "Military Organization (Col. II-IX)", "description": "Banners, trumpets, formations, weapons, age requirements"},
            {"name": "Battle Liturgy (Col. X-XIV)", "description": "Prayers, hymns, and blessings for battle"},
            {"name": "Final Battle (Col. XV-XIX)", "description": "Seven engagements — God intervenes in the seventh"},
        ],
        "significance": "Eschatological battle plan combining Hellenistic military tactics with prophetic vision. Influenced early Christian apocalypticism (cf. Revelation 19-20). The 'Sons of Light vs. Sons of Darkness' framework parallels Pauline and Johannine dualism.",
        "data": []
    })
    
    # ── Temple Scroll (11QT) ──
    print("\n" + "=" * 60)
    print("📜 TEMPLE SCROLL (11QT — Megillat ha-Mikdash)")
    print("=" * 60)
    print("  Original: Hebrew (longest scroll found — 8.15 meters)")
    
    all_scrolls["scrolls"].append({
        "id": "temple-scroll",
        "name": "Temple Scroll (11QT)",
        "category": "Sectarian",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; longest DSS at 8.15 meters (66 columns). Second copy: 11Q20. Fragments: 4Q524",
        "date_composed": "~2nd century BC",
        "qumran_references": ["11Q19 (11QT-a, 66 columns)", "11Q20 (11QT-b, fragmentary)", "4Q524"],
        "total_columns": 66,
        "sections": [
            {"name": "Covenant Renewal (Col. II-XIII)", "description": "Rewriting Exodus 34-Deuteronomy festival laws"},
            {"name": "Ideal Temple Plan (Col. III-XIII, XXX-XLV)", "description": "Detailed architectural plan for God's temple — three concentric courts"},
            {"name": "Festival Calendar (Col. XIII-XXIX)", "description": "Feast laws based on the 364-day solar calendar"},
            {"name": "Purity Laws (Col. XLV-LI)", "description": "Expansion of Deuteronomic purity regulations"},
            {"name": "Royal Law (Col. LVI-LIX)", "description": "The king's law — limits on royal power"},
            {"name": "Miscellaneous Laws (Col. LX-LXVI)", "description": "Various legal rulings"},
        ],
        "significance": "Presents itself as God's direct speech to Moses (first person). Provides the most detailed architectural plan for a Jewish temple outside Ezekiel 40-48. The 'Torah of the King' section limits royal authority — possibly anti-Hasmonean polemic.",
        "data": []
    })
    
    # ── Thanksgiving Hymns (1QH / Hodayot) ──
    print("\n" + "=" * 60)
    print("📜 THANKSGIVING HYMNS (1QH — Hodayot)")
    print("=" * 60)
    
    all_scrolls["scrolls"].append({
        "id": "thanksgiving-hymns",
        "name": "Thanksgiving Hymns (1QH)",
        "category": "Liturgical",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; badly damaged scroll from Cave 1 with ~25 hymns. Fragments: 4Q427-432 (4QH a-f), 1Q35 (1QH-b)",
        "date_composed": "~1st century BC",
        "qumran_references": ["1QH-a (main scroll, ~25 columns)", "1Q35 (1QH-b)", "4Q427-432 (4QH a-f)"],
        "total_hymns": 25,
        "sections": [
            {"name": "Teacher Hymns", "description": "Personal hymns possibly by the Teacher of Righteousness — themes of persecution, divine revelation, and community leadership"},
            {"name": "Community Hymns", "description": "Congregational hymns — themes of human frailty, divine grace, and cosmic knowledge"},
        ],
        "significance": "The most personal and emotional DSS texts. Closest parallel to the Psalms. The 'Teacher' hymns may preserve the voice of the community's founder. Themes of justification by grace anticipate Pauline theology (cf. Romans 3-4).",
        "data": []
    })
    
    # ── Pesharim (Biblical Commentaries) ──
    print("\n" + "=" * 60)
    print("📜 PESHARIM (Qumran Biblical Commentaries)")
    print("=" * 60)
    
    all_scrolls["scrolls"].append({
        "id": "pesher-habakkuk",
        "name": "Pesher Habakkuk (1QpHab)",
        "category": "Exegetical",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; nearly complete scroll from Cave 1 (13 columns). Commentary on Habakkuk 1-2",
        "date_composed": "~1st century BC",
        "qumran_references": ["1QpHab (13 columns)"],
        "total_columns": 13,
        "sections": [
            {"name": "Commentary on Habakkuk 1-2", "description": "Interprets Habakkuk's prophecy as referring to the Qumran community's own history — the Teacher of Righteousness vs. the Wicked Priest"},
        ],
        "significance": "Best-preserved example of pesher ('interpretation') method. Reveals how Qumran read biblical prophecy as coded references to their own time — a hermeneutic paralleled in early Christianity's reading of the OT.",
        "data": []
    })
    
    # ── Genesis Apocryphon ──
    print("\n" + "=" * 60)
    print("📜 GENESIS APOCRYPHON (1QapGen)")
    print("=" * 60)
    
    all_scrolls["scrolls"].append({
        "id": "genesis-apocryphon",
        "name": "Genesis Apocryphon (1QapGen)",
        "category": "Rewritten Bible",
        "original_language": "aramaic",
        "original_language_note": "Written in Aramaic; badly deteriorated scroll from Cave 1. Only columns II, XIX-XXII well preserved",
        "date_composed": "~1st century BC",
        "qumran_references": ["1Q20 (1QapGen, ~22 columns, mostly damaged)"],
        "total_columns": 22,
        "sections": [
            {"name": "Lamech's Story (Col. II-V)", "description": "Lamech's fear that Noah was fathered by a Watcher (fallen angel)"},
            {"name": "Noah Narrative (Col. VI-XVII)", "description": "Expanded flood narrative and division of the earth"},
            {"name": "Abraham Narrative (Col. XIX-XXII)", "description": "Abraham in Egypt — Sarah's beauty described, Pharaoh's plague"},
        ],
        "significance": "First-person narrative expansion of Genesis. Provides unique window into how Second Temple Jews retold and expanded biblical stories. The Lamech/Noah section connects to 1 Enoch's Watcher tradition.",
        "data": []
    })
    
    # ── Copper Scroll ──
    print("\n" + "=" * 60)
    print("📜 COPPER SCROLL (3Q15)")
    print("=" * 60)
    
    all_scrolls["scrolls"].append({
        "id": "copper-scroll",
        "name": "Copper Scroll (3Q15)",
        "category": "Documentary",
        "original_language": "hebrew",
        "original_language_note": "Engraved on copper; unique among the DSS. Mishnaic Hebrew with some errors. Found in Cave 3",
        "date_composed": "~1st century AD",
        "qumran_references": ["3Q15 (two copper rolls, 12 columns)"],
        "total_columns": 12,
        "total_locations": 64,
        "sections": [
            {"name": "Treasure List", "description": "64 locations where gold, silver, scrolls, and sacred vessels are allegedly buried. Total claimed: ~4,600 talents of gold and silver (est. $1 billion+)"},
        ],
        "significance": "Most enigmatic DSS. Either records actual Temple treasure hidden before 70 AD destruction, or is a legendary/fictional inventory. The only DSS written on metal. Locations remain unidentified.",
        "data": []
    })
    
    # ── Damascus Document ──
    print("\n" + "=" * 60)
    print("📜 DAMASCUS DOCUMENT (CD)")
    print("=" * 60)
    
    all_scrolls["scrolls"].append({
        "id": "damascus-document",
        "name": "Damascus Document (CD)",
        "category": "Sectarian",
        "original_language": "hebrew",
        "original_language_note": "Written in Hebrew; two medieval copies found in Cairo Genizah (1896). Qumran fragments: 4Q266-273, 5Q12, 6Q15",
        "date_composed": "~100 BC",
        "qumran_references": ["4Q266-273 (4QD a-h)", "5Q12", "6Q15"],
        "sections": [
            {"name": "Admonition (Col. I-VIII, XIX-XX)", "description": "Historical survey of Israel's unfaithfulness; the community as the faithful remnant; the Teacher of Righteousness"},
            {"name": "Laws (Col. IX-XVI)", "description": "Sabbath regulations, oaths, witnesses, judges, purity — stricter than Pharisaic halakhah"},
        ],
        "significance": "The 'sister document' to the Community Rule. First DSS text discovered (in Cairo, 1896 — before Qumran). References to a 'New Covenant in the land of Damascus' connect to early Christianity's 'New Covenant' language (Luke 22:20, 1 Corinthians 11:25). The sect may have originated in Damascus before moving to Qumran.",
        "data": []
    })

    # ── Now try to download actual verse content for 1 Enoch from bolls.life ──
    print("\n" + "=" * 60)
    print("📜 Downloading available text content...")
    print("=" * 60)
    
    # Try to find 1 Enoch on bolls.life via Ethiopian Bible
    for code in ["ETH", "ETHKJV", "LXXE", "NRSVAE", "NETfull"]:
        url = f"{BOLLS_LIFE_API_BASE}get-books/{code}/"
        data = fetch_json(url)
        if data:
            for book in data:
                name = str(book.get('name', '')).lower()
                bid = book.get('bookid', book.get('id', 0))
                if 'enoch' in name or bid > 86:
                    print(f"  Found potential DSS text in {code}: {book.get('name')} (ID {bid}, {book.get('chapters', '?')} ch)")
    
    # Try getbible.net for 1 Enoch
    print("\n  Checking getbible.net for 1 Enoch...")
    enoch_url = "https://getbible.net/v2/aethiopic/67.json"
    enoch_data_raw = fetch_json(enoch_url)
    if enoch_data_raw:
        print(f"  ✅ Found 1 Enoch on getbible.net!")
    else:
        print("  ⚠️  Not available on getbible.net")
    
    # Try sacred-texts.com structure (R.H. Charles translation)
    print("\n  Checking for R.H. Charles 1 Enoch text...")
    charles_url = "https://sacred-texts.com/bib/boe/index.htm"
    charles_page = fetch_text(charles_url)
    if charles_page and 'Enoch' in str(charles_page):
        print("  ✅ sacred-texts.com has 1 Enoch (R.H. Charles)")
        print("     Would need HTML parsing to extract verses — marking for future download")
    else:
        print("  ⚠️  sacred-texts.com not accessible from this environment")

    # Save the DSS metadata + whatever text we got
    output_file = os.path.join(output_dir, "dss-collection.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_scrolls, f, ensure_ascii=False, indent=2)
    
    file_size = os.path.getsize(output_file) / 1024
    print(f"\n{'=' * 60}")
    print(f"✅ SAVED: {output_file} ({file_size:.1f} KB)")
    print(f"   {len(all_scrolls['scrolls'])} scrolls/texts catalogued")
    print(f"{'=' * 60}")
    
    return all_scrolls


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    output_directory = "public/lib/original-texts/"
    download_all_dss(output_directory)

