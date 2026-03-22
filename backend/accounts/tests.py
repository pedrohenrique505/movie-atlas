from django.contrib.auth import get_user_model
from django.core import mail
from django.test import override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Favorite
from .tokens import email_verification_token

User = get_user_model()


@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
class AccountsAPITests(APITestCase):
    def setUp(self):
        self.password = "strong-pass-123"
        self.user = User.objects.create_user(
            username="moviefan",
            email="moviefan@example.com",
            password=self.password,
            is_email_verified=False,
        )

    def login(self):
        return self.client.post(
            "/api/accounts/login/",
            {"username": self.user.username, "password": self.password},
            format="json",
        )

    def verify_user(self, user=None):
        target_user = user or self.user
        target_user.is_email_verified = True
        target_user.save(update_fields=["is_email_verified"])
        return target_user

    def test_register_creates_user_with_email_unverified(self):
        response = self.client.post(
            "/api/accounts/register/",
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "another-strong-pass",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.json(),
            {
                "id": User.objects.get(username="newuser").id,
                "username": "newuser",
                "email": "newuser@example.com",
                "is_email_verified": False,
            },
        )
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_login_returns_authenticated_user_payload(self):
        response = self.login()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            {
                "id": self.user.id,
                "username": "moviefan",
                "email": "moviefan@example.com",
                "is_email_verified": False,
            },
        )

    def test_me_returns_authenticated_user(self):
        self.login()

        response = self.client.get("/api/accounts/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            {
                "id": self.user.id,
                "username": "moviefan",
                "email": "moviefan@example.com",
                "is_email_verified": False,
            },
        )

    def test_logout_clears_session(self):
        self.login()

        response = self.client.post("/api/accounts/logout/")
        me_response = self.client.get("/api/accounts/me/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.json(),
            {"detail": "Logout realizado com sucesso."},
        )
        self.assertEqual(me_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_send_verification_email_sends_message_for_unverified_user(self):
        self.login()

        response = self.client.post("/api/accounts/verify-email/send/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["detail"], "E-mail de verificacao enviado com sucesso.")
        self.assertEqual(response.json()["user"]["id"], self.user.id)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["moviefan@example.com"])
        self.assertIn("/api/accounts/verify-email/", mail.outbox[0].body)

    def test_verify_email_confirms_user(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = email_verification_token.make_token(self.user)

        response = self.client.get(f"/api/accounts/verify-email/{uid}/{token}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_email_verified)
        self.assertEqual(response.json()["detail"], "E-mail verificado com sucesso.")
        self.assertTrue(response.json()["user"]["is_email_verified"])

    def test_favorites_require_authentication(self):
        response = self.client.get("/api/accounts/favorites/")

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unverified_user_cannot_create_favorite(self):
        self.login()

        response = self.client.post(
            "/api/accounts/favorites/",
            {"tmdb_id": 550, "media_type": "movie"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.json(),
            {"detail": "Verifique seu e-mail antes de adicionar favoritos."},
        )
        self.assertFalse(Favorite.objects.filter(user=self.user).exists())

    def test_verified_user_can_create_list_and_delete_favorite(self):
        self.verify_user()
        self.login()

        create_response = self.client.post(
            "/api/accounts/favorites/",
            {"tmdb_id": 550, "media_type": "movie"},
            format="json",
        )
        favorite_id = create_response.json()["id"]
        list_response = self.client.get("/api/accounts/favorites/")
        delete_response = self.client.delete(f"/api/accounts/favorites/{favorite_id}/")

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.json()["tmdb_id"], 550)
        self.assertEqual(create_response.json()["media_type"], "movie")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["id"], favorite_id)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Favorite.objects.filter(pk=favorite_id).exists())
