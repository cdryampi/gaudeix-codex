from __future__ import annotations

import os
import random
from collections.abc import Iterable
from dataclasses import dataclass
from pathlib import Path

from faker import Faker

GLOBAL_SEED_ENV_VAR = "GAUDEIX_SEED"


@dataclass(slots=True)
class SeedContext:
    seed: int | None
    rng: random.Random
    faker: Faker


def build_seed_context(explicit_seed: int | None = None, faker_locale: str = "es_ES") -> SeedContext:
    """Return deterministic random/Faker helpers when a seed is provided."""
    seed = explicit_seed
    if seed is None:
        raw_seed = os.getenv(GLOBAL_SEED_ENV_VAR)
        if raw_seed not in (None, ""):
            try:
                seed = int(raw_seed)
            except ValueError:
                seed = None

    rng = random.Random(seed)
    faker = Faker(faker_locale)
    if seed is not None:
        faker.seed_instance(seed)

    return SeedContext(seed=seed, rng=rng, faker=faker)


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
