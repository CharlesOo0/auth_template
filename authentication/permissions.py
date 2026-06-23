from rest_framework import permissions

class IsAdministrator(permissions.BasePermission):
    """
    Permission permettant uniquement aux administrateurs d'accéder.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_administrator)

class IsCustomer(permissions.BasePermission):
    """
    Permission permettant aux clients d'accéder.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_customer)
