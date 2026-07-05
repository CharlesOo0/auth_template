from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from allauth.account.models import EmailAddress

User = get_user_model()


class RegistrationTests(APITestCase):
    def test_weak_password_is_rejected(self):
        response = self.client.post('/api/registration/', {
            'username': 'bob',
            'email': 'bob@example.com',
            'password1': 'alllowercase',
            'password2': 'alllowercase',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='bob').exists())

    def test_strong_password_creates_unverified_user(self):
        response = self.client.post('/api/registration/', {
            'username': 'alice',
            'email': 'alice@example.com',
            'password1': 'Str0ng!Pass',
            'password2': 'Str0ng!Pass',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='alice')
        self.assertFalse(EmailAddress.objects.get(user=user).verified)


class LoginTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='carol', email='carol@example.com', password='Str0ng!Pass',
        )

    def test_login_blocked_before_email_verification(self):
        response = self.client.post('/api/login/', {
            'email': 'carol@example.com',
            'password': 'Str0ng!Pass',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('code'), ['email_not_verified'])

    def test_login_succeeds_and_sets_jwt_cookies_after_verification(self):
        EmailAddress.objects.create(
            user=self.user, email=self.user.email, primary=True, verified=True,
        )
        response = self.client.post('/api/login/', {
            'email': 'carol@example.com',
            'password': 'Str0ng!Pass',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('jwt-auth', response.cookies)
        self.assertIn('jwt-refresh-auth', response.cookies)

    def test_logout_clears_jwt_cookies(self):
        EmailAddress.objects.create(
            user=self.user, email=self.user.email, primary=True, verified=True,
        )
        self.client.post('/api/login/', {
            'email': 'carol@example.com',
            'password': 'Str0ng!Pass',
        })
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies['jwt-auth'].value, '')
        self.assertEqual(response.cookies['jwt-refresh-auth'].value, '')


@override_settings(REST_FRAMEWORK={
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'login': '2/min',
        'registration': '2/min',
    },
})
class ThrottleTests(APITestCase):
    def test_login_endpoint_is_rate_limited(self):
        credentials = {'email': 'nobody@example.com', 'password': 'wrong'}
        for _ in range(2):
            self.client.post('/api/login/', credentials)
        response = self.client.post('/api/login/', credentials)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)