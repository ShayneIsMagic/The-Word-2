#!/usr/bin/env python3
"""
Parse & Download Dead Sea Scrolls / Pseudepigrapha Texts
==========================================================

Downloads public domain texts from Project Gutenberg and other sources,
parses them into structured JSON, and saves to public/lib/original-texts/

Texts sourced:
  1. 1 Enoch (R.H. Charles / Richard Laurence) — Gutenberg #77815
  2. Jubilees (R.H. Charles, 1902)
  3. Psalms of Solomon (R.H. Charles)
  4. Testaments of the Twelve Patriarchs (R.H. Charles)
  5. 2 Baruch / Apocalypse of Baruch (R.H. Charles)
  6. Assumption of Moses (R.H. Charles)
  7. Letter of Aristeas (R.H. Charles)

All from "The Apocrypha and Pseudepigrapha of the Old Testament" (1913)
which is PUBLIC DOMAIN.
"""

import os
import re
import json
import urllib.request
import ssl
from typing import Dict, List, Optional, Tuple
from datetime import datetime


# ============================================================================
# Helpers
# ============================================================================

def fetch_text(url: str) -> Optional[str]:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  ❌ Error fetching {url}: {e}")
        return None


# ============================================================================
# 1 ENOCH — Parse from Gutenberg plain text
# ============================================================================

def parse_enoch(raw_text: str) -> dict:
    """Parse 1 Enoch from the Gutenberg plain text (Richard Laurence translation)."""
    print("\n📜 Parsing 1 Enoch...")
    
    # Find the start of actual text (after Gutenberg header and introduction)
    lines = raw_text.split('\n')
    
    # The actual text starts after the introduction, look for "1. The word of the blessing"
    start_idx = None
    end_idx = None
    for i, line in enumerate(lines):
        if '1. The word of the blessing of Enoch' in line:
            start_idx = i
            break
    
    # Find end (Gutenberg footer)
    for i, line in enumerate(lines):
        if '*** END OF THE PROJECT GUTENBERG EBOOK' in line:
            end_idx = i
            break
    
    if start_idx is None:
        print("  ❌ Could not find start of 1 Enoch text")
        return {"name": "1 Enoch", "chapters": []}
    
    text_lines = lines[start_idx:end_idx] if end_idx else lines[start_idx:]
    
    # Parse into chapters and verses
    # The text uses numbered verses like "1. text", "2. text"
    # Chapters are separated by blank lines and start with "1."
    chapters = []
    current_chapter = []
    current_verse_num = 0
    current_verse_text = ""
    chapter_num = 0
    
    for line in text_lines:
        line = line.strip()
        if not line:
            continue
        
        # Check for footnote markers and skip pure footnotes
        if line.startswith('[') and line[1:3].isdigit() and ']' in line[:6]:
            # This is likely a footnote reference at start of line
            pass
        
        # Check if this starts a new verse
        verse_match = re.match(r'^(\d+)\.\s+(.+)', line)
        
        if verse_match:
            new_verse_num = int(verse_match.group(1))
            verse_text = verse_match.group(2)
            
            # If we go back to verse 1 and we had content, that's a new chapter
            if new_verse_num == 1 and current_verse_num > 0:
                # Save previous verse
                if current_verse_text:
                    current_chapter.append({
                        "verse": current_verse_num,
                        "text": clean_text(current_verse_text)
                    })
                # Save previous chapter
                if current_chapter:
                    chapter_num += 1
                    chapters.append({
                        "chapter": chapter_num,
                        "verses": current_chapter
                    })
                current_chapter = []
            elif current_verse_text and current_verse_num > 0:
                # Save previous verse
                current_chapter.append({
                    "verse": current_verse_num,
                    "text": clean_text(current_verse_text)
                })
            
            current_verse_num = new_verse_num
            current_verse_text = verse_text
        else:
            # Continuation of current verse
            if current_verse_num > 0:
                current_verse_text += " " + line
    
    # Save last verse and chapter
    if current_verse_text:
        current_chapter.append({
            "verse": current_verse_num,
            "text": clean_text(current_verse_text)
        })
    if current_chapter:
        chapter_num += 1
        chapters.append({
            "chapter": chapter_num,
            "verses": current_chapter
        })
    
    total_verses = sum(len(c["verses"]) for c in chapters)
    print(f"  ✅ Parsed: {len(chapters)} chapters, {total_verses} verses")
    
    return {
        "name": "1 Enoch",
        "chapters": chapters
    }


