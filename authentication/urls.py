from django.urls import path, include, re_path
from django.shortcuts import redirect
from django.conf import settings
from dj_rest_auth.registration.views import VerifyEmailView
from . import views

def email_confirmation_redirect(request, key):
    return redirect(f"{settings.FRONTEND_URL}/auth/verify-email/{key}")

urlpatterns = [
    # Priorité à la redirection vers le frontend
    re_path(
        r'^registration/account-confirm-email/(?P<key>[-:\w]+)/$',
        email_confirmation_redirect,
        name='account_confirm_email',
    ),
    
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('google/', views.GoogleLogin.as_view(), name='google_login'),
    path('account-confirm-email/', VerifyEmailView.as_view(), name='account_email_verification_sent'),
]
