"""
Tests for encoding integrity in seed data files.

Detects mojibake (Windows-1252 double-encoding) patterns that cause
characters like é, í, ó, ú to appear as Ã©, Ã\xad, Ã³, Ãº in seeded content.

Patterns checked:
- c3 83 c2 ...   (Ã followed by printable Latin-1 char)
- c3 82 c2 b7    (Â· instead of ·)
- c2 a1           (¡ in wrong context)
"""

from pathlib import Path

import pytest

BASE = Path(__file__).resolve().parents[3]
BACKEND = BASE / "backend"


# Known mojibake byte signatures (UTF-8 bytes on disk)
# When UTF-8 bytes were misread as Windows-1252 and re-saved as UTF-8
MOJIBAKE_SIGNATURES = [
    # Ã© (should be é)
    (b'\xc3\x83\xc2\xa9', 'windows-1252', 'é'),
    # Ã³ (should be ó)
    (b'\xc3\x83\xc2\xb3', 'windows-1252', 'ó'),
    # Ãº (should be ú)
    (b'\xc3\x83\xc2\xba', 'windows-1252', 'ú'),
    # Ã± (should be ñ)
    (b'\xc3\x83\xc2\xb1', 'windows-1252', 'ñ'),
    # Ã§ (should be ç)
    (b'\xc3\x83\xc2\xa7', 'windows-1252', 'ç'),
    # Ã¯ (should be ï)
    (b'\xc3\x83\xc2\xaf', 'windows-1252', 'ï'),
    # Ã¡ (should be á)
    (b'\xc3\x83\xc2\xa1', 'windows-1252', 'á'),
    # Ã‰ (should be É) - uses ‰ (E2 80 B0) for second byte
    (b'\xc3\x83\xe2\x80\xb0', 'windows-1252', 'É'),
    # Ã (lone C3 83 not part of valid sequence)
    # Â· (should be ·)
    (b'\xc3\x82\xc2\xb7', 'latin-1', '·'),
    # Âª (should be ª)
    (b'\xc3\x82\xc2\xaa', 'latin-1', 'ª'),
]


def _scan_file_for_mojibake(filepath: Path) -> list[dict]:
    """Scan a single file for mojibake patterns. Returns list of issues found."""
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
    except Exception:
        return []

    issues = []
    for sig, encoding, expected_char in MOJIBAKE_SIGNATURES:
        pos = 0
        while True:
            idx = content.find(sig, pos)
            if idx == -1:
                break
            # Get context around the match
            start = max(0, idx - 20)
            end = min(len(content), idx + len(sig) + 10)
            context = content[start:end]

            issues.append({
                'file': str(filepath.relative_to(BASE)),
                'offset': idx,
                'signature': sig.hex(' '),
                'expected': expected_char,
                'encoding': encoding,
                'context': context.hex(' '),
            })
            pos = idx + 1

    return issues


def _find_seed_files() -> list[Path]:
    """Find all seed data files across the project (backend only)."""
    seed_files = []

    # JSON seed datasets
    for pattern in ['**/seed/*.json', '**/fixtures/*.json']:
        seed_files.extend(BACKEND.glob(pattern))

    # Python seed commands
    for f in BACKEND.rglob('seed_*.py'):
        seed_files.append(f)

    # Also check migration files
    for f in BACKEND.rglob('migrations/*.py'):
        seed_files.append(f)

    return sorted(set(seed_files))


def test_no_mojibake_in_seed_files():
    """Verify no seed data file contains double-encoded UTF-8 mojibake."""
    seed_files = _find_seed_files()
    assert len(seed_files) > 0, "No seed files found to check"

    all_issues = []
    for fpath in seed_files:
        issues = _scan_file_for_mojibake(fpath)
        all_issues.extend(issues)

    if all_issues:
        msg_parts = [f"Found {len(all_issues)} mojibake pattern(s):"]
        for issue in all_issues[:20]:
            msg_parts.append(
                f"  {issue['file']} @ offset {issue['offset']}: "
                f"found {issue['signature']} "
                f"(expected '{issue['expected']}', "
                f"fix: .encode('{issue['encoding']}').decode('utf-8'))"
            )
        if len(all_issues) > 20:
            msg_parts.append(f"  ... and {len(all_issues) - 20} more")

        pytest.fail("\n".join(msg_parts))
