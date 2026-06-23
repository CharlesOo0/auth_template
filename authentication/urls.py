from django.urls import path, include, re_path
from django.shortcuts import redirect
from dj_rest_auth.registration.views import VerifyEmailView

def email_confirmation_redirect(request, key):
    return redirect(f"http://localhost:5173/auth/verify-email/{key}")

urlpatterns = [
    # Priorité à la redirection vers le frontend
    re_path(
        r'^registration/account-confirm-email/(?P<key>[-:\w]+)/$',
        email_confirmation_redirect,
        name='account_confirm_email',
    ),
    
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('account-confirm-email/', VerifyEmailView.as_view(), name='account_email_verification_sent'),
]
