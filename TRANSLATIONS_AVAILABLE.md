# Bible Translations Available in The Word App

## ✅ Currently Loaded (20 Translations + 4 Original Texts)

### Original Language Texts
| Abbr | Name | Testament | File |
|------|------|-----------|------|
| **WLC** | Westminster Leningrad Codex (BHS) | OT | `hebrew-ot-complete.json` |
| **TR** | Textus Receptus | NT | `greek-nt-tr.json` |
| **BYZ** | Byzantine Majority Text | NT | `byzantine-nt.json` |
| **LXX** | Septuagint (Greek OT) | OT | `septuagint-lxx.json` |

### English Translations

#### LDS Primary
| Abbr | Name | Notes |
|------|------|-------|
| **KJV+JST** | King James Version (LDS) | With JST footnotes integrated |

#### KJV Family (NKJV Alternatives)
| Abbr | Name | Notes |
|------|------|-------|
| **MKJV** | Modern King James Version | Best NKJV alternative |
| **KJVPCE** | KJV Pure Cambridge Edition | Definitive KJV text |
| **AKJV** | American King James | Updated spelling |

#### Modern Scholarly
| Abbr | Name | Notes |
|------|------|-------|
| **ESV** | English Standard Version | Formal equivalence |
| **BSB** | Berean Study Bible | Similar to NIV/CSB |
| **LEB** | Lexham English Bible | Highly literal, scholarly |

#### Expanded Style (Amplified Alternative)
| Abbr | Name | Notes |
|------|------|-------|
| **JUB** | Jubilee Bible 2000 | Amplified-style expanded meanings |

#### Historic/Reformation
| Abbr | Name | Notes |
|------|------|-------|
| **GNV** | 1599 Geneva Bible | With marginal notes (original spelling) |
| **TYN** | Tyndale Bible (1534) | Foundation of English Bibles |

#### Jewish
| Abbr | Name | Notes |
|------|------|-------|
| **JPS** | JPS Tanakh | Jewish Publication Society (OT only) |

#### Catholic
| Abbr | Name | Notes |
|------|------|-------|
| **DRC** | Douay-Rheims Catholic | Traditional Catholic Bible |

#### Literal Translations (LSB Alternatives)
| Abbr | Name | Notes |
|------|------|-------|
| **LITV** | Literal Translation | Word-for-word (closest to LSB) |
| **YLT** | Young's Literal Translation | Word-for-word literal |
| **ASV** | American Standard Version | Predecessor to NASB |
| **DARBY** | Darby Translation | Literal, dispensational |

#### Other English
| Abbr | Name | Notes |
|------|------|-------|
| **WEB** | Webster's Bible | |
| **BBE** | Bible in Basic English | Simple vocabulary |
| **NHEB** | New Heart English Bible | |
| **OEB** | Open English Bible | |

---

## 🔄 Available to Download

### NET Bible (FREE with Translator Notes)
Run this command in your terminal:
```bash
python3 download_net_bible.py
```
The NET Bible includes comprehensive translator notes explaining translation decisions.

---

## ❌ Copyrighted (Not Freely Available)

These translations require licensing and cannot be freely redistributed:

| Translation | Copyright Holder | Best Alternative |
|-------------|-----------------|------------------|
| **AMP** (Amplified) | Lockman Foundation | **JUB** (Jubilee 2000) |
| **NKJV** | Thomas Nelson | **MKJV** (Modern KJV) |
| **NASB** | Lockman Foundation | **LEB** or **ASV** |
| **NIV** | Biblica | **BSB** (Berean) |
| **CSB** | Holman | **BSB** (Berean) |
| **LSB** | Three Sixteen | **LITV** or **LEB** |
| **NLT** | Tyndale House | **BBE** (Basic English) |
| **NRSV/NRSVue** | National Council | **ESV** or **LEB** |
| **NA28/UBS5** | German Bible Society | **TR** or **BYZ** |

---

## 📄 Your PDFs

| PDF File | Contains | Status |
|----------|----------|--------|
| `BHS-ESV Interlinear OT.pdf` | Hebrew + ESV | ESV ✅ loaded; Hebrew is image-based |
| `UBS5 Greek NT.pdf` | Greek text | Copyrighted, image-based |
| `NA28.pdf` | Greek text | Copyrighted, image-based |

**Note:** The ESV English text from your interlinear PDF is already loaded. The Hebrew/Greek in PDFs are image-based and require OCR to extract. We already have verified digital Hebrew (WLC) and Greek (TR/BYZ) texts loaded.

---

## 🌐 Additional Translations in Database (140+ Total)

The `bible_databases/formats/json/` folder contains 140 translations including:
- Multiple German translations
- French translations
- Spanish, Portuguese, Italian
- Russian, Ukrainian
- Chinese, Japanese, Korean
- Greek, Hebrew (modern)
- Latin (Vulgate)
- And many more...

To add any of these, copy them to `public/lib/original-texts/` and update the scripture loader.



