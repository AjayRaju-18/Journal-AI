from typing import Dict, Any, Callable, Optional
from langgraph.graph import StateGraph, END
from app.graph.state import PaperGenerationState, create_initial_state
from app.graph.checkpointer import get_global_checkpointer
from app.graph.nodes.structuring import structuring_node
from app.graph.nodes.drafting import drafting_node
from app.graph.nodes.citation import citation_node
from app.graph.nodes.formatting import formatting_node


def create_paper_generation_graph() -> StateGraph:
    """
    Create the LangGraph workflow for paper generation.
    
    Returns:
        Configured StateGraph
    """
    # Create graph
    workflow = StateGraph(PaperGenerationState)
    
    # Add nodes
    workflow.add_node("structuring", structuring_node)
    workflow.add_node("drafting", drafting_node)
    workflow.add_node("citation", citation_node)
    workflow.add_node("formatting", formatting_node)
    
    # Define edges
    workflow.set_entry_point("structuring")
    workflow.add_edge("structuring", "drafting")
    workflow.add_edge("drafting", "citation")
    workflow.add_edge("citation", "formatting")
    workflow.add_edge("formatting", END)
    
    return workflow


async def run_paper_generation(
    job_id: str,
    raw_data: Dict[str, Any],
    template_structure: Optional[Dict[str, Any]] = None,
    config: Optional[Dict[str, Any]] = None,
    status_callback: Optional[Callable] = None
) -> PaperGenerationState:
    """
    Run the paper generation workflow.
    
    Args:
        job_id: Unique job identifier
        raw_data: Parsed data from upload
        template_structure: Optional template structure
        config: Generation configuration
        status_callback: Optional callback for status updates
        
    Returns:
        Final workflow state
    """
    print(f"[Workflow] Starting paper generation for job: {job_id}")
    
    # Create initial state
    initial_state = create_initial_state(
        job_id=job_id,
        raw_data=raw_data,
        template_structure=template_structure,
        config=config or {}
    )
    
    # Create and compile workflow
    workflow = create_paper_generation_graph()
    checkpointer = get_global_checkpointer()
    app = workflow.compile(checkpointer=checkpointer)
    
    # Run workflow
    try:
        final_state = None
        
        # Execute workflow with streaming for status updates
        config_dict = {
            "configurable": {
                "thread_id": job_id
            }
        }
        
        async for state in app.astream(initial_state, config=config_dict):
            # Extract state from stream
            if isinstance(state, dict):
                # Get the node name and its output
                for node_name, node_state in state.items():
                    if node_state:
                        final_state = node_state
                        
                        # Call status callback if provided
                        if status_callback and isinstance(node_state, dict):
                            status_callback(node_state)
                        
                        print(f"[Workflow] Completed node: {node_name}")
        
        if final_state is None:
            raise Exception("Workflow produced no output")
        
        print(f"[Workflow] Paper generation completed for job: {job_id}")
        return final_state
        
    except Exception as e:
        print(f"[Workflow] Error in paper generation: {str(e)}")
        error_state = initial_state.copy()
        error_state["status"] = "failed"
        error_state["error"] = str(e)
        return error_state


def get_workflow_status(job_id: str) -> Optional[PaperGenerationState]:
    """
    Get the current state of a workflow from checkpointer.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Current state or None if not found
    """
    try:
        checkpointer = get_global_checkpointer()
        
        # Get checkpoint for thread
        config = {
            "configurable": {
                "thread_id": job_id
            }
        }
        
        checkpoint = checkpointer.get(config)
        
        if checkpoint:
            return checkpoint.get("values")
        
        return None
        
    except Exception as e:
        print(f"[Workflow] Error getting workflow status: {str(e)}")
        return None
