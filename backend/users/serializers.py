"""
Serializers for the Users app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration (public endpoint).
    Validates password and creates new user.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'password', 'password_confirm']
        read_only_fields = ['id']

    def validate(self, attrs):
        """
        Validate that passwords match.
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Create user with hashed password.
        """
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for reading user data.
    Excludes sensitive fields like password.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'is_staff', 'is_active', 'date_joined']
        read_only_fields = ['id', 'is_staff', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user data.
    Allows updating name and email, but not username or password.
    """
    class Meta:
        model = User
        fields = ['email', 'name']

    def validate_email(self, value):
        """
        Ensure email is unique (excluding current user).
        """
        user = self.instance
        if User.objects.exclude(pk=user.pk).filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset.
    Public endpoint - doesn't leak user existence.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Always return success to avoid user enumeration.
        Actual user lookup happens in the view.
        """
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset with token.
    """
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validate passwords match and token is valid.
        """
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})

        # Validate token
        try:
            uid = urlsafe_base64_decode(attrs['uid']).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid user ID."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        attrs['user'] = user
        return attrs

    def save(self):
        """
        Set new password for the user.
        """
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Validates credentials and returns user data with JWT tokens.
    Accepts either username or email for login.
    """
    username = serializers.CharField(required=True, help_text="Username or email")
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Validate credentials and authenticate user.
        Supports login with username or email.
        """
        from django.contrib.auth import authenticate

        username_or_email = attrs.get('username')
        password = attrs.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError("Both username/email and password are required.")

        # Try to authenticate with username first
        user = authenticate(username=username_or_email, password=password)

        # If authentication failed, try with email
        if not user:
            try:
                # Look up user by email
                user_obj = User.objects.get(email=username_or_email)
                # Authenticate with the username of the found user
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                # User not found by email either
                pass
            except User.MultipleObjectsReturned:
                # Handle edge case of multiple users with same email (shouldn't happen with unique constraint)
                pass

        if not user:
            raise serializers.ValidationError({"non_field_errors": ["Invalid credentials."]})

        if not user.is_active:
            raise serializers.ValidationError({"non_field_errors": ["User account is disabled."]})

        attrs['user'] = user
        return attrs
