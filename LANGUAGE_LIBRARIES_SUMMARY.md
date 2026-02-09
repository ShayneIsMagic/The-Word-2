# 📚 Language Libraries Summary - Quick Reference

## ✅ Frontend (Browser) - Already Set Up!

**No installation needed!** Fonts are loaded from Google Fonts:

- ✅ **Noto Sans** - Greek, Latin
- ✅ **Noto Sans Hebrew** - Hebrew, Aramaic
- ✅ RTL support for Hebrew
- ✅ Unicode support (built into browsers)

**Status:** ✅ **Working - No changes needed**

---

## ⚠️ Backend (Python) - Needs Installation

### Required Libraries:

#### 1. **pdfminer.six** - PDF Text Extraction
```bash
pip install pdfminer.six
```
**Purpose:** Extract text from PDFs (Hebrew, Greek, etc.)

#### 2. **langdetect** - Language Detection ⚠️ **NEEDED**
```bash
pip install langdetect
```
**Purpose:** Automatically detect if text is Hebrew, Greek, Aramaic, etc.

**Example:**
```python
from langdetect import detect
detect("בְּרֵאשִׁית")  # Returns 'he' (Hebrew)
detect("Ἐν ἀρχῇ")     # Returns 'el' (Greek)
```

---

### Recommended Libraries:

#### 3. **pytesseract** - OCR for Scanned PDFs
```bash
# First install Tesseract:
brew install tesseract tesseract-lang  # macOS

# Then Python wrapper:
pip install pytesseract pillow
```
**Purpose:** Extract text from scanned PDF images (Hebrew, Greek)

**Language Packs Needed:**
- `heb` - Hebrew
- `ell` - Greek
- `ara` - Arabic (for Aramaic)

#### 4. **pdfplumber** - Better PDF Processing
```bash
pip install pdfplumber
```
**Purpose:** Better text extraction, preserves layout, better Unicode

---

## 🚀 Quick Install

### Minimal (Required):

```bash
pip install pdfminer.six langdetect
```

### Recommended (Full Setup):

```bash
# Install Tesseract first (macOS)
brew install tesseract tesseract-lang

# Then Python packages
pip install pdfminer.six langdetect pytesseract pillow pdfplumber beautifulsoup4 requests
```

Or use the requirements file:

```bash
pip install -r requirements.txt
```

---

## 📊 What Each Library Does

| Library | Purpose | For OT | For NT | Status |
|---------|---------|--------|--------|--------|
| **Noto Fonts** | Display Hebrew/Greek | ✅ Hebrew | ✅ Greek | ✅ Installed |
| **pdfminer.six** | Extract text from PDFs | ✅ Hebrew | ✅ Greek | ⚠️ Need install |
| **langdetect** | Detect language | ✅ Hebrew | ✅ Greek | ❌ **NOT installed** |
| **pytesseract** | OCR for scanned PDFs | ✅ Hebrew | ✅ Greek | ❌ Not installed |
| **pdfplumber** | Better PDF extraction | ✅ Hebrew | ✅ Greek | ❌ Not installed |

---

## 🎯 Answer to Your Question

**"What language libraries do we need to have to read the symbols for OT and NT?"**

### Frontend (Browser):
- ✅ **Already have:** Noto Sans fonts (Hebrew & Greek)
- ✅ **No additional libraries needed**

### Backend (Python):
- ⚠️ **Need:** `langdetect` - To identify Hebrew vs Greek vs Aramaic
- ⚠️ **Need:** `pdfminer.six` - To extract text from PDFs
- ⚠️ **Recommended:** `pytesseract` - For OCR of scanned PDFs

---

## ✅ Current Status

**Frontend:** ✅ Ready (fonts loaded)  
**Backend:** ⚠️ Needs `langdetect` and `pdfminer.six`

---

## 📝 Installation Command

**Run this in your terminal:**

```bash
pip install pdfminer.six langdetect
```

**For OCR support (optional):**

```bash
brew install tesseract tesseract-lang
pip install pytesseract pillow
```

---

**The frontend is ready! Backend needs `langdetect` to identify languages!**



