#!/usr/bin/env python3
"""
Extract Hebrew from BHS PDFs using Tesseract OCR
Uses image-based OCR to properly read Hebrew characters from scanned PDFs
"""

import os
import re
import json
import sys
from pathlib import Path

# Check dependencies
try:
    import fitz  # PyMuPDF
    from PIL import Image
    import pytesseract
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install pymupdf pillow pytesseract")
    sys.exit(1)

# Configuration
BHS_PDF = "BHS-ESV Interlinear OT.pdf"  # Original high-quality PDF
OUTPUT_FILE = "public/lib/original-texts/hebrew-ot-ocr.json"
HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF]+')

# Genesis chapter/verse markers to help identify verses
GENESIS_VERSE_PATTERN = re.compile(r'(\d+)[:\.](\d+)')


def pdf_page_to_image(pdf_path: str, page_num: int, dpi: int = 300):
    """Convert a PDF page to a PIL Image for OCR"""
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    
    # Render page to image at high DPI for better OCR
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat)
    
    # Convert to PIL Image
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    doc.close()
    return img


def extract_hebrew_from_image(img: Image.Image) -> str:
    """Use Tesseract OCR to extract Hebrew text from image"""
    # Use Hebrew + English languages for interlinear text
    text = pytesseract.image_to_string(img, lang='heb+eng')
    return text


def extract_hebrew_only(text: str) -> list:
    """Extract only Hebrew characters from mixed text"""
    return HEBREW_PATTERN.findall(text)


def process_pdf(pdf_path: str, start_page: int = 0, num_pages: int = 5):
    """Process PDF pages and extract Hebrew text"""
    print(f"Processing: {pdf_path}")
    print(f"Pages: {start_page} to {start_page + num_pages - 1}")
    print("=" * 60)
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF not found: {pdf_path}")
        return {}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()
    
    print(f"Total pages in PDF: {total_pages}")
    
    results = {}
    
    for page_num in range(start_page, min(start_page + num_pages, total_pages)):
        print(f"\nProcessing page {page_num + 1}...")
        
        try:
            # Convert page to image
            img = pdf_page_to_image(pdf_path, page_num, dpi=300)
            
            # OCR the image
            text = extract_hebrew_from_image(img)
            
            # Extract Hebrew
            hebrew_segments = extract_hebrew_only(text)
            
            print(f"  Found {len(hebrew_segments)} Hebrew segments")
            
            if hebrew_segments:
                # Store with page reference
                results[f"page-{page_num + 1}"] = {
                    "hebrew_segments": hebrew_segments,
                    "hebrew_text": " ".join(hebrew_segments),
                    "raw_text_sample": text[:500] if len(text) > 500 else text
                }
                
                # Show sample
                print(f"  Sample: {hebrew_segments[:3]}")
        
        except Exception as e:
            print(f"  ERROR: {e}")
    
    return results


def main():
    print("=" * 60)
    print("Hebrew OCR Extraction from BHS PDF")
    print("Using Tesseract with Hebrew language pack")
    print("=" * 60)
    
    # Check for Tesseract
    try:
        langs = pytesseract.get_languages()
        if 'heb' not in langs:
            print("WARNING: Hebrew language pack not installed in Tesseract")
            print("Install with: brew install tesseract-lang")
        else:
            print("✅ Tesseract Hebrew language pack available")
    except Exception as e:
        print(f"Tesseract check failed: {e}")
    
    # Find best PDF to use
    pdf_options = [
        "BHS-ESV Interlinear OT.pdf",  # Original high-quality
        "BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf",
        "BHS-ESV Interlinear OT-OCR.pdf"
    ]
    
    pdf_path = None
    for pdf in pdf_options:
        if os.path.exists(pdf):
            pdf_path = pdf
            break
    
    if not pdf_path:
        print("ERROR: No BHS PDF found")
        return
    
    print(f"\nUsing PDF: {pdf_path}")
    
    # Process first 10 pages as a test
    print("\n--- Testing OCR on first 10 pages ---")
    results = process_pdf(pdf_path, start_page=0, num_pages=10)
    
    # Save results
    if results:
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"\n✅ Saved OCR results to {OUTPUT_FILE}")
    else:
        print("\n❌ No Hebrew text extracted")
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total_segments = sum(len(r.get('hebrew_segments', [])) for r in results.values())
    print(f"Pages processed: {len(results)}")
    print(f"Total Hebrew segments: {total_segments}")
    
    if total_segments > 0:
        print("\n✅ OCR extraction successful!")
        print("To process more pages, modify the script's num_pages parameter.")
    else:
        print("\n⚠️ No Hebrew extracted - PDF may need different processing")


if __name__ == "__main__":
    main()



