from django.core.management.base import BaseCommand
from site_settings.services import WeatherService


class Command(BaseCommand):
    help = "Updates the municipality weather forecast data from external APIs."

    def handle(self, *args, **options):
        self.stdout.write("Fetching latest weather forecast...")

        weather_obj = WeatherService.update_forecast()

        if weather_obj:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully updated weather. Source: {weather_obj.forecast_data.get('source')}"
                )
            )
        else:
            self.stdout.write(self.style.ERROR("Failed to update weather forecast."))
