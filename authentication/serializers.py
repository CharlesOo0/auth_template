from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.utils import translation
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer as DefaultRegisterSerializer
from .models import UserProfile

class UserSerializer(serializers.ModelSerializer):
    language = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'language')

    def get_language(self, obj):
        try:
            return obj.profile.language
        except UserProfile.DoesNotExist:
            return 'fr'

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
        UserProfile.objects.get_or_create(user=user, defaults={'language': language})
        
        # On active la langue pour la requête actuelle afin que l'e-mail de confirmation
        # envoyé par allauth (via des signaux ou dans le save) utilise la bonne langue.
        translation.activate(language)
        return user
