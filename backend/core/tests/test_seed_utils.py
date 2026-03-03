from __future__ import annotations

from core.seed_utils import find_duplicate_manifest_paths, list_files_sorted


def test_list_files_sorted_is_stable_between_runs(tmp_path):
    (tmp_path / "zeta.txt").write_text("z", encoding="utf-8")
    (tmp_path / "alpha.txt").write_text("a", encoding="utf-8")
    (tmp_path / "middle.txt").write_text("m", encoding="utf-8")

    first = [path.name for path in list_files_sorted(tmp_path)]
    second = [path.name for path in list_files_sorted(tmp_path)]

    assert first == ["alpha.txt", "middle.txt", "zeta.txt"]
    assert second == first


def test_find_duplicate_manifest_paths_returns_unique_duplicates_in_order():
    entries = [
        {"path": "images/a.png"},
        {"path": "images/b.png"},
        {"path": "images/a.png"},
        {"path": "images/a.png"},
        {"path": "images/b.png"},
    ]

    assert find_duplicate_manifest_paths(entries) == ["images/a.png", "images/b.png"]
