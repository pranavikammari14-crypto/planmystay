from rest_framework import permissions

class IsCustomer(permissions.BasePermission):
    """Allows access to authenticated customers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsHotelOwner(permissions.BasePermission):
    """Allows access to authorized hotel owners or administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['OWNER', 'ADMIN']
        )


class IsPlatformAdmin(permissions.BasePermission):
    """Allows access exclusively to platform administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_superuser)
        )


class IsOwnerOrAdminForObject(permissions.BasePermission):
    """
    Object-level permission allowing access if user is the owner
    or an administrator.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            return True
        # Check if obj has an owner or user field
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
