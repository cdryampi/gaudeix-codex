"""Tests for LLM translation functionality with local provider."""

from __future__ import annotations

import pytest
from unittest.mock import Mock, patch, MagicMock
from django.contrib.auth import get_user_model

from llm_translations.models import LLMProviderConfig, TranslationLog
from llm_translations.utils import (
    get_llm_client,
    translate_text,
    translate_with_local,
    TranslationError,
)

User = get_user_model()

pytestmark = pytest.mark.django_db


@pytest.fixture
def local_config():
    """Create LLM configuration for local provider."""
    config = LLMProviderConfig.get_solo()
    config.provider = LLMProviderConfig.Provider.LOCAL
    config.model_name = LLMProviderConfig.Model.MISTRAL_NEMO
    config.is_active = True
    config.temperature = 0.3
    config.max_tokens = 2000
    config.save()
    return config


@pytest.fixture
def mock_local_client():
    """Mock OpenAI client for local LLM."""
    mock_client = Mock()
    mock_response = Mock()
    mock_response.choices = [Mock(message=Mock(content="Hello world"))]
    mock_response.usage = Mock(total_tokens=50)
    mock_client.chat.completions.create.return_value = mock_response
    return mock_client


class TestLLMProviderConfig:
    """Test LLMProviderConfig model."""

    def test_singleton_creation(self, local_config):
        """Test that only one config instance can exist."""
        config1 = LLMProviderConfig.get_solo()
        config2 = LLMProviderConfig.get_solo()
        
        assert config1.id == config2.id
        assert LLMProviderConfig.objects.count() == 1

    def test_config_defaults(self):
        """Test default configuration values."""
        config = LLMProviderConfig.get_solo()
        
        assert config.provider == LLMProviderConfig.Provider.OPENAI
        assert config.model_name == LLMProviderConfig.Model.GPT_4O_MINI
        assert config.is_active is True
        assert config.temperature == 0.3
        assert config.max_tokens == 2000

    def test_local_provider_configuration(self, local_config):
        """Test local provider can be configured."""
        assert local_config.provider == LLMProviderConfig.Provider.LOCAL
        assert local_config.model_name == LLMProviderConfig.Model.MISTRAL_NEMO
        assert str(local_config) == "Local LLM (Ollama/LM Studio) - Mistral Nemo Instruct (Local)"

    def test_get_config_method(self, local_config):
        """Test get_config class method."""
        config = LLMProviderConfig.get_config()
        
        assert isinstance(config, LLMProviderConfig)
        assert config.provider == LLMProviderConfig.Provider.LOCAL


class TestGetLLMClient:
    """Test LLM client factory function."""

    @patch('llm_translations.utils.settings')
    def test_get_local_client_with_settings(self, mock_settings):
        """Test getting local LLM client with proper settings."""
        mock_settings.LLM_LOCAL_API_URL = "http://localhost:11434"
        
        # Mock the OpenAI import within the function
        with patch('openai.OpenAI') as mock_openai:
            mock_client = Mock()
            mock_openai.return_value = mock_client
            
            client = get_llm_client(LLMProviderConfig.Provider.LOCAL)
            
            # Verify OpenAI was called with correct params
            mock_openai.assert_called_once_with(
                base_url="http://localhost:11434/v1",
                api_key="local"
            )
            assert client == mock_client

    @patch('llm_translations.utils.settings')
    def test_get_local_client_no_url(self, mock_settings):
        """Test error when local API URL not configured."""
        mock_settings.LLM_LOCAL_API_URL = ""
        
        with pytest.raises(TranslationError, match="Local LLM API URL not configured"):
            get_llm_client(LLMProviderConfig.Provider.LOCAL)

    def test_get_client_unsupported_provider(self):
        """Test error with unsupported provider."""
        with pytest.raises(TranslationError, match="Unsupported provider"):
            get_llm_client("invalid_provider")


class TestTranslateWithLocal:
    """Test translation with local LLM provider."""

    def test_translate_success(self, mock_local_client):
        """Test successful translation with local LLM."""
        translated, tokens = translate_with_local(
            client=mock_local_client,
            text="Hola món",
            source_lang="ca",
            target_lang="en",
            model="mistralai/mistral-nemo-instruct-2407",
            temperature=0.3,
            max_tokens=2000
        )
        
        assert translated == "Hello world"
        assert tokens == 50
        
        # Verify API call
        mock_local_client.chat.completions.create.assert_called_once()
        call_args = mock_local_client.chat.completions.create.call_args
        assert call_args.kwargs['model'] == "mistralai/mistral-nemo-instruct-2407"
        assert call_args.kwargs['temperature'] == 0.3
        assert call_args.kwargs['max_tokens'] == 2000
        assert len(call_args.kwargs['messages']) == 2
        assert "Catalan" in call_args.kwargs['messages'][0]['content']
        assert "English" in call_args.kwargs['messages'][0]['content']
        assert call_args.kwargs['messages'][1]['content'] == "Hola món"

    def test_translate_no_token_usage(self, mock_local_client):
        """Test translation when local model doesn't return token usage."""
        mock_response = Mock()
        mock_response.choices = [Mock(message=Mock(content="Translated text"))]
        # No usage attribute
        del mock_response.usage
        mock_local_client.chat.completions.create.return_value = mock_response
        
        translated, tokens = translate_with_local(
            client=mock_local_client,
            text="Test",
            source_lang="ca",
            target_lang="es",
            model="mistral:latest",
            temperature=0.5,
            max_tokens=1000
        )
        
        assert translated == "Translated text"
        assert tokens == 0  # Should default to 0 when no usage data


