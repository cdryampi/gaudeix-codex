from __future__ import annotations

import logging

from django.conf import settings
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Category
from .serializers import CategorySerializer

logger = logging.getLogger(__name__)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoints for categories (core).
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Category.objects.all()
        params = self.request.query_params

        taxonomy = params.get("taxonomy")
        if taxonomy:
            queryset = queryset.filter(taxonomy=taxonomy)

        slug = params.get("slug")
        if slug:
            queryset = queryset.filter(slug=slug)

        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(
                Q(translations__nombre__icontains=search) | Q(translations__descripcion__icontains=search)
            ).distinct()

        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, pk=None):
        """
        Auto-translate category name/description to target languages.
        Does not touch slug or taxonomy.
        """
        category = self.get_object()

        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        if source_lang not in category.get_available_languages():
            return Response(
                {"success": False, "error": f"Category has no content in {source_lang} to translate from"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        category.set_current_language(source_lang)
        source_nombre = category.nombre
        source_descripcion = category.descripcion or ""

        if not source_nombre:
            return Response(
                {"success": False, "error": f"Category has no content in {source_lang} to translate from"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from llm_translations.utils import TranslationError, translate_text
        except ImportError:
            return Response(
                {"success": False, "error": "LLM translation module not available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        translations = {}
        errors = {}

        for target_lang in target_langs:
            try:
                translated_nombre = translate_text(
                    text=source_nombre,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    log_translation=True,
                )

                translated_descripcion = ""
                if source_descripcion:
                    translated_descripcion = translate_text(
                        text=source_descripcion,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                category.set_current_language(target_lang, initialize=True)
                category.nombre = translated_nombre
                category.descripcion = translated_descripcion
                category.save_translations()

                translations[target_lang] = {
                    "nombre": translated_nombre,
                    "descripcion": translated_descripcion,
                }

                logger.info(f"Translated category {category.id} to {target_lang}: '{translated_nombre}'")

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(f"Failed to translate category {category.id} to {target_lang}: {error_msg}")
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(f"Unexpected error translating category {category.id} to {target_lang}")

        return Response(
            {
                "success": len(errors) == 0,
                "source_lang": source_lang,
                "translations": translations,
                "errors": errors,
            },
            status=status.HTTP_200_OK if len(errors) == 0 else status.HTTP_207_MULTI_STATUS,
        )
