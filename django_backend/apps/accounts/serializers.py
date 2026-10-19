from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Safe user serializer without exposing passwords or security tokens."""

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'role',
            'phone',
            'avatar',
            'title',
            'preferences',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """Customer & Owner registration serializer with password validation."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    role = serializers.CharField(default='USER', required=False)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'password', 'phone', 'role']
        extra_kwargs = {
            'phone': {'required': False},
        }

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return normalized

    def create(self, validated_data):
        password = validated_data.pop('password')
        role = validated_data.get('role', 'USER')
        # Enforce that public registration CANNOT create an ADMIN
        if role == 'ADMIN':
            role = 'USER'
        validated_data['role'] = role

        name = validated_data.get('name') or validated_data['email'].split('@')[0]
        validated_data['name'] = name
        avatar = name[:2].upper() if name else 'AP'
        validated_data['avatar'] = avatar

        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user


class LoginSerializer(serializers.Serializer):
    """User authentication serializer."""

    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email', '').strip().lower()
        password = attrs.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            # Fallback check
            try:
                found_user = User.objects.get(email=email)
                if found_user.check_password(password):
                    user = found_user
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError('Invalid email or password.')

        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated.')

        attrs['user'] = user
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Allows updating user profile details."""

    class Meta:
        model = User
        fields = ['name', 'phone', 'avatar', 'title', 'preferences']


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
