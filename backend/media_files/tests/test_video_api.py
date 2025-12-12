from __future__ import annotations

import pytest
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from media_files.models import VideoFile


pytestmark = pytest.mark.django_db


def make_video(name="sample.mp4", content: bytes | None = None):
    payload = content if content is not None else b"\x00\x00\x00\x18ftypmp42"
    return SimpleUploadedFile(name, payload, content_type="video/mp4")


def test_upload_video():
    client = APIClient()
    url = reverse("media-videos-list")
    video = make_video()
    resp = client.post(url, {"file": video}, format="multipart")
    assert resp.status_code == status.HTTP_201_CREATED
    assert VideoFile.objects.count() == 1


def test_reject_wrong_extension():
    client = APIClient()
    url = reverse("media-videos-list")
    bad_video = make_video(name="bad.avi")
    resp = client.post(url, {"file": bad_video}, format="multipart")
    assert resp.status_code == status.HTTP_400_BAD_REQUEST
