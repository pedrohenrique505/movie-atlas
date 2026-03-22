from django.urls import path

from .views import FavoriteDestroyView, FavoriteListCreateView

urlpatterns = [
    path("favorites/", FavoriteListCreateView.as_view(), name="favorite-list-create"),
    path("favorites/<int:pk>/", FavoriteDestroyView.as_view(), name="favorite-destroy"),
]