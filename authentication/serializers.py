from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.utils import translation
from django.utils.translation import gettext as _
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer as DefaultRegisterSerializer
from dj_rest_auth.serializers import LoginSerializer as DefaultLoginSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'language', 'is_customer', 'is_administrator')
        # Role flags and email must never be settable by the user themselves -
        # if this serializer is ever wired in as USER_DETAILS_SERIALIZER for
        # profile editing, a plain ModelSerializer would otherwise let anyone
        # PATCH their own is_administrator to True.
        read_only_fields = ('email', 'is_customer', 'is_administrator')

class LoginSerializer(DefaultLoginSerializer):
    """
    Wraps dj-rest-auth's "email not verified" error with a stable machine
    code, since the base serializer only raises a translated free-text
    message - the frontend can't reliably match that once Accept-Language
    isn't English (see authentication error handling in login.tsx).
    """
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except serializers.ValidationError as exc:
            detail = exc.detail if isinstance(exc.detail, list) else [exc.detail]
            if any(str(message) == str(_('E-mail is not verified.')) for message in detail):
                raise serializers.ValidationError({
                    'non_field_errors': detail,
                    'code': 'email_not_verified',
                })
            raise


class RegisterSerializer(DefaultRegisterSerializer):
    language = serializers.CharField(required=False, default='fr')

    def validate_password(self, value):
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def save(self, request):
        user = super().save(request)
        language = self.validated_data.get('language', 'fr')
        user.language = language
        user.save()
        
        # On active la langue pour la requête actuelle afin que l'e-mail de confirmation
        # envoyé par allauth (via des signaux ou dans le save) utilise la bonne langue.
        translation.activate(language)
        return user
