import requests
import logging
from django.conf import settings
from .models import SiteSettings
from .models_weather import MunicipalityWeather

logger = logging.getLogger(__name__)


class WeatherService:
    """
    Service to handle weather forecast fetching and storage.
    Defaults to Cabrera de Mar coordinates if not provided.
    """

    # Cabrera de Mar, Spain
    DEFAULT_LAT = 41.5306
    DEFAULT_LNG = 2.3917

    @classmethod
    def update_forecast(cls):
        """
        Fetches the latest forecast and saves it to the database.
        Uses Open-Meteo (Free, No API Key required).
        """
        config = SiteSettings.get_solo()

        lat = config.latitude or cls.DEFAULT_LAT
        lng = config.longitude or cls.DEFAULT_LNG

        # Primary source: Open-Meteo
        return cls._fetch_open_meteo(lat, lng)

    @classmethod
    def _fetch_open_meteo(cls, lat, lng):
        """
        Free fallback: Open-Meteo (no API key required).
        """
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto"

        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Normalize to a similar structure
            clean_days = []
            daily = data.get("daily", {})
            times = daily.get("time", [])

            for i in range(len(times)):
                clean_days.append(
                    {
                        "datetime": times[i],
                        "tempmax": daily.get("temperature_2m_max", [0] * 10)[i],
                        "tempmin": daily.get("temperature_2m_min", [0] * 10)[i],
                        "precip_prob": daily.get(
                            "precipitation_probability_max", [0] * 10
                        )[i],
                        "weather_code": daily.get("weathercode", [0] * 10)[i],
                    }
                )

            clean_data = {
                "address": "Cabrera de Mar",
                "days": clean_days,
                "source": "open_meteo",
            }

            weather_obj = MunicipalityWeather.objects.create(forecast_data=clean_data)
            logger.info("Updated municipality weather via Open-Meteo fallback.")
            return weather_obj

        except Exception as e:
            logger.error(f"Weather update failed completely: {str(e)}")
            return None
