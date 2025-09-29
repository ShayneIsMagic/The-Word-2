import os
from pdfminer.high_level import extract_text
import requests
from bs4 import BeautifulSoup
import re
import time

# --- CONFIGURATION ---
NA28_PDF = "scripture-app/The Greek New Testament UBS Fifth Revised Edition.pdf"
UBS5_PDF = "scripture-app/Novum Testamentum Graece_ Nestle-Aland  (28 ed.) ( PDFDrive ).pdf"
VERSE_GREEK = "Ἐν ἀρχῇ ἦν ὁ λόγος"  # John 1:1 Greek
ONLINE_URL = "https://sblgnt.com/passages/John/1/1"

def extract_verse_from_pdf(pdf_path, verse_greek):
    print(f"\nExtracting from {pdf_path} ...")
    text = extract_text(pdf_path)
    # Find the line containing the Greek for John 1:1
    for line in text.splitlines():
        if verse_greek in line:
            print(f"Found verse: {line.strip()}")
            return line.strip()
    print("Verse not found in PDF.")
    return None

def fetch_online_verse(url):
    print(f"\nFetching online verse from {url} ...")
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    # SBLGNT displays the verse in a <span class="verse">
    verse = soup.find("span", class_="verse")
    if verse:
        print(f"Online verse: {verse.text.strip()}")
        return verse.text.strip()
    print("Verse not found online.")
    return None

def compare_texts(texts):
    print("\n--- Comparison ---")
    for label, text in texts.items():
        print(f"{label}: {text}")
    base = list(texts.values())[0]
    for label, text in texts.items():
        if text != base:
            print(f"❌ Discrepancy found in {label}!")
        else:
            print(f"✅ {label} matches base text.")

def scan_for_sections(pdf_path, keywords):
    print(f"\nScanning {pdf_path} for sections ...")
    text = extract_text(pdf_path)
    found = set()
    for keyword in keywords:
        if re.search(keyword, text, re.IGNORECASE):
            found.add(keyword)
    if found:
        print(f"Found sections: {', '.join(found)}")
    else:
        print("No dictionary/commentary sections found.")
    return found

def extract_section_content(pdf_path, start_keyword, end_keywords):
    print(f"\nExtracting section '{start_keyword}' from {pdf_path} ...")
    text = extract_text(pdf_path)
    lines = text.splitlines()
    extracting = False
    section = []
    for line in lines:
        if not extracting and start_keyword.lower() in line.lower():
            extracting = True
            section.append(line)
            continue
        if extracting:
            if any(end.lower() in line.lower() for end in end_keywords):
                break
            section.append(line)
    if section:
        print(f"\n--- Start of '{start_keyword}' section ---\n")
        print("\n".join(section[:50]))  # Print first 50 lines for preview
        print(f"\n--- End of '{start_keyword}' section (preview) ---\n")
        print(f"Total lines extracted: {len(section)}")
    else:
        print(f"Section '{start_keyword}' not found.")
    return section

def extract_section_content_to_file(pdf_path, start_keyword, end_keywords, output_file):
    print(f"\nExtracting section '{start_keyword}' from {pdf_path} ...")
    start_time = time.time()
    text = extract_text(pdf_path)
    lines = text.splitlines()
    extracting = False
    section = []
    for line in lines:
        if not extracting and start_keyword.lower() in line.lower():
            extracting = True
            section.append(line)
            continue
        if extracting:
            if any(end.lower() in line.lower() for end in end_keywords):
                break
            section.append(line)
    if section:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(section))
        print(f"Saved '{start_keyword}' section to {output_file} ({len(section)} lines)")
    else:
        print(f"Section '{start_keyword}' not found.")
    print(f"Extraction time: {time.time() - start_time:.2f} seconds")
    return section

def print_possible_section_headers(pdf_path):
    print(f"\nScanning for possible section headers in {pdf_path} ...")
    text = extract_text(pdf_path)
    lines = text.splitlines()
    headers = set()
    for line in lines:
        l = line.strip()
        # Heuristic: lines in all caps, or containing key words
        if (l.isupper() and len(l) > 3) or any(k in l.lower() for k in ["dictionary", "commentary", "appendix", "index", "bibliography", "references", "lexicon", "introduction", "notes"]):
            headers.add(l)
    print("\nPossible section headers found:")
    for h in sorted(headers):
        print(h)
    print(f"\nTotal unique headers: {len(headers)}")

if __name__ == "__main__":
    # 1. Extract John 1:1 from both PDFs
    na28_verse = extract_verse_from_pdf(NA28_PDF, VERSE_GREEK)
    ubs5_verse = extract_verse_from_pdf(UBS5_PDF, VERSE_GREEK)

    # 2. Fetch John 1:1 from SBLGNT
    online_verse = fetch_online_verse(ONLINE_URL)

    # 3. Compare all three
    compare_texts({
        "NA28 PDF": na28_verse,
        "UBS5 PDF": ubs5_verse,
        "SBLGNT Online": online_verse
    })

    # 4. Scan for dictionaries/commentaries
    keywords = [
        "dictionary", "lexicon", "commentary", "introduction", "appendix",
        "glossary", "index", "notes", "bibliography", "references"
    ]
    print("\n--- Scanning for dictionaries/commentaries ---")
    scan_for_sections(NA28_PDF, keywords)
    scan_for_sections(UBS5_PDF, keywords)

    # 5. Print all possible section headers for manual review
    print_possible_section_headers(NA28_PDF)
    print_possible_section_headers(UBS5_PDF)

    # 6. Extract and save dictionary and commentary sections as plain text files using robust headers
    end_keywords = ["APPENDIX"]
    extract_section_content_to_file(
        NA28_PDF, "DICTIONARY", end_keywords, "scripture-app/dictionary_section.txt"
    )
    extract_section_content_to_file(
        NA28_PDF, "COMMENTARY", end_keywords, "scripture-app/commentary_section.txt"
    ) 