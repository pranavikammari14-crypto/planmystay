from django.urls import re_path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CurrentUserView,
    UpdateProfileView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminListUsersView,
    AdminUpdateUserRoleView,
)

urlpatterns = [
    re_path(r'^register/?$', RegisterView.as_view(), name='auth_register'),
    re_path(r'^login/?$', LoginView.as_view(), name='auth_login'),
    re_path(r'^logout/?$', LogoutView.as_view(), name='auth_logout'),
    re_path(r'^me/?$', CurrentUserView.as_view(), name='auth_me'),
    re_path(r'^update-profile/?$', UpdateProfileView.as_view(), name='auth_update_profile'),
    re_path(r'^forgot-password/?$', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    re_path(r'^reset-password/?$', ResetPasswordView.as_view(), name='auth_reset_password'),

    # Admin User Management
    re_path(r'^admin/users/?$', AdminListUsersView.as_view(), name='admin_list_users'),
    re_path(r'^admin/users/(?P<user_id>[0-9a-f-]+)/role/?$', AdminUpdateUserRoleView.as_view(), name='admin_update_user_role'),
]
