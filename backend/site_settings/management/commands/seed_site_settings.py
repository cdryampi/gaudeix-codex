from __future__ import annotations

import json
import mimetypes
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from core.seed_manifest import load_seed_asset_manifest, render_dry_run
from media_files.models import ImageFile
from site_settings.models import SiteSettings


class Command(BaseCommand):
    help = "Seed default site settings for Cabrera de Mar (branding/contact/SEO), linking existing static pages if available."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Print resolved asset attachments and exit.")

    def handle(self, *args, **options):
        manifest_entries = self._load_asset_manifest()
        if options.get("dry_run"):
            self.stdout.write(render_dry_run(manifest_entries, title="site_settings asset manifest"))
            return

        seed_data = self._load_seed_settings()
        settings_obj = SiteSettings.get_solo()
        for field in (
            "site_name",
            "tagline",
            "phone",
            "support_email",
            "contact_email",
            "address",
            "schedule",
            "facebook_url",
            "instagram_url",
            "youtube_url",
            "twitter_url",
            "maps_base_url",
            "latitude",
            "longitude",
            "analytics_id",
            "captcha_site_key",
            "default_metatitle",
            "default_metadescription",
            "video_title",
            "video_description_internal",
            "alert_enabled",
            "alert_message",
            "alert_type",
            "alert_link",
            "alert_start_at",
            "alert_end_at",
        ):
            if field in ["latitude", "longitude", "alert_enabled", "alert_message", "alert_type", "alert_start_at", "alert_end_at"]:
                setattr(settings_obj, field, seed_data.get(field))
            else:
                self._set_if_empty(settings_obj, field, seed_data.get(field))

        link_pages_by_template = seed_data.get("link_pages_by_template", {}) or {}
        if isinstance(link_pages_by_template, dict) and link_pages_by_template:
            try:
                from static_pages.models import StaticPage

                for field_name, template in link_pages_by_template.items():
                    if not template or not hasattr(settings_obj, field_name):
                        continue
                    if getattr(settings_obj, field_name):
                        continue
                    page = StaticPage.objects.filter(template=template).first()
                    if page:
                        setattr(settings_obj, field_name, page)
            except Exception:
                pass

        asset_map = {(entry.attach_to, entry.slug_or_key): entry.resolved_path for entry in manifest_entries}

        logo_path = asset_map.get(("logo", seed_data.get("logo_file", "")))
        favicon_path = asset_map.get(("favicon", seed_data.get("favicon_file", "")))
        video_path = asset_map.get(("background_video", seed_data.get("background_video_file", "")))

        if logo_path and not settings_obj.logo:
            settings_obj.logo = self._create_image(logo_path, mimetypes.guess_type(logo_path.name)[0] or "image/png")
        if favicon_path and not settings_obj.favicon:
            settings_obj.favicon = self._create_image(favicon_path, mimetypes.guess_type(favicon_path.name)[0] or "image/png")
        if video_path and not settings_obj.background_video:
            settings_obj.background_video = self._create_video(video_path, mimetypes.guess_type(video_path.name)[0] or "video/mp4")

        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("Site settings seeded/updated"))

    def _load_asset_manifest(self):
        return load_seed_asset_manifest(
            manifest_path=Path(__file__).resolve().parents[2] / "seed" / "site_settings_assets.yaml",
            assets_root=Path(__file__).resolve().parent,
            allowed_types={"image", "video"},
            allowed_attach_to={"logo", "favicon", "background_video"},
        )

    def _set_if_empty(self, instance, field: str, value) -> None:
        if value is None:
            return
        current = getattr(instance, field, None)
        if current:
            return
        setattr(instance, field, value)

    def _load_seed_settings(self) -> dict:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "site_settings.json"
        try:
            data = json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

        if not isinstance(data, dict):
            raise CommandError(f"Expected a JSON object in {seed_path}")
        return data

    def _create_image(self, path: Path, mime: str) -> ImageFile:
        with path.open("rb") as fp:
            data = fp.read()
        content = ContentFile(data, name=path.name)
        obj, _ = ImageFile.objects.get_or_create(
            original_name=path.name,
            defaults={"file": content, "mime_type": mime, "size_bytes": len(data)},
        )
        return obj

    def _create_video(self, path: Path, mime: str):
        with path.open("rb") as fp:
            data = fp.read()
        from media_files.models import VideoFile

        content = ContentFile(data, name=path.name)
        obj, _ = VideoFile.objects.get_or_create(
            original_name=path.name,
            defaults={"file": content, "mime_type": mime, "size_bytes": len(data)},
        )
        return obj
