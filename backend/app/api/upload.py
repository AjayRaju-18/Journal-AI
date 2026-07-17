from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pathlib import Path
from typing import Optional
import uuid
import shutil
from app.core.config import settings


router = APIRouter()


@router.post("/upload")
async def upload_file(
    data_file: UploadFile = File(...),
    template_file: Optional[UploadFile] = File(None)
):
    """
    Upload data file and optional template file.
    
    Args:
        data_file: Required data file (CSV, XLSX)
        template_file: Optional DOCX template file
        
    Returns:
        Dictionary with job_id and uploaded file paths
    """
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Create job directory
        upload_dir = Path(settings.UPLOAD_DIR)
        job_dir = upload_dir / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        # Validate and save data file
        data_file_path = await _save_data_file(data_file, job_dir)
        
        # Save template file if provided
        template_file_path = None
        if template_file:
            template_file_path = await _save_template_file(template_file, job_dir)
        
        return {
            "job_id": job_id,
            "status": "uploaded",
            "files": {
                "data_file": str(data_file_path),
                "template_file": str(template_file_path) if template_file_path else None
            },
            "message": "Files uploaded successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


async def _save_data_file(file: UploadFile, job_dir: Path) -> Path:
    """
    Save and validate data file.
    
    Args:
        file: Uploaded file
        job_dir: Job directory path
        
    Returns:
        Path to saved file
        
    Raises:
        ValueError: If file type is invalid
    """
    # Validate file extension
    allowed_extensions = {".csv", ".xlsx", ".xls"}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise ValueError(
            f"Invalid data file type: {file_extension}. "
            f"Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Generate safe filename
    safe_filename = f"data{file_extension}"
    file_path = job_dir / safe_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Validate file size
    file_size = file_path.stat().st_size
    max_size = 50 * 1024 * 1024  # 50 MB
    
    if file_size > max_size:
        file_path.unlink()  # Delete file
        raise ValueError(f"File too large: {file_size / 1024 / 1024:.1f} MB (max: 50 MB)")
    
    if file_size == 0:
        file_path.unlink()  # Delete file
        raise ValueError("Uploaded file is empty")
    
    return file_path


async def _save_template_file(file: UploadFile, job_dir: Path) -> Path:
    """
    Save and validate template file.
    
    Args:
        file: Uploaded template file
        job_dir: Job directory path
        
    Returns:
        Path to saved file
        
    Raises:
        ValueError: If file type is invalid
    """
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension != ".docx":
        raise ValueError(
            f"Invalid template file type: {file_extension}. "
            f"Only .docx files are supported"
        )
    
    # Generate safe filename
    safe_filename = f"template{file_extension}"
    file_path = job_dir / safe_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Validate file size
    file_size = file_path.stat().st_size
    max_size = 10 * 1024 * 1024  # 10 MB
    
    if file_size > max_size:
        file_path.unlink()  # Delete file
        raise ValueError(f"Template too large: {file_size / 1024 / 1024:.1f} MB (max: 10 MB)")
    
    if file_size == 0:
        file_path.unlink()  # Delete file
        raise ValueError("Uploaded template is empty")
    
    return file_path


@router.get("/upload/{job_id}")
async def get_upload_status(job_id: str):
    """
    Get upload status for a job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Upload status information
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        job_dir = upload_dir / job_id
        
        if not job_dir.exists():
            raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
        
        # Check for files
        data_file = None
        template_file = None
        
        for ext in [".csv", ".xlsx", ".xls"]:
            data_path = job_dir / f"data{ext}"
            if data_path.exists():
                data_file = str(data_path)
                break
        
        template_path = job_dir / "template.docx"
        if template_path.exists():
            template_file = str(template_path)
        
        return {
            "job_id": job_id,
            "status": "uploaded",
            "files": {
                "data_file": data_file,
                "template_file": template_file
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
