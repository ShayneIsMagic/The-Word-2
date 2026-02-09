#!/usr/bin/env python3
"""
Setup Complete Bible Data
Downloads pre-built Hebrew and Greek scripture data from reliable sources

RUN THIS IN YOUR TERMINAL (not through Cursor):
    cd /Users/shayneroy/The-Word-2
    source .venv/bin/activate
    python3 setup_complete_bible_data.py
"""

import os
import json
import subprocess
import sys

OUTPUT_DIR = "public/lib/original-texts"
STRONGS_DIR = "public/lib/strongs"

def run_command(cmd):
    """Run a shell command"""
    print(f"  Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"  Error: {result.stderr}")
        return False
    return True

def download_with_curl(url, output_file):
    """Download using curl (more reliable than Python requests)"""
    cmd = f'curl -L -o "{output_file}" "{url}"'
    return run_command(cmd)

def main():
    print("=" * 70)
    print("  COMPLETE BIBLE DATA SETUP")
    print("  This will download Hebrew OT, Greek NT, and Strong's Concordance")
    print("=" * 70)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(STRONGS_DIR, exist_ok=True)
    
    # =========================================================================
    # Option 1: Download from scrollmapper/bible_databases (SQLite)
    # =========================================================================
    print("\n📥 STEP 1: Downloading Hebrew Bible Database...")
    
    # This is a well-maintained Bible database with Strong's numbers
    bible_db_url = "https://github.com/scrollmapper/bible_databases/raw/master/json/t_wlc.json"
    hebrew_file = f"{OUTPUT_DIR}/hebrew-ot-wlc.json"
    
    if download_with_curl(bible_db_url, hebrew_file):
        print(f"  ✅ Downloaded Hebrew OT to {hebrew_file}")
        # Check file size
        if os.path.exists(hebrew_file):
            size = os.path.getsize(hebrew_file) / 1024 / 1024
            print(f"     File size: {size:.2f} MB")
    else:
        print("  ❌ Failed to download Hebrew")
    
    # =========================================================================
    # Option 2: Download Greek NT
    # =========================================================================
    print("\n📥 STEP 2: Downloading Greek NT Database...")
    
    greek_db_url = "https://github.com/scrollmapper/bible_databases/raw/master/json/t_gnt.json"
    greek_file = f"{OUTPUT_DIR}/greek-nt-gnt.json"
    
    if download_with_curl(greek_db_url, greek_file):
        print(f"  ✅ Downloaded Greek NT to {greek_file}")
        if os.path.exists(greek_file):
            size = os.path.getsize(greek_file) / 1024 / 1024
            print(f"     File size: {size:.2f} MB")
    else:
        print("  ❌ Failed to download Greek")
    
    # =========================================================================
    # Option 3: Download Strong's Concordance
    # =========================================================================
    print("\n📥 STEP 3: Downloading Strong's Hebrew...")
    
    strongs_h_url = "https://raw.githubusercontent.com/openscriptures/HebrewLexicon/master/strongs-hebrew-dictionary.js"
    strongs_h_file = f"{STRONGS_DIR}/strongs-hebrew-raw.js"
    
    download_with_curl(strongs_h_url, strongs_h_file)
    
    print("\n📥 STEP 4: Downloading Strong's Greek...")
    
    strongs_g_url = "https://raw.githubusercontent.com/morphgnt/strongs-dictionary-xml/master/strongsgreek.xml"
    strongs_g_file = f"{STRONGS_DIR}/strongs-greek-raw.xml"
    
    download_with_curl(strongs_g_url, strongs_g_file)
    
    # =========================================================================
    # Alternative: Use git clone for complete data
    # =========================================================================
    print("\n📥 STEP 5: Cloning complete Bible databases repository...")
    
    repo_dir = "bible_databases"
    if not os.path.exists(repo_dir):
        clone_cmd = "git clone --depth 1 https://github.com/scrollmapper/bible_databases.git"
        if run_command(clone_cmd):
            print(f"  ✅ Cloned repository to {repo_dir}/")
            
            # Copy the JSON files we need
            import shutil
            
            json_files = [
                ("bible_databases/json/t_wlc.json", f"{OUTPUT_DIR}/hebrew-ot-complete.json"),
                ("bible_databases/json/t_gnt.json", f"{OUTPUT_DIR}/greek-nt-complete.json"),
                ("bible_databases/json/t_kjv.json", f"{OUTPUT_DIR}/kjv-complete.json"),
            ]
            
            for src, dst in json_files:
                if os.path.exists(src):
                    shutil.copy(src, dst)
                    size = os.path.getsize(dst) / 1024 / 1024
                    print(f"  ✅ Copied {os.path.basename(dst)} ({size:.2f} MB)")
        else:
            print("  ⚠️ Git clone failed - trying direct downloads instead")
    else:
        print(f"  ℹ️ Repository already exists at {repo_dir}/")
    
    # =========================================================================
    # Summary
    # =========================================================================
    print("\n" + "=" * 70)
    print("  DOWNLOAD SUMMARY")
    print("=" * 70)
    
    files_to_check = [
        f"{OUTPUT_DIR}/hebrew-ot-complete.json",
        f"{OUTPUT_DIR}/hebrew-ot-wlc.json",
        f"{OUTPUT_DIR}/greek-nt-complete.json",
        f"{OUTPUT_DIR}/greek-nt-gnt.json",
        f"{OUTPUT_DIR}/kjv-complete.json",
    ]
    
    total_size = 0
    for f in files_to_check:
        if os.path.exists(f):
            size = os.path.getsize(f) / 1024 / 1024
            total_size += size
            print(f"  ✅ {os.path.basename(f)}: {size:.2f} MB")
        else:
            print(f"  ❌ {os.path.basename(f)}: NOT FOUND")
    
    print(f"\n  Total data: {total_size:.2f} MB")
    print("\n" + "=" * 70)
    
    if total_size > 1:
        print("  ✅ SUCCESS! Bible data is ready.")
        print("  Run: npm run dev:3002")
        print("  Then visit: http://localhost:3002/amplified")
    else:
        print("  ⚠️ Downloads may have failed. Check your network connection.")
        print("  Try running this script again or check the files manually.")


if __name__ == "__main__":
    main()



