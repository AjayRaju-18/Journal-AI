from typing import Dict, Any
import pandas as pd
from pathlib import Path


def parse_data_file(file_path: str) -> pd.DataFrame:
    """
    Parse CSV or XLSX file into a pandas DataFrame.
    
    Args:
        file_path: Path to the data file
        
    Returns:
        DataFrame containing the parsed data
        
    Raises:
        ValueError: If file format is not supported
        FileNotFoundError: If file does not exist
    """
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_ext = path.suffix.lower()
    
    if file_ext == ".csv":
        return pd.read_csv(file_path)
    elif file_ext in [".xlsx", ".xls"]:
        return pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_ext}. Only CSV and XLSX are supported.")


def get_summary_stats(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate summary statistics for a DataFrame.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing summary statistics
    """
    summary = {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values": df.isnull().sum().to_dict(),
        "numeric_summary": {},
        "categorical_summary": {}
    }
    
    # Numeric columns summary
    numeric_cols = df.select_dtypes(include=["number"]).columns
    for col in numeric_cols:
        summary["numeric_summary"][col] = {
            "mean": float(df[col].mean()) if not df[col].isnull().all() else None,
            "median": float(df[col].median()) if not df[col].isnull().all() else None,
            "std": float(df[col].std()) if not df[col].isnull().all() else None,
            "min": float(df[col].min()) if not df[col].isnull().all() else None,
            "max": float(df[col].max()) if not df[col].isnull().all() else None,
        }
    
    # Categorical columns summary
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns
    for col in categorical_cols:
        value_counts = df[col].value_counts().head(10).to_dict()
        summary["categorical_summary"][col] = {
            "unique_count": int(df[col].nunique()),
            "top_values": {str(k): int(v) for k, v in value_counts.items()}
        }
    
    return summary


def parse_and_summarize(file_path: str) -> Dict[str, Any]:
    """
    Parse data file and generate summary statistics in one step.
    
    Args:
        file_path: Path to the data file
        
    Returns:
        Dictionary containing both the data and summary statistics
    """
    df = parse_data_file(file_path)
    stats = get_summary_stats(df)
    
    return {
        "data": df.to_dict(orient="records"),
        "summary": stats
    }
