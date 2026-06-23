from django.contrib.auth.models import User
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer as DefaultRegisterSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(DefaultRegisterSerializer):
    def save(self, request):
        user = super().save(request)
        return user
