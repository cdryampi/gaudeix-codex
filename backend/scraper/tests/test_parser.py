"""
Tests for CabreraDeMarParser.

Covers:
- Parsing news list pages with realistic HTML
- Parsing news detail pages with full content extraction
- URL normalization and slug extraction
- Edge cases: empty pages, missing data, malformed HTML
"""


from scraper.parsers.cabrera_de_mar import CabreraDeMarParser
from scraper.parser_registry import ParserRegistry


class TestParserRegistration:
    """Tests for parser registration in registry."""

    def test_parser_is_registered(self):
        """Test that CabreraDeMarParser is auto-registered."""
        assert "cabrera-de-mar" in ParserRegistry.list_all()

    def test_get_parser_by_slug(self):
        """Test retrieving parser by slug."""
        parser = ParserRegistry.get("cabrera-de-mar")
        assert parser is not None
        assert isinstance(parser, CabreraDeMarParser)

    def test_parser_attributes(self):
        """Test parser class attributes."""
        parser = CabreraDeMarParser()
        assert parser.name == "Cabrera de Mar"
        assert parser.slug == "cabrera-de-mar"
        assert parser.base_url == "https://www.cabrerademar.cat"


class TestGetListPageUrls:
    """Tests for list page URL generation."""

    def test_default_pagination(self):
        """Test default pagination generates 8 pages."""
        parser = CabreraDeMarParser()
        urls = parser.get_list_page_urls()

        assert len(urls) == 8
        assert urls[0] == "https://www.cabrerademar.cat/actualitat/noticies"
        assert urls[1] == "https://www.cabrerademar.cat/actualitat/noticies?pag=2"
        assert urls[7] == "https://www.cabrerademar.cat/actualitat/noticies?pag=8"

    def test_custom_max_pages(self):
        """Test custom max_pages parameter."""
        parser = CabreraDeMarParser()
        urls = parser.get_list_page_urls(max_pages=3)

        assert len(urls) == 3
        assert "?pag=3" in urls[2]

    def test_single_page(self):
        """Test requesting only one page."""
        parser = CabreraDeMarParser()
        urls = parser.get_list_page_urls(max_pages=1)

        assert len(urls) == 1
        assert "?pag=" not in urls[0]

    def test_config_override(self):
        """Test max_pages from config."""
        parser = CabreraDeMarParser(config={"max_pages": 5})
        urls = parser.get_list_page_urls()

        assert len(urls) == 5


