from django.apps import AppConfig

class SocialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'social'

    def ready(self):
        """
        Configuration method called when the app is ready.
        Importing signals here ensures they are registered.
        """
        import social.signals

