"""Dynamic settings loader for the gaudeix_backend project."""

import os

ENVIRONMENT = os.environ.get("ENVIRONMENT", "local").lower()

if ENVIRONMENT == "production":
    from .production import *  # noqa: F401,F403
elif ENVIRONMENT == "test":
    from .test import *  # noqa: F401,F403
else:
    from .local import *  # noqa: F401,F403
