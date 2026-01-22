"""
Complete LLM Translation Demo with LM Studio (Mistral)

Demonstrates:
1. Configuration check
2. Simple translation
3. Place multi-language translation
4. Translation logs review
"""

import os
import sys
import django

# Fix encoding for Windows console
if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from llm_translations.models import LLMProviderConfig, TranslationLog
from llm_translations.utils import translate_text, TranslationError
from places.models import Place
from django.conf import settings


def separator():
    print("\n" + "─" * 70 + "\n")


def main():
    print("\n" + "=" * 70)
    print("  LLM TRANSLATION DEMO - Gaudeix Places")
    print("  Provider: LM Studio + Mistral Nemo Instruct")
    print("=" * 70)

    # 1. Show Configuration
    separator()
    print("📋 CONFIGURATION")
    config = LLMProviderConfig.get_solo()
    print(f"  Provider:    {config.get_provider_display()}")
    print(f"  Model:       {config.model_name}")
    print(f"  Temperature: {config.temperature}")
    print(f"  Max Tokens:  {config.max_tokens}")
    print(f"  Active:      {'✓ Yes' if config.is_active else '✗ No'}")
    print(f"  API URL:     {settings.LLM_LOCAL_API_URL}")

    # 2. Select a place
    separator()
    print("🏛️ SELECTING PLACE TO TRANSLATE")

    place = Place.objects.filter(translations__language_code="ca").first()

    if not place:
        print("❌ No places found with Catalan content!")
        print("   Run: python manage.py seed_places")
        return

    place.set_current_language("ca")
    print(f"\n  Place ID: {place.id}")
    print(f"  Title (CA): {place.title}")
    print(
        f"  Description: {place.description[:80]}..."
        if place.description
        else "  Description: (none)"
    )
    print(f"  Available languages: {list(place.get_available_languages())}")

    # 3. Translate to multiple languages
    separator()
    print("🌍 TRANSLATING TO MULTIPLE LANGUAGES")

    target_languages = ["es", "en", "fr"]
    results = {}

    for target_lang in target_languages:
        lang_names = {"es": "Spanish", "en": "English", "fr": "French"}
        print(f"\n  Translating to {lang_names[target_lang]}...")

        try:
            # Translate title
            translated_title = translate_text(
                text=place.title,
                source_lang="ca",
                target_lang=target_lang,
                log_translation=True,
            )

            # Translate description if exists
            if place.description:
                translated_desc = translate_text(
                    text=place.description,
                    source_lang="ca",
                    target_lang=target_lang,
                    log_translation=True,
                )
            else:
                translated_desc = ""

            # Save translation
            place.set_current_language(target_lang, initialize=True)
            place.title = translated_title
            place.description = translated_desc
            place.save_translations()

            results[target_lang] = {
                "title": translated_title,
                "description": translated_desc,
            }

            print(f"  ✓ Title: {translated_title}")
            if translated_desc:
                print(f"    Description: {translated_desc[:60]}...")

        except TranslationError as e:
            print(f"  ✗ Failed: {e}")
            results[target_lang] = None

    # 4. Verify saved translations
    separator()
    print("✅ VERIFICATION - Saved Translations")

    place.refresh_from_db()
    print(f"\n  Place now has {len(place.get_available_languages())} languages:")

    for lang_code in place.get_available_languages():
        place.set_current_language(lang_code)
        lang_names = {
            "ca": "🇦🇩 Catalan",
            "es": "🇪🇸 Spanish",
            "en": "🇬🇧 English",
            "fr": "🇫🇷 French",
        }
        print(f"\n  {lang_names.get(lang_code, lang_code)}:")
        print(f"    Title: {place.title}")
        if place.description:
            print(f"    Description: {place.description[:70]}...")

    # 5. Show translation logs
    separator()
    print("📊 TRANSLATION LOGS (Last 5)")

    logs = TranslationLog.objects.filter(provider="local", success=True).order_by(
        "-created_at"
    )[:5]

    if logs.exists():
        print()
        for log in logs:
            print(
                f"  {log.created_at.strftime('%H:%M:%S')} | "
                f"{log.source_language} → {log.target_language} | "
                f"{log.tokens_used} tokens | "
                f"{log.source_text[:30]}..."
            )
    else:
        print("  (No logs found)")

    # 6. Statistics
    separator()
    print("📈 STATISTICS")

    total_translations = TranslationLog.objects.filter(provider="local").count()
    successful = TranslationLog.objects.filter(provider="local", success=True).count()
    failed = TranslationLog.objects.filter(provider="local", success=False).count()
    total_tokens = (
        TranslationLog.objects.filter(provider="local", success=True).aggregate(
            total=models.Sum("tokens_used")
        )["total"]
        or 0
    )

    print(f"\n  Total translations: {total_translations}")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print(f"  Total tokens used: {total_tokens:,}")
    print(
        f"  Average tokens/translation: {total_tokens // successful if successful else 0}"
    )

    # Success message
    separator()
    print("✨ DEMO COMPLETED SUCCESSFULLY!")
    print()
    print("  The place has been translated to:")
    for lang in target_languages:
        status = "✓" if results.get(lang) else "✗"
        print(f"    {status} {lang.upper()}")

    print("\n  You can now:")
    print("    • View the place in the backoffice (/dashboard/places)")
    print("    • View the place in the frontend (/places/{slug})")
    print("    • Check translation logs in admin or backoffice")
    print()
    print("=" * 70)
    print()


if __name__ == "__main__":
    from django.db import models

    main()
