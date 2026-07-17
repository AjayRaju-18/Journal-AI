"""
Vision node — analyses uploaded graph/figure images before structuring.

If no images were uploaded this node is a no-op and passes state through
to the structuring node unchanged.
"""

from app.graph.state import PaperGenerationState, update_progress
from app.services.image_analyser import analyse_images


def vision_node(state: PaperGenerationState) -> PaperGenerationState:
    """
    Vision node: run the image analyser on any uploaded figure images.

    Reads ``image_paths`` from state; writes ``image_descriptions`` back.
    If there are no images, the node updates progress and returns immediately
    so the rest of the pipeline is unaffected.

    Args:
        state: Current workflow state.

    Returns:
        Updated state with image_descriptions populated (or empty list).
    """
    job_id = state["job_id"]
    image_paths = state.get("image_paths") or []

    print(f"[Vision] Starting vision analysis for job {job_id} "
          f"({len(image_paths)} image(s))")

    # Always update progress so the frontend shows the node is running
    state = update_progress(state, "vision", 0.05)

    if not image_paths:
        print("[Vision] No images — skipping vision analysis")
        state["image_descriptions"] = []
        return state

    try:
        descriptions = analyse_images(image_paths)
        state["image_descriptions"] = descriptions
        print(f"[Vision] Completed analysis of {len(descriptions)} image(s)")

    except Exception as exc:
        # Non-fatal: log the error but don't fail the whole job.
        # The structuring node will simply have no image context.
        print(f"[Vision] ERROR during analysis: {exc}")
        state["image_descriptions"] = []

    return state
