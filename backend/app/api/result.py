from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from app.core.config import settings


router = APIRouter()


@router.get("/result/{job_id}")
async def get_result(job_id: str):
    """
    Get the generated paper file for a job.
    
    Args:
        job_id: Job identifier
        
    Returns:
        FileResponse with the generated DOCX file
    """
    try:
        # Construct output file path
        upload_dir = Path(settings.UPLOAD_DIR)
        output_dir = upload_dir / "outputs"
        output_file = output_dir / f"paper_{job_id}.docx"
        
        # Check if file exists
        if not output_file.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Result file not found for job {job_id}. "
                       f"Please check job status or ensure generation is complete."
            )
        
        # Return file as download
        return FileResponse(
            path=str(output_file),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"paper_{job_id}.docx",
            headers={
                "Content-Disposition": f'attachment; filename="paper_{job_id}.docx"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve result: {str(e)}"
        )


@router.get("/result/{job_id}/info")
async def get_result_info(job_id: str):
    """
    Get information about the result file without downloading it.
    
    Args:
        job_id: Job identifier
        
    Returns:
        File information (size, path, exists)
    """
    try:
        # Construct output file path
        upload_dir = Path(settings.UPLOAD_DIR)
        output_dir = upload_dir / "outputs"
        output_file = output_dir / f"paper_{job_id}.docx"
        
        # Check if file exists
        if not output_file.exists():
            return {
                "job_id": job_id,
                "exists": False,
                "message": "Result file not found"
            }
        
        # Get file info
        file_stat = output_file.stat()
        
        return {
            "job_id": job_id,
            "exists": True,
            "filename": output_file.name,
            "path": str(output_file),
            "size_bytes": file_stat.st_size,
            "size_mb": round(file_stat.st_size / (1024 * 1024), 2),
            "created_at": file_stat.st_ctime,
            "modified_at": file_stat.st_mtime
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get result info: {str(e)}"
        )


@router.delete("/result/{job_id}")
async def delete_result(job_id: str):
    """
    Delete the result file and job directory for cleanup.
    
    Args:
        job_id: Job identifier
        
    Returns:
        Deletion confirmation
    """
    try:
        upload_dir = Path(settings.UPLOAD_DIR)
        
        # Delete output file
        output_dir = upload_dir / "outputs"
        output_file = output_dir / f"paper_{job_id}.docx"
        
        deleted_items = []
        
        if output_file.exists():
            output_file.unlink()
            deleted_items.append("output_file")
        
        # Delete job directory with uploaded files
        job_dir = upload_dir / job_id
        if job_dir.exists():
            import shutil
            shutil.rmtree(job_dir)
            deleted_items.append("job_directory")
        
        if not deleted_items:
            raise HTTPException(
                status_code=404,
                detail=f"No files found for job {job_id}"
            )
        
        return {
            "job_id": job_id,
            "deleted": deleted_items,
            "message": "Job data deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete result: {str(e)}"
        )
