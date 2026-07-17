from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.core.config import settings
from app.api import upload, generate, result


# Create FastAPI app
app = FastAPI(
    title="Paper Pipeline API",
    description="Automated academic paper generation from data using LangGraph",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(result.router, prefix="/api", tags=["result"])


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    print("=" * 50)
    print("Paper Pipeline API Starting...")
    print("=" * 50)
    
    # Ensure upload directory exists
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    print(f"Upload directory: {upload_dir.absolute()}")
    
    # Ensure output directory exists
    output_dir = upload_dir / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {output_dir.absolute()}")
    
    print("=" * 50)
    print("API is ready!")
    print(f"Docs available at: http://localhost:8000/docs")
    print("=" * 50)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    print("=" * 50)
    print("Paper Pipeline API Shutting Down...")
    print("=" * 50)


@app.get("/", tags=["health"])
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "Paper Pipeline API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "upload_dir": settings.UPLOAD_DIR,
        "db_url": settings.DB_URL.split("://")[0] + "://***"  # Hide credentials
    }


@app.get("/api/config", tags=["config"])
async def get_config():
    """Get current API configuration (non-sensitive)."""
    return {
        "upload_dir": settings.UPLOAD_DIR,
        "database": settings.DB_URL.split("://")[0],  # Just the DB type
        "api_configured": bool(settings.GROQ_API_KEY)
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
