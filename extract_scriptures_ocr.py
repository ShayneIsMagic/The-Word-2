#!/usr/bin/env python3
"""
Advanced Scripture OCR Extraction
Extracts Hebrew (OT) and Greek (NT) from PDF files using optimized OCR

Improvements over basic extraction:
1. Image preprocessing for better OCR accuracy
2. Multiple Tesseract configurations tested
3. Verse identification patterns
4. Quality validation against known sources
5. Both Hebrew and Greek support
6. Configurable DPI and processing options
"""

import os
import re
import json
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime

# Check dependencies
MISSING_DEPS = []
try:
    import fitz  # PyMuPDF
except ImportError:
    MISSING_DEPS.append("pymupdf")

try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps
except ImportError:
    MISSING_DEPS.append("Pillow")

try:
    import pytesseract
except ImportError:
    MISSING_DEPS.append("pytesseract")

if MISSING_DEPS:
    print(f"Missing dependencies: {', '.join(MISSING_DEPS)}")
    print("Install with: pip install pymupdf pillow pytesseract")
    sys.exit(1)

# Add backend scripts to path for language detection
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'scripts'))
try:
    from language_detector import detect_language, has_hebrew, has_greek
except ImportError:
    # Fallback
    def detect_language(text):
        hebrew = len(re.findall(r'[\u0590-\u05FF]+', text))
        greek = len(re.findall(r'[\u0370-\u03FF\u1F00-\u1FFF]+', text))
        if hebrew > greek:
            return {'language': 'hebrew', 'confidence': hebrew/(hebrew+greek+1), 'hebrew_count': hebrew, 'greek_count': greek}
        elif greek > hebrew:
            return {'language': 'greek', 'confidence': greek/(hebrew+greek+1), 'hebrew_count': hebrew, 'greek_count': greek}
        return {'language': 'unknown', 'confidence': 0, 'hebrew_count': 0, 'greek_count': 0}
    def has_hebrew(text): return bool(re.search(r'[\u0590-\u05FF]+', text))
    def has_greek(text): return bool(re.search(r'[\u0370-\u03FF\u1F00-\u1FFF]+', text))

# ============================================================================
# Configuration
# ============================================================================

@dataclass
class OCRConfig:
    """OCR Configuration options"""
    dpi: int = 300
    enhance_contrast: float = 1.5
    sharpen: bool = True
    denoise: bool = True
    threshold: bool = False  # Binarization
    tesseract_psm: int = 6  # Page segmentation mode (6 = uniform block of text)
    tesseract_oem: int = 3  # OCR Engine Mode (3 = default, based on what's available)


# Unicode patterns (from existing repo solution)
HEBREW_PATTERN = re.compile(r'[\u0590-\u05FF\uFB1D-\uFB4F]+')  # Including Hebrew presentation forms
GREEK_PATTERN = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]+')
VERSE_REF_PATTERN = re.compile(r'(\d+)[:\.](\d+)')
CHAPTER_PATTERN = re.compile(r'(?:chapter|ch\.?)\s*(\d+)', re.IGNORECASE)

# PDF Files
PDF_FILES = {
    'hebrew_ot': [
        'BHS-ESV Interlinear OT.pdf',
        'BHS-ESV Interlinear OT-OCR-Hebrew-v2.pdf',
        'BHS-ESV Interlinear OT-OCR.pdf',
    ],
    'greek_nt': [
        'The Greek New Testament UBS Fifth Revised Edition.pdf',
        'Novum Testamentum Graece_ Nestle-Aland  (28 ed.) ( PDFDrive ).pdf',
    ]
}

# Known Hebrew verses for validation
KNOWN_HEBREW = {
    'genesis-1-1': 'בְּרֵאשִׁית',  # First word of Genesis 1:1
    'genesis-1-3': 'יְהִי אוֹר',   # "Let there be light"
    'psalm-23-1': 'יְהוָה רֹעִי',  # "The LORD is my shepherd"
}

# Known Greek verses for validation
KNOWN_GREEK = {
    'john-1-1': 'Ἐν ἀρχῇ ἦν ὁ λόγος',
    'john-3-16': 'οὕτως γὰρ ἠγάπησεν',
}

# ============================================================================
# Image Processing
# ============================================================================

def preprocess_image(img: Image.Image, config: OCRConfig) -> Image.Image:
    """
    Preprocess image for better OCR accuracy
    
    Applies:
    1. Grayscale conversion
    2. Contrast enhancement
    3. Sharpening
    4. Denoising
    5. Optional binarization
    """
    # Convert to grayscale if not already
    if img.mode != 'L':
        img = img.convert('L')
    
    # Enhance contrast
    if config.enhance_contrast != 1.0:
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(config.enhance_contrast)
    
    # Sharpen
    if config.sharpen:
        img = img.filter(ImageFilter.SHARPEN)
    
    # Denoise (slight blur then sharpen)
    if config.denoise:
        img = img.filter(ImageFilter.MedianFilter(size=3))
    
    # Binarization (threshold) - useful for very faded text
    if config.threshold:
        img = img.point(lambda x: 0 if x < 128 else 255, '1')
        img = img.convert('L')
    
    return img


