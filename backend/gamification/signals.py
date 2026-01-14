"""Signals for initializing user points and bonuses."""

from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import PointTransaction
from .utils import REGISTRATION_BONUS, add_points, get_or_create_user_points

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_points(sender, instance, created, **kwargs):
    if not created:
        return

    get_or_create_user_points(instance)
    add_points(
        user=instance,
        points=REGISTRATION_BONUS,
        transaction_type=PointTransaction.TransactionType.REGISTRATION_BONUS,
        description="Bonus por registro",
    )
