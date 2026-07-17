from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from pathlib import Path
import asyncio
from app.core.config import settings
from app.models.schemas import JobStatus
from app.graph.graph import run_paper_generation
from app.services.data_parser import parse_and_summarize
from app.services.template_parser import parse_template_structure


router = APIRouter()


# In-memory job status storage (replace with database in production)
job_statuses: Dict[str, Dict[str, Any]] = {}


class GenerateRequest(BaseModel):
    """Request model for paper generation."""
    job_id: str = Field(..., description="Job ID from upload")
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Generation configuration"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "550e8400-e29b-41d4-a716-446655440000",
                "config": {
                    "style": "academic",
                    "citation_style": "APA"
                }
            }
        }


class JobStatusResponse(BaseModel):
    """Response model for job status."""
    job_id: str
    status: str
    progress: float
    current_step: Optional[str] = None
    error: Optional[str] = None
    final_doc: Optional[str] = None


@router.post("/generate")
async def generate_paper(
    request: GenerateRequest,
    background_tasks: BackgroundTasks
):
    """
    Start paper generation process asynchronously.
    
    Args:
        request: Generation request with job_id and config
        background_tasks: FastAPI background tasks
        
    Returns:
        Job status with job_id
    """
    try:
        job_id = request.job_id
        config = request.config
        
        # Validate job directory exists
        upload_dir = Path(settings.UPLOAD_DIR)
        job_dir = upload_dir / job_id
        
        if not job_dir.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Job {job_id} not found. Please upload files first."
            )
        
        # Check for data file
        data_file_path = _find_data_file(job_dir)
        if not data_file_path:
            raise HTTPException(
                status_code=400,
                detail="No data file found for this job"
            )
        
        # Check for template file (optional)
        template_file_path = job_dir / "template.docx"
        if not template_file_path.exists():
            template_file_path = None
        
        # Initialize job status
        job_statuses[job_id] = {
            "job_id": job_id,
            "status": JobStatus.PENDING,
            "progress": 0.0,
            "current_step": "initializing",
            "error": None,
            "final_doc": None
        }
        
        # Start generation in background
        background_tasks.add_task(
            _run_generation,
            job_id,
            str(data_file_path),
            str(template_file_path) if template_file_path else None,
            config
        )
        
        return {
            "job_id": job_id,
            "status": JobStatus.PENDING,
            "message": "Paper generation started",
            "progress": 0.0
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start generation: {str(e)}")


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get status of a paper generation job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Current job status
    """
    if job_id not in job_statuses:
        raise HTTPException(
            status_code=404,
            detail=f"Job {job_id} not found or not started"
        )
    
    return job_statuses[job_id]


@router.get("/jobs")
async def list_jobs():
    """
    List all jobs and their statuses.
    
    Returns:
        List of all job statuses
    """
    return {
        "jobs": list(job_statuses.values()),
        "total": len(job_statuses)
    }


def _find_data_file(job_dir: Path) -> Optional[Path]:
    """
    Find data file in job directory.
    
    Args:
        job_dir: Job directory path
        
    Returns:
        Path to data file or None
    """
    for ext in [".csv", ".xlsx", ".xls"]:
        data_path = job_dir / f"data{ext}"
        if data_path.exists():
            return data_path
    return None


async def _run_generation(
    job_id: str,
    data_file_path: str,
    template_file_path: Optional[str],
    config: Dict[str, Any]
):
    """
    Run paper generation workflow in background.
    
    Args:
        job_id: Job identifier
        data_file_path: Path to data file
        template_file_path: Optional path to template file
        config: Generation configuration
    """
    try:
        # Update status
        job_statuses[job_id]["status"] = JobStatus.PROCESSING
        job_statuses[job_id]["current_step"] = "parsing_data"
        
        # Parse data file
        print(f"[Generate] Parsing data file: {data_file_path}")
        raw_data = parse_and_summarize(data_file_path)
        
        # Parse template if provided
        template_structure = None
        if template_file_path:
            print(f"[Generate] Parsing template: {template_file_path}")
            template_structure = parse_template_structure(template_file_path)
            # Add template path to structure for formatting node
            template_structure["template_path"] = template_file_path
        
        # Update status
        job_statuses[job_id]["current_step"] = "running_workflow"
        job_statuses[job_id]["progress"] = 0.1
        
        # Run LangGraph workflow
        print(f"[Generate] Starting workflow for job: {job_id}")
        final_state = await run_paper_generation(
            job_id=job_id,
            raw_data=raw_data,
            template_structure=template_structure,
            config=config,
            status_callback=lambda state: _update_job_status(job_id, state)
        )
        
        # Update final status
        if final_state.get("status") == "completed":
            job_statuses[job_id]["status"] = JobStatus.COMPLETED
            job_statuses[job_id]["progress"] = 1.0
            job_statuses[job_id]["current_step"] = "completed"
            job_statuses[job_id]["final_doc"] = final_state.get("final_doc")
            print(f"[Generate] Job {job_id} completed successfully")
        else:
            raise Exception(final_state.get("error", "Unknown error"))
        
    except Exception as e:
        print(f"[Generate] Job {job_id} failed: {str(e)}")
        job_statuses[job_id]["status"] = JobStatus.FAILED
        job_statuses[job_id]["error"] = str(e)
        job_statuses[job_id]["current_step"] = "failed"


def _update_job_status(job_id: str, state: Dict[str, Any]):
    """
    Update job status from workflow state.
    
    Args:
        job_id: Job identifier
        state: Current workflow state
    """
    if job_id in job_statuses:
        job_statuses[job_id].update({
            "status": state.get("status", JobStatus.PROCESSING),
            "progress": state.get("progress", 0.0),
            "current_step": state.get("current_step"),
            "error": state.get("error")
        })
