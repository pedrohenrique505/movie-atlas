from django.urls import path

from .views import (
    FavoriteDestroyView,
    FavoriteListCreateView,
    LoginView,
    LogoutView,
    MeView,
    RegisterView,
    SendVerificationEmailView,
    VerifyEmailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("verify-email/send/", SendVerificationEmailView.as_view(), name="send-verify-email"),
    path("verify-email/<uidb64>/<token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("favorites/", FavoriteListCreateView.as_view(), name="favorite-list-create"),
    path("favorites/<int:pk>/", FavoriteDestroyView.as_view(), name="favorite-destroy"),
]