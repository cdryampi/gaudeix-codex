
from __future__ import annotations

import random
import mimetypes
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from core.models import Category, Tag
from events.models import Event
from media_files.models import ImageFile


class Command(BaseCommand):
    help = "Seed future events with random data and new AI-generated images up to Feb 2026."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Seeding future events..."))
        
        fake = Faker('es_ES')
        base_now = timezone.now()
        end_date = datetime(2026, 2, 28, 23, 59, 59, tzinfo=ZoneInfo("Europe/Madrid"))
        
        # Ensure we cover the range if now is past end_date (unlikely given prompt)
        if base_now > end_date:
             self.stdout.write(self.style.ERROR("Current date is past Feb 2026. Adjusting end date to +1 month."))
             end_date = base_now + timedelta(days=30)

        # Categories mapping to our generated images
        # Category Name -> Image Filename
        categories_map = {
            "Música": "concert.png",
            "Gastronomía": "food.png",
            "Tecnología": "tech.png",
            "Arte": "art.png",
            "Teatro": "theater.png",
            "Naturaleza": "nature.png",
            "Deportes": "sports.png",
            "Fiesta": "party.png",
        }

        # Root category
        root_category, _ = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Events", "taxonomy": "events"},
        )

        with transaction.atomic():
            # Pre-load or create ImageFiles
            images_cache = {}
            seed_images_dir = Path(__file__).resolve().parents[3] / "seed" / "images"
            
            if not seed_images_dir.exists():
                 self.stdout.write(self.style.ERROR(f"Seed images directory not found at {seed_images_dir}"))
                 return

            for cat_name, filename in categories_map.items():
                image_path = seed_images_dir / filename
                if image_path.exists():
                     img_file = self._get_or_create_image(image_path)
                     images_cache[cat_name] = img_file
                else:
                    self.stdout.write(self.style.WARNING(f"Image not found: {filename}"))

            created_count = 0
            # Generate 30 events
            for _ in range(30):
                # Random date between now and end_date
                time_diff = end_date - base_now
                random_seconds = random.randint(0, int(time_diff.total_seconds()))
                start_at = base_now + timedelta(seconds=random_seconds)
                # Duration 2 to 6 hours
                end_at = start_at + timedelta(hours=random.randint(2, 6))

                # Pick category
                cat_name = random.choice(list(categories_map.keys()))
                
                # Get or Create Category
                category_slug = cat_name.lower().replace("á", "a").replace("í", "i").replace("ó", "o")
                category, _ = Category.objects.get_or_create(
                    slug=category_slug,
                    defaults={
                        "nombre": cat_name,
                        "taxonomy": "events",
                        "parent": root_category
                    }
                )

                # Prepare Data
                title = fake.sentence(nb_words=4).replace(".", "")
                if cat_name == "Música":
                    title = f"Concierto: {fake.company()}"
                elif cat_name == "Arte":
                    title = f"Exposición: {fake.word().title()}"
                
                summary = fake.text(max_nb_chars=120)
                description = fake.text(max_nb_chars=500)
                venue = fake.company()
                location = fake.address()
                price = f"{random.randint(10, 100)} EUR" if random.choice([True, False]) else "Gratis"

                # Image
                featured_media = images_cache.get(cat_name)

                # Create Event
                event = Event.objects.create(
                    title=title,
                    slug=fake.slug() + str(random.randint(1000,9999)), # Ensure unique slug
                    summary=summary,
                    description=description,
                    start_at=start_at,
                    end_at=end_at,
                    is_published=True,
                    venue_name=venue,
                    location_text=location,
                    price_text=price,
                    is_free=(price == "Gratis"),
                    category=category,
                    featured_media=featured_media
                )
                
                # Set language explicitly for these fields
                event.set_current_language('es')
                event.title = title
                event.summary = summary
                event.description = description
                event.save()

                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created event: {title} ({start_at.date()})"))

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} future events."))

    def _get_or_create_image(self, path: Path) -> ImageFile:
        # Check if exists by original name to avoid duplicates
        existing = ImageFile.objects.filter(original_name=path.name).first()
        if existing:
            return existing

        with path.open("rb") as source:
            instance = ImageFile.objects.create(
                file=File(source, name=path.name),
                original_name=path.name,
                mime_type=mimetypes.guess_type(path.name)[0] or "image/png",
                size_bytes=path.stat().st_size,
            )
        self.stdout.write(self.style.SUCCESS(f"Imported image: {path.name}"))
        return instance
