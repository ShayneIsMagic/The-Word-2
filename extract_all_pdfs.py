#!/usr/bin/env python3
"""
Extract All Scripture PDFs
Extracts Hebrew and Greek text from all PDF files in the project
Outputs to "PDF Extraction" folder

PDFs:
1. BHS-ESV Interlinear OT.pdf - Hebrew Old Testament
2. BHS-ESV Interlinear OT-OCR.pdf - OCR version
3. BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf - OCR Hebrew v2
4. Novum Testamentum Graece (NA28).pdf - Greek New Testament
5. The Greek New Testament UBS Fifth Revised Edition.pdf - Greek NT UBS5
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime

# Output directory
OUTPUT_DIR = "PDF Extraction"

# PDF files to process
PDF_FILES = [
    ("BHS-ESV Interlinear OT.pdf", "hebrew", "BHS Hebrew OT"),
    ("BHS-ESV Interlinear OT-OCR.pdf", "hebrew", "BHS Hebrew OT (OCR)"),
    ("BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf", "hebrew", "BHS Hebrew OT (OCR v2)"),
    ("Novum Testamentum Graece_ Nestle-Aland  (28 ed.) ( PDFDrive ).pdf", "greek", "NA28 Greek NT"),
    ("The Greek New Testament UBS Fifth Revised Edition.pdf", "greek", "UBS5 Greek NT"),
]

# ============================================================================
# Language Detection (from our existing module)
# ============================================================================

import re

HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF]+')
GREEK_PATTERN = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]+')

def detect_language(text):
    """Detect Hebrew or Greek in text"""
    hebrew_matches = HEBREW_PATTERN.findall(text)
    greek_matches = GREEK_PATTERN.findall(text)
    
    if len(hebrew_matches) > len(greek_matches):
        return 'hebrew', hebrew_matches
    elif len(greek_matches) > 0:
        return 'greek', greek_matches
    else:
        return 'unknown', []

def extract_hebrew(text):
    """Extract only Hebrew characters"""
    return ' '.join(HEBREW_PATTERN.findall(text))

def extract_greek(text):
    """Extract only Greek characters"""
    return ' '.join(GREEK_PATTERN.findall(text))

# ============================================================================
# PDF Extraction with PyMuPDF
# ============================================================================

def extract_with_pymupdf(pdf_path, expected_lang):
    """Extract text using PyMuPDF (fitz)"""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        print("  ⚠️ PyMuPDF not installed. Run: pip install pymupdf")
        return None
    
    results = {
        "source_file": os.path.basename(pdf_path),
        "extraction_method": "PyMuPDF",
        "expected_language": expected_lang,
        "timestamp": datetime.now().isoformat(),
        "pages": [],
        "statistics": {
            "total_pages": 0,
            "pages_with_text": 0,
            "hebrew_chars": 0,
            "greek_chars": 0,
            "total_chars": 0,
        }
    }
    
    try:
        doc = fitz.open(pdf_path)
        results["statistics"]["total_pages"] = len(doc)
        
        print(f"  📄 {len(doc)} pages found")
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            if text.strip():
                results["statistics"]["pages_with_text"] += 1
                
                # Extract language-specific text
                hebrew_text = extract_hebrew(text)
                greek_text = extract_greek(text)
                
                results["statistics"]["hebrew_chars"] += len(hebrew_text.replace(' ', ''))
                results["statistics"]["greek_chars"] += len(greek_text.replace(' ', ''))
                results["statistics"]["total_chars"] += len(text)
                
                page_data = {
                    "page": page_num + 1,
                    "raw_text": text[:1000] + "..." if len(text) > 1000 else text,
                    "hebrew": hebrew_text[:500] if hebrew_text else "",
                    "greek": greek_text[:500] if greek_text else "",
                }
                results["pages"].append(page_data)
            
            # Progress indicator
            if (page_num + 1) % 50 == 0:
                print(f"    Processed {page_num + 1}/{len(doc)} pages...")
        
        doc.close()
        return results
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

# ============================================================================
# PDF Extraction with pdfminer
# ============================================================================

def extract_with_pdfminer(pdf_path, expected_lang):
    """Extract text using pdfminer.six"""
    try:
        from pdfminer.high_level import extract_text
    except ImportError:
        print("  ⚠️ pdfminer not installed. Run: pip install pdfminer.six")
        return None
    
    results = {
        "source_file": os.path.basename(pdf_path),
        "extraction_method": "pdfminer.six",
        "expected_language": expected_lang,
        "timestamp": datetime.now().isoformat(),
        "full_text": "",
        "hebrew_text": "",
        "greek_text": "",
        "statistics": {
            "hebrew_chars": 0,
            "greek_chars": 0,
            "total_chars": 0,
        }
    }
    
    try:
        print("  Extracting (this may take a while)...")
        text = extract_text(pdf_path)
        
        results["full_text"] = text[:10000] + "..." if len(text) > 10000 else text
        results["hebrew_text"] = extract_hebrew(text)
        results["greek_text"] = extract_greek(text)
        
        results["statistics"]["total_chars"] = len(text)
        results["statistics"]["hebrew_chars"] = len(results["hebrew_text"].replace(' ', ''))
        results["statistics"]["greek_chars"] = len(results["greek_text"].replace(' ', ''))
        
        return results
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

# ============================================================================
# OCR Extraction with Tesseract
# ============================================================================

def extract_with_ocr(pdf_path, expected_lang, max_pages=10):
    """Extract text using Tesseract OCR (for image-based PDFs)"""
    try:
        import fitz
        import pytesseract
        from PIL import Image
        import io
    except ImportError as e:
        print(f"  ⚠️ Missing dependency: {e}")
        print("  Run: pip install pymupdf pytesseract pillow")
        return None
    
    # Set Tesseract language
    lang_code = "heb" if expected_lang == "hebrew" else "grc"  # grc = ancient Greek
    
    results = {
        "source_file": os.path.basename(pdf_path),
        "extraction_method": f"Tesseract OCR ({lang_code})",
        "expected_language": expected_lang,
        "timestamp": datetime.now().isoformat(),
        "pages": [],
        "statistics": {
            "total_pages": 0,
            "processed_pages": 0,
            "hebrew_chars": 0,
            "greek_chars": 0,
        }
    }
    
    try:
        doc = fitz.open(pdf_path)
        results["statistics"]["total_pages"] = len(doc)
        
        pages_to_process = min(max_pages, len(doc))
        print(f"  📄 Processing {pages_to_process} of {len(doc)} pages with OCR...")
        
        for page_num in range(pages_to_process):
            page = doc[page_num]
            
            # Render page to image
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better OCR
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # OCR
            try:
                ocr_text = pytesseract.image_to_string(img, lang=lang_code)
                
                hebrew_text = extract_hebrew(ocr_text)
                greek_text = extract_greek(ocr_text)
                
                results["statistics"]["hebrew_chars"] += len(hebrew_text.replace(' ', ''))
                results["statistics"]["greek_chars"] += len(greek_text.replace(' ', ''))
                results["statistics"]["processed_pages"] += 1
                
                results["pages"].append({
                    "page": page_num + 1,
                    "ocr_text": ocr_text[:500] if ocr_text else "",
                    "hebrew": hebrew_text[:300] if hebrew_text else "",
                    "greek": greek_text[:300] if greek_text else "",
                })
                
                print(f"    Page {page_num + 1}: {len(hebrew_text)} Hebrew, {len(greek_text)} Greek chars")
                
            except Exception as e:
                print(f"    Page {page_num + 1}: OCR failed - {e}")
        
        doc.close()
        return results
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

# ============================================================================
# Main Extraction
# ============================================================================

def process_pdf(filename, expected_lang, description):
    """Process a single PDF file"""
    pdf_path = filename
    
    if not os.path.exists(pdf_path):
        print(f"  ❌ File not found: {filename}")
        return None
    
    file_size = os.path.getsize(pdf_path) / (1024 * 1024)  # MB
    print(f"\n{'='*60}")
    print(f"📖 {description}")
    print(f"   File: {filename}")
    print(f"   Size: {file_size:.1f} MB")
    print(f"   Expected: {expected_lang}")
    print('='*60)
    
    # Try PyMuPDF first (fastest)
    print("\n1️⃣ Trying PyMuPDF extraction...")
    result = extract_with_pymupdf(pdf_path, expected_lang)
    
    if result and result["statistics"]["hebrew_chars"] + result["statistics"]["greek_chars"] > 100:
        print(f"  ✅ Success! {result['statistics']['hebrew_chars']} Hebrew, {result['statistics']['greek_chars']} Greek chars")
        return result
    
    # If PyMuPDF found little text, try OCR
    print("\n2️⃣ Text extraction low, trying OCR...")
    ocr_result = extract_with_ocr(pdf_path, expected_lang, max_pages=5)
    
    if ocr_result:
        return ocr_result
    
    # Fallback to pdfminer
    print("\n3️⃣ Trying pdfminer extraction...")
    return extract_with_pdfminer(pdf_path, expected_lang)


def main():
    print("=" * 70)
    print("  📚 SCRIPTURE PDF EXTRACTION")
    print("  Extracting Hebrew and Greek from all PDF files")
    print("=" * 70)
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Summary for all PDFs
    summary = {
        "timestamp": datetime.now().isoformat(),
        "files_processed": 0,
        "total_hebrew_chars": 0,
        "total_greek_chars": 0,
        "results": []
    }
    
    # Process each PDF
    for filename, expected_lang, description in PDF_FILES:
        if os.path.exists(filename):
            result = process_pdf(filename, expected_lang, description)
            
            if result:
                # Save individual result
                safe_name = filename.replace(' ', '_').replace('.pdf', '')
                output_file = f"{OUTPUT_DIR}/{safe_name}_extraction.json"
                
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(result, f, ensure_ascii=False, indent=2)
                print(f"\n  💾 Saved to: {output_file}")
                
                # Update summary
                summary["files_processed"] += 1
                summary["total_hebrew_chars"] += result.get("statistics", {}).get("hebrew_chars", 0)
                summary["total_greek_chars"] += result.get("statistics", {}).get("greek_chars", 0)
                summary["results"].append({
                    "file": filename,
                    "description": description,
                    "hebrew_chars": result.get("statistics", {}).get("hebrew_chars", 0),
                    "greek_chars": result.get("statistics", {}).get("greek_chars", 0),
                    "output": output_file
                })
        else:
            print(f"\n⚠️ Skipping {filename} (not found)")
    
    # Save summary
    summary_file = f"{OUTPUT_DIR}/extraction_summary.json"
    with open(summary_file, 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    
    # Print final summary
    print("\n" + "=" * 70)
    print("  📊 EXTRACTION SUMMARY")
    print("=" * 70)
    print(f"  Files processed: {summary['files_processed']}")
    print(f"  Total Hebrew characters: {summary['total_hebrew_chars']:,}")
    print(f"  Total Greek characters: {summary['total_greek_chars']:,}")
    print(f"\n  Output folder: {OUTPUT_DIR}/")
    print("=" * 70)
    
    # Create a quick reference text file
    ref_file = f"{OUTPUT_DIR}/README.txt"
    with open(ref_file, 'w', encoding='utf-8') as f:
        f.write("PDF EXTRACTION RESULTS\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Extracted: {summary['timestamp']}\n\n")
        f.write("Files:\n")
        for r in summary["results"]:
            f.write(f"  - {r['description']}\n")
            f.write(f"    Hebrew: {r['hebrew_chars']:,} chars\n")
            f.write(f"    Greek: {r['greek_chars']:,} chars\n")
            f.write(f"    Output: {r['output']}\n\n")
    
    print(f"\n✅ Complete! Check '{OUTPUT_DIR}/' folder for results.")


if __name__ == "__main__":
    main()



