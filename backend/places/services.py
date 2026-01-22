from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from django.conf import settings
from llm_translations.utils import TranslationError, translate_text

if TYPE_CHECKING:
    from .models import Place

logger = logging.getLogger(__name__)


def auto_translate_place(
    place: Place,
    source_lang: str | None = None,
    target_langs: list[str] | None = None,
) -> dict[str, Any]:
    """
    Service to auto-translate a Place model using LLM.
    
    Returns a dictionary with results of the operation.
    """
    if not source_lang:
        source_lang = settings.LANGUAGE_CODE
        
    configured_langs = [lang[0] for lang in settings.LANGUAGES]
    if not target_langs:
        target_langs = [lang for lang in configured_langs if lang != source_lang]

    if source_lang not in place.get_available_languages():
        raise TranslationError(f"Place has no content in {source_lang} to translate from")

    place.set_current_language(source_lang)
    source_title = place.title
    source_description = place.description or ""

    if not source_title:
         raise TranslationError(f"Place has no content in {source_lang} to translate from")

    translations = {}
    errors = {}

    for target_lang in target_langs:
        if target_lang not in configured_langs:
            continue
            
        try:
            translated_title = translate_text(
                text=source_title,
                source_lang=source_lang,
                target_lang=target_lang,
                log_translation=True,
            )

            translated_description = ""
            if source_description:
                translated_description = translate_text(
                    text=source_description,
                    source_lang=source_lang,
                    target_lang=target_lang,
                    log_translation=True,
                )

            place.set_current_language(target_lang, initialize=True)
            place.title = translated_title
            place.description = translated_description
            place.save_translations()

            translations[target_lang] = {
                "title": translated_title,
                "description": translated_description,
            }

            logger.info(
                f"Translated place {place.id} to {target_lang}: '{translated_title}'"
            )

        except TranslationError as e:
            error_msg = str(e)
            errors[target_lang] = error_msg
            logger.error(
                f"Failed to translate place {place.id} to {target_lang}: {error_msg}"
            )
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            errors[target_lang] = error_msg
            logger.exception(
                f"Unexpected error translating place {place.id} to {target_lang}"
            )

    return {
        "success": len(errors) == 0,
        "source_lang": source_lang,
        "translations": translations,
        "errors": errors,
    }
