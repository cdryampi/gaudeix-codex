from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import EventDate


@receiver(post_save, sender=EventDate)
@receiver(post_delete, sender=EventDate)
def update_event_dates(sender, instance, **kwargs):
    """
    Update the parent Event's start_at/end_at when an EventDate changes.
    """
    event = instance.event
    event.update_cached_dates()
