#!/usr/bin/env python3
"""
Create Simple Google Docs Version
Creates a simplified version optimized for Google Docs import
"""

import os
import re
import sys
import tempfile

def simplify_for_google_docs(markdown_file, output_file):
    """Create a simplified version optimized for Google Docs"""
    
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace Mermaid diagrams with simple text placeholders
    mermaid_pattern = r'```mermaid\n(.*?)\n```'
    
    def replace_mermaid(match):
        diagram_content = match.group(1)
        # Extract diagram type and create a simple description
        if 'subgraph' in diagram_content.lower():
            return '\n**[DIAGRAM: Architecture Diagram - See PNG files in diagrams folder for visual representation]**\n'
        elif 'graph' in diagram_content.lower():
            return '\n**[DIAGRAM: Flow Diagram - See PNG files in diagrams folder for visual representation]**\n'
        else:
            return '\n**[DIAGRAM: See PNG files in diagrams folder for visual representation]**\n'
    
    content = re.sub(mermaid_pattern, replace_mermaid, content, flags=re.DOTALL)
    
    # Simplify code blocks - keep the code but make it more Google Docs friendly
    code_pattern = r'```(\w+)?\n(.*?)\n```'
    
    def replace_code(match):
        language = match.group(1) or 'code'
        code_content = match.group(2)
        return f'\n**{language.upper()} CODE BLOCK:**\n```\n{code_content}\n```\n'
    
    content = re.sub(code_pattern, replace_code, content, flags=re.DOTALL)
    
    # Simplify inline code
    content = re.sub(r'`([^`]+)`', r'**\1**', content)
    
    # Convert slide separators to clear section breaks
    content = re.sub(r'^---\s*$', '\n' + '='*50 + '\n', content, flags=re.MULTILINE)
    
    # Simplify headers for better Google Docs compatibility
    content = re.sub(r'^## (.+)$', r'\n## \1\n', content, flags=re.MULTILINE)
    content = re.sub(r'^### (.+)$', r'\n### \1\n', content, flags=re.MULTILINE)
    content = re.sub(r'^#### (.+)$', r'\n#### \1\n', content, flags=re.MULTILINE)
    
    # Add clear section markers
    content = re.sub(r'^## (.+)$', r'\n\n---\n\n## \1\n', content, flags=re.MULTILINE)
    
    # Simplify tables - convert to simple text format
    table_pattern = r'\|(.+?)\|'
    def replace_table(match):
        table_content = match.group(1)
        # This is a simplified table replacement - Google Docs will handle formatting
        return f'| {table_content} |'
    
    # Keep tables but make them simpler
    content = re.sub(table_pattern, replace_table, content, flags=re.MULTILINE)
    
    # Add a header with instructions
    header = """# AI Safety for Vulnerable Populations - Technical Presentation

**Instructions for Google Docs Import:**
1. Import this document into Google Docs
2. Replace [DIAGRAM] placeholders with PNG images from the diagrams folder
3. Format headers, lists, and tables as needed
4. The document structure is preserved for easy navigation

---

"""
    
    content = header + content
    
    # Write simplified version
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return True

