from __future__ import annotations

from django.core.management.base import BaseCommand
from site_settings.models import SiteSettings


class Command(BaseCommand):
    help = "Seed default site settings (identity/contact), linking existing static pages if available."

    def handle(self, *args, **options):
        settings_obj = SiteSettings.get_solo()
        settings_obj.site_name = settings_obj.site_name or "Gaudeix"
        settings_obj.tagline = settings_obj.tagline or "Experiències i informació"
        settings_obj.phone = settings_obj.phone or "+34 000 000 000"
        settings_obj.support_email = settings_obj.support_email or "suport@example.com"
        settings_obj.contact_email = settings_obj.contact_email or "contacte@example.com"
        settings_obj.address = settings_obj.address or ""
        settings_obj.schedule = settings_obj.schedule or ""

        # Try to auto-link static pages by template
        try:
            from static_pages.models import StaticPage

            settings_obj.privacy_page = settings_obj.privacy_page or StaticPage.objects.filter(template="privacy").first()
            settings_obj.cookies_page = settings_obj.cookies_page or StaticPage.objects.filter(template="cookies").first()
            settings_obj.legal_page = settings_obj.legal_page or StaticPage.objects.filter(template="legal_notice").first()
            settings_obj.inclusion_page = settings_obj.inclusion_page or StaticPage.objects.filter(template="inclusion").first()
        except Exception:
            pass

        settings_obj.save()
        self.stdout.write(self.style.SUCCESS("Site settings seeded/updated"))
