from typing import List, Dict, Any, Optional
from pathlib import Path
from docx import Document
from docx.text.paragraph import Paragraph


def extract_section_headings(file_path: str) -> List[Dict[str, Any]]:
    """
    Extract section headings from a DOCX template file.
    
    Args:
        file_path: Path to the DOCX template file
        
    Returns:
        List of dictionaries containing heading information
        
    Raises:
        FileNotFoundError: If file does not exist
        ValueError: If file is not a valid DOCX
    """
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"Template file not found: {file_path}")
    
    if path.suffix.lower() != ".docx":
        raise ValueError(f"File must be a DOCX file, got: {path.suffix}")
    
    doc = Document(file_path)
    headings = []
    
    for idx, paragraph in enumerate(doc.paragraphs):
        # Check if paragraph is a heading
        if paragraph.style.name.startswith("Heading"):
            heading_level = _get_heading_level(paragraph.style.name)
            
            headings.append({
                "text": paragraph.text.strip(),
                "level": heading_level,
                "style": paragraph.style.name,
                "position": idx
            })
    
    return headings


def _get_heading_level(style_name: str) -> int:
    """
    Extract heading level from style name.
    
    Args:
        style_name: Style name (e.g., "Heading 1", "Heading 2")
        
    Returns:
        Heading level as integer (default: 1)
    """
    try:
        # Extract number from "Heading X" style
        parts = style_name.split()
        if len(parts) >= 2 and parts[1].isdigit():
            return int(parts[1])
    except (IndexError, ValueError):
        pass
    
    return 1


def get_section_order(file_path: str) -> List[str]:
    """
    Get ordered list of section titles from DOCX template.
    
    Args:
        file_path: Path to the DOCX template file
        
    Returns:
        Ordered list of section titles
    """
    headings = extract_section_headings(file_path)
    return [heading["text"] for heading in headings]


def parse_template_structure(file_path: str) -> Dict[str, Any]:
    """
    Parse complete template structure including headings hierarchy.
    
    Args:
        file_path: Path to the DOCX template file
        
    Returns:
        Dictionary containing template structure information
    """
    headings = extract_section_headings(file_path)
    
    # Build hierarchical structure
    hierarchy = []
    current_h1 = None
    current_h2 = None
    
    for heading in headings:
        level = heading["level"]
        text = heading["text"]
        
        if level == 1:
            current_h1 = {
                "title": text,
                "subsections": []
            }
            hierarchy.append(current_h1)
            current_h2 = None
        elif level == 2 and current_h1:
            current_h2 = {
                "title": text,
                "subsections": []
            }
            current_h1["subsections"].append(current_h2)
        elif level == 3 and current_h2:
            current_h2["subsections"].append({
                "title": text
            })
        elif level >= 3 and current_h1 and not current_h2:
            # Level 3+ without level 2, attach to level 1
            current_h1["subsections"].append({
                "title": text
            })
    
    return {
        "headings": headings,
        "section_order": [h["text"] for h in headings],
        "hierarchy": hierarchy,
        "total_sections": len(headings)
    }


def validate_template(file_path: str) -> Dict[str, Any]:
    """
    Validate template file and return validation results.
    
    Args:
        file_path: Path to the DOCX template file
        
    Returns:
        Dictionary with validation results
    """
    try:
        structure = parse_template_structure(file_path)
        
        return {
            "valid": True,
            "message": "Template is valid",
            "section_count": structure["total_sections"],
            "sections": structure["section_order"]
        }
    except Exception as e:
        return {
            "valid": False,
            "message": f"Template validation failed: {str(e)}",
            "error": str(e)
        }
