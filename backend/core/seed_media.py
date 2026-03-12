from __future__ import annotations

import mimetypes
from dataclasses import dataclass
from pathlib import Path

from django.core.files import File
from django.core.files.storage import default_storage

from core.seed_manifest import SeedAssetEntry
from media_files.models import DocumentFile, ImageFile, VideoFile


@dataclass(frozen=True, slots=True)
class EnsuredMediaResult:
    instance: ImageFile | DocumentFile | VideoFile
    action: str


@dataclass(frozen=True, slots=True)
class SeedMediaIndex:
    images: dict[tuple[str, str], ImageFile]
    documents: dict[tuple[str, str], DocumentFile]
    videos: dict[tuple[str, str], VideoFile]


def ensure_image_file(path: Path) -> EnsuredMediaResult:
    return _ensure_media_file(ImageFile, path)


def ensure_document_file(path: Path) -> EnsuredMediaResult:
    return _ensure_media_file(DocumentFile, path)


def ensure_video_file(path: Path) -> EnsuredMediaResult:
    return _ensure_media_file(VideoFile, path)


def ensure_media_from_manifest(entries: list[SeedAssetEntry]) -> SeedMediaIndex:
    images: dict[tuple[str, str], ImageFile] = {}
    documents: dict[tuple[str, str], DocumentFile] = {}
    videos: dict[tuple[str, str], VideoFile] = {}

    for entry in entries:
        key = (entry.attach_to, entry.slug_or_key)
        if entry.type == "image":
            images[key] = ensure_image_file(entry.resolved_path).instance
            continue
        if entry.type == "document":
            documents[key] = ensure_document_file(entry.resolved_path).instance
            continue
        if entry.type == "video":
            videos[key] = ensure_video_file(entry.resolved_path).instance

    return SeedMediaIndex(images=images, documents=documents, videos=videos)


def _ensure_media_file(model, path: Path) -> EnsuredMediaResult:
    mime_type = mimetypes.guess_type(path.name)[0] or _default_mime_for_model(model)
    existing = model.objects.filter(original_name=path.name).order_by("pk").first()

    if existing is None:
        return EnsuredMediaResult(
            instance=_create_media_instance(model, path, mime_type),
            action="created",
        )

    if _needs_media_restore(existing):
        _restore_media_instance(existing, path, mime_type)
        return EnsuredMediaResult(instance=existing, action="restored")

    _sync_metadata(existing, mime_type=mime_type, size_bytes=path.stat().st_size)
    return EnsuredMediaResult(instance=existing, action="reused")


def _create_media_instance(model, path: Path, mime_type: str):
    with path.open("rb") as source:
        return model.objects.create(
            file=File(source, name=path.name),
            original_name=path.name,
            mime_type=mime_type,
            size_bytes=path.stat().st_size,
        )


def _restore_media_instance(instance, path: Path, mime_type: str) -> None:
    with path.open("rb") as source:
        instance.file = File(source, name=path.name)
        instance.original_name = path.name
        instance.mime_type = mime_type
        instance.size_bytes = path.stat().st_size
        if isinstance(instance, ImageFile):
            instance.variant_thumbnail = ""
            instance.variant_medium = ""
            instance.variant_large = ""
        instance.save()


def _sync_metadata(instance, *, mime_type: str, size_bytes: int) -> None:
    update_fields: list[str] = []
    if instance.mime_type != mime_type:
        instance.mime_type = mime_type
        update_fields.append("mime_type")
    if instance.size_bytes != size_bytes:
        instance.size_bytes = size_bytes
        update_fields.append("size_bytes")
    if update_fields:
        instance.save(update_fields=update_fields)


def _needs_media_restore(instance: ImageFile | DocumentFile | VideoFile) -> bool:
    if not getattr(instance, "file", None):
        return True
    if not instance.file.name or not default_storage.exists(instance.file.name):
        return True

    if isinstance(instance, ImageFile):
        variant_paths = [
            instance.variant_thumbnail,
            instance.variant_medium,
            instance.variant_large,
        ]
        return any(not path or not default_storage.exists(path) for path in variant_paths)

    return False


def _default_mime_for_model(model) -> str:
    if model is ImageFile:
        return "image/png"
    if model is DocumentFile:
        return "application/pdf"
    return "video/mp4"
