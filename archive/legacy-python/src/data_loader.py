"""Load game data from JSON files."""
import json
import os
from pathlib import Path


def get_data_dir() -> Path:
    """Return the path to the data directory."""
    # When running from src/, data is in ../data
    src_dir = Path(__file__).resolve().parent
    project_root = src_dir.parent
    return project_root / "data"


def load_json(filename: str) -> dict:
    """Load a JSON data file."""
    path = get_data_dir() / filename
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_data() -> dict:
    """Load all game data."""
    return {
        "maps": load_json("maps.json"),
        "npcs": load_json("npcs.json"),
        "skills": load_json("skills.json"),
        "items": load_json("items.json"),
    }