def clean_text(text: str) -> str:
    """Clean up parsed text — remove footnote markers, extra whitespace."""
    # Remove footnote references like [25], [86], etc.
    text = re.sub(r'\[\d+\]', '', text)
    # Remove italic markers
    text = text.replace('_', '')
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove trailing footnote text (sometimes footnotes are inline)
    return text


# ============================================================================
# Download & parse all available texts
# ============================================================================

def download_and_parse_all(output_dir: str):
    """Download and parse all available public domain DSS/Pseudepigrapha texts."""
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("DEAD SEA SCROLLS & PSEUDEPIGRAPHA — Text Acquisition")
    print("=" * 60)
    
    all_books = []
    
    # ── 1 ENOCH ──
    print("\n" + "─" * 60)
    print("📖 1 ENOCH (Richard Laurence, 1883 — Public Domain)")
    print("─" * 60)
    
    # Check if we already downloaded it
    enoch_cache = "/tmp/enoch_gutenberg.txt"
    if os.path.exists(enoch_cache):
        print("  Using cached download...")
        with open(enoch_cache, 'r') as f:
            enoch_raw = f.read()
    else:
        print("  Downloading from Project Gutenberg #77815...")
        enoch_raw = fetch_text("https://www.gutenberg.org/ebooks/77815.txt.utf-8")
        if enoch_raw:
            with open(enoch_cache, 'w') as f:
                f.write(enoch_raw)
    
    if enoch_raw:
        enoch_data = parse_enoch(enoch_raw)
        all_books.append({
            "id": "1-enoch",
            "name": "1 Enoch (Book of Enoch)",
            "abbreviation": "1 En",
            "category": "Apocalyptic",
            "original_language": "Aramaic/Ge'ez",
            "translation": "Richard Laurence (1883)",
            "source": "Project Gutenberg #77815",
            "license": "Public Domain",
            "date_composed": "~300-100 BC (composite)",
            "qumran_refs": "4Q201-212 (11 Aramaic fragments)",
            "sections": [
                {"name": "Book of the Watchers", "chapters": "1-36"},
                {"name": "Book of Parables (Similitudes)", "chapters": "37-71"},
                {"name": "Astronomical Book", "chapters": "72-82"},
                {"name": "Book of Dreams", "chapters": "83-90"},
                {"name": "Epistle of Enoch", "chapters": "91-108"},
            ],
            "significance": "Quoted in Jude 14-15. Foundational for Jewish and Christian apocalypticism. The 'Son of Man' tradition influenced NT Christology. 11 Aramaic fragments found at Qumran (all sections except Parables).",
            "chapters": enoch_data["chapters"],
            "total_chapters": len(enoch_data["chapters"]),
            "total_verses": sum(len(c["verses"]) for c in enoch_data["chapters"])
        })
    
    # ── JUBILEES ──
    print("\n" + "─" * 60)
    print("📖 JUBILEES (R.H. Charles, 1902 — Public Domain)")
    print("─" * 60)
    
    # Try Gutenberg for Jubilees
    jubilees_raw = None
    jubilees_cache = "/tmp/jubilees_gutenberg.txt"
    
    if os.path.exists(jubilees_cache):
        print("  Using cached download...")
        with open(jubilees_cache, 'r') as f:
            jubilees_raw = f.read()
    else:
        # Search Gutenberg
        print("  Searching Project Gutenberg for Jubilees...")
        search_url = "https://gutendex.com/books?search=jubilees+charles"
        search_result = fetch_text(search_url)
        if search_result:
            try:
                data = json.loads(search_result)
                for book in data.get("results", []):
                    if "jubilee" in book.get("title", "").lower():
                        print(f"  Found: {book['title']} (ID {book['id']})")
                        for fmt, url in book.get("formats", {}).items():
                            if "text/plain" in fmt:
                                print(f"  Downloading: {url}")
                                jubilees_raw = fetch_text(url)
                                if jubilees_raw:
                                    with open(jubilees_cache, 'w') as f:
                                        f.write(jubilees_raw)
                                break
            except json.JSONDecodeError:
                pass
        
        if not jubilees_raw:
            # Try Internet Archive for R.H. Charles APOT Vol 2
            print("  Trying Internet Archive...")
            ia_url = "https://archive.org/download/bookjubileestran00char/bookjubileestran00char_djvu.txt"
            jubilees_raw = fetch_text(ia_url)
            if jubilees_raw:
                with open(jubilees_cache, 'w') as f:
                    f.write(jubilees_raw)
    
    if jubilees_raw and len(jubilees_raw) > 1000:
        jubilees_data = parse_generic_chapters(jubilees_raw, "Jubilees")
        if jubilees_data["chapters"]:
            all_books.append({
                "id": "jubilees",
                "name": "Jubilees (Little Genesis)",
                "abbreviation": "Jub",
                "category": "Rewritten Bible",
                "original_language": "Hebrew",
                "translation": "R.H. Charles (1902)",
                "source": "Internet Archive / Project Gutenberg",
                "license": "Public Domain",
                "date_composed": "~160-150 BC",
                "qumran_refs": "4Q216-228, 1Q17-18, 2Q19-20, 3Q5, 11Q12 (15+ Hebrew fragments)",
                "sections": [
                    {"name": "Creation to Abraham", "chapters": "1-23"},
                    {"name": "Abraham to Moses", "chapters": "24-50"},
                ],
                "significance": "Rewrites Genesis-Exodus on a 49-year jubilee calendar. Authoritative at Qumran (cited as scripture). 15+ Hebrew fragments found confirm Hebrew original.",
                "chapters": jubilees_data["chapters"],
                "total_chapters": len(jubilees_data["chapters"]),
                "total_verses": sum(len(c["verses"]) for c in jubilees_data["chapters"])
            })
        else:
            print("  ⚠️  Could not parse Jubilees text — adding metadata only")
            all_books.append(make_metadata_only("jubilees", "Jubilees (Little Genesis)", "Jub", 50, "Rewritten Bible", "Hebrew", "~160-150 BC", "4Q216-228, 1Q17-18, 2Q19-20, 3Q5, 11Q12"))
    else:
        print("  ⚠️  Could not download Jubilees — adding metadata only")
        all_books.append(make_metadata_only("jubilees", "Jubilees (Little Genesis)", "Jub", 50, "Rewritten Bible", "Hebrew", "~160-150 BC", "4Q216-228, 1Q17-18, 2Q19-20, 3Q5, 11Q12"))
    
    # ── PSALMS OF SOLOMON ──
    print("\n" + "─" * 60)
    print("📖 PSALMS OF SOLOMON")
    print("─" * 60)
    print("  Adding metadata (text to be sourced)")
    all_books.append(make_metadata_only("psalms-of-solomon", "Psalms of Solomon", "Ps Sol", 18, "Poetry/Wisdom", "Hebrew (composed)/Greek (preserved)", "~70-30 BC", "No Qumran fragments — but contemporary with DSS community"))
    
    # ── TESTAMENTS OF THE TWELVE PATRIARCHS ──
    print("\n" + "─" * 60)
    print("📖 TESTAMENTS OF THE TWELVE PATRIARCHS")
    print("─" * 60)
    print("  Adding metadata (text to be sourced)")
    all_books.append(make_metadata_only("testaments-twelve", "Testaments of the Twelve Patriarchs", "T12P", 12, "Testamentary", "Hebrew/Aramaic → Greek", "~200-100 BC", "4Q213-214 (Testament of Levi, Aramaic), 4Q215 (Testament of Naphtali, Hebrew)"))
    
    # ── 2 BARUCH (Syriac Apocalypse) ──
    print("\n" + "─" * 60)
    print("📖 2 BARUCH (Syriac Apocalypse of Baruch)")
    print("─" * 60)
    print("  Adding metadata (text to be sourced)")
    all_books.append(make_metadata_only("2-baruch", "2 Baruch (Syriac Apocalypse)", "2 Bar", 87, "Apocalyptic", "Hebrew (lost) → Syriac", "~early 2nd century AD", "No Qumran fragments — but thematically related"))
    
    # ── ASSUMPTION OF MOSES ──
    print("\n" + "─" * 60)
    print("📖 ASSUMPTION OF MOSES (Testament of Moses)")
    print("─" * 60)
    print("  Adding metadata (text to be sourced)")
    all_books.append(make_metadata_only("assumption-moses", "Assumption of Moses (Testament of Moses)", "As Mos", 12, "Testamentary/Apocalyptic", "Hebrew (lost) → Latin", "~1st century AD", "Jude 9 may allude to this text"))
    
    # ── SECTARIAN SCROLLS (metadata + summaries, no full text — copyrighted) ──
    print("\n" + "─" * 60)
    print("📖 SECTARIAN SCROLLS (metadata only — full text copyrighted)")
    print("─" * 60)
    
    sectarian = [
        {
            "id": "community-rule", "name": "Community Rule (1QS)", "abbreviation": "1QS",
            "category": "Sectarian/Legal", "original_language": "Hebrew",
            "date_composed": "~100 BC", "total_chapters": 11,
            "qumran_refs": "1QS (complete, 11 columns), 4Q255-264, 5Q11",
            "sections": [
                {"name": "Preamble (I.1-15)", "description": "Purpose of the community"},
                {"name": "Entrance Ceremony (I.16-III.12)", "description": "Covenant renewal liturgy"},
                {"name": "Treatise on Two Spirits (III.13-IV.26)", "description": "Spirit of Truth vs. Spirit of Deceit"},
                {"name": "Community Rules (V.1-VII.25)", "description": "Regulations for communal life"},
                {"name": "The Maskil's Hymn (VIII.1-X.8)", "description": "The instructor's role"},
                {"name": "Final Hymn (X.9-XI.22)", "description": "Praise and trust in God"},
            ],
            "significance": "Primary rule book of the Qumran community. The 'Two Spirits' doctrine influenced early Christian dualism (light vs. darkness in John's Gospel).",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il/explore-the-archive/manuscript/MAS-1e"},
                {"label": "BYU Studies: Community Rule", "url": "https://byustudies.byu.edu"}
            ]
        },
        {
            "id": "war-scroll", "name": "War Scroll (1QM)", "abbreviation": "1QM",
            "category": "Sectarian/Apocalyptic", "original_language": "Hebrew",
            "date_composed": "~late 1st century BC", "total_chapters": 19,
            "qumran_refs": "1QM (19 columns), 4Q491-497",
            "sections": [
                {"name": "Introduction (Col. I)", "description": "The 40-year war of Sons of Light vs. Sons of Darkness"},
                {"name": "Military Organization (Col. II-IX)", "description": "Banners, trumpets, formations"},
                {"name": "Battle Liturgy (Col. X-XIV)", "description": "Prayers and hymns for battle"},
                {"name": "Final Battle (Col. XV-XIX)", "description": "Seven engagements — God intervenes in the seventh"},
            ],
            "significance": "Eschatological battle plan. 'Sons of Light vs. Darkness' parallels Pauline and Johannine dualism.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il/explore-the-archive/manuscript/MAS-1f"}
            ]
        },
        {
            "id": "temple-scroll", "name": "Temple Scroll (11QT)", "abbreviation": "11QT",
            "category": "Sectarian/Legal", "original_language": "Hebrew",
            "date_composed": "~2nd century BC", "total_chapters": 66,
            "qumran_refs": "11Q19 (66 columns — longest DSS at 8.15m), 11Q20, 4Q524",
            "sections": [
                {"name": "Covenant Renewal (Col. II-XIII)", "description": "Rewriting festival laws"},
                {"name": "Ideal Temple Plan (Col. III-XLV)", "description": "Three concentric courts"},
                {"name": "Festival Calendar (Col. XIII-XXIX)", "description": "364-day solar calendar"},
                {"name": "Purity Laws (Col. XLV-LI)", "description": "Expanded Deuteronomic purity"},
                {"name": "Royal Law (Col. LVI-LIX)", "description": "Limits on royal power"},
            ],
            "significance": "Presents itself as God's direct speech to Moses. Most detailed Jewish temple plan outside Ezekiel 40-48.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il/explore-the-archive/manuscript/MAS-1l"}
            ]
        },
        {
            "id": "thanksgiving-hymns", "name": "Thanksgiving Hymns (1QH — Hodayot)", "abbreviation": "1QH",
            "category": "Liturgical/Poetry", "original_language": "Hebrew",
            "date_composed": "~1st century BC", "total_chapters": 25,
            "qumran_refs": "1QH-a (~25 columns), 1Q35, 4Q427-432",
            "sections": [
                {"name": "Teacher Hymns", "description": "Personal hymns of the Teacher of Righteousness — persecution, revelation"},
                {"name": "Community Hymns", "description": "Congregational — human frailty, divine grace"},
            ],
            "significance": "Most personal DSS texts. Themes of justification by grace anticipate Pauline theology.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il"}
            ]
        },
        {
            "id": "pesher-habakkuk", "name": "Pesher Habakkuk (1QpHab)", "abbreviation": "1QpHab",
            "category": "Exegetical", "original_language": "Hebrew",
            "date_composed": "~1st century BC", "total_chapters": 13,
            "qumran_refs": "1QpHab (13 columns)",
            "significance": "Best-preserved pesher. Shows how Qumran read prophecy as coded references to their own time.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il/explore-the-archive/manuscript/MAS-1j"}
            ]
        },
        {
            "id": "genesis-apocryphon", "name": "Genesis Apocryphon (1QapGen)", "abbreviation": "1QapGen",
            "category": "Rewritten Bible", "original_language": "Aramaic",
            "date_composed": "~1st century BC", "total_chapters": 22,
            "qumran_refs": "1Q20 (~22 columns, mostly damaged)",
            "significance": "First-person narrative expansion of Genesis. Lamech/Noah section connects to 1 Enoch's Watcher tradition.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il"}
            ]
        },
        {
            "id": "copper-scroll", "name": "Copper Scroll (3Q15)", "abbreviation": "3Q15",
            "category": "Documentary", "original_language": "Mishnaic Hebrew",
            "date_composed": "~1st century AD", "total_chapters": 12,
            "qumran_refs": "3Q15 (two copper rolls, 12 columns)",
            "significance": "Most enigmatic DSS. 64 treasure locations. Only DSS written on metal.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il"}
            ]
        },
        {
            "id": "damascus-document", "name": "Damascus Document (CD)", "abbreviation": "CD",
            "category": "Sectarian/Legal", "original_language": "Hebrew",
            "date_composed": "~100 BC", "total_chapters": 20,
            "qumran_refs": "4Q266-273, 5Q12, 6Q15 (also 2 medieval copies from Cairo Genizah, 1896)",
            "significance": "First DSS text ever discovered (Cairo, 1896). 'New Covenant in Damascus' connects to NT 'New Covenant' language.",
            "external_links": [
                {"label": "Leon Levy Digital Library", "url": "https://www.deadseascrolls.org.il"}
            ]
        },
    ]
    
    for scroll in sectarian:
        all_books.append({
            **scroll,
            "chapters": [],
            "total_verses": 0,
            "text_status": "metadata_only",
            "text_note": "Full transcription and modern translations are under copyright (Oxford DJD series, Vermes, García Martínez). Sections, summaries, and external links provided for scholarly reference."
        })
        print(f"  📜 {scroll['name']} — metadata added")
    
    # ── Build final output ──
    books_with_text = sum(1 for b in all_books if b.get("total_verses", 0) > 0)
    books_metadata = sum(1 for b in all_books if b.get("total_verses", 0) == 0)
    total_verses = sum(b.get("total_verses", 0) for b in all_books)
    
    final = {
        "info": {
            "collection": "Dead Sea Scrolls & Related Pseudepigrapha",
            "date_compiled": datetime.now().isoformat(),
            "note": "Separate from canonical and deuterocanonical texts. Ancient manuscripts from Qumran (1947-1956) and related Second Temple Jewish literature.",
            "books_with_full_text": books_with_text,
            "books_with_metadata_only": books_metadata,
            "total_verses": total_verses,
            "academic_sources": [
                "R.H. Charles, The Apocrypha and Pseudepigrapha of the Old Testament (1913)",
                "Richard Laurence, The Book of Enoch the Prophet (1883, from 1821 Ethiopic MS)",
                "Florentino García Martínez & Eibert J.C. Tigchelaar, The Dead Sea Scrolls Study Edition (1997-1998)",
                "Geza Vermes, The Complete Dead Sea Scrolls in English (2004)",
                "Donald W. Parry & Emanuel Tov, The Dead Sea Scrolls Bible (1999)",
                "James H. Charlesworth, The Old Testament Pseudepigrapha (1983/1985)"
            ],
            "copyright_note": "Public domain texts (pre-1927) are included with full verse content. Modern scholarly translations of the sectarian scrolls (Community Rule, War Scroll, etc.) are under copyright and are represented with metadata, section summaries, and links to scholarly resources."
        },
        "books": all_books
    }
    
    output_file = os.path.join(output_dir, "dss-texts.json")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final, f, ensure_ascii=False, indent=2)
    
    file_size = os.path.getsize(output_file) / 1024
    
    print(f"\n{'=' * 60}")
    print(f"✅ COMPLETE: {output_file}")
    print(f"   {len(all_books)} texts ({books_with_text} with full text, {books_metadata} metadata only)")
    print(f"   {total_verses} total verses")
    print(f"   {file_size:.1f} KB")
    print(f"{'=' * 60}")
    
    return final


