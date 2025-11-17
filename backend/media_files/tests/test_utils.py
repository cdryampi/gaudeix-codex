from __future__ import annotations

import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from media_files import utils


def test_validate_max_file_size_allows_small_file():
    file_obj = SimpleUploadedFile("photo.jpg", b"a" * (1024 * 1024))  # 1 MB
    utils.validate_max_file_size(file_obj)


def test_validate_max_file_size_rejects_large_file():
    file_obj = SimpleUploadedFile(
        "photo.jpg", b"a" * (utils.MAX_FILE_SIZE_MB * 1024 * 1024 + 1)
    )
    with pytest.raises(ValidationError):
        utils.validate_max_file_size(file_obj)


def test_validate_image_extension_accepts_allowed():
    file_obj = SimpleUploadedFile("photo.png", b"data")
    utils.validate_image_extension(file_obj)


def test_validate_image_extension_rejects_invalid():
    file_obj = SimpleUploadedFile("photo.bmp", b"data")
    with pytest.raises(ValidationError):
        utils.validate_image_extension(file_obj)


def test_validate_document_extension_accepts_allowed():
    file_obj = SimpleUploadedFile("document.pdf", b"data")
    utils.validate_document_extension(file_obj)


def test_validate_document_extension_rejects_invalid():
    file_obj = SimpleUploadedFile("document.exe", b"data")
    with pytest.raises(ValidationError):
        utils.validate_document_extension(file_obj)
