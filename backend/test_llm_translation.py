"""
Test script for LLM translations with LM Studio (Mistral).

This script tests:
1. Connection to LM Studio
2. Basic translation
3. Place auto-translation
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

from llm_translations.models import LLMProviderConfig
from llm_translations.utils import translate_text, TranslationError
from places.models import Place


def print_header(title):
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_llm_configuration():
    """Test 1: Verify LLM configuration"""
    print_header("Test 1: LLM Configuration")

    config = LLMProviderConfig.get_solo()
    print(f"✓ Provider: {config.provider}")
    print(f"✓ Model: {config.model_name}")
    print(f"✓ Active: {config.is_active}")
    print(f"✓ Temperature: {config.temperature}")
    print(f"✓ Max tokens: {config.max_tokens}")

    # Check if local API URL is configured
    from django.conf import settings

    local_url = getattr(settings, "LLM_LOCAL_API_URL", None)
    print(f"✓ Local API URL: {local_url or 'Not set (using default)'}")

    return config


def test_basic_translation():
    """Test 2: Basic text translation"""
    print_header("Test 2: Basic Translation (CA -> ES)")

    test_text = "Hola món! Aquest és un text de prova."
    print(f"Original (CA): {test_text}")

    try:
        translated = translate_text(
            text=test_text, source_lang="ca", target_lang="es", log_translation=True
        )
        print(f"✓ Translated (ES): {translated}")
        return True
    except TranslationError as e:
        print(f"✗ Translation failed: {e}")
        return False


def test_place_auto_translation():
    """Test 3: Place auto-translation"""
    print_header("Test 3: Place Auto-Translation")

    # Get first place with Catalan content
    place = Place.objects.first()
    if not place:
        print("✗ No places found in database. Run seed_places first.")
        return False

    print(f"Place ID: {place.id}")
    place.set_current_language("ca")
    print(f"Original title (CA): {place.title}")
    print(
        f"Original description (CA): {place.description[:100] if place.description else 'None'}..."
    )

    # Get available languages before translation
    available_before = place.get_available_languages()
    print(f"Languages before: {available_before}")

    # Translate to Spanish
    try:
        print("\nTranslating to Spanish...")
        es_title = translate_text(
            text=place.title, source_lang="ca", target_lang="es", log_translation=True
        )

        if place.description:
            es_description = translate_text(
                text=place.description,
                source_lang="ca",
                target_lang="es",
                log_translation=True,
            )
        else:
            es_description = ""

        # Save Spanish translation
        place.set_current_language("es", initialize=True)
        place.title = es_title
        place.description = es_description
        place.save_translations()

        print(f"✓ Spanish title: {es_title}")
        print(
            f"✓ Spanish description: {es_description[:100] if es_description else 'None'}..."
        )

        # Verify it was saved
        place.refresh_from_db()
        available_after = place.get_available_languages()
        print(f"Languages after: {available_after}")

        return True

    except TranslationError as e:
        print(f"✗ Translation failed: {e}")
        return False


def test_connection_to_lm_studio():
    """Test 0: Connection to LM Studio"""
    print_header("Test 0: LM Studio Connection")

    import requests
    from django.conf import settings

    base_url = getattr(settings, "LLM_LOCAL_API_URL", "http://127.0.0.1:1234")

    try:
        # Try to list models
        response = requests.get(f"{base_url}/v1/models", timeout=5)
        if response.status_code == 200:
            models = response.json()
            print(f"✓ Connected to LM Studio at {base_url}")
            if "data" in models and len(models["data"]) > 0:
                print(f"✓ Models available: {len(models['data'])}")
                for model in models["data"]:
                    print(f"  - {model.get('id', 'unknown')}")
            else:
                print("⚠ No models loaded in LM Studio")
            return True
        else:
            print(f"✗ LM Studio returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"✗ Cannot connect to LM Studio at {base_url}")
        print("  Make sure LM Studio is running and has a model loaded.")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 60)
    print("  LLM Translation Test Suite")
    print("  Testing with LM Studio + Mistral Nemo")
    print("=" * 60)

    results = []

    # Test 0: Connection
    results.append(("LM Studio Connection", test_connection_to_lm_studio()))

    # Test 1: Configuration
    try:
        test_llm_configuration()
        results.append(("LLM Configuration", True))
    except Exception as e:
        print(f"✗ Configuration error: {e}")
        results.append(("LLM Configuration", False))

    # Test 2: Basic translation
    results.append(("Basic Translation", test_basic_translation()))

    # Test 3: Place auto-translation
    results.append(("Place Auto-Translation", test_place_auto_translation()))

    # Summary
    print_header("Summary")
    total = len(results)
    passed = sum(1 for _, result in results if result)

    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! LLM translation is working correctly.")
    else:
        print(
            f"\n⚠ {total - passed} test(s) failed. Check the output above for details."
        )


if __name__ == "__main__":
    main()
