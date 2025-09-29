import re
import json

# --- CONFIGURATION ---
DICT_TXT = "scripture-app/dictionary_section.txt"
COMM_TXT = "scripture-app/commentary_section.txt"
DICT_JSON = "scripture-app/dictionary.json"
COMM_JSON = "scripture-app/commentary.json"

# --- DICTIONARY PARSING ---
def parse_dictionary(txt_path):
    with open(txt_path, encoding="utf-8") as f:
        text = f.read()
    # Naive split: headwords in all caps, followed by definition
    entries = []
    for match in re.finditer(r"\n([A-ZΑ-Ω]{3,})\n(.+?)(?=\n[A-ZΑ-Ω]{3,}\n|$)", text, re.DOTALL):
        headword = match.group(1).strip()
        definition = match.group(2).strip().replace('\n', ' ')
        entries.append({
            "headword": headword,
            "definition": definition,
            "related_verses": []  # To be filled in later if possible
        })
    return entries

# --- COMMENTARY PARSING ---
def parse_commentary(txt_path):
    with open(txt_path, encoding="utf-8") as f:
        text = f.read()
    # Naive split: look for verse references like "John 1:1"
    entries = []
    for match in re.finditer(r"(John \d+:\d+|[A-Z][a-z]+ \d+:\d+)\n(.+?)(?=(?:[A-Z][a-z]+ \d+:\d+)|$)", text, re.DOTALL):
        reference = match.group(1).strip()
        commentary_text = match.group(2).strip().replace('\n', ' ')
        entries.append({
            "reference": reference,
            "commentary_text": commentary_text,
            "source": "UBS5"
        })
    return entries

if __name__ == "__main__":
    print("Parsing dictionary...")
    dict_entries = parse_dictionary(DICT_TXT)
    with open(DICT_JSON, "w", encoding="utf-8") as f:
        json.dump(dict_entries, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(dict_entries)} dictionary entries to {DICT_JSON}")

    print("Parsing commentary...")
    comm_entries = parse_commentary(COMM_TXT)
    with open(COMM_JSON, "w", encoding="utf-8") as f:
        json.dump(comm_entries, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(comm_entries)} commentary entries to {COMM_JSON}") 