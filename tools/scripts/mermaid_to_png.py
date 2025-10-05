#!/usr/bin/env python3
"""
Mermaid Diagram to PNG Converter
Extracts Mermaid diagrams from markdown files and converts them to PNG images
"""

import os
import re
import sys
import subprocess
import tempfile
from pathlib import Path
import json
import base64

def extract_mermaid_diagrams(markdown_file):
    """Extract all Mermaid diagrams from markdown file"""
    diagrams = []
    
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all mermaid code blocks
    pattern = r'```mermaid\n(.*?)\n```'
    matches = re.findall(pattern, content, re.DOTALL)
    
    for i, diagram_content in enumerate(matches, 1):
        # Extract diagram title from surrounding context
        title = f"diagram_{i}"
        
        # Try to find a title in the surrounding text
        diagram_start = content.find(f"```mermaid\n{diagram_content}")
        before_diagram = content[:diagram_start]
        
        # Look for headers or titles before the diagram
        header_matches = re.findall(r'#+\s*(.+?)$', before_diagram, re.MULTILINE)
        if header_matches:
            # Use the last (most recent) header
            header_text = header_matches[-1].strip().lower()
            title = re.sub(r'[^\w\s-]', '', header_text)
            title = re.sub(r'[-\s]+', '_', title)
            title = title[:50]  # Limit length
        
        # Generate unique title based on content if needed
        if title == f"diagram_{i}" or title in [d['title'] for d in diagrams]:
            # Look for specific keywords in the diagram content
            if "subgraph" in diagram_content.lower():
                subgraph_matches = re.findall(r'subgraph\s+"([^"]*)"', diagram_content, re.IGNORECASE)
                if subgraph_matches:
                    title = subgraph_matches[0].strip().lower()
                    title = re.sub(r'[^\w\s-]', '', title)
                    title = re.sub(r'[-\s]+', '_', title)
                    title = f"{title}_{i}"
                else:
                    title = f"architecture_diagram_{i}"
            elif "graph" in diagram_content.lower():
                title = f"flow_diagram_{i}"
            else:
                title = f"diagram_{i}"
        
        diagrams.append({
            'title': title,
            'content': diagram_content.strip(),
            'index': i
        })
    
    return diagrams

def convert_mermaid_to_png_via_mermaid_cli(diagram_content, output_file):
    """Convert using mermaid CLI tool"""
    try:
        # Create temporary mermaid file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', delete=False) as temp_file:
            temp_file.write(diagram_content)
            temp_file_path = temp_file.name
        
        # Use mermaid CLI to convert
        cmd = [
            'mmdc',  # mermaid CLI tool
            '-i', temp_file_path,
            '-o', output_file,
            '-t', 'neutral',  # theme
            '-b', 'white'     # background
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return result.returncode == 0 and os.path.exists(output_file)
    except Exception:
        return False

def convert_mermaid_to_png_via_online_service(diagram_content, output_file):
    """Convert using mermaid.ink online service"""
    try:
        # Encode diagram content to base64
        encoded = base64.urlsafe_b64encode(diagram_content.encode('utf-8')).decode('ascii')
        
        # Construct URL
        url = f"https://mermaid.ink/img/{encoded}"
        
        # Download the image
        cmd = ['curl', '-s', '-o', output_file, url]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        return result.returncode == 0 and os.path.exists(output_file) and os.path.getsize(output_file) > 1000
    except Exception:
        return False

def convert_mermaid_to_png_via_browser(diagram_content, output_file):
    """Convert using headless browser approach"""
    try:
        # Create HTML template
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
        </head>
        <body>
            <div class="mermaid">
        {diagram_content}
            </div>
            <script>
                mermaid.initialize({{ startOnLoad: true, theme: 'neutral' }});
            </script>
        </body>
        </html>
        """
        
        # Create temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as temp_file:
            temp_file.write(html_template)
            temp_file_path = temp_file.name
        
        # Try to convert using Chrome headless
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
                    "--screenshot=" + output_file,
                    "--window-size=1200,800",
                    f"file://{os.path.abspath(temp_file_path)}"
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                if result.returncode == 0 and os.path.exists(output_file):
                    os.unlink(temp_file_path)
                    return True
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
        
        # Clean up temp file
        os.unlink(temp_file_path)
        return False
    except Exception:
        return False

def convert_diagram_to_png(diagram_content, output_file):
    """Convert Mermaid diagram to PNG using available methods"""
    
    methods = [
        lambda: convert_mermaid_to_png_via_mermaid_cli(diagram_content, output_file),
        lambda: convert_mermaid_to_png_via_online_service(diagram_content, output_file),
        lambda: convert_mermaid_to_png_via_browser(diagram_content, output_file),
    ]
    
    for i, method in enumerate(methods, 1):
        try:
            print(f"  Trying conversion method {i}...")
            result = method()
            if result:
                print(f"  ✅ Successfully converted diagram")
                return True
        except Exception as e:
            print(f"  ❌ Method {i} failed: {e}")
            continue
    
    print(f"  ❌ All conversion methods failed")
    return False

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python mermaid_to_png.py <markdown_file>")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    
    if not os.path.exists(markdown_file):
        print(f"❌ Markdown file not found: {markdown_file}")
        sys.exit(1)
    
    # Extract diagrams
    print(f"Extracting Mermaid diagrams from {markdown_file}...")
    diagrams = extract_mermaid_diagrams(markdown_file)
    
    if not diagrams:
        print("❌ No Mermaid diagrams found in the file")
        sys.exit(1)
    
    print(f"Found {len(diagrams)} Mermaid diagrams")
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(markdown_file), "diagrams")
    os.makedirs(output_dir, exist_ok=True)
    
    # Convert each diagram
    successful_conversions = 0
    
    for diagram in diagrams:
        print(f"\nConverting diagram: {diagram['title']}")
        
        output_file = os.path.join(output_dir, f"{diagram['title']}.png")
        
        if convert_diagram_to_png(diagram['content'], output_file):
            successful_conversions += 1
            # Get file size
            size = os.path.getsize(output_file)
            print(f"  📄 Saved: {output_file} ({size:,} bytes)")
        else:
            print(f"  ❌ Failed to convert: {diagram['title']}")
    
    print(f"\n✅ Successfully converted {successful_conversions}/{len(diagrams)} diagrams")
    print(f"📁 Diagrams saved to: {output_dir}")
    
    if successful_conversions > 0:
        print(f"\nGenerated files:")
        for file in sorted(os.listdir(output_dir)):
            if file.endswith('.png'):
                file_path = os.path.join(output_dir, file)
                size = os.path.getsize(file_path)
                print(f"  - {file} ({size:,} bytes)")

if __name__ == "__main__":
    main()
