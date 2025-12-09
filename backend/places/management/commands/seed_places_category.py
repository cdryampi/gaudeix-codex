"""
Seed the Places category, template categories and PlaceCategorySingleton.

Idempotent: safe to run multiple times.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Category
from places.models import Place, PlaceCategorySingleton


class Command(BaseCommand):
    help = "Seed the Places category, template categories and assign root to existing places"

    def handle(self, *args, **options):
        with transaction.atomic():
            root_category = self._create_root_category()
            self._create_template_categories()
            singleton = self._create_singleton(root_category)
            assigned = self._assign_root_to_places(root_category)
            self._print_summary(root_category, singleton, assigned)

    def _create_root_category(self) -> Category:
        category, created = Category.objects.get_or_create(
            slug="places",
            defaults={"nombre": "Places"},
        )

        translations = {
            "ca": "Llocs",
            "es": "Lugares",
            "en": "Places",
            "fr": "Lieux",
        }
        for lang_code, name in translations.items():
            category.set_current_language(lang_code)
            if category.nombre != name:
                category.nombre = name
                category.save()

        if created:
            self.stdout.write(self.style.SUCCESS("Created root category 'places'"))
        else:
            self.stdout.write(self.style.WARNING("Root category 'places' already exists"))
        return category

    def _create_template_categories(self) -> None:
        templates = [
            ("poi", {"ca": "Punt d'interès", "es": "Punto de interés", "en": "Point of interest", "fr": "Point d'intérêt"}),
            ("restaurant", {"ca": "Restaurant", "es": "Restaurante", "en": "Restaurant", "fr": "Restaurant"}),
            ("bar", {"ca": "Bar", "es": "Bar", "en": "Bar", "fr": "Bar"}),
            ("hotel", {"ca": "Hotel", "es": "Hotel", "en": "Hotel", "fr": "Hôtel"}),
            ("apartment", {"ca": "Apartament", "es": "Apartamento", "en": "Apartment", "fr": "Appartement"}),
            ("viewpoint", {"ca": "Mirador", "es": "Mirador", "en": "Viewpoint", "fr": "Point de vue"}),
            ("museum", {"ca": "Museu", "es": "Museo", "en": "Museum", "fr": "Musée"}),
            ("beach", {"ca": "Platja", "es": "Playa", "en": "Beach", "fr": "Plage"}),
        ]

        for slug, names in templates:
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={"nombre": names.get("en", slug), "taxonomy": "template"},
            )
            if category.taxonomy != "template":
                category.taxonomy = "template"
            for lang_code, name in names.items():
                category.set_current_language(lang_code)
                if category.nombre != name:
                    category.nombre = name
            category.save()
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created template category '{slug}'"))
            else:
                self.stdout.write(self.style.WARNING(f"Template category '{slug}' already exists"))

    def _create_singleton(self, category: Category) -> PlaceCategorySingleton:
        singleton, created = PlaceCategorySingleton.objects.get_or_create(
            pk=1,
            defaults={"category": category},
        )
        if not created and singleton.category != category:
            singleton.category = category
            singleton.save()
            self.stdout.write(self.style.SUCCESS("Updated PlaceCategorySingleton to root category"))
        elif created:
            self.stdout.write(self.style.SUCCESS("Created PlaceCategorySingleton"))
        else:
            self.stdout.write(self.style.WARNING("PlaceCategorySingleton already configured"))
        return singleton

    def _assign_root_to_places(self, category: Category) -> int:
        places_without_category = Place.objects.filter(category__isnull=True)
        count = places_without_category.count()
        if count:
            places_without_category.update(category=category)
            self.stdout.write(self.style.SUCCESS(f"Assigned root category to {count} place(s)"))
        else:
            self.stdout.write(self.style.WARNING("All places already have a category"))
        return count

    def _print_summary(self, category: Category, singleton: PlaceCategorySingleton, assigned: int) -> None:
        total_places = Place.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"\n{'='*50}\n"
                f"Seed completed successfully\n"
                f"  - Root category: {category.nombre}\n"
                f"  - Total places: {total_places}\n"
                f"  - Singleton points to category: {'yes' if singleton.category == category else 'no'}\n"
                f"  - Places assigned to root: {assigned}\n"
                f"{'='*50}"
            )
        )
