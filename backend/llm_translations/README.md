# LLM Translations App

Django app for AI-powered content translation using multiple LLM providers.

## Features

- **Multi-provider support**: OpenAI, Google Gemini, Anthropic Claude, Mistral AI, Groq
- **Singleton configuration**: Centralized provider and model selection
- **Translation logging**: Track usage, costs, and errors
- **Event auto-translation**: Translate event titles and descriptions to all configured languages
- **REST API**: Full API for configuration and manual translation

## Models

### LLMProviderConfig (Singleton)

Configuration for the active LLM provider.

**Fields**:
- `provider`: Choice field (openai, gemini, anthropic, mistral, groq)
- `model_name`: Specific model to use (e.g., gpt-4o-mini, gemini-2.0-flash-exp)
- `is_active`: Enable/disable LLM translation globally
- `temperature`: Controls randomness (0.0-2.0, default 0.3)
- `max_tokens`: Maximum tokens for output (default 2000)

**Supported Models**:
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo
- **Gemini**: Gemini 2.0 Flash, Gemini 1.5 Pro
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku
- **Mistral**: Mistral Large
- **Groq**: Llama 3.1 70B

### TranslationLog

Audit log for all translation requests.

**Fields**:
- `provider`, `model_name`: Which LLM was used
- `source_text`, `translated_text`: Original and translated content
- `source_language`, `target_language`: Language codes
- `tokens_used`: Token consumption
- `cost_estimate`: Estimated cost in USD
- `success`: Whether translation succeeded
- `error_message`: Error details if failed
- `created_at`: Timestamp

## API Endpoints

### LLM Configuration

**GET /api/v1/llm-config/**
- Get current LLM provider configuration
- Auth: Required

**PATCH /api/v1/llm-config/{id}/**
- Update LLM configuration
- Auth: Required
- Body: `{ "provider": "openai", "model_name": "gpt-4o-mini", "temperature": 0.3 }`

### Manual Translation

**POST /api/v1/llm-config/translate/**
- Translate text using configured LLM
- Auth: Required
- Body:
  ```json
  {
    "text": "Hola món",
    "source_lang": "ca",
    "target_lang": "en",
    "log_translation": true
  }
  ```
- Response:
  ```json
  {
    "original_text": "Hola món",
    "translated_text": "Hello world",
    "source_lang": "ca",
    "target_lang": "en",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "success": true
  }
  ```

### Event Auto-Translation

**POST /api/v1/events/{id}/auto_translate/**
- Auto-translate event to all configured languages
- Auth: Required
- Body (optional):
  ```json
  {
    "source_lang": "ca",
    "target_langs": ["es", "en", "fr"]
  }
  ```
- Response:
  ```json
  {
    "success": true,
    "source_lang": "ca",
    "translations": {
      "es": {"title": "...", "description": "..."},
      "en": {"title": "...", "description": "..."},
      "fr": {"title": "...", "description": "..."}
    },
    "errors": {}
  }
  ```

### Translation Logs

**GET /api/v1/translation-logs/**
- List all translation logs
- Auth: Required
- Query params: `provider`, `success`, `source_lang`, `target_lang`

## Environment Variables

Add to `backend/.env`:

```env
# LLM Translation Configuration
LLM_OPENAI_API_KEY=sk-...
LLM_GEMINI_API_KEY=...
LLM_ANTHROPIC_API_KEY=...
LLM_MISTRAL_API_KEY=...
LLM_GROQ_API_KEY=...
```

**Note**: You only need to configure the API key for the provider you intend to use.

## Usage

### 1. Configure Provider

Access Django admin → **LLM Provider Configuration**:
1. Select provider (e.g., OpenAI)
2. Select model (e.g., GPT-4o Mini)
3. Set temperature (0.3 recommended for translations)
4. Enable `is_active`
5. Save

### 2. Auto-Translate Events

```python
# Via API
POST /api/v1/events/123/auto_translate/

# Programmatically
from llm_translations.utils import translate_text

translated = translate_text(
    text="Hola món",
    source_lang="ca",
    target_lang="en"
)
```

### 3. Switch Providers

To change providers, simply update the singleton configuration:

```python
from llm_translations.models import LLMProviderConfig

config = LLMProviderConfig.get_config()
config.provider = LLMProviderConfig.Provider.GEMINI
config.model_name = LLMProviderConfig.Model.GEMINI_2_FLASH
config.save()
```

## Error Handling

The app provides detailed error messages:
- Missing API key: `"OpenAI API key not configured"`
- Missing package: `"openai package not installed. Run: pip install openai"`
- Translation disabled: `"LLM translation is currently disabled"`
- Empty source: `"Event has no content in ca to translate from"`

All errors are logged to `TranslationLog` with `success=False`.

## Cost Tracking

Translation logs include token usage and cost estimates. Review costs via:
- Django admin → Translation Logs
- API: `GET /api/v1/translation-logs/?provider=openai`

## Development

### Run Tests

```bash
pytest backend/llm_translations/tests/
```

### Add New Provider

1. Update `LLMProviderConfig.Provider` choices
2. Add API key to settings
3. Implement `translate_with_<provider>()` in `utils.py`
4. Add case to `get_llm_client()` switch

## Security Notes

- API keys are stored in environment variables, never in code
- All translation endpoints require authentication
- Logs can be reviewed but not modified via API
- Singleton config prevents accidental deletion
