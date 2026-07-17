"""
Image / graph analyser service.

Uses the Groq vision-capable model to produce a rich text description
of each uploaded figure so that the paper-generation pipeline can
reference it in the structuring and drafting stages.
"""

from __future__ import annotations

import base64
from pathlib import Path
from typing import List, Dict, Any

from groq import Groq
from app.core.config import settings

# Vision model available on Groq
VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

# Accepted image extensions (must match upload validation)
ACCEPTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def _encode_image(image_path: str) -> tuple[str, str]:
    """
    Base64-encode an image and detect its MIME type.

    Returns:
        (base64_string, mime_type)
    """
    path = Path(image_path)
    ext = path.suffix.lower()
    mime_map = {
        ".png":  "image/png",
        ".jpg":  "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
    }
    mime_type = mime_map.get(ext, "image/png")

    with open(image_path, "rb") as f:
        encoded = base64.standard_b64encode(f.read()).decode("utf-8")

    return encoded, mime_type


def _analyse_single_image(image_path: str, figure_index: int) -> Dict[str, Any]:
    """
    Send one image to the vision model and return a structured description.

    Args:
        image_path: Absolute path to the image file.
        figure_index: 0-based index (used as the figure label).

    Returns:
        Dict with keys: filename, figure_label, description, figure_type.
    """
    path = Path(image_path)
    figure_label = f"Figure {figure_index + 1}"

    try:
        b64, mime = _encode_image(image_path)

        system_prompt = (
            "You are an expert scientific figure analyst. "
            "When given an image of a graph, plot, chart, microscopy image, "
            "or any other scientific figure, you produce a precise, detailed "
            "textual description that captures:\n"
            "  • The type of figure (line graph, bar chart, scatter plot, heatmap, "
            "    microscopy image, photograph, schematic, etc.)\n"
            "  • All axis labels, units, and ranges (x-axis and y-axis)\n"
            "  • Legend entries and what each series/group represents\n"
            "  • Key trends, peaks, valleys, plateaus, or inflection points\n"
            "  • Approximate numerical values at important data points\n"
            "  • Any annotations, error bars, significance markers, or inset panels\n"
            "  • A concise one-sentence summary suitable for use as a figure caption\n"
            "Be specific and quantitative wherever possible."
        )

        user_prompt = (
            f"Please analyse {figure_label} and provide a complete scientific description "
            "following the guidelines in your instructions."
        )

        response = _get_client().chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime};base64,{b64}",
                            },
                        },
                        {"type": "text", "text": user_prompt},
                    ],
                },
            ],
            temperature=0.3,
            max_tokens=1024,
        )

        description = response.choices[0].message.content.strip()

        # Best-effort figure type extraction from the first sentence
        first_line = description.split("\n")[0].lower()
        if any(w in first_line for w in ["bar", "histogram"]):
            figure_type = "bar_chart"
        elif any(w in first_line for w in ["scatter", "dot plot"]):
            figure_type = "scatter_plot"
        elif any(w in first_line for w in ["line", "curve", "time series", "trend"]):
            figure_type = "line_graph"
        elif any(w in first_line for w in ["heatmap", "heat map", "matrix"]):
            figure_type = "heatmap"
        elif any(w in first_line for w in ["microscop", "sem", "tem", "staining"]):
            figure_type = "microscopy"
        elif any(w in first_line for w in ["schematic", "diagram", "flow"]):
            figure_type = "schematic"
        else:
            figure_type = "graph"

        print(f"[Vision] Analysed {figure_label} ({path.name}): {figure_type}")

        return {
            "filename": path.name,
            "figure_label": figure_label,
            "figure_type": figure_type,
            "description": description,
        }

    except Exception as exc:
        print(f"[Vision] ERROR analysing {path.name}: {exc}")
        return {
            "filename": path.name,
            "figure_label": figure_label,
            "figure_type": "unknown",
            "description": f"[Vision analysis failed for {path.name}: {exc}]",
        }


def analyse_images(image_paths: List[str]) -> List[Dict[str, Any]]:
    """
    Analyse a list of image files and return their descriptions.

    Args:
        image_paths: List of absolute paths to image files.

    Returns:
        List of description dicts (one per image).
    """
    if not image_paths:
        return []

    descriptions = []
    for i, path in enumerate(image_paths):
        desc = _analyse_single_image(path, i)
        descriptions.append(desc)

    print(f"[Vision] Analysed {len(descriptions)} image(s)")
    return descriptions


def find_image_files(job_dir: Path) -> List[str]:
    """
    Find all saved image files in a job directory, sorted by name.

    Args:
        job_dir: Path to the job upload directory.

    Returns:
        Sorted list of absolute path strings.
    """
    images = []
    for ext in ACCEPTED_EXTENSIONS:
        images.extend(job_dir.glob(f"image_*{ext}"))
    images.sort(key=lambda p: p.name)
    return [str(p) for p in images]
