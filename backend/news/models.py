from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from parler.models import TranslatableModel, TranslatedFields
from core.models import ContentBase

class News(ContentBase, TranslatableModel):
    """
    Model for news and announcements.
    """
    translations = TranslatedFields(
        title=models.CharField(_("Title"), max_length=200),
        summary=models.TextField(_("Summary"), blank=True),
        body=models.TextField(_("Body"), blank=True),
    )
    
    is_published = models.BooleanField(_("Is published"), default=True)
    published_at = models.DateTimeField(_("Published at"), default=timezone.now)
    
    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_news",
        verbose_name=_("Featured media"),
    )

    class Meta:
        ordering = ("-published_at", "-id")
        verbose_name = _("News")
        verbose_name_plural = _("News")

    def __str__(self) -> str:
        return f"News {self.pk}"

    def save(self, *args, **kwargs):
        # Slug generation logic handled safely
        if not self.slug:
            from django.utils.text import slugify
            # In Parler, if PK is not set, we can't always get the translation safely in some contexts,
            # but usually it's fine if it was set before save.
            try:
                title = self.safe_translation_getter("title", any_language=True) or "news"
            except:
                title = "news"
            
            self.slug = slugify(title) or "news"
            
            # Simple unique check
            if not self.pk:
                orig_slug = self.slug
                count = 1
                while News.objects.filter(slug=self.slug).exists():
                    self.slug = f"{orig_slug}-{count}"
                    count += 1
        super().save(*args, **kwargs)