def pdf_page_to_image(pdf_path: str, page_num: int, dpi: int = 300) -> Image.Image:
    """Convert a PDF page to a PIL Image for OCR"""
    doc = fitz.open(pdf_path)
    page = doc[page_num]
    
    # Render page to image at specified DPI
    mat = fitz.Matrix(dpi / 72, dpi / 72)
    pix = page.get_pixmap(matrix=mat)
    
    # Convert to PIL Image
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    
    doc.close()
    return img


# ============================================================================
# OCR Extraction
# ============================================================================

def run_tesseract(img: Image.Image, lang: str, config: OCRConfig) -> str:
    """
    Run Tesseract OCR with optimized settings
    
    PSM modes:
    - 3: Fully automatic page segmentation
    - 6: Assume a single uniform block of text
    - 11: Sparse text - find as much text as possible
    - 12: Sparse text with OSD
    
    OEM modes:
    - 0: Legacy engine only
    - 1: Neural nets LSTM engine only
    - 2: Legacy + LSTM engines
    - 3: Default, based on what is available
    """
    custom_config = f'--psm {config.tesseract_psm} --oem {config.tesseract_oem}'
    
    try:
        text = pytesseract.image_to_string(img, lang=lang, config=custom_config)
        return text
    except Exception as e:
        print(f"  OCR Error: {e}")
        return ""


def extract_from_page(pdf_path: str, page_num: int, lang: str, config: OCRConfig) -> Dict:
    """Extract text from a single PDF page using OCR"""
    
    # Convert page to image
    img = pdf_page_to_image(pdf_path, page_num, config.dpi)
    
    # Preprocess
    img_processed = preprocess_image(img, config)
    
    # Run OCR
    raw_text = run_tesseract(img_processed, lang, config)
    
    # Detect languages
    lang_result = detect_language(raw_text)
    
    # Extract specific scripts
    hebrew_segments = HEBREW_PATTERN.findall(raw_text)
    greek_segments = GREEK_PATTERN.findall(raw_text)
    
    # Find verse references
    verse_refs = VERSE_REF_PATTERN.findall(raw_text)
    
    return {
        'page': page_num + 1,
        'raw_text': raw_text,
        'hebrew_segments': hebrew_segments,
        'greek_segments': greek_segments,
        'hebrew_text': ' '.join(hebrew_segments),
        'greek_text': ' '.join(greek_segments),
        'verse_refs': [f"{ch}:{vs}" for ch, vs in verse_refs],
        'language_detected': lang_result['language'],
        'confidence': lang_result.get('confidence', 0),
        'hebrew_count': len(hebrew_segments),
        'greek_count': len(greek_segments),
    }


def test_ocr_configs(pdf_path: str, page_num: int = 1, lang: str = 'heb+eng') -> Dict[str, Dict]:
    """Test multiple OCR configurations to find the best one"""
    
    print(f"\n{'='*60}")
    print(f"Testing OCR Configurations on page {page_num + 1}")
    print(f"{'='*60}")
    
    configs = {
        'default': OCRConfig(),
        'high_contrast': OCRConfig(enhance_contrast=2.0),
        'threshold': OCRConfig(threshold=True),
        'high_dpi': OCRConfig(dpi=400),
        'psm3': OCRConfig(tesseract_psm=3),
        'psm11': OCRConfig(tesseract_psm=11),
    }
    
    results = {}
    
    for name, config in configs.items():
        print(f"\n  Testing config: {name}...")
        result = extract_from_page(pdf_path, page_num, lang, config)
        results[name] = {
            'hebrew_count': result['hebrew_count'],
            'greek_count': result['greek_count'],
            'total_chars': len(result['raw_text']),
            'sample': result['hebrew_text'][:100] if result['hebrew_text'] else result['greek_text'][:100],
        }
        print(f"    Hebrew: {result['hebrew_count']}, Greek: {result['greek_count']}")
    
    # Find best config
    best_hebrew = max(results.items(), key=lambda x: x[1]['hebrew_count'])
    best_greek = max(results.items(), key=lambda x: x[1]['greek_count'])
    
    print(f"\n  Best for Hebrew: {best_hebrew[0]} ({best_hebrew[1]['hebrew_count']} segments)")
    print(f"  Best for Greek: {best_greek[0]} ({best_greek[1]['greek_count']} segments)")
    
    return results


# ============================================================================
# Full PDF Processing
# ============================================================================

