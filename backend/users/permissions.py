"""
Custom permissions for the Users app.
"""
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission that allows access only to the owner of the object or admin users.
    
    Used for operations where users can manage their own data,
    but admins can manage any user's data.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user is the owner or an admin.
        
        Args:
            request: The HTTP request.
            view: The view being accessed.
            obj: The object being accessed (User instance).
            
        Returns:
            bool: True if user is owner or admin, False otherwise.
        """
        # Admin users have full access
        if request.user and request.user.is_staff:
            return True
        
        # Users can only access their own data
        return obj == request.user


class IsOwner(permissions.BasePermission):
    """
    Permission that allows access only to the owner of the object.
    
    Used for operations where only the owner should have access,
    regardless of admin status.
    """
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user is the owner.
        
        Args:
            request: The HTTP request.
            view: The view being accessed.
            obj: The object being accessed (User instance).
            
        Returns:
            bool: True if user is owner, False otherwise.
        """
        return obj == request.user
