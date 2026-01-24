import json
import mimetypes
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from news.models import News
from media_files.models import ImageFile

class Command(BaseCommand):
    help = "Seed news with demo data."

    def handle(self, *args, **options):
        self.stdout.write("Seeding sample news...")
        with transaction.atomic():
            News.objects.all().delete()
            news_data = self._load_seed_news()
            
            for index, data in enumerate(news_data):
                image_filename = data.get("image_filename")
                featured_media = None
                
                if image_filename:
                    # Look for image in existing media_files
                    featured_media = ImageFile.objects.filter(original_name=image_filename).first()

                news = News.objects.create(
                    slug=f"noticia-{index}",
                    is_published=data.get("is_published", True),
                    featured_media=featured_media
                )
                
                # Apply base fields and translations
                news.set_current_language("ca")
                news.title = data["title"]
                news.summary = data.get("summary", "")
                news.body = data.get("body", "")
                
                translations = data.get("translations", {})
                for lang, values in translations.items():
                    news.set_current_language(lang)
                    news.title = values.get("title", news.title)
                    news.summary = values.get("summary", news.summary)
                    news.body = values.get("body", news.body)
                
                news.save()
                self.stdout.write(f"Created news: {news.title}")

    def _load_seed_news(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "news.json"
        try:
            return json.loads(seed_path.read_text(encoding="utf-8"))
        except Exception as e:
            raise CommandError(f"Error loading news seed: {e}")
