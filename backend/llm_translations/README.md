# LLM Translations App

Django app for AI-powered content translation using multiple LLM providers with a modular, extensible architecture.

## Features

- **Multi-provider support**: OpenAI, Google Gemini, Anthropic Claude, Mistral AI, Groq, Local LLMs
- **Modular architecture**: Each provider in separate file for easy maintenance
- **Singleton configuration**: Centralized provider and model selection
- **Translation logging**: Track usage, costs, and errors
- **Event auto-translation**: Translate event titles and descriptions to all configured languages
- **REST API**: Full API for configuration and manual translation

## Project Structure

```
llm_translations/
├── models.py                    # Configuration and logging models
├── utils.py                     # Main translation interface
├── serializers.py               # DRF serializers
├── views.py                     # API ViewSets
├── admin.py                     # Django admin configuration
├── urls.py                      # API routes
├── tests.py                     # Unit tests
├── providers/                   # Modular provider implementations
│   ├── __init__.py             # Provider exports
│   ├── base.py                 # Base provider class and shared utilities
│   ├── openai_provider.py      # OpenAI GPT models
│   ├── gemini_provider.py      # Google Gemini models
│   ├── anthropic_provider.py   # Anthropic Claude models
│   ├── mistral_provider.py     # Mistral AI models
│   ├── groq_provider.py        # Groq inference API
│   └── local_provider.py       # Local LLMs (Ollama, LM Studio)
└── README.md                    # This file
```

## Architecture

### Provider Pattern

Each LLM provider inherits from `BaseProvider` and implements the `translate()` method:

```python
from llm_translations.providers import BaseProvider, TranslationResult

class CustomProvider(BaseProvider):
    def translate(self, text, source_lang, target_lang, model, temperature, max_tokens):
        # Provider-specific implementation
        return TranslationResult(
            translated_text="...",
            tokens_used=123,
            provider="custom",
            model=model
        )
```

### Main Translation Flow

1. **User calls** `translate_text()` from `utils.py`
2. **Configuration loaded** from `LLMProviderConfig` singleton
3. **Provider instantiated** via `get_provider()` factory
4. **Translation executed** by provider's `translate()` method
5. **Result logged** to `TranslationLog` model
6. **Translated text returned** to caller

## Models

### LLMProviderConfig (Singleton)

Configuration for the active LLM provider.

**Fields**:
- `provider`: Choice field (openai, gemini, anthropic, mistral, groq, local)
- `model_name`: Specific model to use
- `is_active`: Enable/disable LLM translation globally
- `temperature`: Controls randomness (0.0-2.0, default 0.3)
- `max_tokens`: Maximum tokens for output (default 2000)

**Supported Models**:
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo
- **Gemini**: Gemini 2.0 Flash, Gemini 1.5 Pro
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Mistral**: Mistral Large
- **Groq**: Llama 3.1 70B
- **Local**: Mistral Nemo Instruct (via Ollama/LM Studio)

### TranslationLog

Audit log for all translation requests.

**Fields**:
- `provider`, `model_name`: Which LLM was used
- `source_text`, `translated_text`: Original and translated content
- `source_language`, `target_language`: Language codes (ca, es, en, fr)
- `tokens_used`: Token consumption
- `cost_estimate`: Estimated cost in USD
- `success`: Whether translation succeeded
- `error_message`: Error details if failed
- `created_at`: Timestamp

## API Endpoints

### LLM Configuration

