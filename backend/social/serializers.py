from parler_rest.serializers import TranslatableModelSerializer, TranslatedFieldsField
from .models import SocialLink

from .utils import format_hex_color

class SocialLinkSerializer(TranslatableModelSerializer):
    """
    Serializer for the SocialLink model.
    
    Inherits from TranslatableModelSerializer to handle translations via django-parler-rest.
    """
    
    # Expose translated fields (e.g., 'name') as a dictionary or flat based on configuration.
    # TranslatedFieldsField handles the 'translations' meta field.
    translations = TranslatedFieldsField(shared_model=SocialLink, required=False)

    class Meta:
        """
        Meta class to define model and fields.
        """
        model = SocialLink
        fields = [
            'id', 
            'name',  # This will be the translated value for the current language
            'url', 
            'icon_class', 
            'color',
            'available_in_ca',
            'available_in_es',
            'available_in_en',
            'available_in_fr',
            'order', 
            'is_active',
            'translations' # Full translations dictionary
        ]
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        """
        Custom representation to format hex color.
        
        Args:
            instance: The SocialLink instance.
            
        Returns:
            dict: Serialized data.
        """
        ret = super().to_representation(instance)
        if 'color' in ret and ret['color']:
            ret['color'] = format_hex_color(ret['color'])
        return ret
