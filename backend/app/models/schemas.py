from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Status of a paper generation job."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class UploadRequest(BaseModel):
    """Request model for file upload."""
    filename: str = Field(..., description="Name of the uploaded file")
    file_type: str = Field(..., description="Type of file (csv, json, etc.)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "filename": "data.csv",
                "file_type": "csv"
            }
        }


class GenerateRequest(BaseModel):
    """Request model for paper generation."""
    job_id: str = Field(..., description="Unique job identifier")
    data_file: str = Field(..., description="Path to uploaded data file")
    template_file: Optional[str] = Field(None, description="Optional template file path")
    config: Dict[str, Any] = Field(
        default_factory=dict,
        description="Generation configuration options"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_123",
                "data_file": "/uploads/data.csv",
                "template_file": "/uploads/template.docx",
                "config": {
                    "style": "academic",
                    "citations": "APA"
                }
            }
        }


class PaperState(BaseModel):
    """State model for paper generation workflow."""
    job_id: str = Field(..., description="Unique job identifier")
    status: JobStatus = Field(default=JobStatus.PENDING, description="Current job status")
    
    # Input data
    raw_data: Optional[Dict[str, Any]] = Field(None, description="Raw uploaded data")
    template: Optional[Dict[str, Any]] = Field(None, description="Template configuration")
    config: Dict[str, Any] = Field(default_factory=dict, description="Generation config")
    
    # Processing stages
    structured_data: Optional[Dict[str, Any]] = Field(None, description="Structured data")
    draft_sections: Optional[Dict[str, str]] = Field(None, description="Draft sections")
    citations: Optional[List[Dict[str, str]]] = Field(None, description="Citations list")
    formatted_content: Optional[str] = Field(None, description="Formatted paper content")
    
    # Output
    output_file: Optional[str] = Field(None, description="Path to generated file")
    
    # Metadata
    error: Optional[str] = Field(None, description="Error message if failed")
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Progress percentage (0-1)")
    current_step: Optional[str] = Field(None, description="Current processing step")
    
    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "job_123",
                "status": "processing",
                "progress": 0.5,
                "current_step": "drafting"
            }
        }
