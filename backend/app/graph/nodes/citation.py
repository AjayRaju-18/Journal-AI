from typing import Dict, Any, List
import json
import re
from app.graph.state import PaperGenerationState, update_progress
from app.core.llm import call_llm


def citation_node(state: PaperGenerationState) -> PaperGenerationState:
    """
    Citation node: Format existing citations to target style (no generation).
    
    Args:
        state: Current workflow state
        
    Returns:
        Updated state with formatted citations
    """
    print(f"[Citation] Starting citation formatting for job {state['job_id']}")
    
    try:
        # Update progress
        state = update_progress(state, "citation", 0.70)
        
        # Extract inputs
        sections = state.get("sections", {})
        config = state.get("config", {})
        existing_citations = state.get("citations", [])
        
        if not sections:
            raise ValueError("No sections available for citation processing")
        
        # Extract citations from sections
        extracted_citations = _extract_citations_from_sections(sections)
        
        # Combine with any existing citations
        all_citations = existing_citations + extracted_citations if existing_citations else extracted_citations
        
        # Format citations to target style
        if all_citations:
            formatted_citations = _format_citations(all_citations, config)
        else:
            formatted_citations = []
            print("[Citation] No citations found to format")
        
        # Update state
        state["citations"] = formatted_citations
        state["status"] = "processing"
        
        print(f"[Citation] Formatted {len(formatted_citations)} citations")
        
        return state
        
    except Exception as e:
        print(f"[Citation] Error: {str(e)}")
        state["error"] = f"Citation formatting failed: {str(e)}"
        state["status"] = "failed"
        return state


def _extract_citations_from_sections(sections: Dict[str, str]) -> List[Dict[str, str]]:
    """
    Extract citation references from section text.
    
    Args:
        sections: Dictionary of section prose
        
    Returns:
        List of extracted citation dictionaries
    """
    citations = []
    citation_patterns = [
        # APA style: (Author, Year)
        r'\(([A-Z][a-z]+(?:\s+(?:et\s+al\.|&\s+[A-Z][a-z]+))?),\s*(\d{4})\)',
        # Numbered: [1], [2]
        r'\[(\d+)\]',
        # Author-year: Author et al. (2020)
        r'([A-Z][a-z]+\s+et\s+al\.)\s*\((\d{4})\)',
    ]
    
    seen_citations = set()
    
    for section_title, content in sections.items():
        for pattern in citation_patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                citation_text = match.group(0)
                
                # Avoid duplicates
                if citation_text not in seen_citations:
                    seen_citations.add(citation_text)
                    
                    # Try to parse citation info
                    citation_info = {
                        "raw_text": citation_text,
                        "section": section_title,
                        "type": _detect_citation_type(citation_text)
                    }
                    
                    citations.append(citation_info)
    
    return citations


def _detect_citation_type(citation_text: str) -> str:
    """
    Detect the citation style type.
    
    Args:
        citation_text: Citation text
        
    Returns:
        Citation type identifier
    """
    if re.match(r'\[(\d+)\]', citation_text):
        return "numbered"
    elif re.search(r'\d{4}', citation_text):
        return "author-year"
    else:
        return "unknown"


def _format_citations(
    citations: List[Dict[str, str]],
    config: Dict[str, Any]
) -> List[Dict[str, str]]:
    """
    Format citations to target style without generating new ones.
    
    Args:
        citations: List of citation dictionaries
        config: Configuration with target citation style
        
    Returns:
        List of formatted citation dictionaries
    """
    target_style = config.get("citation_style", "APA").upper()
    
    print(f"[Citation] Formatting {len(citations)} citations to {target_style} style")
    
    formatted_citations = []
    
    for citation in citations:
        formatted = _format_single_citation(citation, target_style)
        formatted_citations.append(formatted)
    
    # Remove duplicates and sort
    formatted_citations = _deduplicate_citations(formatted_citations)
    formatted_citations = _sort_citations(formatted_citations, target_style)
    
    return formatted_citations


def _format_single_citation(
    citation: Dict[str, str],
    target_style: str
) -> Dict[str, str]:
    """
    Format a single citation to target style using LLM.
    
    Args:
        citation: Citation dictionary
        target_style: Target citation style (APA, MLA, Chicago, IEEE, etc.)
        
    Returns:
        Formatted citation dictionary
    """
    raw_text = citation.get("raw_text", "")
    citation_type = citation.get("type", "unknown")
    
    # If citation is already well-formed, try to reformat it
    system_prompt = f"""You are a citation formatting expert.
Your task is to reformat existing citations to {target_style} style.

CRITICAL RULES:
1. DO NOT generate or invent new citation information
2. ONLY reformat what is provided
3. If information is missing, keep the original format
4. Return ONLY the formatted citation text
5. Do not add explanations or metadata"""

    user_prompt = f"""Reformat this citation to {target_style} style:

Citation: {raw_text}
Type: {citation_type}

If this citation cannot be properly formatted to {target_style} style because of missing information, return it unchanged.

Formatted citation:"""

    try:
        formatted_text = call_llm(user_prompt, system_prompt).strip()
        
        # Clean up any extra quotation marks or formatting
        formatted_text = formatted_text.strip('"\'')
        
        return {
            "text": formatted_text,
            "raw_text": raw_text,
            "style": target_style,
            "section": citation.get("section", ""),
            "type": citation_type
        }
    except Exception as e:
        print(f"[Citation] Warning: Failed to format citation '{raw_text}': {e}")
        # Return original if formatting fails
        return {
            "text": raw_text,
            "raw_text": raw_text,
            "style": "original",
            "section": citation.get("section", ""),
            "type": citation_type
        }


def _deduplicate_citations(citations: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Remove duplicate citations based on text.
    
    Args:
        citations: List of citation dictionaries
        
    Returns:
        Deduplicated list
    """
    seen_texts = set()
    unique_citations = []
    
    for citation in citations:
        text = citation.get("text", "")
        if text and text not in seen_texts:
            seen_texts.add(text)
            unique_citations.append(citation)
    
    return unique_citations


def _sort_citations(
    citations: List[Dict[str, str]],
    style: str
) -> List[Dict[str, str]]:
    """
    Sort citations according to style conventions.
    
    Args:
        citations: List of citation dictionaries
        style: Citation style
        
    Returns:
        Sorted citations list
    """
    if style in ["APA", "MLA", "CHICAGO"]:
        # Alphabetical by text (author name typically)
        return sorted(citations, key=lambda c: c.get("text", "").lower())
    elif style == "IEEE":
        # Numerical order
        return citations  # Keep original order for numbered citations
    else:
        # Default: alphabetical
        return sorted(citations, key=lambda c: c.get("text", "").lower())


def add_inline_citations(
    sections: Dict[str, str],
    citations: List[Dict[str, str]],
    style: str = "APA"
) -> Dict[str, str]:
    """
    Helper function to ensure inline citations match reference list format.
    
    Args:
        sections: Section prose
        citations: Formatted citations list
        style: Citation style
        
    Returns:
        Sections with consistent inline citations
    """
    # This is a helper for future use - not called in the main node
    # Could be used to ensure inline citation consistency
    updated_sections = sections.copy()
    
    # Create mapping of raw citations to formatted ones
    citation_map = {c.get("raw_text", ""): c.get("text", "") 
                   for c in citations if c.get("raw_text")}
    
    # Replace inline citations with formatted versions (optional enhancement)
    for section_title, content in updated_sections.items():
        for raw, formatted in citation_map.items():
            if raw in content and raw != formatted:
                # Only replace if we have proper formatting
                content = content.replace(raw, formatted)
        updated_sections[section_title] = content
    
    return updated_sections
