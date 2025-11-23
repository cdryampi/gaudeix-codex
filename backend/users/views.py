"""
Views for the Users app.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
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
        if self.action == 'create':
            return UserRegistrationSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action.
        """
        if self.action == 'create':
            # Registration is public
            return [AllowAny()]
        elif self.action == 'list':
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
        
        email = serializer.validated_data['email']
        
        # Try to find user, but don't leak existence
        try:
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # In production, send email with reset link
            # For now, we'll just log it (in tests we can capture this)
            print(f"Password reset requested for {email}")
            print(f"Reset link: /api/v1/users/password-reset-confirm/ with uid={uid}, token={token}")
            
        except User.DoesNotExist:
            # Don't leak that user doesn't exist
            pass
        
        # Always return success
        return Response(
            {"detail": "If an account exists with this email, a password reset link has been sent."},
            status=status.HTTP_200_OK
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
            status=status.HTTP_200_OK
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
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Return user data with tokens
        user_data = UserDetailSerializer(user).data
        
        return Response({
            'user': user_data,
            'access': access_token,
            'refresh': refresh_token,
        }, status=status.HTTP_200_OK)
