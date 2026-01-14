"""
Views for the Users app.
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Count, Exists, OuterRef


from gamification.serializers import PointTransactionSerializer, UserPointsSerializer
from gamification.utils import (
    get_or_create_user_points,
    get_user_monthly_rank,
    get_user_rank,
)
from events.models import Event, UserFavoriteEvent
from events.serializers import EventSerializer


from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


from .serializers import (
    UserRegistrationSerializer,
    UserDetailSerializer,
    UserUpdateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LoginSerializer,
)
from .permissions import IsOwnerOrAdmin

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user CRUD operations.

    - create: Public (registration)
    - list: Admin only
    - retrieve: Owner or Admin
    - update/partial_update: Owner or Admin
    - destroy: Owner or Admin
    """

    queryset = User.objects.all()

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action == "create":
            return UserRegistrationSerializer
        elif self.action in ["update", "partial_update"]:
            return UserUpdateSerializer
        return UserDetailSerializer

    def get_permissions(self):
        """
        Set permissions based on action.
        """
        if self.action == "create":
            # Registration is public
            return [AllowAny()]
        elif self.action in [
            "me",
            "my_points",
            "my_points_history",
            "my_rank",
            "my_favorites",
            "my_favorites_upcoming",
        ]:
            return [IsAuthenticated()]

        elif self.action == "list":
            # Only admins can list all users
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        else:
            # retrieve, update, destroy require authentication and ownership
            return [IsAuthenticated(), IsOwnerOrAdmin()]

    def get_queryset(self):
        """
        Filter queryset based on user permissions.
        """
        user = self.request.user

        # Admins can see all users
        if user.is_staff:
            return User.objects.all()

        # Regular users can only see themselves
        if user.is_authenticated:
            return User.objects.filter(pk=user.pk)

        return User.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Register a new user (public endpoint).
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return user data without password
        response_serializer = UserDetailSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get", "patch", "delete"], url_path="me")
    def me(self, request, *args, **kwargs):
        """
        Retrieve, update, or delete the authenticated user's profile.
        """
        user = request.user

        if request.method.lower() == "get":
            serializer = UserDetailSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if request.method.lower() == "patch":
            serializer = UserUpdateSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserDetailSerializer(user).data, status=status.HTTP_200_OK)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="me/points")
    def my_points(self, request, *args, **kwargs):
        user_points = get_or_create_user_points(request.user)
        rank = get_user_rank(request.user)
        data = UserPointsSerializer(user_points).data
        return Response(
            {
                "total_points": data["total_points"],
                "level": data["level"],
                "rank": rank,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="me/points-history")
    def my_points_history(self, request, *args, **kwargs):
        transactions = request.user.point_transactions.all()
        serializer = PointTransactionSerializer(transactions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="me/rank")
    def my_rank(self, request, *args, **kwargs):
        rank = get_user_rank(request.user)
        monthly_rank = get_user_monthly_rank(request.user)
        return Response(
            {
                "rank": rank,
                "monthly_rank": monthly_rank,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="me/favorites")
    def my_favorites(self, request, *args, **kwargs):
        favorites = (
            Event.objects.filter(favorited_by__user=request.user)
            .select_related("category", "featured_media")
            .prefetch_related("attachments", "tags")
            .annotate(favorites_count=Count("favorited_by", distinct=True))
            .annotate(
                is_favorited=Exists(
                    UserFavoriteEvent.objects.filter(
                        user=request.user,
                        event=OuterRef("pk"),
                    )
                )
            )
            .order_by("-favorited_by__created_at")
        )
        serializer = EventSerializer(favorites, many=True, context={"request": request})

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="me/favorites/upcoming")
    def my_favorites_upcoming(self, request, *args, **kwargs):
        favorites = (
            Event.objects.filter(
                favorited_by__user=request.user,
                start_at__gte=timezone.now(),
            )
            .select_related("category", "featured_media")
            .prefetch_related("attachments", "tags")
            .annotate(favorites_count=Count("favorited_by", distinct=True))
            .annotate(
                is_favorited=Exists(
                    UserFavoriteEvent.objects.filter(
                        user=request.user,
                        event=OuterRef("pk"),
                    )
                )
            )
            .order_by("start_at")
        )
        serializer = EventSerializer(favorites, many=True, context={"request": request})

        return Response(serializer.data, status=status.HTTP_200_OK)


class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset (public endpoint).
    Doesn't leak user existence - always returns success.
    """

    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        """
        Process password reset request.
        Always returns success to avoid user enumeration.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        # Try to find user, but don't leak existence
        try:
            user = User.objects.get(email=email)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # In production, send email with reset link
            # For now, we'll just log it (in tests we can capture this)
            print(f"Password reset requested for {email}")
            print(
                f"Reset link: /api/v1/users/password-reset-confirm/ with uid={uid}, token={token}"
            )

        except User.DoesNotExist:
            # Don't leak that user doesn't exist
            pass

        # Always return success
        return Response(
            {
                "detail": "If an account exists with this email, a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset with token (public endpoint).
    """

    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        """
        Reset password using token.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK,
        )


class LoginView(generics.GenericAPIView):
    """
    Login endpoint that returns JWT tokens.
    Public endpoint - no authentication required.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        """
        Authenticate user and return JWT tokens.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Return user data with tokens
        user_data = UserDetailSerializer(user).data

        return Response(
            {
                "user": user_data,
                "access": access_token,
                "refresh": refresh_token,
            },
            status=status.HTTP_200_OK,
        )
