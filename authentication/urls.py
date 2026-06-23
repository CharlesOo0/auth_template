from django.urls import path, include, re_path
from dj_rest_auth.registration.views import VerifyEmailView, ConfirmEmailView

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    
    # Email verification routes
    re_path(
        r'^registration/account-confirm-email/(?P<key>[-:\w]+)/$',
        ConfirmEmailView.as_view(),
        name='account_confirm_email',
    ),
    path('account-confirm-email/', VerifyEmailView.as_view(), name='account_email_verification_sent'),
]
