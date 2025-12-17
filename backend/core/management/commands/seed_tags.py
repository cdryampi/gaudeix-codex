"""
Seed common tags with translations.

Idempotent: safe to run multiple times.
"""

from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Tag


class Command(BaseCommand):
    help = "Seed common tags with translations"

    def handle(self, *args, **options):
        with transaction.atomic():
            created = 0
            updated = 0
            for slug, names in self._tag_definitions():
                tag, was_created = Tag.objects.get_or_create(
                    slug=slug,
                    defaults={"nombre": names.get("en", slug)},
                )

                if tag.slug != slug:
                    tag.slug = slug

                changed = False
                for lang_code, name in names.items():
                    tag.set_current_language(lang_code)
                    if tag.nombre != name:
                        tag.nombre = name
                        changed = True

                if changed:
                    tag.save()
                    if not was_created:
                        updated += 1

                if was_created:
                    created += 1

            total = Tag.objects.count()
            self.stdout.write(
                self.style.SUCCESS(
                    f"Seeded tags: created={created}, updated={updated}, total={total}"
                )
            )

    def _tag_definitions(self) -> list[tuple[str, dict[str, str]]]:
        return [
            ("mercat", {"ca": "Mercat", "es": "Mercado", "en": "Market", "fr": "Marche"}),
            ("producte-local", {"ca": "Producte local", "es": "Producto local", "en": "Local produce", "fr": "Produit local"}),
            ("artesania", {"ca": "Artesania", "es": "Artesania", "en": "Crafts", "fr": "Artisanat"}),
            ("infantil", {"ca": "Infantil", "es": "Infantil", "en": "Kids", "fr": "Enfants"}),
            ("taller", {"ca": "Taller", "es": "Taller", "en": "Workshop", "fr": "Atelier"}),
            ("familia", {"ca": "Familia", "es": "Familia", "en": "Family", "fr": "Famille"}),
            ("ruta", {"ca": "Ruta", "es": "Ruta", "en": "Route", "fr": "Itineraire"}),
            ("patrimoni", {"ca": "Patrimoni", "es": "Patrimonio", "en": "Heritage", "fr": "Patrimoine"}),
            ("visita-guiada", {"ca": "Visita guiada", "es": "Visita guiada", "en": "Guided tour", "fr": "Visite guidee"}),
            ("teatre", {"ca": "Teatre", "es": "Teatro", "en": "Theatre", "fr": "Theatre"}),
            ("comedia", {"ca": "Comedia", "es": "Comedia", "en": "Comedy", "fr": "Comedie"}),
            ("musica", {"ca": "Musica", "es": "Musica", "en": "Music", "fr": "Musique"}),
            ("concert", {"ca": "Concert", "es": "Concierto", "en": "Concert", "fr": "Concert"}),
            ("classica", {"ca": "Classica", "es": "Clasica", "en": "Classical", "fr": "Classique"}),
            ("xerrada", {"ca": "Xerrada", "es": "Charla", "en": "Talk", "fr": "Conference"}),
            ("participacio", {"ca": "Participacio", "es": "Participacion", "en": "Participation", "fr": "Participation"}),
            ("formacio", {"ca": "Formacio", "es": "Formacion", "en": "Training", "fr": "Formation"}),
            ("digital", {"ca": "Digital", "es": "Digital", "en": "Digital", "fr": "Numerique"}),
            ("ajuda", {"ca": "Ajuda", "es": "Ayuda", "en": "Help", "fr": "Aide"}),
            ("esports", {"ca": "Esports", "es": "Deportes", "en": "Sports", "fr": "Sports"}),
            ("caminada", {"ca": "Caminada", "es": "Caminata", "en": "Walk", "fr": "Marche"}),
            ("salut", {"ca": "Salut", "es": "Salud", "en": "Health", "fr": "Sante"}),
            ("educacio", {"ca": "Educacio", "es": "Educacion", "en": "Education", "fr": "Education"}),
            ("reforc", {"ca": "Reforc", "es": "Refuerzo", "en": "Support", "fr": "Soutien"}),
            ("inscripcions", {"ca": "Inscripcions", "es": "Inscripciones", "en": "Registration", "fr": "Inscriptions"}),
            ("nadal", {"ca": "Nadal", "es": "Navidad", "en": "Christmas", "fr": "Noel"}),
            ("fira", {"ca": "Fira", "es": "Feria", "en": "Fair", "fr": "Foire"}),
            ("reis", {"ca": "Reis", "es": "Reyes", "en": "Kings", "fr": "Rois"}),
            ("tradicio", {"ca": "Tradicio", "es": "Tradicion", "en": "Tradition", "fr": "Tradition"}),
        ]

