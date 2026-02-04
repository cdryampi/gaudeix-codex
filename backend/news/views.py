from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .models import News
from .serializers import NewsSerializer
import logging

logger = logging.getLogger(__name__)


class NewsViewSet(viewsets.ModelViewSet):
    """
    API endpoints for news.
    """

    queryset = News.objects.all().select_related("featured_media", "category")
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = self.queryset
        params = self.request.query_params

        is_published = params.get("is_published")
        if is_published is not None:
            normalized = is_published.lower()
            if normalized in {"true", "1", "yes"}:
                queryset = queryset.filter(is_published=True)
            elif normalized in {"false", "0", "no"}:
                queryset = queryset.filter(is_published=False)

        search = params.get("search") or params.get("q")
        if search:
            queryset = queryset.filter(translations__title__icontains=search).distinct()

        # Filter by category (id or slug)
        category = params.get("category")
        if category:
            if category.isdigit():
                queryset = queryset.filter(category_id=int(category))
            else:
                queryset = queryset.filter(category__slug=category)

        return queryset

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def auto_translate(self, request, pk=None):
        """
        Auto-translate news to all configured languages using LLM.
        """
        news = self.get_object()
        source_lang = request.data.get("source_lang", settings.LANGUAGE_CODE)
        configured_langs = [lang[0] for lang in settings.LANGUAGES]
        target_langs = request.data.get(
            "target_langs", [l for l in configured_langs if l != source_lang]
        )

        news.set_current_language(source_lang)
        if not news.title:
            return Response(
                {"success": False, "error": f"News has no content in {source_lang}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from llm_translations.utils import translate_text, TranslationError
        except ImportError:
            return Response(
                {"success": False, "error": "LLM translation module not available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        translations = {}
        errors = {}

        for target_lang in target_langs:
            try:
                trans_title = translate_text(
                    text=news.title, source_lang=source_lang, target_lang=target_lang
                )
                trans_summary = (
                    translate_text(
                        text=news.summary,
                        source_lang=source_lang,
                        target_lang=target_lang,
                    )
                    if news.summary
                    else ""
                )
                trans_body = (
                    translate_text(
                        text=news.body, source_lang=source_lang, target_lang=target_lang
                    )
                    if news.body
                    else ""
                )

                news.set_current_language(target_lang, initialize=True)
                news.title = trans_title
                news.summary = trans_summary
                news.body = trans_body
                news.save_translations()

                translations[target_lang] = {
                    "title": trans_title,
                    "summary": trans_summary,
                    "body": trans_body,
                }
            except Exception as e:
                errors[target_lang] = str(e)

        return Response(
            {"success": not errors, "translations": translations, "errors": errors},
            status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS,
        )
