from typing import TypedDict, Optional, Dict, Any, List
from typing_extensions import Annotated
from langgraph.graph import add_messages


class PaperGenerationState(TypedDict):
    """State for paper generation workflow using LangGraph."""
    
    # Job metadata
    job_id: str
    status: str
    
    # Input data
    raw_data: Optional[Dict[str, Any]]
    template_structure: Optional[Dict[str, Any]]
    config: Dict[str, Any]
    
    # Processing stages
    structured_data: Optional[Dict[str, Any]]
    sections: Optional[Dict[str, str]]
    citations: Optional[List[Dict[str, str]]]
    
    # Output
    final_doc: Optional[str]
    
    # Tracking
    current_step: Optional[str]
    progress: float
    error: Optional[str]
    
    # Messages for agent communication (optional)
    messages: Annotated[list, add_messages]


class GraphState(TypedDict):
    """Alternative simplified state definition."""
    
    # Core fields
    job_id: str
    status: str
    raw_data: Optional[Dict[str, Any]]
    template_structure: Optional[Dict[str, Any]]
    sections: Optional[Dict[str, str]]
    citations: Optional[List[Dict[str, str]]]
    final_doc: Optional[str]
    
    # Metadata
    config: Dict[str, Any]
    error: Optional[str]


# Helper function to create initial state
def create_initial_state(
    job_id: str,
    raw_data: Optional[Dict[str, Any]] = None,
    template_structure: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None
) -> PaperGenerationState:
    """
    Create initial state for paper generation workflow.
    
    Args:
        job_id: Unique job identifier
        raw_data: Optional raw data dictionary
        template_structure: Optional template structure
        config: Optional configuration dictionary
        
    Returns:
        Initial PaperGenerationState
    """
    return PaperGenerationState(
        job_id=job_id,
        status="pending",
        raw_data=raw_data,
        template_structure=template_structure,
        config=config or {},
        structured_data=None,
        sections=None,
        citations=None,
        final_doc=None,
        current_step=None,
        progress=0.0,
        error=None,
        messages=[]
    )


def update_progress(state: PaperGenerationState, step: str, progress: float) -> PaperGenerationState:
    """
    Update state with current step and progress.
    
    Args:
        state: Current state
        step: Current processing step
        progress: Progress value (0.0 to 1.0)
        
    Returns:
        Updated state
    """
    state["current_step"] = step
    state["progress"] = min(max(progress, 0.0), 1.0)  # Clamp between 0 and 1
    return state


def mark_error(state: PaperGenerationState, error_message: str) -> PaperGenerationState:
    """
    Mark state as failed with error message.
    
    Args:
        state: Current state
        error_message: Error description
        
    Returns:
        Updated state
    """
    state["status"] = "failed"
    state["error"] = error_message
    return state
