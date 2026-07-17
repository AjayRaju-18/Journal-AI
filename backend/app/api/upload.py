from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pathlib import Path
from typing import Optional, List
import uuid
import shutil
from app.core.config import settings

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_IMAGE_SIZE  = 10 * 1024 * 1024   # 10 MB per image
MAX_IMAGE_COUNT = 5


router = APIRouter()


@router.post("/upload")
async def upload_file(
    data_file: UploadFile = File(...),
    template_file: Optional[UploadFile] = File(None),
    image_files: Optional[List[UploadFile]] = File(None),
):
    """
    Upload data file, optional template file, and optional figure images.

    Args:
        data_file:     Required data file (CSV, XLSX)
        template_file: Optional DOCX template file
        image_files:   Optional list of graph/figure images (PNG, JPG, WebP)

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
        if template_file and template_file.filename:
            template_file_path = await _save_template_file(template_file, job_dir)

        # Save image files if provided
        image_file_paths = []
        if image_files:
            # Filter out empty/null entries that FastAPI may inject
            valid_images = [f for f in image_files if f and f.filename]
            if len(valid_images) > MAX_IMAGE_COUNT:
                raise ValueError(
                    f"Too many images: {len(valid_images)} (max {MAX_IMAGE_COUNT})"
                )
            for idx, img in enumerate(valid_images):
                img_path = await _save_image_file(img, job_dir, idx)
                image_file_paths.append(str(img_path))

        return {
            "job_id": job_id,
            "status": "uploaded",
            "files": {
                "data_file":     str(data_file_path),
                "template_file": str(template_file_path) if template_file_path else None,
                "image_files":   image_file_paths,
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


async def _save_image_file(file: UploadFile, job_dir: Path, index: int) -> Path:
    """
    Save and validate one image file.

    Args:
        file:    Uploaded image file.
        job_dir: Job directory path.
        index:   0-based index used to name the saved file.

    Returns:
        Path to saved file.

    Raises:
        ValueError: If file type or size is invalid.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in IMAGE_EXTENSIONS:
        raise ValueError(
            f"Invalid image type: {ext}. Allowed: {', '.join(IMAGE_EXTENSIONS)}"
        )

    safe_name = f"image_{index}{ext}"
    file_path = job_dir / safe_name

    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    size = file_path.stat().st_size
    if size > MAX_IMAGE_SIZE:
        file_path.unlink()
        raise ValueError(
            f"Image too large: {size / 1024 / 1024:.1f} MB (max 10 MB)"
        )
    if size == 0:
        file_path.unlink()
        raise ValueError("Uploaded image is empty")

    return file_path

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
