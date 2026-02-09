#!/usr/bin/env python3
"""
OCR Accuracy Verification Script
Compares OCR extraction from PDFs against verified GitHub solution data

This script:
1. Loads verified Hebrew/Greek data from GitHub solution
2. Extracts text from PDFs using OCR
3. Compares and calculates accuracy
4. Reports differences for review
"""

import os
import re
import json
import sys
from typing import Dict, List, Tuple
from difflib import SequenceMatcher
from datetime import datetime

# Check dependencies
try:
    import fitz  # PyMuPDF
    from PIL import Image, ImageEnhance, ImageFilter
    import pytesseract
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install pymupdf pillow pytesseract")
    sys.exit(1)

# ============================================================================
# Configuration
# ============================================================================

# Verified data files (from GitHub solution)
VERIFIED_HEBREW = "public/lib/original-texts/hebrew-ot-mechon.json"
VERIFIED_GREEK = "public/lib/original-texts/greek-nt.json"

# PDF files
PDF_FILES = {
    'hebrew': [
        'BHS-ESV Interlinear OT.pdf',
        'BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf',
    ],
    'greek': [
        'The Greek New Testament UBS Fifth Revised Edition.pdf',
        'Novum Testamentum Graece_ Nestle-Aland  (28 ed.) ( PDFDrive ).pdf',
    ]
}

# Unicode patterns (from GitHub solution - download_hebrew_bible.py line 85)
HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF\uFB1D-\uFB4F]+')
GREEK_PATTERN = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]+')

# ============================================================================
# Load Verified Data
# ============================================================================

def load_verified_data() -> Tuple[Dict, Dict]:
    """Load verified Hebrew and Greek data from GitHub solution"""
    
    hebrew_data = {}
    greek_data = {}
    
    if os.path.exists(VERIFIED_HEBREW):
        with open(VERIFIED_HEBREW, 'r', encoding='utf-8') as f:
            hebrew_data = json.load(f)
        print(f"✅ Loaded {len(hebrew_data)} verified Hebrew verses")
    else:
        print(f"❌ Hebrew data not found: {VERIFIED_HEBREW}")
    
    if os.path.exists(VERIFIED_GREEK):
        with open(VERIFIED_GREEK, 'r', encoding='utf-8') as f:
            greek_data = json.load(f)
        print(f"✅ Loaded {len(greek_data)} verified Greek verses")
    else:
        print(f"❌ Greek data not found: {VERIFIED_GREEK}")
    
    return hebrew_data, greek_data


# ============================================================================
# OCR Functions
# ============================================================================

def pdf_page_to_image(pdf_path: str, page_num: int, dpi: int = 300) -> Image.Image:
    """Convert PDF page to image"""
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    doc.close()
    return img


def preprocess_image(img: Image.Image) -> Image.Image:
    """Preprocess image for better OCR"""
    # Convert to grayscale
    if img.mode != 'L':
        img = img.convert('L')
    
    # Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)
    
    # Sharpen
    img = img.filter(ImageFilter.SHARPEN)
    
    return img


def ocr_page(img: Image.Image, lang: str) -> str:
    """Run Tesseract OCR on image"""
    img_processed = preprocess_image(img)
    config = '--psm 6 --oem 3'
    try:
        text = pytesseract.image_to_string(img_processed, lang=lang, config=config)
        return text
    except Exception as e:
        print(f"  OCR Error: {e}")
        return ""


def extract_script(text: str, pattern: re.Pattern) -> List[str]:
    """Extract specific script (Hebrew/Greek) from mixed text"""
    return pattern.findall(text)


# ============================================================================
# Comparison Functions
# ============================================================================

def normalize_text(text: str) -> str:
    """Normalize text for comparison (remove diacritics, whitespace)"""
    # Remove common variations
    text = re.sub(r'[\u0591-\u05C7]', '', text)  # Remove Hebrew cantillation marks
    text = re.sub(r'[\u0300-\u036F]', '', text)  # Remove combining diacritics
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()


