#!/usr/bin/env python3
"""
Convert Technical Paper to PDF using weasyprint
"""
import subprocess
import sys
import os

def install_weasyprint():
    """Install weasyprint if not available"""
    try:
        import weasyprint
        return True
    except ImportError:
        print("Installing weasyprint...")
        subprocess.run([sys.executable, "-m", "pip", "install", "weasyprint"], check=True)
        import weasyprint
        return True

def create_styled_html():
    """Create HTML with academic paper styling"""
    html_content = '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>A Pluggable Architecture for AI-Powered Content Curation Using BAML</title>
    <style>
        @page {
            size: A4;
            margin: 1in;
            @top-center {
                content: "A Pluggable Architecture for AI-Powered Content Curation Using BAML";
                font-size: 10pt;
                font-style: italic;
            }
            @bottom-center {
                content: counter(page);
                font-size: 10pt;
            }
        }
        
        body {
            font-family: "Times New Roman", serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: none;
        }
        
        h1 {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20pt;
            page-break-before: auto;
        }
        
        h2 {
            font-size: 14pt;
            font-weight: bold;
            margin-top: 20pt;
            margin-bottom: 10pt;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5pt;
        }
        
        h3 {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 15pt;
            margin-bottom: 8pt;
        }
        
        h4 {
            font-size: 11pt;
            font-weight: bold;
            margin-top: 12pt;
            margin-bottom: 6pt;
        }
        
        p {
            margin-bottom: 10pt;
            text-align: justify;
        }
        
        code {
            font-family: "Courier New", monospace;
            font-size: 9pt;
            background-color: #f5f5f5;
            padding: 2pt;
            border-radius: 3pt;
        }
        
        pre {
            font-family: "Courier New", monospace;
            font-size: 9pt;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5pt;
            padding: 10pt;
            margin: 10pt 0;
            overflow-x: auto;
            page-break-inside: avoid;
        }
        
        blockquote {
            margin: 15pt 20pt;
            padding: 10pt;
            background-color: #f9f9f9;
            border-left: 4pt solid #ddd;
            font-style: italic;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 10pt 0;
            page-break-inside: avoid;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8pt;
            text-align: left;
        }
        
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        
        .abstract {
            font-style: italic;
            margin: 20pt 0;
            padding: 15pt;
            background-color: #f9f9f9;
            border-radius: 5pt;
        }
        
        .keywords {
            font-weight: bold;
            margin-top: 10pt;
        }
        
        .author-info {
            text-align: center;
            margin: 20pt 0;
            font-style: italic;
        }
        
        .references {
            font-size: 10pt;
        }
        
        .toc {
            page-break-after: always;
        }
        
        ol, ul {
            margin-bottom: 10pt;
        }
        
        li {
            margin-bottom: 5pt;
        }
    </style>
</head>
<body>
'''
    
    # Read the generated HTML content
    with open('TECHNICAL_PAPER_BAML_ARCHITECTURE.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract body content
    import re
    body_match = re.search(r'<body[^>]*>(.*)</body>', content, re.DOTALL)
    if body_match:
        body_content = body_match.group(1)
    else:
        body_content = content
    
    # Add abstract styling
    body_content = body_content.replace(
        '<h2 id="abstract">Abstract</h2>',
        '<h2 id="abstract">Abstract</h2><div class="abstract">'
    )
    
    # Find the end of abstract and close the div
    body_content = body_content.replace(
        '<p><strong>Keywords:</strong>',
        '</div><p class="keywords"><strong>Keywords:</strong>'
    )
    
    html_content += body_content + '</body></html>'
    
    with open('TECHNICAL_PAPER_BAML_ARCHITECTURE_STYLED.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

def create_pdf():
    """Create PDF from styled HTML"""
    try:
        import weasyprint
        
        print("Creating styled HTML...")
        create_styled_html()
        
        print("Converting to PDF...")
        weasyprint.HTML('TECHNICAL_PAPER_BAML_ARCHITECTURE_STYLED.html').write_pdf(
            'TECHNICAL_PAPER_BAML_ARCHITECTURE.pdf'
        )
        
        print("✅ PDF created successfully: TECHNICAL_PAPER_BAML_ARCHITECTURE.pdf")
        
        # Clean up temporary files
        os.remove('TECHNICAL_PAPER_BAML_ARCHITECTURE_STYLED.html')
        
    except Exception as e:
        print(f"❌ Error creating PDF: {e}")
        print("💡 Alternative: Open TECHNICAL_PAPER_BAML_ARCHITECTURE.html in browser and print to PDF")

if __name__ == "__main__":
    try:
        install_weasyprint()
        create_pdf()
    except Exception as e:
        print(f"❌ Could not install weasyprint: {e}")
        print("💡 Alternative: Open TECHNICAL_PAPER_BAML_ARCHITECTURE.html in browser and print to PDF")
        print("   The HTML file has been created with professional styling.")
