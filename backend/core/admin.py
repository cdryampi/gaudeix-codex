from django.contrib import admin
from parler.admin import TranslatableAdmin
from .models import Category, Tag


@admin.register(Category)
class CategoryAdmin(TranslatableAdmin):
    """
    Admin para el modelo Category con soporte de traducciones.
    """
    
    list_display = (
        'slug',
        'get_nombre',
        'taxonomy',
        'icon',
        'fecha_creacion',
        'fecha_modificacion',
    )
    
    search_fields = (
        'slug',
        'translations__nombre',
        'taxonomy',
    )
    
    list_filter = (
        'taxonomy',
        'fecha_creacion',
    )
    
    readonly_fields = (
        'creado_por',
        'modificado_por',
        'fecha_creacion',
        'fecha_modificacion',
    )
    
    fieldsets = (
        ('Informació bàsica', {
            'fields': ('slug', 'taxonomy', 'icon')
        }),
        ('Contingut traduïble', {
            'fields': ('nombre', 'descripcion')
        }),
        ('Metadades SEO', {
            'fields': ('metatitulo', 'metadescripcion'),
            'classes': ('collapse',)
        }),
        ('Auditoria', {
            'fields': (
                'creado_por',
                'modificado_por',
                'fecha_creacion',
                'fecha_modificacion',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_nombre(self, obj):
        """Obtiene el nombre en cualquier idioma disponible."""
        return obj.safe_translation_getter("nombre", any_language=True) or "-"
    get_nombre.short_description = "Nom"
    
    # NOTA: prepopulated_fields no es compatible directamente con TranslatableAdmin
    # debido a que los campos traducibles no están en el modelo base.
    # Para auto-generar el slug, considera usar django-autoslug o hacerlo
    # mediante señales (signals) o en el método save() del modelo.


@admin.register(Tag)
class TagAdmin(TranslatableAdmin):
    """
    Admin para el modelo Tag con soporte de traducciones.
    """
    
    list_display = (
        'slug',
        'get_nombre',
        'fecha_creacion',
        'fecha_modificacion',
    )
    
    search_fields = (
        'slug',
        'translations__nombre',
    )
    
    list_filter = (
        'fecha_creacion',
    )
    
    readonly_fields = (
        'creado_por',
        'modificado_por',
        'fecha_creacion',
        'fecha_modificacion',
    )
    
    fieldsets = (
        ('Informació bàsica', {
            'fields': ('slug',)
        }),
        ('Contingut traduïble', {
            'fields': ('nombre',)
        }),
        ('Auditoria', {
            'fields': (
                'creado_por',
                'modificado_por',
                'fecha_creacion',
                'fecha_modificacion',
            ),
            'classes': ('collapse',)
        }),
    )
    
    def get_nombre(self, obj):
        """Obtiene el nombre en cualquier idioma disponible."""
        return obj.safe_translation_getter("nombre", any_language=True) or "-"
    get_nombre.short_description = "Nom"
    
    # NOTA: prepopulated_fields no es compatible directamente con TranslatableAdmin.
