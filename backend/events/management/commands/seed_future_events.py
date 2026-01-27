
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

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=100,
            help="Number of events to generate",
        )

    def handle(self, *args, **options):
        count = options["count"]
        self.stdout.write(self.style.WARNING(f"Seeding {count} future events for Cabrera de Mar..."))
        
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
            "Familia": "family.png",
            "Tradición": "tradition.png",
            "Cine": "cinema.png",
            "Mercado": "market.png",
            "Bienestar": "wellness.png",
            "Networking": "networking.png",
            "Playa": "beach.png",
        }

        # Root category
        root_category, _ = Category.objects.get_or_create(
            slug="events",
            defaults={"nombre": "Eventos", "taxonomy": "events"},
        )

        # Realistic locations in Cabrera de Mar
        cabrera_locations = [
            {"name": "Castell de Burriac", "address": "Muntanya de Burriac, s/n"},
            {"name": "Plaça de la Vila", "address": "Plaça de la Vila, 1"},
            {"name": "Can Bartomeu", "address": "Carrer de la Riera, s/n"},
            {"name": "Biblioteca Ilturo", "address": "Carrer de Sant Vicenç, 2"},
            {"name": "Pavelló Municipal", "address": "Carrer de la Riera de Cabrera, 34"},
            {"name": "Platja de Cabrera", "address": "Passeig Marítim, s/n"},
            {"name": "Espai Cultural Ca l'Arnau", "address": "Carrer de Baix, 23"},
        ]

        # Municipal event templates
        event_templates = {
            "Música": [
                "Concierto de Jazz a la Fresca",
                "Recital de Piano en Can Bartomeu",
                "Festival de Música Juvenil",
                "Cantada de Habaneras en la Playa",
                "Noche de Ópera bajo las estrellas",
                "Jam Session en la Plaza",
                "Concierto de Corales Locales"
            ],
            "Gastronomía": [
                "Feria de la Tapa Local",
                "Cata de Vinos del Maresme",
                "Mercado de Productos de Proximidad",
                "Taller de Cocina Catalana",
                "Degustación de Platos con Pèsol de Cabrera",
                "Showcooking con chefs locales",
                "Feria de la Cerveza Artesana"
            ],
            "Naturaleza": [
                "Caminata Nocturna al Castell de Burriac",
                "Limpieza Voluntaria de la Playa",
                "Ruta Botánica por el Valle de Cabrera",
                "Observación de Estrellas",
                "Salida Ornitológica por la Riera",
                "Taller de Plantas Medicinales",
                "Senderismo Familiar por Burriac"
            ],
            "Arte": [
                "Exposición de Pintura Local",
                "Muestra de Escultura Contemporánea",
                "Taller de Fotografía de Paisaje",
                "Feria del Colectivo de Artistas",
                "Exposición de Arte Urbano",
                "Concurso de Pintura Rápida",
                "Instalaciones Artísticas en la Calle"
            ],
            "Teatro": [
                "Teatro Infantil en el Parque",
                "Representación de Leyendas Locales",
                "Maratón de Microteatro",
                "Espectáculo de Circo Municipal",
                "Teatro de Marionetas para Familias",
                "Monólogos de Humor en Can Bartomeu",
                "Pasacalles de Animación Teatral"
            ],
            "Deportes": [
                "Cursa Popular de Burriac",
                "Torneo de Pádel Solidario",
                "Yoga frente al Mar",
                "Bicicletada Familiar por el Maresme",
                "Torneo de Fútbol Sala 24h",
                "Clase Magistral de Pilates",
                "Encuentro de Escuelas de Vela"
            ],
            "Fiesta": [
                "Pregón de la Festa Major",
                "Baile de Gigantes y Cabezudos",
                "Noche de Conciertos en la Carpa",
                "Correfoc por las calles del centro",
                "Baile de Gala de San Vicenç",
                "Cena Popular al Aire Libre",
                "Feria de Atracciones"
            ],
            "Tecnología": [
                "Taller de Robótica para Niños",
                "Charla sobre Inteligencia Artificial",
                "Curso de Competencias Digitales",
                "Encuentro de Creadores Digitales",
                "Iniciación a la Impresión 3D",
                "Taller de Seguridad en Redes Sociales",
                "Exhibición de Drones en el Estadio"
            ],
            "Familia": [
                "Taller de Juegos Tradicionales en Familia",
                "Gincana por el Centro Histórico",
                "Fiesta de la Espuma para Niños",
                "Mañana de Cuentacuentos al Aire Libre",
                "Día de la Familia en Can Bartomeu"
            ],
            "Tradición": [
                "Diada Castellera de Sant Vicenç",
                "Muestra de Bailes de Bastones",
                "Encuentro de Puntaires",
                "Concentración de Gigantes del Maresme",
                "Baile de Sardanas en la Plaza"
            ],
            "Cine": [
                "Cine de Verano en la Playa",
                "Proyección de Cortometrajes Locales",
                "Ciclo de Cine de Autor",
                "Documental del Mes: Naturaleza y Mar"
            ],
            "Mercado": [
                "Mercado Semanal de Artesanía",
                "Feria de Antigüedades y Coleccionismo",
                "Mercado de Intercambio de Libros",
                "Muestra de Comercio en la Calle"
            ],
            "Bienestar": [
                "Sesión de Yoga al Amanecer",
                "Taller de Mindfulness y Relajación",
                "Charla sobre Nutrición Saludable",
                "Caminata Consciente por la Playa",
                "Taller de Cosmética Natural"
            ],
            "Networking": [
                "Encuentro de Emprendedores Locales",
                "Desayuno de Networking Empresarial",
                "Charla sobre Transformación Digital",
                "Jornada de Coworking Abierto",
                "Afterwork para Profesionales en Can Bartomeu"
            ],
            "Playa": [
                "Voley Playa: Torneo de Verano",
                "Bautizo de Vela Ligera",
                "Concurso de Castillos de Arena",
                "Fitness en la Arena de la Playa",
                "Travesía a Nado de Cabrera"
            ]
        }

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
            # Generate specified count of events
            for _ in range(count):
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

                # Random date between now and end_date
                time_diff = end_date - base_now
                random_seconds = random.randint(0, int(time_diff.total_seconds()))
                start_at = base_now + timedelta(seconds=random_seconds)
                end_at = start_at + timedelta(hours=random.randint(2, 6))

                # Pick template and location
                title = random.choice(event_templates[cat_name])
                location_data = random.choice(cabrera_locations)
                
                summary = f"Únete a nosotros para el evento '{title}' en {location_data['name']}. Una actividad organizada por el Ayuntamiento de Cabrera de Mar para fomentar la cultura y la participación ciudadana."
                description = f"El evento '{title}' es una de las actividades destacadas de la agenda municipal de Cabrera de Mar. Se llevará a cabo en {location_data['name']} ({location_data['address']}).\n\nEsperamos contar con vuestra presencia para disfrutar de una jornada dedicada a {cat_name.lower()}. No te pierdas esta oportunidad de conectar con la comunidad y disfrutar de lo mejor que nuestro municipio tiene para ofrecer."
                
                price = f"{random.randint(5, 25)} EUR" if random.choice([True, False, False]) else "Gratis"

                # Image
                featured_media = images_cache.get(cat_name)

                # Create Event
                event = Event.objects.create(
                    title=title,
                    slug=fake.slug() + str(random.randint(1000,9999)),
                    summary=summary,
                    description=description,
                    start_at=start_at,
                    end_at=end_at,
                    is_published=True,
                    venue_name=location_data['name'],
                    location_text=location_data['address'],
                    price_text=price,
                    is_free=(price == "Gratis"),
                    category=category,
                    featured_media=featured_media
                )
                
                # Set language explicitly
                event.set_current_language('es')
                event.title = title
                event.summary = summary
                event.description = description
                event.save()

                created_count += 1
                if created_count % 10 == 0:
                    self.stdout.write(self.style.SUCCESS(f"Created {created_count} events..."))

        self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} future events for Cabrera de Mar."))

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
