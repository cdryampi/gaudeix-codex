import pytest
from django.utils import timezone
from datetime import timedelta
from site_settings.models_weather import MunicipalityWeather
from core.models import Category
from events.models import Event, EventCategorySingleton, EventDate
from events.serializers import EventSerializer


@pytest.fixture
def events_category() -> Category:
    """Create the default events category."""
    category, _ = Category.objects.get_or_create(
        slug="events", defaults={"taxonomy": "events", "nombre": "Events"}
    )
    return category


@pytest.fixture
def events_singleton(events_category) -> EventCategorySingleton:
    """Create the events category singleton."""
    singleton, _ = EventCategorySingleton.objects.get_or_create(
        category=events_category
    )
    return singleton


@pytest.mark.django_db
class TestWeatherLogic:
    def test_municipality_weather_storage(self):
        """Test that we can store and retrieve weather data."""
        data = {
            "days": [
                {"datetime": "2026-02-20", "tempmax": 20, "tempmin": 10},
                {"datetime": "2026-02-21", "tempmax": 22, "tempmin": 12},
            ]
        }
        weather = MunicipalityWeather.objects.create(forecast_data=data)
        assert MunicipalityWeather.objects.count() == 1
        assert weather.forecast_data["days"][0]["tempmax"] == 20

    def test_event_serializer_includes_weather(self, events_singleton):
        """Test that EventSerializer maps the correct day from forecast."""
        # Setup weather data for a specific date
        target_date = (timezone.now() + timedelta(days=2)).date()
        date_str = target_date.strftime("%Y-%m-%d")

        MunicipalityWeather.objects.create(
            forecast_data={
                "days": [
                    {
                        "datetime": date_str,
                        "tempmax": 25,
                        "tempmin": 15,
                        "conditions": "Sunny",
                    }
                ]
            }
        )

        # Create outdoor event on that date
        event = Event.objects.create(
            title="Outdoor Party",
            is_outdoor=True,
            start_at=timezone.make_aware(
                timezone.datetime.combine(target_date, timezone.datetime.min.time())
            ),
        )
        EventDate.objects.create(event=event, start_at=event.start_at)

        serializer = EventSerializer(instance=event)
        forecast = serializer.data.get("weather_forecast")

        assert forecast is not None
        assert forecast["tempmax"] == 25
        assert forecast["datetime"] == date_str

    def test_event_serializer_no_weather_if_not_outdoor(self, events_singleton):
        """Test that indoor events don't get weather data."""
        target_date = (timezone.now() + timedelta(days=1)).date()
        MunicipalityWeather.objects.create(
            forecast_data={
                "days": [{"datetime": target_date.strftime("%Y-%m-%d"), "tempmax": 20}]
            }
        )

        event = Event.objects.create(
            title="Indoor Concert", is_outdoor=False, start_at=timezone.now()
        )
        serializer = EventSerializer(instance=event)
        assert serializer.data.get("weather_forecast") is None