class TestParseListPage:
    """Tests for parsing news listing pages."""

    def test_parse_list_extracts_news_items(self, cabrera_list_page_html):
        """Test extracting news items from list page."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        # Should find 3 unique news items
        assert len(items) == 3

    def test_parse_list_extracts_urls(self, cabrera_list_page_html):
        """Test that URLs are correctly extracted and normalized."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        urls = [item.url for item in items]
        assert (
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html"
            in urls
        )
        assert (
            "https://www.cabrerademar.cat/actualitat/noticies/pressupost-2026.html"
            in urls
        )

    def test_parse_list_extracts_titles(self, cabrera_list_page_html):
        """Test that titles are extracted."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        titles = [item.title for item in items]
        assert any("Festa Major" in t for t in titles)
        assert any("pressupost" in t.lower() for t in titles)

    def test_parse_list_extracts_dates(self, cabrera_list_page_html):
        """Test date extraction from DD/MM/YYYY format."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        # At least one item should have a date
        items_with_dates = [i for i in items if i.published_at is not None]
        assert len(items_with_dates) >= 1

        # Check date is parsed correctly (15/01/2026)
        festa_item = next((i for i in items if "festa" in i.url.lower()), None)
        if festa_item and festa_item.published_at:
            assert festa_item.published_at.year == 2026
            assert festa_item.published_at.month == 1
            assert festa_item.published_at.day == 15

    def test_parse_list_extracts_images(self, cabrera_list_page_html):
        """Test thumbnail image extraction."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        items_with_images = [i for i in items if i.image_url]
        assert len(items_with_images) >= 2
        assert "festa-major-thumb.jpg" in items_with_images[0].image_url

    def test_parse_list_extracts_summaries(self, cabrera_list_page_html):
        """Test summary extraction from <strong> tags."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        items_with_summary = [i for i in items if i.summary]
        assert len(items_with_summary) >= 1

    def test_parse_list_deduplicates_urls(self, cabrera_list_page_html):
        """Test that duplicate URLs are filtered out."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_list_page_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        urls = [item.url for item in items]
        # festa-major-2026.html appears twice in HTML but should only be in list once
        assert (
            urls.count(
                "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html"
            )
            == 1
        )

    def test_parse_empty_list(self, cabrera_empty_list_html):
        """Test handling empty news list."""
        parser = CabreraDeMarParser()
        items = parser.parse_list_page(
            cabrera_empty_list_html, "https://www.cabrerademar.cat/actualitat/noticies"
        )

        assert items == []


class TestParseDetailPage:
    """Tests for parsing news detail pages."""

    def test_parse_detail_extracts_all_fields(self, cabrera_detail_page_html):
        """Test full extraction from detail page."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert data.source_id == "festa-major-2026"
        assert (
            data.source_url
            == "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html"
        )
        assert "Festa Major" in data.title
        assert "Sant Vicenç" in data.title

    def test_parse_detail_extracts_title_from_og(self, cabrera_detail_page_html):
        """Test title extraction from og:title meta tag."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        # og:title should be preferred over <title>
        assert "Arriba la Festa Major" in data.title
        assert "Inici" not in data.title  # Should not include suffix

    def test_parse_detail_extracts_summary(self, cabrera_detail_page_html):
        """Test summary extraction from og:description."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert "Programa complet" in data.summary
        assert "Cabrera de Mar" in data.summary

    def test_parse_detail_extracts_date(self, cabrera_detail_page_html):
        """Test date extraction from meta name='date' tag."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert data.published_at is not None
        assert data.published_at.year == 2026
        assert data.published_at.month == 1
        assert data.published_at.day == 15
        assert data.published_at.hour == 14
        assert data.published_at.minute == 30

    def test_parse_detail_extracts_featured_image(self, cabrera_detail_page_html):
        """Test featured image from first og:image."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert "festa-major-2026.jpg" in data.featured_image_url

    def test_parse_detail_extracts_gallery(self, cabrera_detail_page_html):
        """Test gallery images from additional og:image tags."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert len(data.gallery_image_urls) == 1
        assert "festa-concert.jpg" in data.gallery_image_urls[0]

    def test_parse_detail_extracts_body(self, cabrera_detail_page_html):
        """Test article body extraction."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert "Ajuntament de Cabrera de Mar" in data.body
        assert "Correfoc" in data.body
        assert "<script>" not in data.body  # Scripts should be removed

    def test_parse_detail_stores_raw_html(self, cabrera_detail_page_html):
        """Test that raw HTML is stored for debugging."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert data.raw_html == cabrera_detail_page_html

    def test_parse_detail_extracts_metadata(self, cabrera_detail_page_html):
        """Test raw_metadata includes canonical and author."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_page_html,
            "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html",
        )

        assert "canonical" in data.raw_metadata
        assert "festa-major-2026.html" in data.raw_metadata["canonical"]
        assert data.raw_metadata["author"] == "Ajuntament de Cabrera de Mar"

    def test_parse_detail_fallback_title(self, cabrera_detail_minimal_html):
        """Test title fallback to <title> tag when og:title missing."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_minimal_html,
            "https://www.cabrerademar.cat/actualitat/noticies/minimal.html",
        )

        assert "Notícia sense meta tags" in data.title
        assert "Inici" not in data.title  # Suffix should be removed

    def test_parse_detail_handles_missing_date(self, cabrera_detail_minimal_html):
        """Test handling missing date gracefully."""
        parser = CabreraDeMarParser()
        data = parser.parse_detail_page(
            cabrera_detail_minimal_html,
            "https://www.cabrerademar.cat/actualitat/noticies/minimal.html",
        )

        assert data.published_at is None


class TestUrlNormalization:
    """Tests for URL normalization helper."""

    def test_normalize_absolute_url(self):
        """Test absolute URLs are returned unchanged."""
        parser = CabreraDeMarParser()
        url = "https://other.com/image.jpg"
        assert parser.normalize_url(url) == url

    def test_normalize_protocol_relative_url(self):
        """Test protocol-relative URLs get https."""
        parser = CabreraDeMarParser()
        url = "//cdn.example.com/image.jpg"
        assert parser.normalize_url(url) == "https://cdn.example.com/image.jpg"

    def test_normalize_absolute_path(self):
        """Test absolute paths get base_url prepended."""
        parser = CabreraDeMarParser()
        url = "/media/images/test.jpg"
        assert (
            parser.normalize_url(url)
            == "https://www.cabrerademar.cat/media/images/test.jpg"
        )

    def test_normalize_relative_path(self):
        """Test relative paths get base_url prepended."""
        parser = CabreraDeMarParser()
        url = "images/test.jpg"
        assert (
            parser.normalize_url(url) == "https://www.cabrerademar.cat/images/test.jpg"
        )


class TestSlugExtraction:
    """Tests for slug extraction from URLs."""

    def test_extract_slug_simple(self):
        """Test basic slug extraction."""
        parser = CabreraDeMarParser()
        url = "https://www.cabrerademar.cat/actualitat/noticies/festa-major-2026.html"
        assert parser.extract_slug_from_url(url) == "festa-major-2026"

    def test_extract_slug_removes_html(self):
        """Test .html extension is removed."""
        parser = CabreraDeMarParser()
        url = "https://www.cabrerademar.cat/noticies/test-article.html"
        slug = parser.extract_slug_from_url(url)
        assert ".html" not in slug
        assert slug == "test-article"

    def test_extract_slug_removes_query_params(self):
        """Test query parameters are removed."""
        parser = CabreraDeMarParser()
        url = "https://www.cabrerademar.cat/noticies/test-page.html?utm_source=twitter"
        slug = parser.extract_slug_from_url(url)
        assert "utm" not in slug
        assert slug == "test-page"

    def test_extract_slug_handles_trailing_slash(self):
        """Test trailing slash is handled."""
        parser = CabreraDeMarParser()
        url = "https://www.cabrerademar.cat/noticies/test-url/"
        slug = parser.extract_slug_from_url(url)
        assert slug == "test-url"
