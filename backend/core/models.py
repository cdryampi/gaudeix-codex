from __future__ import annotations

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
from parler.models import TranslatableModel, TranslatedFields


class BaseModel(models.Model):
    """
    Modelo base abstracto que proporciona campos de auditoría comunes.

    Incluye información sobre quién creó y modificó el registro,
    así como las fechas de creación y modificación.
    """

    creado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="%(class)s_creados",
        null=True,
        blank=True,
        editable=False,
        verbose_name="Creat per",
        help_text="Usuari que va crear el registre",
    )

    modificado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="%(class)s_modificados",
        null=True,
        blank=True,
        editable=False,
        verbose_name="Modificat per",
        help_text="Últim usuari que va modificar el registre",
    )

    fecha_creacion = models.DateTimeField(
        default=timezone.now,
        editable=False,
        verbose_name="Data de creació",
        help_text="Data de creació",
    )

    fecha_modificacion = models.DateTimeField(
        auto_now=True,
        editable=False,
        verbose_name="Data de modificació",
        help_text="Data de modificació",
    )

    class Meta:
        abstract = True

    def __str__(self) -> str:
        return str(self.pk)


class MetadataModel(models.Model):
    """
    Modelo base abstracto para metadatos SEO.

    Proporciona campos para metatítulo y metadescripción
    que pueden ser usados para optimización en motores de búsqueda.
    """

    metatitulo = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        verbose_name="Metatítol",
        help_text="Metatítol per a SEO",
    )

    metadescripcion = models.TextField(
        null=True,
        blank=True,
        verbose_name="Metadescripció",
        help_text="Metadescripció per a SEO",
    )

    class Meta:
        abstract = True


class ContentBase(BaseModel, MetadataModel):
    """
    Modelo base abstracto para contenido con slug.

    Combina auditoría (BaseModel) y metadatos SEO (MetadataModel).

    NOTA: Este modelo NO incluye TranslatableModel ni TranslatedFields
    porque los modelos abstractos no pueden tener TranslatedFields.
    Los modelos concretos que hereden de esta clase deberán:
    1. Heredar de TranslatableModel además de ContentBase
    2. Definir sus propios TranslatedFields

    Ejemplo de uso en un modelo concreto:

        class BlogPost(TranslatableModel, ContentBase):
            translations = TranslatedFields(
                titulo=models.CharField(max_length=200),
                contenido=models.TextField()
            )
    """

    slug = models.SlugField(
        max_length=150,
        unique=True,
        verbose_name="Slug",
        help_text="Identificador únic per a URLs",
    )

    class Meta:
        abstract = True

    def __str__(self) -> str:
        # Fallback al slug
        if self.slug:
            return self.slug

        # Último fallback
        return f"{self.__class__.__name__} #{self.pk}"


class Category(TranslatableModel, BaseModel, MetadataModel):
    """
    Modelo de categoría genérica traducible.

    Puede ser usado para clasificar diferentes tipos de contenido
    mediante el campo 'taxonomy' (ej: theme, audience, season, etc.).

    Soporta traducciones en múltiples idiomas para nombre y descripción.
    """

    class TaxonomyChoices(models.TextChoices):
        """Available taxonomy types for categories."""

        EVENTS = "events", "Eventos"
        PLACES = "places", "Lugares"
        TEMPLATE = "template", "Plantilla"
        THEME = "theme", "Tema"
        AUDIENCE = "audience", "Audiencia"
        SEASON = "season", "Temporada"
        NEWS = "news", "Noticias"
        OTHER = "other", "Otro"

    slug = models.SlugField(
        max_length=150,
        unique=True,
        verbose_name="Slug",
        help_text="Identificador únic per a la categoria",
    )

    translations = TranslatedFields(
        nombre=models.CharField(
            max_length=150, verbose_name="Nom", help_text="Nom de la categoria"
        ),
        descripcion=models.TextField(
            blank=True,
            verbose_name="Descripció",
            help_text="Descripció de la categoria",
        ),
    )

    taxonomy = models.CharField(
        max_length=50,
        blank=True,
        choices=TaxonomyChoices.choices,
        verbose_name="Taxonomia",
        help_text="Tipus de taxonomia (p.ex. events, places, template...)",
    )

    parent = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="children",
        verbose_name="Pare",
        help_text="Categoria pare (opcional)",
    )

    icon = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Icona",
        help_text="Identificador d'icona per mostrar al front/back office",
    )

    is_published = models.BooleanField(
        default=True,
        verbose_name="Publicada",
        help_text="Si la categoria esta publicada",
    )

    featured_media = models.ForeignKey(
        "media_files.ImageFile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="featured_in_categories",
        verbose_name="Media destacada",
        help_text="Imagen destacada para la categoria",
    )

    attachments = models.ManyToManyField(
        "media_files.DocumentFile",
        blank=True,
        related_name="attached_to_categories",
        verbose_name="Adjuntos",
        help_text="Documentos adjuntos de la categoria",
    )

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ("slug",)

    def __str__(self) -> str:
        nombre = self.safe_translation_getter("nombre", any_language=True)
        return nombre if nombre else self.slug

    def clean(self):
        super().clean()
        parent = self.parent
        seen: set[int] = set()
        depth = 0
        while parent:
            # Avoid self reference or cycles
            if parent == self or (self.pk and parent.pk == self.pk):
                raise ValidationError(
                    {"parent": "Una categoría no puede ser su propio padre."}
                )
            if parent.pk and parent.pk in seen:
                raise ValidationError(
                    {
                        "parent": "No se pueden crear ciclos en la jerarquía de categorías."
                    }
                )
            if parent.pk:
                seen.add(parent.pk)
            depth += 1
            if depth >= 3:
                raise ValidationError(
                    {"parent": "Máximo 3 niveles (raíz > hijo > nieto)."}
                )
            parent = parent.parent


class Tag(TranslatableModel, BaseModel):
    """
    Modelo de etiqueta (tag) genérica traducible.

    Permite etiquetar contenido de forma flexible.
    Más ligero que Category, ideal para taxonomías folksonómicas.

    Soporta traducciones en múltiples idiomas para el nombre.
    """

    slug = models.SlugField(
        max_length=150,
        unique=True,
        verbose_name="Slug",
        help_text="Identificador únic per a l'etiqueta",
    )

    translations = TranslatedFields(
        nombre=models.CharField(
            max_length=100, verbose_name="Nom", help_text="Nom de l'etiqueta"
        )
    )

    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"
        ordering = ("slug",)

    def __str__(self) -> str:
        nombre = self.safe_translation_getter("nombre", any_language=True)
        return nombre if nombre else self.slug
