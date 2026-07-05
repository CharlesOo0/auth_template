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

    # Throttled overrides - must come before the dj_rest_auth includes below
    # so they take precedence over the default (unthrottled) views.
    path('login/', views.LoginView.as_view(), name='rest_login'),
    path('registration/', views.RegisterView.as_view(), name='rest_register'),
    path('google/', views.GoogleLogin.as_view(), name='google_login'),
    path('verify-otp/', views.VerifyOTPView.as_view(), name='verify_otp'),
    path('resend-otp/', views.ResendOTPView.as_view(), name='resend_otp'),

    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('account-confirm-email/', VerifyEmailView.as_view(), name='account_email_verification_sent'),
]
