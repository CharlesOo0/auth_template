from django.conf import settings
from dj_rest_auth.views import LoginView as DefaultLoginView
from dj_rest_auth.registration.views import RegisterView as DefaultRegisterView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView


class LoginView(DefaultLoginView):
    """Same as dj-rest-auth's LoginView, rate-limited against brute force."""
    throttle_scope = 'login'


class RegisterView(DefaultRegisterView):
    """Same as dj-rest-auth's RegisterView, rate-limited against abuse."""
    throttle_scope = 'registration'


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = settings.FRONTEND_URL
    client_class = OAuth2Client
    throttle_scope = 'login'