def process_pdf(pdf_path: str, 
                start_page: int = 0, 
                num_pages: int = 10, 
                lang: str = 'heb+eng',
                config: Optional[OCRConfig] = None) -> Dict:
    """Process multiple pages from a PDF"""
    
    if config is None:
        config = OCRConfig()
    
    print(f"\n{'='*60}")
    print(f"Processing: {pdf_path}")
    print(f"Pages: {start_page + 1} to {start_page + num_pages}")
    print(f"Language: {lang}")
    print(f"DPI: {config.dpi}")
    print(f"{'='*60}")
    
    if not os.path.exists(pdf_path):
        print(f"ERROR: PDF not found: {pdf_path}")
        return {}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    doc.close()
    
    print(f"Total pages in PDF: {total_pages}")
    
    results = {
        'metadata': {
            'pdf': pdf_path,
            'processed_at': datetime.now().isoformat(),
            'pages_processed': 0,
            'config': {
                'dpi': config.dpi,
                'lang': lang,
                'psm': config.tesseract_psm,
            }
        },
        'pages': {},
        'summary': {
            'total_hebrew': 0,
            'total_greek': 0,
        }
    }
    
    for page_num in range(start_page, min(start_page + num_pages, total_pages)):
        print(f"\n  Page {page_num + 1}/{total_pages}...", end=" ")
        
        try:
            page_result = extract_from_page(pdf_path, page_num, lang, config)
            
            results['pages'][f"page-{page_num + 1}"] = {
                'hebrew_segments': page_result['hebrew_segments'],
                'greek_segments': page_result['greek_segments'],
                'hebrew_text': page_result['hebrew_text'],
                'greek_text': page_result['greek_text'],
                'verse_refs': page_result['verse_refs'],
            }
            
            results['summary']['total_hebrew'] += page_result['hebrew_count']
            results['summary']['total_greek'] += page_result['greek_count']
            results['metadata']['pages_processed'] += 1
            
            print(f"Hebrew: {page_result['hebrew_count']}, Greek: {page_result['greek_count']}")
            
            if page_result['hebrew_segments']:
                print(f"    Sample: {page_result['hebrew_segments'][:3]}")
            elif page_result['greek_segments']:
                print(f"    Sample: {page_result['greek_segments'][:3]}")
        
        except Exception as e:
            print(f"ERROR: {e}")
    
    return results


def validate_against_known(results: Dict) -> Dict[str, bool]:
    """Validate OCR results against known verses"""
    
    validations = {}
    
    all_hebrew = ' '.join(
        page.get('hebrew_text', '') 
        for page in results.get('pages', {}).values()
    )
    all_greek = ' '.join(
        page.get('greek_text', '') 
        for page in results.get('pages', {}).values()
    )
    
    for ref, expected in KNOWN_HEBREW.items():
        validations[f"hebrew_{ref}"] = expected in all_hebrew
    
    for ref, expected in KNOWN_GREEK.items():
        validations[f"greek_{ref}"] = expected in all_greek
    
    return validations


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Advanced Scripture OCR Extraction')
    parser.add_argument('--pdf', type=str, help='Specific PDF to process')
    parser.add_argument('--lang', type=str, default='heb+eng', help='Tesseract language (heb+eng, grc+eng)')
    parser.add_argument('--pages', type=int, default=10, help='Number of pages to process')
    parser.add_argument('--start', type=int, default=0, help='Starting page (0-indexed)')
    parser.add_argument('--dpi', type=int, default=300, help='DPI for rendering')
    parser.add_argument('--test-configs', action='store_true', help='Test multiple OCR configurations')
    parser.add_argument('--output', type=str, help='Output JSON file')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("Advanced Scripture OCR Extraction")
    print("=" * 60)
    
    # Check Tesseract languages
    try:
        langs = pytesseract.get_languages()
        print(f"\nTesseract languages available: {len(langs)}")
        for l in ['heb', 'grc', 'ell', 'eng']:
            status = '✅' if l in langs else '❌'
            print(f"  {status} {l}")
    except Exception as e:
        print(f"Tesseract check failed: {e}")
    
    # Find PDF
    if args.pdf:
        pdf_path = args.pdf
    else:
        # Auto-detect
        pdf_path = None
        for pdf in PDF_FILES['hebrew_ot'] + PDF_FILES['greek_nt']:
            if os.path.exists(pdf):
                pdf_path = pdf
                break
    
    if not pdf_path or not os.path.exists(pdf_path):
        print(f"\nERROR: No PDF found. Available PDFs:")
        for pdf in PDF_FILES['hebrew_ot'] + PDF_FILES['greek_nt']:
            status = '✅' if os.path.exists(pdf) else '❌'
            print(f"  {status} {pdf}")
        return
    
    print(f"\nUsing PDF: {pdf_path}")
    
    # Test configurations if requested
    if args.test_configs:
        test_ocr_configs(pdf_path, page_num=args.start, lang=args.lang)
        return
    
    # Process PDF
    config = OCRConfig(dpi=args.dpi)
    results = process_pdf(
        pdf_path, 
        start_page=args.start, 
        num_pages=args.pages,
        lang=args.lang,
        config=config
    )
    
    # Validate
    validations = validate_against_known(results)
    results['validations'] = validations
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Pages processed: {results['metadata']['pages_processed']}")
    print(f"Total Hebrew segments: {results['summary']['total_hebrew']}")
    print(f"Total Greek segments: {results['summary']['total_greek']}")
    
    print("\nValidation against known verses:")
    for ref, valid in validations.items():
        status = '✅' if valid else '❌'
        print(f"  {status} {ref}")
    
    # Save results
    output_file = args.output or 'public/lib/original-texts/ocr-extraction.json'
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Results saved to: {output_file}")


if __name__ == "__main__":
    main()



