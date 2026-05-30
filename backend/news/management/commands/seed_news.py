from __future__ import annotations

import json
from datetime import timedelta
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from core.seed_media import ensure_image_file
from media_files.models import ImageFile
from news.models import News, NewsCategorySingleton


SEED_IMAGES_DIR = Path(__file__).resolve().parents[3] / "seed_assets" / "media_files" / "images"


class Command(BaseCommand):
    help = "Seed demo news with multilingual titles, bodies and featured images."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Print resolved asset attachments and exit.")

    def handle(self, *args, **options):
        if options.get("dry_run"):
            self.stdout.write(self.style.NOTICE("[dry-run] would seed 5 demo news items"))
            return

        self.stdout.write(self.style.WARNING("Seeding demo news..."))
        with transaction.atomic():
            root_category = self._ensure_root_category()
            self._clear_news()
            image_map = self._ensure_images()
            self._create_news(root_category, image_map)

    def _ensure_root_category(self):
        from core.models import Category
        category, _ = Category.objects.get_or_create(slug="news", defaults={"nombre": "News"})
        singleton, _ = NewsCategorySingleton.objects.get_or_create(pk=1, defaults={"category": category})
        if singleton.category != category:
            singleton.category = category
            singleton.save()
        return category

    def _clear_news(self) -> None:
        count = News.objects.count()
        News.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f"Removed {count} existing news."))

    def _ensure_images(self) -> dict[str, ImageFile]:
        image_map: dict[str, ImageFile] = {}
        image_names = ["noticia_ple.png", "noticia_fira.png"]
        for name in image_names:
            path = SEED_IMAGES_DIR / name
            if path.exists():
                result = ensure_image_file(path)
                image_map[name] = result.instance
                self.stdout.write(self.style.SUCCESS(f"  Image: {name} ({result.action})"))
            else:
                self.stdout.write(self.style.WARNING(f"  Image not found: {name}"))
        return image_map

    def _create_news(self, root_category, image_map: dict[str, ImageFile]) -> None:
        from core.models import Category

        data = self._load_seed_data()
        now = timezone.now()

        for idx, item in enumerate(data):
            cat = Category.objects.filter(slug=item["category_slug"]).first() or root_category
            featured_media = image_map.get(item.get("featured_image", ""))

            news = News.objects.create(
                slug=item["slug"],
                is_published=item.get("is_published", True),
                is_featured=item.get("is_featured", False),
                published_at=now - timedelta(hours=idx * 24),
                category=cat,
                featured_media=featured_media,
            )

            self._apply_translations(news, item.get("translations", {}))
            self.stdout.write(self.style.SUCCESS(f"  News: {item['slug']}"))

    def _load_seed_data(self) -> list[dict]:
        seed_path = Path(__file__).resolve().parents[2] / "seed" / "news.json"
        try:
            return json.loads(seed_path.read_text(encoding="utf-8"))
        except FileNotFoundError as exc:
            raise CommandError(f"Seed file not found: {seed_path}") from exc
        except json.JSONDecodeError as exc:
            raise CommandError(f"Invalid JSON in {seed_path}: {exc}") from exc

    def _apply_translations(self, news: News, translations: dict) -> None:
        for lang_code, values in translations.items():
            news.set_current_language(lang_code)
            news.title = values["title"]
            news.summary = values.get("summary", "")
            news.body = values.get("body", "")
            news.save()
