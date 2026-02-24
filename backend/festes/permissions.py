"""
Custom permissions for the Festes app.
"""

from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission that allows:
    - Public read access (GET, HEAD, OPTIONS)
    - Admin-only write access (POST, PUT, PATCH, DELETE)

    Used for festes, sponsors, and other content models where
    public can view but only authenticated admins can modify.
    """

    def has_permission(self, request, view):
        """
        Allow GET for everyone, POST/PUT/PATCH/DELETE only for admin users.
        """
        # Allow read-only requests for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write operations require admin status
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )

    def has_object_permission(self, request, view, obj):
        """
        Allow GET for everyone, write operations only for admins.
        """
        # Allow read-only requests for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write operations require admin status
        return request.user and request.user.is_staff
