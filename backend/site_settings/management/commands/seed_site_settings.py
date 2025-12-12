from __future__ import annotations

from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from media_files.models import ImageFile
from site_settings.models import SiteSettings


class Command(BaseCommand):
    help = "Seed default site settings for Cabrera de Mar (branding/contact/SEO), linking existing static pages if available."

    def handle(self, *args, **options):
        settings_obj = SiteSettings.get_solo()
        settings_obj.site_name = settings_obj.site_name or "Gaudeix Cabrera de Mar"
        settings_obj.tagline = settings_obj.tagline or "Turisme i cultura a Cabrera de Mar"
        settings_obj.phone = settings_obj.phone or "+34 937 501 006"
        settings_obj.support_email = settings_obj.support_email or "suport@cabreradema.cat"
        settings_obj.contact_email = settings_obj.contact_email or "turisme@cabreradema.cat"
        settings_obj.address = settings_obj.address or "Plaça de l'Ajuntament, 1, 08349 Cabrera de Mar"
        settings_obj.schedule = settings_obj.schedule or "Dl-Dv 9:00-14:00"
        settings_obj.facebook_url = settings_obj.facebook_url or "https://www.facebook.com/ajuntamentcabrerademar"
        settings_obj.instagram_url = settings_obj.instagram_url or "https://www.instagram.com/cabrerademar"
        settings_obj.youtube_url = settings_obj.youtube_url or "https://www.youtube.com"
        settings_obj.twitter_url = settings_obj.twitter_url or "https://twitter.com/cabrerademar"
        settings_obj.maps_base_url = settings_obj.maps_base_url or "https://maps.google.com/?q=Cabrera+de+Mar"
        settings_obj.analytics_id = settings_obj.analytics_id or "GAUDEIX-CA-0001"
        settings_obj.captcha_site_key = settings_obj.captcha_site_key or ""
        settings_obj.default_metatitle = settings_obj.default_metatitle or "Gaudeix Cabrera de Mar"
        settings_obj.default_metadescription = settings_obj.default_metadescription or (
            "Explora la riquesa cultural de Cabrera de Mar amb les nostres propostes. Descobreix l'art, la història i les tradicions en aquesta localitat de la costa catalana."
        )

        # Try to auto-link static pages by template
        try:
            from static_pages.models import StaticPage

            settings_obj.privacy_page = settings_obj.privacy_page or StaticPage.objects.filter(template="privacy").first()
            settings_obj.cookies_page = settings_obj.cookies_page or StaticPage.objects.filter(template="cookies").first()
            settings_obj.legal_page = settings_obj.legal_page or StaticPage.objects.filter(template="legal_notice").first()
            settings_obj.inclusion_page = settings_obj.inclusion_page or StaticPage.objects.filter(template="inclusion").first()
        except Exception:
            pass

        # Load sample logo and favicon from static if provided
        static_dir = Path(__file__).resolve().parent / "static"
        logo_path = static_dir / "logo-cabrera-white_UrlbLGR.png"
        favicon_path = static_dir / "favicon-16x16.png"
        video_path = static_dir / "home.mp4"
        if logo_path.exists() and not settings_obj.logo:
            settings_obj.logo = self._create_image(logo_path, "image/png")
        if favicon_path.exists() and not settings_obj.favicon:
            settings_obj.favicon = self._create_image(favicon_path, "image/png")
        if video_path.exists() and not settings_obj.background_video:
            settings_obj.background_video = self._create_video(video_path, "video/mp4")
        settings_obj.video_title = settings_obj.video_title or "Vídeo de fons Cabrera de Mar"
        settings_obj.video_description_internal = settings_obj.video_description_internal or "Vídeo silenciat per hero/background."
        settings_obj.youtube_url = settings_obj.youtube_url or "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("Site settings seeded/updated"))

    def _create_image(self, path: Path, mime: str) -> ImageFile:
        with path.open("rb") as fp:
            data = fp.read()
        content = ContentFile(data, name=path.name)
        obj, _ = ImageFile.objects.get_or_create(
            original_name=path.name,
            defaults={
                "file": content,
                "mime_type": mime,
                "size_bytes": len(data),
            },
        )
        return obj

    def _create_video(self, path: Path, mime: str):
        with path.open("rb") as fp:
            data = fp.read()
        from media_files.models import VideoFile

        content = ContentFile(data, name=path.name)
        obj, _ = VideoFile.objects.get_or_create(
            original_name=path.name,
            defaults={
                "file": content,
                "mime_type": mime,
                "size_bytes": len(data),
            },
        )
        return obj
