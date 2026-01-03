from django.apps import AppConfig


class GardensConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'gardens'
    verbose_name = 'Virtual Gardens'

    def ready(self):
        # Import signals when app is ready
        import gardens.signals
