from __future__ import annotations

import json

import pytest
from django.core.management import call_command

from users.management.commands.seed_users import Command
from users.models import User


pytestmark = pytest.mark.django_db


def test_seed_users_reads_values_from_env_file(tmp_path, monkeypatch):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "ADMIN_USER=yampi",
                "ADMIN_PASSWORD=thos",
                "SYSTEM_USER=gaudeix",
                "SYSTEM_PASSWORD=gaudeix@2023",
            ]
        ),
        encoding="utf-8",
    )

    seed_file = tmp_path / "users.json"
    seed_file.write_text(
        json.dumps(
            {
                "users": [
                    {
                        "username_env": "ADMIN_USER",
                        "password_env": "ADMIN_PASSWORD",
                        "default_username": "admin",
                        "default_password": "admin123",
                        "defaults": {"is_staff": True, "is_superuser": True, "name": "Admin"},
                    }
                ]
            }
        ),
        encoding="utf-8",
    )

    monkeypatch.setattr(Command, "env_file", env_file)
    monkeypatch.setattr(Command, "_load_seed_users", lambda self: json.loads(seed_file.read_text())["users"])

    call_command("seed_users")

    user = User.objects.get(username="yampi")
    assert user.is_staff is True
    assert user.is_superuser is True
    assert user.check_password("thos") is True