class TestTranslateText:
    """Test main translation function."""

    @patch('llm_translations.utils.get_llm_client')
    @patch('llm_translations.utils.translate_with_local')
    def test_translate_text_with_local(
        self, mock_translate_local, mock_get_client, local_config, mock_local_client
    ):
        """Test translate_text function with local provider."""
        mock_get_client.return_value = mock_local_client
        mock_translate_local.return_value = ("Hola mundo", 45)
        
        result = translate_text(
            text="Hello world",
            source_lang="en",
            target_lang="es",
            log_translation=True
        )
        
        assert result == "Hola mundo"
        
        # Verify client was obtained
        mock_get_client.assert_called_once_with(LLMProviderConfig.Provider.LOCAL)
        
        # Verify translation function was called
        mock_translate_local.assert_called_once_with(
            mock_local_client,
            "Hello world",
            "en",
            "es",
            LLMProviderConfig.Model.MISTRAL_NEMO,
            0.3,
            2000
        )
        
        # Verify log was created
        assert TranslationLog.objects.count() == 1
        log = TranslationLog.objects.first()
        assert log.provider == LLMProviderConfig.Provider.LOCAL
        assert log.model_name == LLMProviderConfig.Model.MISTRAL_NEMO
        assert log.source_text == "Hello world"
        assert log.translated_text == "Hola mundo"
        assert log.source_language == "en"
        assert log.target_language == "es"
        assert log.tokens_used == 45
        assert log.success is True

    @patch('llm_translations.utils.get_llm_client')
    def test_translate_text_disabled(self, mock_get_client, local_config):
        """Test translation fails when LLM is disabled."""
        local_config.is_active = False
        local_config.save()
        
        with pytest.raises(TranslationError, match="LLM translation is currently disabled"):
            translate_text("Test", "ca", "en")
        
        mock_get_client.assert_not_called()

    @patch('llm_translations.utils.get_llm_client')
    @patch('llm_translations.utils.translate_with_local')
    def test_translate_text_error_logging(
        self, mock_translate_local, mock_get_client, local_config, mock_local_client
    ):
        """Test that errors are logged to TranslationLog."""
        mock_get_client.return_value = mock_local_client
        mock_translate_local.side_effect = Exception("Connection error")
        
        with pytest.raises(TranslationError, match="Translation failed: Connection error"):
            translate_text("Test", "ca", "en", log_translation=True)
        
        # Verify error log was created
        assert TranslationLog.objects.count() == 1
        log = TranslationLog.objects.first()
        assert log.success is False
        assert "Connection error" in log.error_message
        assert log.source_text == "Test"
        assert log.translated_text == ""

    @patch('llm_translations.utils.get_llm_client')
    @patch('llm_translations.utils.translate_with_local')
    def test_translate_text_no_logging(
        self, mock_translate_local, mock_get_client, local_config, mock_local_client
    ):
        """Test translation without logging."""
        mock_get_client.return_value = mock_local_client
        mock_translate_local.return_value = ("Translated", 30)
        
        result = translate_text("Test", "ca", "en", log_translation=False)
        
        assert result == "Translated"
        assert TranslationLog.objects.count() == 0


class TestTranslationLog:
    """Test TranslationLog model."""

    def test_log_creation(self):
        """Test creating a translation log."""
        log = TranslationLog.objects.create(
            provider=LLMProviderConfig.Provider.LOCAL,
            model_name="mistral:latest",
            source_text="Hola",
            translated_text="Hello",
            source_language="es",
            target_language="en",
            tokens_used=20,
            success=True
        )
        
        assert str(log) == "✓ es → en (local)"
        assert log.success is True

    def test_failed_log_creation(self):
        """Test creating a failed translation log."""
        log = TranslationLog.objects.create(
            provider=LLMProviderConfig.Provider.LOCAL,
            model_name="mistral:latest",
            source_text="Test",
            translated_text="",
            source_language="ca",
            target_language="en",
            success=False,
            error_message="Connection timeout"
        )
        
        assert str(log) == "✗ ca → en (local)"
        assert log.success is False
        assert log.error_message == "Connection timeout"

    def test_log_ordering(self):
        """Test that logs are ordered by created_at descending."""
        log1 = TranslationLog.objects.create(
            provider=LLMProviderConfig.Provider.LOCAL,
            model_name="mistral:latest",
            source_text="First",
            translated_text="Primero",
            source_language="en",
            target_language="es",
            success=True
        )
        log2 = TranslationLog.objects.create(
            provider=LLMProviderConfig.Provider.LOCAL,
            model_name="mistral:latest",
            source_text="Second",
            translated_text="Segundo",
            source_language="en",
            target_language="es",
            success=True
        )
        
        logs = TranslationLog.objects.all()
        assert logs[0].id == log2.id  # Most recent first
        assert logs[1].id == log1.id

