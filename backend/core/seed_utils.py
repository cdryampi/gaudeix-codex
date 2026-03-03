from __future__ import annotations

from collections.abc import Iterable
from pathlib import Path


def sorted_paths(paths: Iterable[Path]) -> list[Path]:
    """Return paths sorted deterministically by filename."""
    return sorted(paths, key=lambda path: path.name)


def list_files_sorted(directory: Path, pattern: str = "*") -> list[Path]:
    """List files matching a glob pattern, sorted by filename."""
    return sorted_paths(path for path in directory.glob(pattern) if path.is_file())


def find_duplicate_manifest_paths(entries: list[dict]) -> list[str]:
    """Return duplicate path values while preserving first duplicate appearance order."""
    seen: set[str] = set()
    duplicates: list[str] = []
    duplicate_set: set[str] = set()
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        path = entry.get("path")
        if not isinstance(path, str) or not path:
            continue
        if path in seen and path not in duplicate_set:
            duplicates.append(path)
            duplicate_set.add(path)
            continue
        seen.add(path)
    return duplicates