def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity ratio between two texts"""
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, normalize_text(text1), normalize_text(text2)).ratio()


def find_verse_in_ocr(ocr_text: str, verified_text: str, pattern: re.Pattern) -> Tuple[bool, float, str]:
    """
    Check if verified verse text appears in OCR output
    Returns: (found, similarity, best_match)
    """
    # Extract script-specific text from OCR
    ocr_segments = pattern.findall(ocr_text)
    ocr_combined = ' '.join(ocr_segments)
    
    # Check for exact match
    if verified_text in ocr_combined:
        return True, 1.0, verified_text
    
    # Check for partial match
    verified_words = verified_text.split()
    if not verified_words:
        return False, 0.0, ""
    
    # Look for first word (most distinctive)
    first_word = verified_words[0]
    if first_word in ocr_combined:
        similarity = calculate_similarity(verified_text, ocr_combined)
        return True, similarity, first_word
    
    # Calculate overall similarity
    similarity = calculate_similarity(verified_text, ocr_combined)
    return similarity > 0.5, similarity, ""


# ============================================================================
# Main Verification
# ============================================================================

def verify_ocr_accuracy(pdf_path: str, verified_data: Dict, lang: str, script_pattern: re.Pattern, 
                        sample_pages: int = 5, start_page: int = 0) -> Dict:
    """
    Verify OCR accuracy against verified data
    """
    print(f"\n{'='*60}")
    print(f"Verifying OCR: {pdf_path}")
    print(f"Language: {lang}")
    print(f"{'='*60}")
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF not found: {pdf_path}")
        return {'error': 'PDF not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()
    
    print(f"Total pages in PDF: {total_pages}")
    print(f"Checking pages {start_page + 1} to {min(start_page + sample_pages, total_pages)}")
    
    results = {
        'pdf': pdf_path,
        'pages_checked': 0,
        'total_ocr_segments': 0,
        'verified_verses_found': 0,
        'verses_checked': [],
        'accuracy_scores': [],
        'matches': [],
        'misses': [],
    }
    
    # Collect all OCR text from sample pages
    all_ocr_text = ""
    for page_num in range(start_page, min(start_page + sample_pages, total_pages)):
        print(f"\n  Page {page_num + 1}...", end=" ")
        try:
            img = pdf_page_to_image(pdf_path, page_num, dpi=300)
            text = ocr_page(img, lang)
            segments = script_pattern.findall(text)
            print(f"{len(segments)} {lang.split('+')[0]} segments")
            all_ocr_text += " " + text
            results['total_ocr_segments'] += len(segments)
            results['pages_checked'] += 1
        except Exception as e:
            print(f"Error: {e}")
    
    # Check each verified verse against OCR output
    print(f"\n  Checking against {len(verified_data)} verified verses...")
    
    for verse_ref, verified_text in list(verified_data.items())[:20]:  # Check first 20
        found, similarity, match = find_verse_in_ocr(all_ocr_text, verified_text, script_pattern)
        
        results['verses_checked'].append(verse_ref)
        results['accuracy_scores'].append(similarity)
        
        if found and similarity > 0.3:
            results['verified_verses_found'] += 1
            results['matches'].append({
                'verse': verse_ref,
                'similarity': round(similarity, 2),
                'verified': verified_text[:50] + "..." if len(verified_text) > 50 else verified_text,
            })
        else:
            results['misses'].append({
                'verse': verse_ref,
                'similarity': round(similarity, 2),
                'verified': verified_text[:50] + "..." if len(verified_text) > 50 else verified_text,
            })
    
    # Calculate overall accuracy
    if results['accuracy_scores']:
        results['average_accuracy'] = round(sum(results['accuracy_scores']) / len(results['accuracy_scores']), 2)
    else:
        results['average_accuracy'] = 0.0
    
    return results


def main():
    print("=" * 60)
    print("OCR Accuracy Verification")
    print("Comparing PDF OCR against GitHub Solution verified data")
    print("=" * 60)
    
    # Check Tesseract
    try:
        langs = pytesseract.get_languages()
        print(f"\nTesseract languages: {len(langs)}")
        for l in ['heb', 'grc', 'eng']:
            status = '✅' if l in langs else '❌'
            print(f"  {status} {l}")
    except Exception as e:
        print(f"Tesseract error: {e}")
        return
    
    # Load verified data
    print("\n--- Loading Verified Data ---")
    hebrew_data, greek_data = load_verified_data()
    
    if not hebrew_data and not greek_data:
        print("❌ No verified data found. Cannot verify OCR accuracy.")
        return
    
    all_results = {}
    
    # Verify Hebrew PDFs
    if hebrew_data:
        print("\n" + "=" * 60)
        print("HEBREW OCR VERIFICATION")
        print("=" * 60)
        
        for pdf in PDF_FILES['hebrew']:
            if os.path.exists(pdf):
                results = verify_ocr_accuracy(
                    pdf, hebrew_data, 'heb+eng', HEBREW_PATTERN,
                    sample_pages=10, start_page=5  # Skip title pages
                )
                all_results[f"hebrew_{pdf}"] = results
                
                print(f"\n  📊 Results for {pdf}:")
                print(f"     Pages checked: {results.get('pages_checked', 0)}")
                print(f"     OCR segments: {results.get('total_ocr_segments', 0)}")
                print(f"     Verses matched: {results.get('verified_verses_found', 0)}/{len(results.get('verses_checked', []))}")
                print(f"     Average accuracy: {results.get('average_accuracy', 0):.0%}")
                break  # Just check first available
    
    # Verify Greek PDFs
    if greek_data:
        print("\n" + "=" * 60)
        print("GREEK OCR VERIFICATION")
        print("=" * 60)
        
        for pdf in PDF_FILES['greek']:
            if os.path.exists(pdf):
                results = verify_ocr_accuracy(
                    pdf, greek_data, 'grc+eng', GREEK_PATTERN,
                    sample_pages=10, start_page=10  # Skip intro pages
                )
                all_results[f"greek_{pdf}"] = results
                
                print(f"\n  📊 Results for {pdf}:")
                print(f"     Pages checked: {results.get('pages_checked', 0)}")
                print(f"     OCR segments: {results.get('total_ocr_segments', 0)}")
                print(f"     Verses matched: {results.get('verified_verses_found', 0)}/{len(results.get('verses_checked', []))}")
                print(f"     Average accuracy: {results.get('average_accuracy', 0):.0%}")
                break  # Just check first available
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    for name, results in all_results.items():
        if 'error' not in results:
            accuracy = results.get('average_accuracy', 0)
            if accuracy >= 0.7:
                status = "✅ GOOD"
            elif accuracy >= 0.4:
                status = "⚠️ PARTIAL"
            else:
                status = "❌ POOR"
            
            print(f"\n{name}:")
            print(f"  Status: {status}")
            print(f"  Accuracy: {accuracy:.0%}")
            print(f"  Matches: {results.get('verified_verses_found', 0)}")
            
            if results.get('matches'):
                print(f"  Sample match: {results['matches'][0]['verse']} ({results['matches'][0]['similarity']:.0%})")
    
    # Recommendation
    print("\n" + "=" * 60)
    print("RECOMMENDATION")
    print("=" * 60)
    
    hebrew_accuracy = all_results.get(f"hebrew_{PDF_FILES['hebrew'][0]}", {}).get('average_accuracy', 0)
    greek_accuracy = all_results.get(f"greek_{PDF_FILES['greek'][0]}", {}).get('average_accuracy', 0)
    
    if hebrew_accuracy < 0.3:
        print("""
📌 HEBREW: The BHS PDFs appear to be image-based with poor OCR results.
   RECOMMENDATION: Use the verified GitHub solution data (hebrew-ot-mechon.json)
   which has accurate BHS/Masoretic Text already extracted.
   
   To expand coverage, download from:
   - Mechon Mamre: https://www.mechon-mamre.org
   - Open Bible Data: https://github.com/scrollmapper/bible_databases
""")
    
    if greek_accuracy >= 0.5:
        print("""
📌 GREEK: The Greek NT PDFs have reasonable OCR quality.
   The verified data (greek-nt.json) is already comprehensive.
   OCR can be used to cross-verify or fill gaps.
""")
    
    # Save results
    output_file = 'ocr_verification_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Detailed results saved to: {output_file}")


if __name__ == "__main__":
    main()



