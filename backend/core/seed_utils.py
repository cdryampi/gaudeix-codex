from __future__ import annotations

import os
import random
from dataclasses import dataclass
from typing import Any


GLOBAL_SEED_ENV_VAR = "GAUDEIX_SEED"


@dataclass(frozen=True)
class SeedContext:
    seed: int | None
    rng: random.Random
    faker: Any


def resolve_seed(explicit_seed: int | None) -> int | None:
    if explicit_seed is not None:
        return explicit_seed

    env_value = os.getenv(GLOBAL_SEED_ENV_VAR)
    if env_value is None or env_value == "":
        return None

    try:
        return int(env_value)
    except ValueError:
        return None


def build_seed_context(*, explicit_seed: int | None, faker_locale: str = "es_ES") -> SeedContext:
    from faker import Faker

    resolved_seed = resolve_seed(explicit_seed)
    rng = random.Random()
    faker = Faker(faker_locale)

    if resolved_seed is not None:
        rng.seed(resolved_seed)
        faker.seed_instance(resolved_seed)

    return SeedContext(seed=resolved_seed, rng=rng, faker=faker)
