from __future__ import annotations

import logging

from django.conf import settings
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import StaticPage
from .serializers import StaticPageSerializer

logger = logging.getLogger(__name__)


class StaticPageViewSet(viewsets.ModelViewSet):
    queryset = StaticPage.objects.all()
    serializer_class = StaticPageSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        qs = StaticPage.objects.all()
        params = self.request.query_params

        template = params.get("template")
        if template:
            qs = qs.filter(template=template)

        slug = params.get("slug")
        if slug:
            qs = qs.filter(slug=slug)

        is_published = params.get("is_published")
        if is_published is not None:
            if is_published in ["true", "1", "True"]:
                qs = qs.filter(is_published=True)
            elif is_published in ["false", "0", "False"]:
                qs = qs.filter(is_published=False)

        search = params.get("search") or params.get("q")
        if search:
            qs = qs.filter(
                Q(translations__titulo__icontains=search)
                | Q(translations__cuerpo__icontains=search)
                | Q(slug__icontains=search)
            ).distinct()

        return qs

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, pk=None):
        page = self.get_object()

        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        default_targets = [lang for lang in configured_langs if lang != source_lang]
        target_langs = request.data.get("target_langs", default_targets)

        if source_lang not in page.get_available_languages():
            return Response(
                {"success": False, "error": f"Page has no content in {source_lang} to translate from"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        page.set_current_language(source_lang)
        source_title = page.titulo
        source_body = page.cuerpo or ""

        if not source_title:
            return Response(
                {"success": False, "error": f"Page has no content in {source_lang} to translate from"},
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
                translated_title = translate_text(
                    text=source_title,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    log_translation=True,
                )

                translated_body = ""
                if source_body:
                    translated_body = translate_text(
                        text=source_body,
                        source_lang=source_lang,
                        target_lang=target_lang,
                        log_translation=True,
                    )

                page.set_current_language(target_lang, initialize=True)
                page.titulo = translated_title
                page.cuerpo = translated_body
                page.save_translations()

                translations[target_lang] = {
                    "titulo": translated_title,
                    "cuerpo": translated_body,
                }

                logger.info(f"Translated static page {page.id} to {target_lang}: '{translated_title}'")

            except TranslationError as e:
                error_msg = str(e)
                errors[target_lang] = error_msg
                logger.error(f"Failed to translate static page {page.id} to {target_lang}: {error_msg}")
            except Exception as e:
                error_msg = f"Unexpected error: {str(e)}"
                errors[target_lang] = error_msg
                logger.exception(f"Unexpected error translating static page {page.id} to {target_lang}")

        return Response(
            {
                "success": len(errors) == 0,
                "source_lang": source_lang,
                "translations": translations,
                "errors": errors,
            },
            status=status.HTTP_200_OK if len(errors) == 0 else status.HTTP_207_MULTI_STATUS,
        )
