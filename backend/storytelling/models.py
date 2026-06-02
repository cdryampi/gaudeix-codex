from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from solo.models import SingletonModel

from core.models import ContentBase


class StoryCategorySingleton(SingletonModel):
    """
    Singleton model to hold the default 'Storytelling' category.
    Ensures all stories share a common root category.
    """

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="story_singleton",
        verbose_name=_("Storytelling Category"),
        help_text=_("Root category for all stories"),
    )

    class Meta:
        verbose_name = _("Storytelling Category Configuration")

    def __str__(self) -> str:
        return f"Storytelling Category: {self.category}"

    @classmethod
    def get_default_category(cls):
        """Get the default stories category, creating singleton if needed."""
        singleton = cls.get_solo()
        return singleton.category if singleton.category_id else None


class Story(ContentBase, TranslatableModel):
    """
    Story model with multilingual support via django-parler.
    Inherits slug and audit fields from ContentBase.
    """

    translations = TranslatedFields(
        title=models.CharField(_("Title"), max_length=200),
        summary=models.TextField(_("Summary"), blank=True),
        content=models.TextField(_("Content"), blank=True),
        audio_file=models.ForeignKey(
            "media_files.DocumentFile",
            null=True,
            blank=True,
            on_delete=models.SET_NULL,
            related_name="stories_audio",
            verbose_name=_("Audio File"),
            help_text=_("Manual audio guide recording for this language (falls back to TTS if empty)"),
        ),
    )

    category = models.ForeignKey(
        "core.Category",
        on_delete=models.PROTECT,
        related_name="stories",
        null=True,
        blank=True,
        verbose_name=_("Category"),
        help_text=_("Category for this story (defaults to Storytelling category)"),
    )
    is_published = models.BooleanField(_("Is published"), default=True)

    historical_period = models.CharField(
        _("Historical Period"),
        max_length=100,
        blank=True,
        help_text=_("Historical era of the story (e.g. Iberian, Roman, Medieval, Modern)"),
    )

    reading_time = models.PositiveIntegerField(
        _("Reading Time"),
        default=5,
        help_text=_("Estimated reading time in minutes"),
    )

    difficulty = models.CharField(
        _("Difficulty"),
        max_length=50,
        default="easy",
        help_text=_("Difficulty level (e.g. easy, medium, hard)"),
    )

    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_stories",
        verbose_name=_("Featured media"),
    )
    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_stories",
        verbose_name=_("Attachments"),
        help_text=_("Document attachments linked to this story."),
    )

    source_url = models.URLField(
        _("Source URL"),
        max_length=500,
        blank=True,
        help_text=_("Original URL of the source used for this story's content."),
    )
    source_name = models.CharField(
        _("Source Name"),
        max_length=200,
        blank=True,
        help_text=_("Name of the source (e.g. 'Ajuntament de Cabrera de Mar', 'Museu de Cabrera de Mar')."),
    )

    class Meta:
        ordering = ("slug", "id")
        verbose_name = _("Story")
        verbose_name_plural = _("Stories")

    def __str__(self) -> str:
        title = self.safe_translation_getter("title", any_language=True) or _("Story")
        return f"{title}"

    @property
    def created_at(self):
        """Alias for fecha_creacion from BaseModel."""
        return self.fecha_creacion

    @property
    def updated_at(self):
        """Alias for fecha_modificacion from BaseModel."""
        return self.fecha_modificacion

    def save(self, *args, **kwargs):
        # Auto-assign default category if not set
        if not self.category_id:
            default_category = StoryCategorySingleton.get_default_category()
            if default_category:
                self.category = default_category

        # ContentBase handles slug generation, but we override to use translated title
        if not self.slug:
            self.slug = self._generate_unique_slug()

        self.full_clean()
        super().save(*args, **kwargs)

    def _generate_unique_slug(self) -> str:
        """
        Generate a unique slug based on the translated title.
        """
        from django.utils.text import slugify

        if self.pk:
            base_title = (
                self.safe_translation_getter("title", any_language=True) or "story"
            )
        else:
            base_title = getattr(self, "title", None) or "story"
        base_slug = slugify(base_title) or "story"
        slug_candidate = base_slug
        counter = 2

        while Story.objects.filter(slug=slug_candidate).exclude(pk=self.pk).exists():
            slug_candidate = f"{base_slug}-{counter}"
            counter += 1

        return slug_candidate