def create_diagrams_insertion_guide(output_file):
    """Create a guide for inserting diagrams into Google Docs"""
    
    guide_content = """# Diagrams Insertion Guide for Google Docs

## Available Diagrams

### Presentation Diagrams (docs/presentations/diagrams/)
1. **reference_solution_architecture.png** - Ecosystem integration architecture
2. **social_media_platform_integration.png** - YouTube integration example  
3. **educational_platform_integration.png** - Khan Academy integration
4. **family_router_integration.png** - Home network protection
5. **_the_misinformation_cascade_effect.png** - Misinformation spread cycle

### Deployment Diagrams (docs/guides/diagrams/)
6. **deployment_options_overview.png** - Deployment options overview
7. **local_deployment_architecture.png** - Local deployment stack
8. **complete_container_stack.png** - Docker container architecture
9. **aws_infrastructure_components.png** - AWS cloud infrastructure
10. **azure_infrastructure_components.png** - Azure cloud infrastructure
11. **oci_infrastructure_components.png** - OCI cloud infrastructure
12. **production_architecture.png** - Global production architecture

### Architecture Diagrams (docs/architecture/diagrams/)
13. **high_level_architecture.png** - Overall system architecture
14. **architecture_components.png** - Detailed component breakdown
15. **boundaryml_architecture_integration.png** - BAML integration
16. **core_architecture.png** - Core system components
17. **regulatory_mapping.png** - Global compliance framework
18. **implementation_strategy.png** - Phased implementation
19. **phase_1_foundation_months_1_6.png** - Phase 1 implementation
20. **phase_2_enhancement_months_7_12.png** - Phase 2 enhancement
21. **phase_3_scale_months_13_18.png** - Phase 3 scaling
22. **security_considerations.png** - Security architecture
23. **infrastructure_architecture.png** - Infrastructure deployment
24. **deployment_strategy.png** - Strategic deployment
25. **operational_procedures.png** - Operational procedures

## How to Insert Diagrams in Google Docs

### Step 1: Import the Document
1. Open Google Docs (docs.google.com)
2. Click "File" > "Import"
3. Upload the simplified markdown file or HTML file
4. Google Docs will convert it automatically

### Step 2: Insert Diagrams
1. Find each [DIAGRAM] placeholder in the document
2. Click where you want to insert the diagram
3. Go to "Insert" > "Image" > "Upload from computer"
4. Select the corresponding PNG file from the diagrams folder
5. Resize and position the image as needed

### Step 3: Format the Document
1. Apply heading styles (Heading 1, Heading 2, etc.) to headers
2. Format code blocks with monospace font
3. Create proper tables using Google Docs table tools
4. Add page breaks between major sections if needed
5. Apply consistent formatting throughout

### Step 4: Final Review
1. Check that all diagrams are properly inserted
2. Verify table formatting and readability
3. Ensure consistent heading hierarchy
4. Test document navigation and structure

## Tips for Best Results

- **Images**: Use high-resolution PNG files for best quality
- **Tables**: Recreate complex tables using Google Docs table tools
- **Code**: Use monospace fonts for code blocks
- **Headers**: Use Google Docs heading styles for consistent formatting
- **Sections**: Add page breaks between major sections for better readability

## File Locations

- **Main Document**: docs/presentations/google_docs/google_docs_optimized.html
- **Simplified Version**: docs/presentations/google_docs/simplified_for_google_docs.md
- **Diagrams**: docs/presentations/diagrams/, docs/guides/diagrams/, docs/architecture/diagrams/
- **This Guide**: docs/presentations/google_docs/diagrams_insertion_guide.md
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(guide_content)
    
    return True

def main():
    """Main function"""
    if len(sys.argv) != 2:
        print("Usage: python create_simple_google_docs.py <markdown_file>")
        sys.exit(1)
    
    markdown_file = sys.argv[1]
    
    if not os.path.exists(markdown_file):
        print(f"❌ Markdown file not found: {markdown_file}")
        sys.exit(1)
    
    # Create output directory
    output_dir = os.path.join(os.path.dirname(markdown_file), "google_docs")
    os.makedirs(output_dir, exist_ok=True)
    
    # Create simplified version
    simplified_file = os.path.join(output_dir, "simplified_for_google_docs.md")
    print("Creating simplified Google Docs version...")
    
    if not simplify_for_google_docs(markdown_file, simplified_file):
        print("❌ Failed to create simplified version")
        sys.exit(1)
    
    # Create diagrams insertion guide
    guide_file = os.path.join(output_dir, "diagrams_insertion_guide.md")
    print("Creating diagrams insertion guide...")
    
    if not create_diagrams_insertion_guide(guide_file):
        print("❌ Failed to create diagrams guide")
        sys.exit(1)
    
    # Get file size
    simplified_size = os.path.getsize(simplified_file)
    
    print(f"\n✅ Simplified version created!")
    print(f"📁 Output directory: {output_dir}")
    print(f"📄 Simplified version: {simplified_file} ({simplified_size:,} bytes)")
    print(f"📄 Diagrams guide: {guide_file}")
    
    print(f"\n📋 Google Docs Import Options:")
    print(f"Option 1: Upload {simplified_file} directly to Google Docs")
    print(f"Option 2: Upload {output_dir}/google_docs_optimized.html to Google Docs")
    print(f"Option 3: Copy/paste content from {simplified_file} into a new Google Doc")
    
    print(f"\n💡 Recommended approach:")
    print(f"1. Copy/paste content from {simplified_file}")
    print(f"2. Use the diagrams insertion guide to add images")
    print(f"3. Apply Google Docs formatting as needed")

if __name__ == "__main__":
    main()
