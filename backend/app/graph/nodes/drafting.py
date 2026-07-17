from typing import Dict, Any, List
import json
from app.graph.state import PaperGenerationState, update_progress
from app.core.llm import call_llm


def drafting_node(state: PaperGenerationState) -> PaperGenerationState:
    """
    Drafting node: Generate prose for each section based on outline and data.
    
    Args:
        state: Current workflow state
        
    Returns:
        Updated state with sections containing drafted prose
    """
    print(f"[Drafting] Starting drafting for job {state['job_id']}")
    
    try:
        # Update progress
        state = update_progress(state, "drafting", 0.50)
        
        # Extract inputs
        structured_data = state.get("structured_data", {})
        raw_data = state.get("raw_data", {})
        config = state.get("config", {})
        
        if not structured_data:
            raise ValueError("No structured data available for drafting")
        
        # Draft all sections
        sections = _draft_all_sections(structured_data, raw_data, config)
        
        # Update state
        state["sections"] = sections
        state["status"] = "processing"
        
        print(f"[Drafting] Drafted {len(sections)} sections")
        
        return state
        
    except Exception as e:
        print(f"[Drafting] Error: {str(e)}")
        state["error"] = f"Drafting failed: {str(e)}"
        state["status"] = "failed"
        return state


def _draft_all_sections(
    structured_data: Dict[str, Any],
    raw_data: Dict[str, Any],
    config: Dict[str, Any]
) -> Dict[str, str]:
    """
    Draft all sections from the outline.
    
    Args:
        structured_data: Structured outline from structuring node
        raw_data: Raw data for grounding
        config: Configuration options
        
    Returns:
        Dictionary mapping section titles to drafted prose
    """
    sections = {}
    section_outlines = structured_data.get("sections", [])
    section_order = structured_data.get("section_order", [])
    
    # Draft each section
    for section_info in section_outlines:
        section_title = section_info.get("title", "")
        if section_title:
            print(f"[Drafting] Drafting section: {section_title}")
            prose = _draft_single_section(section_info, raw_data, config)
            sections[section_title] = prose
    
    # Ensure all sections from order are present
    for title in section_order:
        if title not in sections:
            print(f"[Drafting] Warning: Section '{title}' not in outline, creating placeholder")
            sections[title] = f"[Section content for {title} to be completed]"
    
    return sections


def _draft_single_section(
    section_info: Dict[str, Any],
    raw_data: Dict[str, Any],
    config: Dict[str, Any]
) -> str:
    """
    Draft prose for a single section, grounded in data only.
    
    Args:
        section_info: Section outline information
        raw_data: Raw data for grounding
        config: Configuration options
        
    Returns:
        Drafted prose for the section
    """
    section_title = section_info.get("title", "")
    key_points = section_info.get("key_points", [])
    data_references = section_info.get("data_references", [])
    estimated_length = section_info.get("estimated_length", "medium")
    
    # Extract relevant data
    relevant_data = _extract_relevant_data(raw_data, data_references)
    
    # Determine target word count
    word_count_map = {
        "short": "150-250 words",
        "medium": "300-500 words",
        "long": "500-800 words"
    }
    target_length = word_count_map.get(estimated_length, "300-500 words")
    
    # Get writing style from config
    style = config.get("style", "academic")
    
    # Build prompt
    system_prompt = f"""You are an expert academic writer specializing in {style} writing.
Your task is to write ONLY what can be directly supported by the provided data.

CRITICAL RULES:
1. Base ALL statements on the provided data
2. Do NOT make assumptions or add external knowledge
3. Do NOT fabricate statistics, findings, or conclusions
4. Use specific numbers and values from the data
5. If data is insufficient, acknowledge limitations
6. Write in clear, {style} prose
7. Return ONLY the section prose, no metadata or explanations"""

    user_prompt = f"""Write the "{section_title}" section for a research paper.

Key Points to Cover:
{_format_list(key_points)}

Available Data:
{relevant_data}

Target Length: {target_length}

Requirements:
- Write prose grounded strictly in the provided data
- Include specific values, statistics, and observations from the data
- Use appropriate academic language
- Do NOT add information not present in the data
- If key points cannot be addressed with available data, state this clearly

Write the section now:"""

    # Call LLM
    prose = call_llm(user_prompt, system_prompt)
    
    return prose.strip()


def _extract_relevant_data(raw_data: Dict[str, Any], data_references: List[str]) -> str:
    """
    Extract relevant data portions based on references.
    
    Args:
        raw_data: Complete raw data
        data_references: List of data references from outline
        
    Returns:
        Formatted string of relevant data
    """
    if not raw_data:
        return "No data available."
    
    data_parts = []
    
    # Include summary statistics
    if "summary" in raw_data:
        summary = raw_data["summary"]
        data_parts.append("=== Data Summary ===")
        data_parts.append(f"Total records: {summary.get('row_count', 0)}")
        data_parts.append(f"Columns: {', '.join(summary.get('columns', []))}")
        
        # Numeric data
        numeric_summary = summary.get("numeric_summary", {})
        if numeric_summary:
            data_parts.append("\n=== Numeric Variables ===")
            for col, stats in numeric_summary.items():
                if _is_relevant_column(col, data_references):
                    data_parts.append(f"\n{col}:")
                    data_parts.append(f"  Mean: {stats.get('mean', 'N/A')}")
                    data_parts.append(f"  Median: {stats.get('median', 'N/A')}")
                    data_parts.append(f"  Std Dev: {stats.get('std', 'N/A')}")
                    data_parts.append(f"  Range: [{stats.get('min', 'N/A')}, {stats.get('max', 'N/A')}]")
        
        # Categorical data
        categorical_summary = summary.get("categorical_summary", {})
        if categorical_summary:
            data_parts.append("\n=== Categorical Variables ===")
            for col, stats in categorical_summary.items():
                if _is_relevant_column(col, data_references):
                    data_parts.append(f"\n{col}:")
                    data_parts.append(f"  Unique values: {stats.get('unique_count', 0)}")
                    top_values = stats.get("top_values", {})
                    if top_values:
                        data_parts.append("  Top values:")
                        for value, count in list(top_values.items())[:5]:
                            data_parts.append(f"    - {value}: {count}")
    
    # Include sample data
    if "data" in raw_data and raw_data["data"]:
        sample_size = min(10, len(raw_data["data"]))
        data_parts.append(f"\n=== Sample Data (first {sample_size} rows) ===")
        data_parts.append(json.dumps(raw_data["data"][:sample_size], indent=2))
    
    result = "\n".join(data_parts)
    
    # Limit size to prevent token overflow
    max_chars = 4000
    if len(result) > max_chars:
        result = result[:max_chars] + "\n... (data truncated)"
    
    return result


def _is_relevant_column(column_name: str, data_references: List[str]) -> bool:
    """
    Check if a column is relevant based on data references.
    
    Args:
        column_name: Name of the column
        data_references: List of data reference strings
        
    Returns:
        True if column appears relevant, False otherwise
    """
    if not data_references:
        return True  # If no specific references, include all
    
    column_lower = column_name.lower()
    
    for ref in data_references:
        ref_lower = ref.lower()
        if column_lower in ref_lower or ref_lower in column_lower:
            return True
    
    return False


def _format_list(items: List[str]) -> str:
    """Format a list of items as numbered list."""
    if not items:
        return "None specified"
    return "\n".join(f"{i+1}. {item}" for i, item in enumerate(items))
