"""Admin configuration for LLM translation models."""

from django.contrib import admin
from solo.admin import SingletonModelAdmin

from .models import LLMProviderConfig, TranslationLog


@admin.register(LLMProviderConfig)
class LLMProviderConfigAdmin(SingletonModelAdmin):
    """Admin for LLM provider configuration singleton."""
    
    fieldsets = (
        ('Provider Configuration', {
            'fields': ('provider', 'model_name', 'is_active')
        }),
        ('Model Parameters', {
            'fields': ('temperature', 'max_tokens'),
            'description': 'Fine-tune translation behavior'
        }),
    )
    
    def has_add_permission(self, request):
        """Only one instance allowed."""
        return not LLMProviderConfig.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Cannot delete the singleton."""
        return False


@admin.register(TranslationLog)
class TranslationLogAdmin(admin.ModelAdmin):
    """Admin for translation logs (read-only)."""
    
    list_display = (
        'created_at',
        'provider',
        'model_name',
        'source_language',
        'target_language',
        'success',
        'tokens_used',
    )
    
    list_filter = (
        'success',
        'provider',
        'source_language',
        'target_language',
        'created_at',
    )
    
    search_fields = (
        'source_text',
        'translated_text',
        'error_message',
    )
    
    readonly_fields = (
        'provider',
        'model_name',
        'source_text',
        'translated_text',
        'source_language',
        'target_language',
        'tokens_used',
        'cost_estimate',
        'success',
        'error_message',
        'created_at',
    )
    
    date_hierarchy = 'created_at'
    
    def has_add_permission(self, request):
        """Logs are created automatically, not manually."""
        return False
    
    def has_change_permission(self, request, obj=None):
        """Logs are read-only."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion for cleanup."""
        return True
