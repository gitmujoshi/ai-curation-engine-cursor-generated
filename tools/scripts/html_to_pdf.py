#!/usr/bin/env python3
"""
HTML to PDF Converter
Converts HTML presentation to PDF using a headless browser approach
"""

import os
import sys
import subprocess
import tempfile
from pathlib import Path

def convert_html_to_pdf(html_file, output_pdf):
    """Convert HTML file to PDF using available tools"""
    
    # Try different conversion methods
    methods = [
        # Method 1: Try using Chrome/Chromium headless
        lambda: convert_with_chrome(html_file, output_pdf),
        # Method 2: Try using Safari (macOS)
        lambda: convert_with_safari(html_file, output_pdf),
        # Method 3: Try using wkhtmltopdf if available
        lambda: convert_with_wkhtmltopdf(html_file, output_pdf),
    ]
    
    for i, method in enumerate(methods, 1):
        try:
            print(f"Trying conversion method {i}...")
            result = method()
            if result:
                print(f"✅ Successfully converted to PDF: {output_pdf}")
                return True
        except Exception as e:
            print(f"❌ Method {i} failed: {e}")
            continue
    
    print("❌ All conversion methods failed")
    return False

def convert_with_chrome(html_file, output_pdf):
    """Convert using Chrome/Chromium headless"""
    chrome_paths = [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "chrome",
        "chromium"
    ]
    
    for chrome_path in chrome_paths:
        try:
            cmd = [
                chrome_path,
                "--headless",
                "--disable-gpu",
                "--no-sandbox",
                "--print-to-pdf=" + output_pdf,
                "--print-to-pdf-no-header",
                f"file://{os.path.abspath(html_file)}"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode == 0 and os.path.exists(output_pdf):
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            continue
    
    return False

def convert_with_safari(html_file, output_pdf):
    """Convert using Safari (macOS only)"""
    if sys.platform != "darwin":
        return False
    
    try:
        # Use AppleScript to open Safari and print to PDF
        applescript = f'''
        tell application "Safari"
            activate
            open location "file://{os.path.abspath(html_file)}"
            delay 3
            tell application "System Events"
                keystroke "p" using command down
                delay 2
                click button "PDF" of sheet 1 of window 1 of application process "Safari"
                delay 1
                click menu item "Save as PDF..." of menu 1 of button "PDF" of sheet 1 of window 1 of application process "Safari"
                delay 2
                keystroke "{output_pdf}"
                delay 1
                keystroke return
            end tell
            delay 2
            quit
        end tell
        '''
        
        subprocess.run(["osascript", "-e", applescript], timeout=60)
        return os.path.exists(output_pdf)
    except Exception:
        return False

def convert_with_wkhtmltopdf(html_file, output_pdf):
    """Convert using wkhtmltopdf"""
    try:
        cmd = [
            "wkhtmltopdf",
            "--page-size", "A4",
            "--margin-top", "0.75in",
            "--margin-right", "0.75in", 
            "--margin-bottom", "0.75in",
            "--margin-left", "0.75in",
            "--encoding", "UTF-8",
            "--print-media-type",
            html_file,
            output_pdf
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return result.returncode == 0 and os.path.exists(output_pdf)
    except Exception:
        return False

def main():
    """Main function"""
    if len(sys.argv) != 3:
        print("Usage: python html_to_pdf.py <input.html> <output.pdf>")
        sys.exit(1)
    
    html_file = sys.argv[1]
    output_pdf = sys.argv[2]
    
    if not os.path.exists(html_file):
        print(f"❌ HTML file not found: {html_file}")
        sys.exit(1)
    
    print(f"Converting {html_file} to {output_pdf}...")
    
    success = convert_html_to_pdf(html_file, output_pdf)
    
    if success:
        print(f"✅ PDF created successfully: {output_pdf}")
        # Get file size
        size = os.path.getsize(output_pdf)
        print(f"📄 File size: {size:,} bytes ({size/1024/1024:.1f} MB)")
    else:
        print("❌ Failed to create PDF")
        sys.exit(1)

if __name__ == "__main__":
    main()
