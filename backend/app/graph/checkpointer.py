from langgraph.checkpoint.sqlite import SqliteSaver
from pathlib import Path
from app.core.config import settings


def get_checkpointer() -> SqliteSaver:
    """
    Create and return a SQLite checkpointer for LangGraph state persistence.
    
    Returns:
        SqliteSaver instance configured with database path
    """
    # Get database URL from settings
    db_url = settings.DB_URL
    
    # Extract path from URL if it's SQLite
    if db_url.startswith("sqlite:///"):
        db_path = db_url.replace("sqlite:///", "")
    else:
        # Default to local SQLite if using other DB
        db_path = "./langgraph_checkpoints.db"
    
    # Ensure parent directory exists
    db_file = Path(db_path)
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Create and return checkpointer
    checkpointer = SqliteSaver.from_conn_string(db_path)
    
    print(f"[Checkpointer] Initialized SQLite checkpointer at: {db_path}")
    
    return checkpointer


def create_checkpointer_with_path(db_path: str) -> SqliteSaver:
    """
    Create a checkpointer with a specific database path.
    
    Args:
        db_path: Path to SQLite database file
        
    Returns:
        SqliteSaver instance
    """
    # Ensure parent directory exists
    db_file = Path(db_path)
    db_file.parent.mkdir(parents=True, exist_ok=True)
    
    checkpointer = SqliteSaver.from_conn_string(db_path)
    
    print(f"[Checkpointer] Created checkpointer at: {db_path}")
    
    return checkpointer


# Global checkpointer instance
_checkpointer = None


def get_global_checkpointer() -> SqliteSaver:
    """
    Get or create the global checkpointer instance (singleton pattern).
    
    Returns:
        Global SqliteSaver instance
    """
    global _checkpointer
    
    if _checkpointer is None:
        _checkpointer = get_checkpointer()
    
    return _checkpointer


def reset_checkpointer() -> None:
    """
    Reset the global checkpointer instance.
    Useful for testing or reconfiguration.
    """
    global _checkpointer
    _checkpointer = None
    print("[Checkpointer] Global checkpointer reset")
