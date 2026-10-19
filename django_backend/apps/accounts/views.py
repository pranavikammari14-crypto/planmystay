import secrets
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ProfileUpdateSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .permissions import IsPlatformAdmin, IsCustomer

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'message': 'Account created successfully',
                'user': UserSerializer(user).data,
                'token': token.key,
            }, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'success': True,
                'message': 'Authentication successful',
                'user': UserSerializer(user).data,
                'token': token.key,
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
        return Response({'success': True, 'message': 'Signed out successfully'})


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data,
        })


class UpdateProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return self.patch(request)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'user': UserSerializer(user).data,
            })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email'].strip().lower()
            try:
                user = User.objects.get(email=email)
                token = secrets.token_urlsafe(32)
                user.reset_token = token
                user.reset_token_expires = timezone.now() + timedelta(hours=2)
                user.save(update_fields=['reset_token', 'reset_token_expires'])
                # In production, email would be dispatched. Token provided in demo/staging:
                return Response({
                    'success': True,
                    'message': 'Password reset instructions have been generated.',
                    'resetToken': token,
                })
            except User.DoesNotExist:
                # Security best practice: don't reveal if user exists
                return Response({
                    'success': True,
                    'message': 'If an account exists with this email, reset instructions have been sent.',
                })
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            try:
                user = User.objects.get(
                    reset_token=token,
                    reset_token_expires__gt=timezone.now()
                )
                user.set_password(new_password)
                user.reset_token = None
                user.reset_token_expires = None
                user.save()
                return Response({
                    'success': True,
                    'message': 'Password has been reset successfully. You can now log in.',
                })
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired password reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AdminListUsersView(views.APIView):
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        return Response({
            'success': True,
            'users': UserSerializer(users, many=True).data,
        })


class AdminUpdateUserRoleView(views.APIView):
    permission_classes = [IsPlatformAdmin]

    def patch(self, request, user_id):
        new_role = request.data.get('role')
        if new_role not in [User.Role.USER, User.Role.OWNER, User.Role.ADMIN]:
            return Response({'error': 'Invalid role specified'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=user_id)
            target_user.role = new_role
            if new_role == User.Role.ADMIN:
                target_user.is_staff = True
            target_user.save()
            return Response({
                'success': True,
                'message': f"Updated role to {new_role}",
                'user': UserSerializer(target_user).data,
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