def parse_generic_chapters(raw_text: str, book_name: str) -> dict:
    """Try to parse a generic chapter/verse text."""
    print(f"  Parsing {book_name}...")
    
    lines = raw_text.split('\n')
    chapters = []
    current_chapter = []
    current_verse_num = 0
    current_verse_text = ""
    chapter_num = 0
    
    # Skip Gutenberg header
    in_text = False
    for i, line in enumerate(lines):
        if '*** START OF' in line:
            in_text = True
            continue
        if '*** END OF' in line:
            break
        if not in_text:
            continue
        
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        verse_match = re.match(r'^(\d+)\.\s+(.+)', line_stripped)
        if verse_match:
            new_verse_num = int(verse_match.group(1))
            verse_text = verse_match.group(2)
            
            if new_verse_num == 1 and current_verse_num > 0:
                if current_verse_text:
                    current_chapter.append({"verse": current_verse_num, "text": clean_text(current_verse_text)})
                if current_chapter:
                    chapter_num += 1
                    chapters.append({"chapter": chapter_num, "verses": current_chapter})
                current_chapter = []
            elif current_verse_text and current_verse_num > 0:
                current_chapter.append({"verse": current_verse_num, "text": clean_text(current_verse_text)})
            
            current_verse_num = new_verse_num
            current_verse_text = verse_text
        elif current_verse_num > 0:
            current_verse_text += " " + line_stripped
    
    if current_verse_text:
        current_chapter.append({"verse": current_verse_num, "text": clean_text(current_verse_text)})
    if current_chapter:
        chapter_num += 1
        chapters.append({"chapter": chapter_num, "verses": current_chapter})
    
    total_verses = sum(len(c["verses"]) for c in chapters)
    print(f"  ✅ Parsed: {len(chapters)} chapters, {total_verses} verses")
    
    return {"name": book_name, "chapters": chapters}


def make_metadata_only(id: str, name: str, abbr: str, chapters: int, category: str, lang: str, date: str, qumran: str) -> dict:
    """Create a metadata-only entry for a text we don't have full content for."""
    return {
        "id": id,
        "name": name,
        "abbreviation": abbr,
        "category": category,
        "original_language": lang,
        "date_composed": date,
        "qumran_refs": qumran,
        "total_chapters": chapters,
        "chapters": [],
        "total_verses": 0,
        "text_status": "metadata_only",
        "text_note": "Full text to be sourced from public domain editions."
    }


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    output_directory = "public/lib/original-texts/"
    download_and_parse_all(output_directory)

