from typing import Optional
import os
from pathlib import Path
from app.graph.state import PaperGenerationState, update_progress
from app.services.docx_export import export_with_citations
from app.core.config import settings


def formatting_node(state: PaperGenerationState) -> PaperGenerationState:
    """
    Formatting node: Generate final DOCX document from sections and citations.
    
    Args:
        state: Current workflow state
        
    Returns:
        Updated state with final_doc path
    """
    print(f"[Formatting] Starting document formatting for job {state['job_id']}")
    
    try:
        # Update progress
        state = update_progress(state, "formatting", 0.90)
        
        # Extract inputs
        job_id = state.get("job_id")
        sections = state.get("sections", {})
        citations = state.get("citations", [])
        template_structure = state.get("template_structure")
        
        if not sections:
            raise ValueError("No sections available for formatting")
        
        # Determine template path if available
        template_path = _get_template_path(template_structure)
        
        # Generate output path
        output_path = _generate_output_path(job_id)
        
        # Create DOCX document
        print(f"[Formatting] Exporting to: {output_path}")
        final_doc_path = export_with_citations(
            sections=sections,
            citations=citations,
            output_path=output_path,
            template_path=template_path
        )
        
        # Update state
        state["final_doc"] = final_doc_path
        state["status"] = "completed"
        state = update_progress(state, "completed", 1.0)
        
        print(f"[Formatting] Document created successfully: {final_doc_path}")
        
        return state
        
    except Exception as e:
        print(f"[Formatting] Error: {str(e)}")
        state["error"] = f"Formatting failed: {str(e)}"
        state["status"] = "failed"
        return state


def _get_template_path(template_structure: Optional[dict]) -> Optional[str]:
    """
    Extract template file path from template structure.
    
    Args:
        template_structure: Template structure dictionary
        
    Returns:
        Template file path or None
    """
    if not template_structure:
        return None
    
    # Check if template_structure contains a file path
    template_path = template_structure.get("template_path")
    
    if template_path and Path(template_path).exists():
        return template_path
    
    return None


def _generate_output_path(job_id: str) -> str:
    """
    Generate output file path for the final document.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Full path to output file
    """
    # Get upload directory from settings
    upload_dir = settings.UPLOAD_DIR
    
    # Create output directory if it doesn't exist
    output_dir = Path(upload_dir) / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename
    filename = f"paper_{job_id}.docx"
    output_path = output_dir / filename
    
    return str(output_path)


def validate_formatting_inputs(state: PaperGenerationState) -> bool:
    """
    Validate that all required inputs are present for formatting.
    
    Args:
        state: Current workflow state
        
    Returns:
        True if inputs are valid, False otherwise
    """
    sections = state.get("sections", {})
    
    if not sections:
        print("[Formatting] Validation failed: No sections available")
        return False
    
    if not isinstance(sections, dict):
        print("[Formatting] Validation failed: Sections is not a dictionary")
        return False
    
    # Check that sections have content
    empty_sections = [title for title, content in sections.items() if not content or not content.strip()]
    if empty_sections:
        print(f"[Formatting] Warning: Empty sections found: {', '.join(empty_sections)}")
    
    return True


def create_document_metadata(state: PaperGenerationState) -> dict:
    """
    Create metadata dictionary for the generated document.
    
    Args:
        state: Current workflow state
        
    Returns:
        Metadata dictionary
    """
    return {
        "job_id": state.get("job_id"),
        "status": state.get("status"),
        "sections_count": len(state.get("sections", {})),
        "citations_count": len(state.get("citations", [])),
        "output_file": state.get("final_doc"),
        "has_template": bool(state.get("template_structure")),
        "progress": state.get("progress", 0.0)
    }
