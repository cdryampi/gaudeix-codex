from __future__ import annotations

import json
from io import StringIO

from django.core.files.base import ContentFile
from django.core.management import call_command

from media_files.models import DocumentFile


def test_seed_audit_assets_reports_orphans_duplicates_and_legacy_refs(media_storage):
    shared_content = b"same-content"

    doc1 = DocumentFile.objects.create(
        file=ContentFile(shared_content, name="dup.pdf"),
        original_name="legacy://dup.pdf",
        mime_type="application/pdf",
        size_bytes=len(shared_content),
    )
    doc2 = DocumentFile.objects.create(
        file=ContentFile(shared_content, name="dup.pdf"),
        original_name="legacy://dup.pdf",
        mime_type="application/pdf",
        size_bytes=len(shared_content),
    )

    out = StringIO()
    call_command("seed_audit_assets", "--json", "--legacy-marker", "legacy://", stdout=out)
    payload = json.loads(out.getvalue())

    assert payload["deprecation_window_releases"] == 2
    assert any(str(doc1.id) in row for row in payload["orphan_assets"]["DocumentFile"])
    assert any(str(doc2.id) in row for row in payload["orphan_assets"]["DocumentFile"])

    duplicate_name_groups = payload["duplicates_by_name"]["DocumentFile"]
    assert any(len(group) == 2 for group in duplicate_name_groups)

    duplicate_hash_groups = payload["duplicates_by_content"]["DocumentFile"]
    assert any(len(group) == 2 for group in duplicate_hash_groups)

    legacy_hits = payload["legacy_path_references"]["legacy://"]
    assert any(hit["model"] == "media_files.DocumentFile" for hit in legacy_hits)
