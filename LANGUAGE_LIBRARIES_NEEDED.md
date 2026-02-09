# 📚 Language Libraries Needed for OT & NT

## Overview

To properly read and display Hebrew (OT), Greek (NT), and other languages (Aramaic, etc.) from PDFs, you need libraries for:

1. **Frontend (Browser)** - Font rendering
2. **Backend (Python)** - PDF extraction, OCR, language detection
3. **Unicode Support** - Character encoding

---

## ✅ Currently Installed

### Frontend (Already Working):

**Fonts:**
- ✅ **Noto Sans** - For Greek (loaded from Google Fonts)
- ✅ **Noto Sans Hebrew** - For Hebrew (loaded from Google Fonts)
- ✅ RTL (right-to-left) support for Hebrew

**Configuration:**
- ✅ `tailwind.config.js` - Font families defined
- ✅ `globals.css` - Font imports and styling
- ✅ Components use `font-hebrew` and `font-greek` classes

### Backend (Python):

**Currently Used:**
- ✅ `pdfminer` - Basic PDF text extraction
- ⚠️ **No language detection** - Can't identify languages automatically
- ⚠️ **No OCR libraries** - Basic text extraction only

---

## 📦 Required Libraries

### Frontend (Browser) - Already Set Up ✅

**No additional libraries needed!** The fonts are loaded via Google Fonts:

```css
/* Already in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap');
```

**Fonts Available:**
- ✅ **Noto Sans** - Greek, Latin, Cyrillic
- ✅ **Noto Sans Hebrew** - Hebrew, Aramaic
- ✅ **System fonts** - Fallback

**For Additional Languages (if needed):**
- **Noto Sans Arabic** - For Arabic text
- **Noto Sans Syriac** - For Syriac (Aramaic variant)
- **SBL Hebrew** - Professional Hebrew font (optional)
- **SBL Greek** - Professional Greek font (optional)

---

### Backend (Python) - Needs Installation

#### 1. PDF Extraction (Currently Using)

**pdfminer.six** ✅ (Likely installed)
```bash
pip install pdfminer.six
```

**What it does:**
- Extracts text from PDFs
- Handles Unicode characters
- Works with Hebrew and Greek

**Limitations:**
- ⚠️ May not preserve Hebrew RTL order
- ⚠️ May not handle complex layouts
- ⚠️ No language detection

---

#### 2. OCR (For Scanned PDFs) - Recommended

**Tesseract OCR with Language Packs:**

```bash
# Install Tesseract
brew install tesseract  # macOS
# or
apt-get install tesseract-ocr  # Linux

# Install Python wrapper
pip install pytesseract

# Install language packs
brew install tesseract-lang  # Includes Hebrew, Greek, Arabic
```

**Language Packs Needed:**
- `heb` - Hebrew
- `ell` - Greek
- `ara` - Arabic (for Aramaic)
- `eng` - English

**Usage:**
```python
import pytesseract
from PIL import Image

# Extract Hebrew text
text = pytesseract.image_to_string(image, lang='heb')

# Extract Greek text
text = pytesseract.image_to_string(image, lang='ell')
```

---

#### 3. Language Detection - Recommended

**langdetect** (Detects language from text):

```bash
pip install langdetect
```

**Usage:**
```python
from langdetect import detect, detect_langs

# Detect language
language = detect("בְּרֵאשִׁית בָּרָא")  # Returns 'he' (Hebrew)
language = detect("Ἐν ἀρχῇ ἦν ὁ λόγος")  # Returns 'el' (Greek)

# Get confidence scores
languages = detect_langs("בְּרֵאשִׁית")
# Returns: [Language(he=0.99), Language(ar=0.01)]
```

**Alternative: polyglot** (More accurate, but heavier):

```bash
pip install polyglot
# Also needs: pyicu, pycld2, morfessor
```

---

#### 4. Unicode Script Detection - Recommended

**unicodedata** (Built-in Python library):

```python
import unicodedata

def detect_script(text):
    scripts = set()
    for char in text:
        if char.isalpha():
            script = unicodedata.name(char).split()[0]
            scripts.add(script)
    return scripts

# Example
scripts = detect_script("בְּרֵאשִׁית")  # Returns {'HEBREW'}
scripts = detect_script("Ἐν ἀρχῇ")  # Returns {'GREEK'}
```

**Alternative: regex** (For pattern matching):

```python
import re

# Hebrew pattern (Unicode range)
hebrew_pattern = re.compile(r'[\u0590-\u05FF]+')

# Greek pattern (Unicode range)
greek_pattern = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]+')
```

---

#### 5. PDF Processing (Advanced) - Optional

**PyPDF2 or pypdf** (Better PDF handling):

```bash
pip install pypdf
```

**pdfplumber** (Better layout preservation):

```bash
pip install pdfplumber
```

**What they provide:**
- Better text extraction
- Preserves layout
- Handles complex PDFs better
- Better Unicode support

---

#### 6. Aramaic Support - If Needed

