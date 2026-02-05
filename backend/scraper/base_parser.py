"""
Base parser class for news scrapers.

All municipality-specific parsers must inherit from BaseNewsParser
and implement the abstract methods.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from urllib.parse import urljoin
import logging

logger = logging.getLogger(__name__)


@dataclass
class NewsListItem:
    """Minimal data extracted from a news listing page."""

    url: str
    title: str
    published_at: Optional[datetime] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None


@dataclass
class ScrapedNewsData:
    """Full data extracted from a news detail page."""

    source_id: str
    source_url: str
    title: str
    summary: str = ""
    body: str = ""
    published_at: Optional[datetime] = None
    featured_image_url: str = ""
    gallery_image_urls: List[str] = field(default_factory=list)
    raw_html: str = ""
    raw_metadata: dict = field(default_factory=dict)


class BaseNewsParser(ABC):
    """
    Abstract base class for municipality news parsers.

    Each municipality has its own HTML structure, so each parser
    implements the extraction logic specific to that site.

    Usage:
        1. Create a new parser in scraper/parsers/
        2. Inherit from BaseNewsParser
        3. Implement all abstract methods
        4. Register with @ParserRegistry.register decorator
    """

    # Override these in subclasses
    name: str = "Base Parser"
    slug: str = "base"
    base_url: str = ""

    def __init__(self, config: Optional[dict] = None):
        """
        Initialize parser with optional configuration.

        Args:
            config: Parser-specific configuration from ScraperSource.config
        """
        self.config = config or {}
        self.logger = logging.getLogger(f"{__name__}.{self.slug}")

    @abstractmethod
    def get_list_page_urls(self, max_pages: Optional[int] = None) -> List[str]:
        """
        Generate URLs for all news listing pages.

        Args:
            max_pages: Maximum number of pages to scrape (None = all)

        Returns:
            List of URLs to scrape for news listings
        """
        pass

    @abstractmethod
    def parse_list_page(self, html: str, url: str) -> List[NewsListItem]:
        """
        Extract news items from a listing page.

        Args:
            html: Raw HTML content of the listing page
            url: URL of the page (for resolving relative links)

        Returns:
            List of NewsListItem with basic info and detail URLs
        """
        pass

    @abstractmethod
    def parse_detail_page(self, html: str, url: str) -> ScrapedNewsData:
        """
        Extract full news data from a detail page.

        Args:
            html: Raw HTML content of the detail page
            url: URL of the page

        Returns:
            ScrapedNewsData with all extracted information
        """
        pass

    def normalize_url(self, url: str) -> str:
        """Convert relative URL to absolute URL using urljoin.

        Always returns a fully qualified absolute URL.
        Handles: /path, //domain/path, relative/path, and absolute URLs.
        """
        if not url:
            return ""
        # Already absolute
        if url.startswith("http://") or url.startswith("https://"):
            return url
        # Protocol-relative (//example.com/path)
        if url.startswith("//"):
            return f"https:{url}"
        # Use urljoin for proper resolution of relative paths
        return urljoin(self.base_url.rstrip("/") + "/", url)

    def normalize_html(self, html: str) -> str:
        """Normalize relative URLs inside HTML content to absolute URLs."""
        if not html:
            return ""
        try:
            from bs4 import BeautifulSoup

            soup = BeautifulSoup(html, "lxml")
            for tag in soup.find_all(True):
                for attr in ["src", "href", "data-src", "data-href"]:
                    url_value = tag.get(attr)
                    if not url_value:
                        continue
                    if url_value.startswith(
                        (
                            "http://",
                            "https://",
                            "//",
                            "mailto:",
                            "tel:",
                            "#",
                            "javascript:",
                        )
                    ):
                        continue
                    tag[attr] = self.normalize_url(url_value)

                srcset = tag.get("srcset")
                if srcset:
                    parts = []
                    for part in srcset.split(","):
                        item = part.strip()
                        if not item:
                            continue
                        tokens = item.split()
                        if tokens:
                            url_part = tokens[0]
                            if not url_part.startswith(("http://", "https://", "//")):
                                url_part = self.normalize_url(url_part)
                            tokens[0] = url_part
                        parts.append(" ".join(tokens))
                    tag["srcset"] = ", ".join(parts)

            return str(soup)
        except Exception:
            return html

    def extract_slug_from_url(self, url: str) -> str:
        """Extract a unique identifier from the URL."""
        # Remove base URL, query params, and .html extension
        path = url.replace(self.base_url, "").split("?")[0]
        path = path.rstrip("/")
        # Use removesuffix to strip exact ".html" (not char-by-char)
        if path.endswith(".html"):
            path = path[:-5]
        # Use last path segment as slug
        return path.split("/")[-1] or path
