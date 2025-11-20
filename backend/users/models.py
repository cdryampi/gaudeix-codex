from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Default custom User model for Gaudeix Codex.
    If adding fields that need to be filled at registration,
    check https://docs.djangoproject.com/en/5.0/topics/auth/customizing/#substituting-a-custom-user-model
    """

    # First and last name do not cover name patterns around the globe
    name = models.CharField(_("Name of User"), blank=True, max_length=255)
    first_name = None  # type: ignore
    last_name = None  # type: ignore

    def __str__(self):
        return self.username