**GET /api/v1/llm-config/**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/llm-config/
```

**PATCH /api/v1/llm-config/1/**
```bash
curl -X PATCH \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"provider":"local","model_name":"mistralai/mistral-nemo-instruct-2407","temperature":0.3}' \
  http://localhost:8000/api/v1/llm-config/1/
```

### Manual Translation

**POST /api/v1/llm-config/translate/**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola món","source_lang":"ca","target_lang":"en"}' \
  http://localhost:8000/api/v1/llm-config/translate/
```

Response:
```json
{
  "original_text": "Hola món",
  "translated_text": "Hello world",
  "source_lang": "ca",
  "target_lang": "en",
  "provider": "local",
  "model": "mistralai/mistral-nemo-instruct-2407",
  "success": true
}
```

### Event Auto-Translation

**POST /api/v1/events/{id}/auto_translate/**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"source_lang":"ca","target_langs":["es","en","fr"]}' \
  http://localhost:8000/api/v1/events/4/auto_translate/
```

Response:
```json
{
  "success": true,
  "source_lang": "ca",
  "translations": {
    "es": {
      "title": "Maratón de Cine",
      "description": "..."
    },
    "en": {
      "title": "Film Marathon",
      "description": "..."
    },
    "fr": {
      "title": "Marathon de Cinéma",
      "description": "..."
    }
  },
  "errors": {}
}
```

### Translation Logs

**GET /api/v1/translation-logs/**
```bash
# All logs
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/translation-logs/

# Filter by provider
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/translation-logs/?provider=local

# Filter by success
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/v1/translation-logs/?success=true
```

## Environment Variables

Add to `backend/.env`:

```env
# LLM Translation Configuration
LLM_OPENAI_API_KEY=sk-...
LLM_GEMINI_API_KEY=...
LLM_ANTHROPIC_API_KEY=...
LLM_MISTRAL_API_KEY=...
LLM_GROQ_API_KEY=...
LLM_LOCAL_API_URL=http://127.0.0.1:1234
```

**Local LLM Setup** (Ollama/LM Studio):
1. Install Ollama or LM Studio
2. Start server on default port (1234 for LM Studio)
3. Set `LLM_LOCAL_API_URL` to server URL (without `/v1` suffix)
4. Select a local model in Django admin

## Usage

### 1. Configure Provider (Django Admin)

1. Navigate to **Admin → LLM Provider Configuration**
2. Select provider (e.g., `local` for LM Studio)
3. Select model (e.g., `mistralai/mistral-nemo-instruct-2407`)
4. Set temperature (0.3 recommended for translations)
5. Enable `is_active`
6. Save

### 2. Translate Text Programmatically

```python
from llm_translations.utils import translate_text, TranslationError

try:
    result = translate_text(
        text="Hola món",
        source_lang="ca",
        target_lang="en",
        log_translation=True
    )
    print(result)  # "Hello world"
except TranslationError as e:
    print(f"Translation failed: {e}")
```

### 3. Auto-Translate Events

```python
# Via API (recommended)
POST /api/v1/events/123/auto_translate/

# Or programmatically
from events.models import Event
from llm_translations.utils import translate_text

event = Event.objects.get(id=123)
event.set_current_language('ca')
source_title = event.title

event.set_current_language('en', initialize=True)
event.title = translate_text(source_title, 'ca', 'en')
event.save_translations()
```

### 4. Switch Providers

```python
from llm_translations.models import LLMProviderConfig

config = LLMProviderConfig.get_config()
config.provider = LLMProviderConfig.Provider.OPENAI
config.model_name = LLMProviderConfig.Model.GPT_4O_MINI
config.save()

# Next translation will use OpenAI
```

## Adding a New Provider

1. **Create provider file** in `providers/` directory:

```python
# providers/custom_provider.py
from .base import BaseProvider, TranslationResult

class CustomProvider(BaseProvider):
    def __init__(self, api_key: str):
        super().__init__(api_key=api_key)
        # Initialize your client
        
    def translate(self, text, source_lang, target_lang, model, temperature, max_tokens):
        # Implement translation logic
        prompt = self.build_translation_prompt(text, source_lang, target_lang)
        
        # Call your LLM API
        response = self.client.complete(...)
        
        return TranslationResult(
            translated_text=response.text,
            tokens_used=response.tokens,
            provider="custom",
            model=model
        )
```

2. **Export in `providers/__init__.py`**:

```python
from .custom_provider import CustomProvider

__all__ = [..., 'CustomProvider']
```

3. **Add to `models.py` choices**:

```python
class Provider(models.TextChoices):
    # ...existing providers...
    CUSTOM = "custom", "Custom LLM"
```

4. **Add to `utils.py` factory**:

```python
def get_provider(provider_name: str, config: LLMProviderConfig) -> BaseProvider:
    match provider_name:
        # ...existing cases...
        case LLMProviderConfig.Provider.CUSTOM:
            if not settings.LLM_CUSTOM_API_KEY:
                raise TranslationError("Custom API key not configured")
            return CustomProvider(api_key=settings.LLM_CUSTOM_API_KEY)
```

5. **Add environment variable** to `config/settings/base.py`:

```python
LLM_CUSTOM_API_KEY = env("LLM_CUSTOM_API_KEY", default="")
```

## Error Handling

All errors raise `TranslationError` with descriptive messages:

- **Missing API key**: `"OpenAI API key not configured"`
- **Missing package**: `"openai package not installed. Run: pip install openai"`
- **Translation disabled**: `"LLM translation is currently disabled in configuration"`
- **Empty source**: `"Event has no content in ca to translate from"`
- **API errors**: `"Translation failed: Error code: 404 - {...}"`

All errors are logged to `TranslationLog` with `success=False`.

## Testing

### Run All Tests

```bash
cd backend
pytest llm_translations/tests.py -v
```

### Run Specific Tests

```bash
# Test local provider only
pytest llm_translations/tests.py::TestTranslateWithLocal -v

# Test configuration
pytest llm_translations/tests.py::TestLLMProviderConfig -v
```

### Test Coverage

```bash
pytest llm_translations/tests.py --cov=llm_translations --cov-report=html
```

## Cost Tracking

Review translation costs via:
- **Django Admin** → Translation Logs
- **API**: `GET /api/v1/translation-logs/?provider=openai`

Cost estimates are calculated based on token usage and provider pricing.

## Security

- ✅ API keys stored in environment variables, never in code
- ✅ All endpoints require authentication
- ✅ Translation logs are read-only via API
- ✅ Singleton config prevents accidental deletion
- ✅ Error messages don't expose sensitive data

## Performance

- **Local LLMs**: 0 API cost, slower inference
- **Groq**: Fastest inference, free tier available
- **OpenAI/Anthropic**: High quality, paid only
- **Gemini**: Good balance, generous free tier

For production, consider:
- Caching translations (implement in views layer)
- Async processing for bulk translations
- Rate limiting for external APIs

## Troubleshooting

### Local LLM Connection Errors

```python
# Check server is running
curl http://127.0.0.1:1234/v1/models

# Verify URL in .env (no trailing slash)
LLM_LOCAL_API_URL=http://127.0.0.1:1234
```

### Parler Translation Not Saving

```python
# Always use initialize=True and save_translations()
event.set_current_language('en', initialize=True)
event.title = "Translated title"
event.save_translations()  # Not save()!
```

### Provider Import Errors

```bash
# Install missing packages
pip install openai google-generativeai anthropic mistralai groq
```

## License

See project root LICENSE file.
