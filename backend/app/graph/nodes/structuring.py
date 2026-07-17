from typing import Dict, Any
import json
from app.graph.state import PaperGenerationState, update_progress
from app.core.llm import call_llm


def structuring_node(state: PaperGenerationState) -> PaperGenerationState:
    """
    Structuring node: Analyze raw data and template structure to create sections outline.
    
    Args:
        state: Current workflow state
        
    Returns:
        Updated state with structured_data containing sections outline
    """
    print(f"[Structuring] Starting structuring for job {state['job_id']}")
    
    try:
        # Update progress
        state = update_progress(state, "structuring", 0.25)
        
        # Extract inputs
        raw_data = state.get("raw_data", {})
        template_structure = state.get("template_structure", {})
        config = state.get("config", {})
        
        # Create sections outline
        sections_outline = _create_sections_outline(raw_data, template_structure, config)
        
        # Update state
        state["structured_data"] = sections_outline
        state["status"] = "processing"
        
        print(f"[Structuring] Created outline with {len(sections_outline.get('sections', []))} sections")
        
        return state
        
    except Exception as e:
        print(f"[Structuring] Error: {str(e)}")
        state["error"] = f"Structuring failed: {str(e)}"
        state["status"] = "failed"
        return state


def _create_sections_outline(
    raw_data: Dict[str, Any],
    template_structure: Dict[str, Any],
    config: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Create sections outline using LLM.
    
    Args:
        raw_data: Raw data from uploaded file
        template_structure: Template structure with section order
        config: Configuration options
        
    Returns:
        Sections outline JSON
    """
    # Prepare section order from template
    section_order = template_structure.get("section_order", [])
    if not section_order:
        # Default academic paper sections
        section_order = [
            "Abstract",
            "Introduction",
            "Methods",
            "Results",
            "Discussion",
            "Conclusion"
        ]
    
    # Prepare data summary
    data_summary = _summarize_data(raw_data)
    
    # Build prompt
    system_prompt = """You are an expert academic paper structuring assistant. 
Your task is to analyze data and create a detailed outline for each section of a paper.
Return your response as valid JSON with the following structure:
{
  "sections": [
    {
      "title": "Section Title",
      "key_points": ["point 1", "point 2"],
      "data_references": ["which data to use"],
      "estimated_length": "short/medium/long"
    }
  ]
}"""
    
    user_prompt = f"""Create a detailed outline for a paper with these sections: {', '.join(section_order)}

Data Summary:
{data_summary}

Configuration:
{json.dumps(config, indent=2)}

For each section, identify:
1. Key points to cover
2. Which data should be referenced
3. Estimated content length

Return ONLY valid JSON, no additional text."""
    
    # Call LLM
    response = call_llm(user_prompt, system_prompt)
    
    # Parse JSON response
    try:
        outline = json.loads(response)
    except json.JSONDecodeError:
        # Try to extract JSON from response if wrapped in markdown or text
        response = response.strip()
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        outline = json.loads(response)
    
    # Ensure sections match template order
    outline["section_order"] = section_order
    
    return outline


def _summarize_data(raw_data: Dict[str, Any]) -> str:
    """
    Create a text summary of raw data for LLM consumption.
    
    Args:
        raw_data: Raw data dictionary
        
    Returns:
        Text summary of data
    """
    if not raw_data:
        return "No data provided."
    
    summary_parts = []
    
    # Add summary statistics if available
    if "summary" in raw_data:
        summary = raw_data["summary"]
        summary_parts.append(f"Data shape: {summary.get('row_count', 0)} rows, {summary.get('column_count', 0)} columns")
        summary_parts.append(f"Columns: {', '.join(summary.get('columns', []))}")
        
        # Numeric summary
        numeric_summary = summary.get("numeric_summary", {})
        if numeric_summary:
            summary_parts.append("\nNumeric columns:")
            for col, stats in list(numeric_summary.items())[:5]:  # First 5
                summary_parts.append(f"  - {col}: mean={stats.get('mean', 'N/A'):.2f}, range=[{stats.get('min', 'N/A'):.2f}, {stats.get('max', 'N/A'):.2f}]")
        
        # Categorical summary
        categorical_summary = summary.get("categorical_summary", {})
        if categorical_summary:
            summary_parts.append("\nCategorical columns:")
            for col, stats in list(categorical_summary.items())[:3]:  # First 3
                summary_parts.append(f"  - {col}: {stats.get('unique_count', 0)} unique values")
    
    # Add sample data if available
    if "data" in raw_data and raw_data["data"]:
        sample_size = min(3, len(raw_data["data"]))
        summary_parts.append(f"\nSample data (first {sample_size} rows):")
        summary_parts.append(json.dumps(raw_data["data"][:sample_size], indent=2))
    
    return "\n".join(summary_parts) if summary_parts else json.dumps(raw_data, indent=2)[:1000]
