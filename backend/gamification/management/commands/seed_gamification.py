"""Seed gamification data for existing users."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from gamification.models import PointTransaction
from gamification.utils import REGISTRATION_BONUS, add_points, get_or_create_user_points


class Command(BaseCommand):
    help = "Seed gamification data for existing users."

    def handle(self, *args, **options):
        User = get_user_model()
        created_points = 0
        created_bonus = 0

        for user in User.objects.all():
            user_points = get_or_create_user_points(user)
            if user_points.total_points == 0:
                created_points += 1

            has_bonus = PointTransaction.objects.filter(
                user=user,
                transaction_type=PointTransaction.TransactionType.REGISTRATION_BONUS,
            ).exists()
            if not has_bonus:
                add_points(
                    user=user,
                    points=REGISTRATION_BONUS,
                    transaction_type=PointTransaction.TransactionType.REGISTRATION_BONUS,
                    description="Bonus por registro",
                )
                created_bonus += 1

        self.stdout.write(self.style.SUCCESS("Gamification seed completed."))
        self.stdout.write(
            self.style.SUCCESS(
                f"User points initialized: {created_points}, registration bonuses: {created_bonus}"
            )
        )
