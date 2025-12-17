"""
Seed the Events category and EventCategorySingleton.

Idempotent: safe to run multiple times.
Steps:
1) Create/update 'events' category with translations
2) Create/update EventCategorySingleton pointing to it
3) Assign the category to Events without one
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from events.models import Event, EventCategorySingleton


class Command(BaseCommand):
    help = "Seed the Events category and assign it to all events"

    def handle(self, *args, **options):
        with transaction.atomic():
            category = self._create_or_update_category()
            subcategories = self._create_or_update_subcategories(category)
            singleton = self._create_or_update_singleton(category)
            assigned = self._assign_category(category)
            self._print_summary(category, subcategories, singleton, assigned)

    def _create_or_update_category(self) -> Category:
        category, created = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Events", "taxonomy": "events"},
        )
        if category.taxonomy != "events":
            category.taxonomy = "events"
            category.save(update_fields=["taxonomy"])

        translations = {
            "ca": "Esdeveniments",
            "es": "Eventos",
            "en": "Events",
            "fr": "Événements",
        }
        for lang_code, name in translations.items():
            category.set_current_language(lang_code)
            if category.nombre != name:
                category.nombre = name
                category.save()

        if created:
            self.stdout.write(self.style.SUCCESS("Created category 'events'"))
        else:
            self.stdout.write(self.style.WARNING("Category 'events' already exists"))
        return category

    def _create_or_update_subcategories(self, root: Category) -> int:
        definitions: list[tuple[str, dict[str, str]]] = [
            ("cultura", {"ca": "Cultura", "es": "Cultura", "en": "Culture", "fr": "Culture"}),
            ("infantil", {"ca": "Infantil", "es": "Infantil", "en": "Kids", "fr": "Enfants"}),
            ("esports", {"ca": "Esports", "es": "Deportes", "en": "Sports", "fr": "Sports"}),
            ("fires-i-mercats", {"ca": "Fires i mercats", "es": "Ferias y mercados", "en": "Fairs and markets", "fr": "Foires et marches"}),
            ("formacio", {"ca": "Formacio", "es": "Formacion", "en": "Training", "fr": "Formation"}),
            ("musica", {"ca": "Musica", "es": "Musica", "en": "Music", "fr": "Musique"}),
            ("teatre", {"ca": "Teatre", "es": "Teatro", "en": "Theatre", "fr": "Theatre"}),
            ("altres", {"ca": "Altres", "es": "Otros", "en": "Other", "fr": "Autres"}),
        ]

        touched = 0
        for slug, names in definitions:
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    "nombre": names.get("en", slug),
                    "taxonomy": "events",
                    "parent": root,
                },
            )

            changed = False
            if category.taxonomy != "events":
                category.taxonomy = "events"
                changed = True
            if category.parent_id != root.id:
                category.parent = root
                changed = True

            for lang_code, name in names.items():
                category.set_current_language(lang_code)
                if category.nombre != name:
                    category.nombre = name
                    changed = True

            if changed:
                category.save()

            if created or changed:
                touched += 1

        return touched

    def _create_or_update_singleton(self, category: Category) -> EventCategorySingleton:
        singleton, created = EventCategorySingleton.objects.get_or_create(
            pk=1,
            defaults={"category": category},
        )
        if not created and singleton.category != category:
            singleton.category = category
            singleton.save()
            self.stdout.write(self.style.SUCCESS("Updated EventCategorySingleton"))
        elif created:
            self.stdout.write(self.style.SUCCESS("Created EventCategorySingleton"))
        else:
            self.stdout.write(self.style.WARNING("EventCategorySingleton already configured"))
        return singleton

    def _assign_category(self, category: Category) -> int:
        events_without_category = Event.objects.filter(category__isnull=True)
        count = events_without_category.count()
        if count:
            events_without_category.update(category=category)
            self.stdout.write(self.style.SUCCESS(f"Assigned category to {count} event(s)"))
        else:
            self.stdout.write(self.style.WARNING("All events already have a category"))
        return count

    def _print_summary(
        self,
        category: Category,
        subcategories: int,
        singleton: EventCategorySingleton,
        assigned: int,
    ) -> None:
        total_events = Event.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\n{'='*50}\n"
                f"Seed completed\n"
                f"  - Events category: {category.nombre}\n"
                f"  - Subcategories touched: {subcategories}\n"
                f"  - Total events: {total_events}\n"
                f"  - Singleton points to category: {'yes' if singleton.category == category else 'no'}\n"
                f"  - Events updated: {assigned}\n"
                f"{'='*50}"
            )
        )
