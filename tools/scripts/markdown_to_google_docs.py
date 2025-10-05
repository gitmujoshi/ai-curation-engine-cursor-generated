#!/usr/bin/env python3
"""
Markdown to Google Docs Converter
Converts markdown files to HTML format optimized for Google Docs import
"""

import os
import re
import sys
import subprocess
import tempfile
from pathlib import Path

def convert_markdown_to_html(markdown_file, output_file):
    """Convert markdown to HTML with Google Docs optimized formatting"""
    
    # Use pandoc with Google Docs optimized settings
    cmd = [
        'pandoc',
        markdown_file,
        '-o', output_file,
        '--standalone',
        '--embed-resources',
        '--css=https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css',
        '--metadata', 'title=AI Safety for Vulnerable Populations',
        '--toc',
        '--toc-depth=3',
        '--number-sections',
        '--highlight-style=pygments',
        '--section-divs',
        '--wrap=preserve'
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        return result.returncode == 0
    except Exception as e:
        print(f"Pandoc conversion failed: {e}")
        return False

def create_google_docs_optimized_html(html_file, output_file):
    """Create Google Docs optimized HTML with better formatting"""
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Google Docs optimizations
    optimizations = [
        # Replace Mermaid diagrams with placeholder text
        (r'<div class="mermaid">.*?</div>', '<div style="border: 2px solid #ddd; padding: 20px; margin: 20px 0; background-color: #f9f9f9; text-align: center; color: #666;">[DIAGRAM: Mermaid diagram converted to PNG - see diagrams folder for images]</div>'),
        
        # Improve heading styles for Google Docs
        (r'<h1([^>]*)>', '<h1 style="color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; page-break-after: avoid;"\\1>'),
        (r'<h2([^>]*)>', '<h2 style="color: #34495e; border-bottom: 2px solid #95a5a6; padding-bottom: 8px; page-break-after: avoid; margin-top: 30px;"\\1>'),
        (r'<h3([^>]*)>', '<h3 style="color: #2980b9; page-break-after: avoid;"\\1>'),
        
        # Improve code block styling
        (r'<pre([^>]*)>', '<pre style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; overflow-x: auto; font-family: Monaco, Menlo, monospace; font-size: 0.9em; page-break-inside: avoid;"\\1>'),
        
        # Improve inline code styling
        (r'<code([^>]*class="[^"]*")>', '<code style="background-color: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-family: Monaco, Menlo, monospace; font-size: 0.9em;"\\1>'),
        
        # Improve table styling
        (r'<table([^>]*)>', '<table style="border-collapse: collapse; width: 100%; margin: 20px 0; page-break-inside: avoid;"\\1>'),
        (r'<th([^>]*)>', '<th style="border: 1px solid #ddd; padding: 12px; text-align: left; background-color: #f2f2f2; font-weight: bold;"\\1>'),
        (r'<td([^>]*)>', '<td style="border: 1px solid #ddd; padding: 12px; text-align: left;"\\1>'),
        
        # Improve list styling
        (r'<ul([^>]*)>', '<ul style="margin: 15px 0; padding-left: 30px;"\\1>'),
        (r'<ol([^>]*)>', '<ol style="margin: 15px 0; padding-left: 30px;"\\1>'),
        (r'<li([^>]*)>', '<li style="margin: 8px 0; page-break-inside: avoid;"\\1>'),
        
        # Add slide separators
        (r'<hr([^>]*)>', '<hr style="border: none; border-top: 3px solid #e74c3c; margin: 40px 0; page-break-before: always;">'),
        
        # Improve blockquote styling
        (r'<blockquote([^>]*)>', '<blockquote style="border-left: 4px solid #3498db; margin: 20px 0; padding-left: 20px; color: #555; font-style: italic; page-break-inside: avoid;"\\1>'),
        
        # Add better paragraph spacing
        (r'<p([^>]*)>', '<p style="margin: 10px 0; line-height: 1.6;"\\1>'),
        
        # Improve strong and emphasis
        (r'<strong([^>]*)>', '<strong style="color: #2c3e50; font-weight: bold;"\\1>'),
        (r'<em([^>]*)>', '<em style="color: #8e44ad; font-style: italic;"\\1>'),
    ]
    
    # Apply optimizations
    for pattern, replacement in optimizations:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)
    
    # Add Google Docs specific meta tags
    meta_tags = '''
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <meta name="google-docs-optimized" content="true">
    '''
    
    content = content.replace('<head>', f'<head>{meta_tags}')
    
    # Write optimized HTML
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def create_diagrams_reference(diagrams_dir, output_file):
    """Create a reference document for diagrams"""
    
    if not os.path.exists(diagrams_dir):
        return False
    
    diagrams = []
    for file in sorted(os.listdir(diagrams_dir)):
        if file.endswith('.png'):
            diagrams.append(file)
    
    if not diagrams:
        return False
    
    reference_content = f"""
# Diagrams Reference

This document contains references to all diagrams mentioned in the AI Safety presentation.

## Available Diagrams

Total diagrams: {len(diagrams)}

"""
    
    for i, diagram in enumerate(diagrams, 1):
        reference_content += f"{i}. **{diagram}** - Located in diagrams folder\n"
    
    reference_content += """

## Usage Instructions

1. Open the main Google Docs document
2. Navigate to the section mentioning a diagram
3. Insert the corresponding PNG file from the diagrams folder
4. Resize and position as needed

## Diagram Categories

- **Presentation Diagrams**: Integration flows and ecosystem architecture
- **Deployment Diagrams**: Infrastructure and deployment strategies  
- **Architecture Diagrams**: Technical system architecture and components

All diagrams are high-quality PNG files ready for Google Docs insertion.
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(reference_content)
    
    return True

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python markdown_to_google_docs.py <markdown_file>")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    
    if not os.path.exists(markdown_file):
        print(f"❌ Markdown file not found: {markdown_file}")
        sys.exit(1)
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(markdown_file), "google_docs")
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert to HTML
    html_file = os.path.join(output_dir, "presentation.html")
    print(f"Converting {markdown_file} to HTML...")
    
    if not convert_markdown_to_html(markdown_file, html_file):
        print("❌ Failed to convert markdown to HTML")
        sys.exit(1)
    
    # Create Google Docs optimized version
    google_docs_file = os.path.join(output_dir, "google_docs_optimized.html")
    print("Creating Google Docs optimized version...")
    
    if not create_google_docs_optimized_html(html_file, google_docs_file):
        print("❌ Failed to create Google Docs optimized version")
        sys.exit(1)
    
    # Create diagrams reference
    diagrams_dir = os.path.join(os.path.dirname(markdown_file), "diagrams")
    diagrams_ref_file = os.path.join(output_dir, "diagrams_reference.md")
    
    if os.path.exists(diagrams_dir):
        print("Creating diagrams reference...")
        create_diagrams_reference(diagrams_dir, diagrams_ref_file)
    
    # Get file sizes
    html_size = os.path.getsize(html_file)
    google_docs_size = os.path.getsize(google_docs_file)
    
    print(f"\n✅ Conversion complete!")
    print(f"📁 Output directory: {output_dir}")
    print(f"📄 Standard HTML: {html_file} ({html_size:,} bytes)")
    print(f"📄 Google Docs optimized: {google_docs_file} ({google_docs_size:,} bytes)")
    
    if os.path.exists(diagrams_ref_file):
        print(f"📄 Diagrams reference: {diagrams_ref_file}")
    
    print(f"\n📋 Next steps:")
    print(f"1. Open Google Docs (docs.google.com)")
    print(f"2. Click 'File' > 'Import'")
    print(f"3. Upload: {google_docs_file}")
    print(f"4. Insert diagrams from the diagrams folder as needed")
    print(f"5. Adjust formatting as needed in Google Docs")

if __name__ == "__main__":
    main()