**For Aramaic (used in some OT books):**

**Fonts:**
- **Noto Sans Syriac** - For Syriac script
- **Noto Sans Aramaic** - For Aramaic (if available)

**Python:**
- Same Unicode detection works
- Tesseract with Arabic language pack (Aramaic uses similar script)

---

## 📋 Installation Checklist

### Frontend (Browser) ✅

- ✅ Noto Sans fonts (loaded via Google Fonts)
- ✅ Noto Sans Hebrew (loaded via Google Fonts)
- ✅ RTL support (CSS `direction: rtl`)
- ✅ Font classes in Tailwind config

**No additional installation needed!**

---

### Backend (Python) - Install These:

#### Required:

```bash
# PDF extraction (if not installed)
pip install pdfminer.six

# Language detection
pip install langdetect
```

#### Recommended:

```bash
# OCR (for scanned PDFs)
brew install tesseract tesseract-lang  # macOS
pip install pytesseract pillow

# Better PDF processing
pip install pdfplumber

# Unicode utilities (built-in, but may need updates)
# No installation needed - part of Python standard library
```

#### Optional (For Advanced Features):

```bash
# Advanced language detection
pip install polyglot pyicu pycld2

# Image processing (for OCR)
pip install pillow opencv-python

# Better text extraction
pip install pypdf
```

---

## 🎯 Quick Setup

### Minimal Setup (What You Need Now):

```bash
# 1. Install language detection
pip install langdetect

# 2. Verify pdfminer is installed
pip install pdfminer.six

# 3. Test language detection
python3 -c "from langdetect import detect; print(detect('בְּרֵאשִׁית'))"
# Should output: he
```

### Full Setup (Recommended):

```bash
# 1. Install Tesseract OCR
brew install tesseract tesseract-lang

# 2. Install Python libraries
pip install pdfminer.six langdetect pytesseract pdfplumber pillow

# 3. Test
python3 -c "from langdetect import detect; print('Hebrew:', detect('בְּרֵאשִׁית')); print('Greek:', detect('Ἐν ἀρχῇ'))"
```

---

## 🔧 Usage Examples

### Detect Language from Text:

```python
from langdetect import detect, detect_langs

# Detect Hebrew
text = "בְּרֵאשִׁית בָּרָא אֱלֹהִים"
lang = detect(text)  # Returns 'he'

# Detect Greek
text = "Ἐν ἀρχῇ ἦν ὁ λόγος"
lang = detect(text)  # Returns 'el'

# Get confidence scores
languages = detect_langs(text)
# Returns: [Language(el=0.99), Language(he=0.01)]
```

### Extract with Language Detection:

```python
from pdfminer.high_level import extract_text
from langdetect import detect

def extract_with_language(pdf_path):
    text = extract_text(pdf_path)
    language = detect(text)
    return text, language

text, lang = extract_with_language("BHS-ESV Interlinear OT.pdf")
print(f"Language: {lang}")  # Should detect Hebrew
```

### OCR with Language:

```python
import pytesseract
from PIL import Image

def ocr_with_language(image_path, language='heb'):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image, lang=language)
    return text

# Extract Hebrew from image
hebrew_text = ocr_with_language("hebrew_page.png", lang='heb')

# Extract Greek from image
greek_text = ocr_with_language("greek_page.png", lang='ell')
```

---

## 📊 Summary

### Frontend (Browser):
- ✅ **Already set up** - Noto fonts loaded
- ✅ **No additional libraries needed**

### Backend (Python):
- ✅ **pdfminer.six** - PDF extraction (likely installed)
- ⚠️ **langdetect** - Language detection (NOT installed - **NEEDED**)
- ⚠️ **pytesseract** - OCR (NOT installed - **RECOMMENDED**)
- ⚠️ **pdfplumber** - Better PDF handling (NOT installed - **OPTIONAL**)

---

## 🚀 Next Steps

### 1. Install Language Detection (Required):

```bash
pip install langdetect
```

### 2. Test Language Detection:

```python
from langdetect import detect

# Test Hebrew
print(detect("בְּרֵאשִׁית"))  # Should return 'he'

# Test Greek
print(detect("Ἐν ἀρχῇ"))  # Should return 'el'
```

### 3. Add to PDF Extraction Scripts:

Update `verify_and_scan.py` to detect languages automatically.

---

## ✅ Current Status

| Library | Frontend | Backend | Status |
|---------|----------|---------|--------|
| **Fonts (Noto)** | ✅ Installed | N/A | ✅ Working |
| **pdfminer** | N/A | ⚠️ Likely | ✅ Basic extraction |
| **langdetect** | N/A | ❌ Not installed | ⚠️ **NEEDED** |
| **pytesseract** | N/A | ❌ Not installed | ⚠️ **RECOMMENDED** |
| **Unicode support** | ✅ Built-in | ✅ Built-in | ✅ Working |

---

**Frontend is ready! Backend needs `langdetect` for language identification!**



