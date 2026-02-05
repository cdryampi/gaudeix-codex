"""
Pytest fixtures for scraper tests.

Provides reusable fixtures for ScraperSource, ScrapedNews,
and realistic HTML samples from Cabrera de Mar website.
"""

import pytest
from django.utils import timezone

from scraper.models import ScraperSource, ScrapedNews


@pytest.fixture
def scraper_source(db):
    """Create a test ScraperSource for Cabrera de Mar."""
    return ScraperSource.objects.create(
        name="Cabrera de Mar",
        slug="cabrera-de-mar",
        base_url="https://www.cabrerademar.cat",
        news_path="/actualitat/noticies",
        is_active=True,
        config={"max_pages": 2},
    )


@pytest.fixture
def inactive_source(db):
    """Create an inactive ScraperSource."""
    return ScraperSource.objects.create(
        name="Inactive Municipality",
        slug="inactive-muni",
        base_url="https://example.com",
        news_path="/news",
        is_active=False,
    )


@pytest.fixture
def scraped_news_pending(db, scraper_source):
    """Create a pending ScrapedNews item."""
    return ScrapedNews.objects.create(
        source=scraper_source,
        source_url="https://www.cabrerademar.cat/actualitat/noticies/test-news.html",
        external_id="test-news",
        title="Notícia de prova per al scraper",
        summary="Resum de la notícia de prova amb contingut en català.",
        body="<p>Contingut complet de la notícia amb HTML.</p>",
        published_at=timezone.now(),
        featured_image_url="https://www.cabrerademar.cat/media/images/test.jpg",
        gallery_image_urls=[
            "https://www.cabrerademar.cat/media/images/gallery1.jpg",
            "https://www.cabrerademar.cat/media/images/gallery2.jpg",
        ],
        status=ScrapedNews.Status.PENDING,
    )


@pytest.fixture
def scraped_news_imported(db, scraper_source):
    """Create an imported ScrapedNews item."""
    return ScrapedNews.objects.create(
        source=scraper_source,
        source_url="https://www.cabrerademar.cat/actualitat/noticies/imported-news.html",
        external_id="imported-news",
        title="Notícia ja importada",
        summary="Aquesta notícia ja ha estat importada al sistema.",
        published_at=timezone.now(),
        status=ScrapedNews.Status.IMPORTED,
    )


# ============================================================================
# Realistic HTML samples from Cabrera de Mar website structure
# ============================================================================


@pytest.fixture
def cabrera_list_page_html():
    """
    Realistic HTML from Cabrera de Mar news listing page.
    Based on actual structure from https://www.cabrerademar.cat/actualitat/noticies
    """
    return """
    <!DOCTYPE html>
    <html lang="ca">
    <head>
        <title>Notícies - Ajuntament de Cabrera de Mar</title>
        <meta name="description" content="Notícies de l'Ajuntament de Cabrera de Mar">
    </head>
    <body>
        <div id="content">
            <ul class="news-list">
                <li>
                    <a href="/actualitat/noticies/festa-major-2026.html">
                        <img src="/media/images/festa-major-thumb.jpg" alt="Festa Major">
                        Arriba la Festa Major de Sant Vicenç 2026
                    </a>
                    <span class="date">15/01/2026</span>
                    <strong>Programa complet d'actes per a la celebració</strong>
                </li>
                <li>
                    <a href="/actualitat/noticies/pressupost-2026.html">
                        <img src="/media/images/pressupost-thumb.jpg" alt="Pressupost">
                        Aprovat el pressupost municipal de 2026
                    </a>
                    <span class="date">10/01/2026</span>
                    <strong>El ple aprova els comptes per unanimitat</strong>
                </li>
                <li>
                    <a href="/actualitat/noticies/obres-carrer-major.html">
                        Obres de millora al Carrer Major
                    </a>
                    <span class="date">05/01/2026</span>
                </li>
            </ul>
            
            <!-- Duplicate link that should be filtered -->
            <a href="/actualitat/noticies/festa-major-2026.html">Veure més</a>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def cabrera_detail_page_html():
    """
    Realistic HTML from Cabrera de Mar news detail page.
    Based on actual structure with meta tags for date and og:image.
    """
    return """
    <!DOCTYPE html>
    <html lang="ca">
    <head>
        <title>Arriba la Festa Major de Sant Vicenç 2026 - Inici</title>
        <meta name="date" content="2026-01-15 14:30:00">
        <meta name="description" content="Programa complet d'actes per a la Festa Major">
        <meta name="author" content="Ajuntament de Cabrera de Mar">
        <meta property="og:title" content="Arriba la Festa Major de Sant Vicenç 2026">
        <meta property="og:description" content="Programa complet d'actes per a la celebració de la Festa Major de Sant Vicenç 2026 a Cabrera de Mar.">
        <meta property="og:image" content="https://www.cabrerademar.cat/media/images/festa-major-2026.jpg">
        <meta property="og:image" content="https://www.cabrerademar.cat/media/images/festa-concert.jpg">
        <link rel="canonical" href="https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html">
    </head>
    <body>
        <article class="news-detail">
            <h1>Arriba la Festa Major de Sant Vicenç 2026</h1>
            <p class="summary">Programa complet d'actes per a la celebració</p>
            <div class="article-content">
                <p>L'Ajuntament de Cabrera de Mar ha presentat el programa d'actes 
                per a la Festa Major de Sant Vicenç 2026, que se celebrarà del 20 al 25 de gener.</p>
                <p>Entre els actes destacats trobem:</p>
                <ul>
                    <li>Concert de la Banda Municipal</li>
                    <li>Correfoc amb els Diables de Cabrera</li>
                    <li>Sardanes a la Plaça de l'Ajuntament</li>
                </ul>
                <p>Tots els actes són gratuïts i oberts a tothom.</p>
            </div>
        </article>
        <script>console.log('analytics');</script>
    </body>
    </html>
    """


@pytest.fixture
def cabrera_detail_minimal_html():
    """Minimal HTML with only title tag (fallback scenario)."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Notícia sense meta tags - Inici</title>
    </head>
    <body>
        <div class="content">
            <h1>Notícia sense meta tags</h1>
            <p>Contingut bàsic sense estructurar.</p>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def cabrera_empty_list_html():
    """HTML for an empty news listing page."""
    return """
    <!DOCTYPE html>
    <html>
    <head><title>Notícies</title></head>
    <body>
        <div id="content">
            <p>No hi ha notícies disponibles.</p>
        </div>
    </body>
    </html>
    """
