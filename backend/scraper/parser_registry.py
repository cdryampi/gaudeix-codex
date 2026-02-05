"""
Parser registry for auto-discovery and management of news parsers.

Parsers register themselves using the @ParserRegistry.register decorator.
"""

from typing import Dict, List, Optional, Type
import logging

from .base_parser import BaseNewsParser

logger = logging.getLogger(__name__)


class ParserRegistry:
    """
    Central registry for all news parsers.

    Parsers are registered by slug and can be retrieved dynamically.

    Usage:
        @ParserRegistry.register
        class MyParser(BaseNewsParser):
            slug = "my-parser"
            ...

        # Later:
        parser = ParserRegistry.get("my-parser")
    """

    _parsers: Dict[str, Type[BaseNewsParser]] = {}

    @classmethod
    def register(cls, parser_class: Type[BaseNewsParser]) -> Type[BaseNewsParser]:
        """
        Register a parser class.

        Can be used as a decorator:
            @ParserRegistry.register
            class MyParser(BaseNewsParser):
                ...
        """
        if not hasattr(parser_class, "slug") or not parser_class.slug:
            raise ValueError(
                f"Parser {parser_class.__name__} must define a 'slug' attribute"
            )

        slug = parser_class.slug
        if slug in cls._parsers:
            logger.warning(f"Parser '{slug}' already registered, overwriting")

        cls._parsers[slug] = parser_class
        logger.debug(f"Registered parser: {slug} -> {parser_class.__name__}")
        return parser_class

    @classmethod
    def get(cls, slug: str, config: Optional[dict] = None) -> BaseNewsParser:
        """
        Get an instance of a parser by slug.

        Args:
            slug: Parser slug (e.g., "cabrera-de-mar")
            config: Optional configuration to pass to parser

        Returns:
            Instantiated parser

        Raises:
            KeyError: If parser not found
        """
        if slug not in cls._parsers:
            available = ", ".join(cls._parsers.keys()) or "(none)"
            raise KeyError(f"Parser '{slug}' not found. Available: {available}")

        return cls._parsers[slug](config=config)

    @classmethod
    def get_class(cls, slug: str) -> Type[BaseNewsParser]:
        """Get parser class (not instance) by slug."""
        if slug not in cls._parsers:
            raise KeyError(f"Parser '{slug}' not found")
        return cls._parsers[slug]

    @classmethod
    def list_all(cls) -> List[str]:
        """List all registered parser slugs."""
        return list(cls._parsers.keys())

    @classmethod
    def get_all_info(cls) -> List[dict]:
        """Get info about all registered parsers."""
        return [
            {
                "slug": slug,
                "name": parser_class.name,
                "base_url": parser_class.base_url,
            }
            for slug, parser_class in cls._parsers.items()
        ]

    @classmethod
    def has(cls, slug: str) -> bool:
        """Check if a parser is registered."""
        return slug in cls._parsers

    @classmethod
    def clear(cls):
        """Clear all registered parsers (for testing)."""
        cls._parsers.clear()
