"""
News parser for Cabrera de Mar municipality website.

Website: https://www.cabrerademar.cat
News URL: https://www.cabrerademar.cat/actualitat/noticies
"""

import re
from datetime import datetime
from typing import List, Optional

from bs4 import BeautifulSoup
from django.utils import timezone

from scraper.base_parser import BaseNewsParser, NewsListItem, ScrapedNewsData
from scraper.parser_registry import ParserRegistry


@ParserRegistry.register
class CabreraDeMarParser(BaseNewsParser):
    """
    Parser for Cabrera de Mar municipal website.

    Structure:
    - News list: /actualitat/noticies with pagination ?pag=1..N
    - News detail: /actualitat/noticies/{slug}.html
    - Images in og:image meta tags and article content
    """

    name = "Cabrera de Mar"
    slug = "cabrera-de-mar"
    base_url = "https://www.cabrerademar.cat"

    # Configuration
    DEFAULT_MAX_PAGES = 8
    NEWS_PATH = "/actualitat/noticies"

    def get_list_page_urls(self, max_pages: Optional[int] = None) -> List[str]:
        """Generate pagination URLs for news listing."""
        if max_pages is None:
            max_pages = self.config.get("max_pages", self.DEFAULT_MAX_PAGES)

        urls = [f"{self.base_url}{self.NEWS_PATH}"]  # First page has no ?pag
        for page in range(2, max_pages + 1):
            urls.append(f"{self.base_url}{self.NEWS_PATH}?pag={page}")

        return urls

    def parse_list_page(self, html: str, url: str) -> List[NewsListItem]:
        """
        Parse news listing page.

        Expected structure:
        <ul> with <li> items containing:
        - <a href="..."> with news link
        - <img> with thumbnail
        - Date text (DD/MM/YYYY)
        - Summary in <strong> or text
        """
        soup = BeautifulSoup(html, "lxml")
        items = []

        # Find news items - they're in the main content area
        # Looking for links to /actualitat/noticies/*.html
        news_links = soup.find_all(
            "a", href=re.compile(r"/actualitat/noticies/[^/]+\.html")
        )

        seen_urls = set()
        for link in news_links:
            href = link.get("href", "")
            if not href or href in seen_urls:
                continue

            full_url = self.normalize_url(href)
            seen_urls.add(href)

            # Try to extract title from link text
            title = link.get_text(strip=True)
            if not title or len(title) < 3:
                continue

            # Look for image in or near the link
            img = link.find("img")
            image_url = ""
            if img and img.get("src"):
                image_url = self.normalize_url(img["src"])

            # Try to find date near this item
            parent = link.find_parent("li") or link.find_parent("div")
            published_at = None
            summary = ""

            if parent:
                text = parent.get_text(" ", strip=True)
                # Look for date pattern DD/MM/YYYY
                date_match = re.search(r"(\d{2})/(\d{2})/(\d{4})", text)
                if date_match:
                    try:
                        day, month, year = date_match.groups()
                        published_at = timezone.make_aware(
                            datetime(int(year), int(month), int(day))
                        )
                    except ValueError:
                        pass

                # Look for summary in <strong> tags or after date
                strong = parent.find("strong")
                if strong:
                    summary = strong.get_text(strip=True)

            items.append(
                NewsListItem(
                    url=full_url,
                    title=title,
                    published_at=published_at,
                    summary=summary,
                    image_url=image_url,
                )
            )

        self.logger.info(f"Found {len(items)} news items on {url}")
        return items

    def parse_detail_page(self, html: str, url: str) -> ScrapedNewsData:
        """
        Parse news detail page.

        Extracts:
        - Title from <title> or og:title
        - Summary from meta description or og:description
        - Body from article content
        - Images from og:image tags
        - Date from meta date tag
        """
        soup = BeautifulSoup(html, "lxml")

        # Extract source_id from URL
        source_id = self.extract_slug_from_url(url)

        # Title: prefer og:title, fallback to <title>
        title = ""
        og_title = soup.find("meta", property="og:title")
        if og_title:
            title = og_title.get("content", "")
        if not title:
            title_tag = soup.find("title")
            if title_tag:
                title = title_tag.get_text(strip=True)
                # Remove site suffix
                title = re.sub(r"\s*-\s*Inici$", "", title)

        # Summary: from meta description or og:description
        summary = ""
        og_desc = soup.find("meta", property="og:description")
        if og_desc:
            summary = og_desc.get("content", "")
        if not summary:
            meta_desc = soup.find("meta", attrs={"name": "description"})
            if meta_desc:
                summary = meta_desc.get("content", "")
        # Clean HTML entities
        summary = BeautifulSoup(summary, "html.parser").get_text()

        # Published date from meta date
        published_at = None
        meta_date = soup.find("meta", attrs={"name": "date"})
        if meta_date:
            date_str = meta_date.get("content", "")
            try:
                # Format: "2026-02-02 14:43:01"
                published_at = timezone.make_aware(
                    datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                )
            except ValueError:
                try:
                    published_at = timezone.make_aware(
                        datetime.strptime(date_str, "%Y-%m-%d")
                    )
                except ValueError:
                    pass

        # Images from og:image tags
        og_images = soup.find_all("meta", property="og:image")
        gallery_urls = []
        featured_image_url = ""

        for img in og_images:
            img_url = img.get("content", "")
            if img_url and "logo" not in img_url.lower():
                normalized = self.normalize_url(img_url)
                if not featured_image_url:
                    featured_image_url = normalized
                else:
                    gallery_urls.append(normalized)

        # Body: find main article content
        body = ""

        # Look for article tag or main content div
        article = soup.find("article")
        if not article:
            # Try common content containers
            for selector in [
                ".article-content",
                ".content",
                ".news-content",
                "#content",
            ]:
                article = soup.select_one(selector)
                if article:
                    break

        if article:
            # Remove script and style tags
            for tag in article.find_all(["script", "style", "nav", "header", "footer"]):
                tag.decompose()
            body = str(article)

        body = self.normalize_html(body)

        # Raw metadata for debugging
        raw_metadata = {
            "canonical": "",
            "author": "",
        }
        canonical = soup.find("link", rel="canonical")
        if canonical:
            raw_metadata["canonical"] = self.normalize_url(canonical.get("href", ""))
        author = soup.find("meta", attrs={"name": "author"})
        if author:
            raw_metadata["author"] = author.get("content", "")

        return ScrapedNewsData(
            source_id=source_id,
            source_url=url,
            title=title,
            summary=summary,
            body=body,
            published_at=published_at,
            featured_image_url=featured_image_url,
            gallery_image_urls=gallery_urls,
            raw_html=html,
            raw_metadata=raw_metadata,
        )
