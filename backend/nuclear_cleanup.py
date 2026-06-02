import os
import django
import argparse
from django.core.management import call_command

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import Category, Tag  # noqa: E402
from places.models import Place, PlaceCategorySingleton  # noqa: E402
from events.models import Event, EventCategorySingleton  # noqa: E402
from festes.models import Festa, FestaCategorySingleton  # noqa: E402
from routes.models import Route, RouteCategorySingleton  # noqa: E402
from news.models import News  # noqa: E402
from media_files.models import ImageFile, DocumentFile, VideoFile  # noqa: E402


def cleanup():
    print("Starting NUCLEAR CLEANUP...")

    # 1. Delete dependent entities
    print(f"Deleting {Event.objects.count()} events...")
    Event.objects.all().delete()
    EventCategorySingleton.objects.all().delete()

    print(f"Deleting {Place.objects.count()} places...")
    Place.objects.all().delete()
    PlaceCategorySingleton.objects.all().delete()

    print(f"Deleting {Festa.objects.count()} festes...")
    Festa.objects.all().delete()
    FestaCategorySingleton.objects.all().delete()

    print(f"Deleting {Route.objects.count()} routes...")
    Route.objects.all().delete()
    RouteCategorySingleton.objects.all().delete()

    print(f"Deleting {News.objects.count()} news...")
    News.objects.all().delete()

    # 2. Delete Categories in hierarchical order
    print(f"Deleting {Category.objects.count()} categories hierarchicaly...")
    while Category.objects.count() > 0:
        count_before = Category.objects.count()
        Category.objects.filter(children__isnull=True).delete()
        if Category.objects.count() == count_before:
            print(
                "Warning: Could not delete all categories due to remains. Force clearing parents."
            )
            Category.objects.all().update(parent=None)
            Category.objects.all().delete()
            break

    print(f"Deleting {Tag.objects.count()} tags...")
    Tag.objects.all().delete()

    # 3. Delete Media Files from DB
    print("Deleting all Media Files from DB...")
    ImageFile.objects.all().delete()
    DocumentFile.objects.all().delete()
    VideoFile.objects.all().delete()

    print("Cleanup FINISHED. System is clean.")


def seed(day_offset=0):
    print(f"\nStarting DEEP SEED (Day Offset: {day_offset})...")

    print("- Seeding Places Categories...")
    call_command("seed_places_category")

    print("- Seeding Events Categories...")
    call_command("seed_events_category")

    print("- Seeding Festes Categories...")
    call_command("seed_festes_category")

    print("- Seeding Routes Categories...")
    call_command("seed_routes_category")

    print("- Seeding Tags...")
    call_command("seed_tags")

    print("- Seeding Places...")
    call_command("seed_places")

    print("- Seeding Festes...")
    call_command("seed_festes")

    print("- Seeding Routes...")
    call_command("seed_routes")

    # Note: News are now scraped from external sources, no seed command

    print(f"- Seeding Events (with day offset {day_offset})...")
    call_command("seed_events", day_offset=day_offset)

    print("\nDEEP SEED FINISHED. System is ready.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean and re-seed the database.")
    parser.add_argument("--days", type=int, default=0, help="Day shift for events.")
    parser.add_argument(
        "--no-seed", action="store_true", help="Only cleanup, do not seed."
    )

    args = parser.parse_args()

    cleanup()
    if not args.no_seed:
        seed(day_offset=args.days)
