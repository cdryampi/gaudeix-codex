"""
URL configuration for scraper API.
"""

from .views import ScraperSourceViewSet, ScrapedNewsViewSet, ScrapeJobViewSet


def register_routes(router):
    """Register scraper routes with the main router."""
    router.register(r"scraper/sources", ScraperSourceViewSet, basename="scraper-source")
    router.register(r"scraper/jobs", ScrapeJobViewSet, basename="scraper-job")
    router.register(
        r"scraper/scraped-news", ScrapedNewsViewSet, basename="scraped-news"
    )
