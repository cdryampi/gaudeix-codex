"""
Management command to seed the Events category and EventCategorySingleton.

This command is idempotent - it can be run multiple times safely.
It will:
1. Create or update the 'Events' category with translations
2. Create the EventCategorySingleton pointing to this category
3. Assign the category to all Events that don't have one
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from events.models import Event, EventCategorySingleton


class Command(BaseCommand):
    help = "Seed the Events category and assign it to all events"

    def handle(self, *args, **options):
        with transaction.atomic():
            # 1. Create or get the Events category by slug
            category, created = Category.objects.get_or_create(
                slug="events",
                defaults={"nombre": "Events"},  # Default language name
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS("✓ Created Events category")
                )
            else:
                self.stdout.write(
                    self.style.WARNING("→ Events category already exists")
                )

            # 2. Add translations for the category
            translations = {
                "ca": "Esdeveniments",
                "es": "Eventos",
                "en": "Events",
                "fr": "Événements",
            }

            for lang_code, translation in translations.items():
                category.set_current_language(lang_code)
                if category.nombre != translation:
                    category.nombre = translation
                    category.save()
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Updated {lang_code} translation: {translation}")
                    )

            # Reset to default language
            category.set_current_language("en")

            # 3. Create or update the EventCategorySingleton
            singleton, singleton_created = EventCategorySingleton.objects.get_or_create(
                pk=1,
                defaults={"category": category},
            )

            if singleton_created:
                self.stdout.write(
                    self.style.SUCCESS("✓ Created EventCategorySingleton")
                )
            else:
                if singleton.category != category:
                    singleton.category = category
                    singleton.save()
                    self.stdout.write(
                        self.style.SUCCESS("✓ Updated EventCategorySingleton")
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING("→ EventCategorySingleton already configured")
                    )

            # 4. Assign category to all Events without one
            events_without_category = Event.objects.filter(category__isnull=True)
            count = events_without_category.count()

            if count > 0:
                events_without_category.update(category=category)
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Assigned category to {count} event(s)")
                )
            else:
                self.stdout.write(
                    self.style.WARNING("→ All events already have a category")
                )

            # 5. Summary
            total_events = Event.objects.count()
            self.stdout.write(
                self.style.SUCCESS(
                    f"\n{'='*50}\n"
                    f"✓ Seed completed successfully!\n"
                    f"  - Events category: {category.nombre}\n"
                    f"  - Total events: {total_events}\n"
                    f"  - All events categorized: Yes\n"
                    f"{'='*50}"
                )
            )
