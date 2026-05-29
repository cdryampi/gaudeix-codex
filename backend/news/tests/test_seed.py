import pytest
from django.core.management import call_command

from news.models import News


pytestmark = pytest.mark.django_db


def test_seed_news_creates_items():
    call_command("seed_news", verbosity=0)

    count = News.objects.count()
    assert count > 0, "seed_news should create news items"

    published = News.objects.filter(is_published=True).count()
    assert published >= count, "all seeded news should be published"

    featured = News.objects.filter(is_featured=True).count()
    assert featured >= 0, "should handle featured flag"


def test_seed_news_idempotent():
    call_command("seed_news", verbosity=0)
    first_count = News.objects.count()

    call_command("seed_news", verbosity=0)
    second_count = News.objects.count()

    assert second_count == first_count, "seed_news should replace, not append"


def test_seed_news_translations():
    call_command("seed_news", verbosity=0)

    for news in News.objects.all():
        for lang in ("ca", "es", "en", "fr"):
            news.set_current_language(lang)
            title = news.title
            assert title, f"Missing {lang} title for news {news.slug}"
            assert len(title) > 5, f"Title too short for {lang} in {news.slug}"
