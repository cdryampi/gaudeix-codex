import pytest
from django.contrib.auth import get_user_model
from gamification.models import UserPoints
from gamification.utils import get_user_rank

User = get_user_model()

pytestmark = pytest.mark.django_db

def test_get_user_rank_basic():
    # User A: 200 pts
    # User B: 100 pts
    # User C: 50 pts

    user_a = User.objects.create_user(username="user_a", password="password")
    user_b = User.objects.create_user(username="user_b", password="password")
    user_c = User.objects.create_user(username="user_c", password="password")

    UserPoints.objects.filter(user=user_a).update(total_points=200)
    UserPoints.objects.filter(user=user_b).update(total_points=100)
    UserPoints.objects.filter(user=user_c).update(total_points=50)

    assert get_user_rank(user_a) == 1
    assert get_user_rank(user_b) == 2
    assert get_user_rank(user_c) == 3

def test_get_user_rank_tied_scores():
    # User A (id=1): 100 pts
    # User B (id=2): 100 pts
    # Rank should be determined by ID (lower ID first)

    user_a = User.objects.create_user(username="user_a_tied", password="password")
    user_b = User.objects.create_user(username="user_b_tied", password="password")

    # Ensure IDs are ordered as expected
    assert user_a.id < user_b.id

    UserPoints.objects.filter(user=user_a).update(total_points=100)
    UserPoints.objects.filter(user=user_b).update(total_points=100)

    assert get_user_rank(user_a) == 1
    assert get_user_rank(user_b) == 2

def test_get_user_rank_tied_scores_mixed():
    # User A (id=1): 100
    # User B (id=2): 200 (Rank 1)
    # User C (id=3): 100

    # Sort:
    # 1. B (200, 2)
    # 2. A (100, 1)
    # 3. C (100, 3)

    user_a = User.objects.create_user(username="user_a_mixed", password="password")
    user_b = User.objects.create_user(username="user_b_mixed", password="password")
    user_c = User.objects.create_user(username="user_c_mixed", password="password")

    # Ensure IDs are ordered as expected
    assert user_a.id < user_b.id < user_c.id

    UserPoints.objects.filter(user=user_a).update(total_points=100)
    UserPoints.objects.filter(user=user_b).update(total_points=200)
    UserPoints.objects.filter(user=user_c).update(total_points=100)

    assert get_user_rank(user_b) == 1
    assert get_user_rank(user_a) == 2
    assert get_user_rank(user_c) == 3

def test_get_user_rank_no_points():
    user = User.objects.create_user(username="no_points", password="password")
    # UserPoints is auto-created, so we must delete it to test DoesNotExist
    UserPoints.objects.filter(user=user).delete()
    assert get_user_rank(user) == 0
