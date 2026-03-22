from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    email = models.EmailField(unique=True)


class Favorite(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("movie", "Movie"),
        ("tv", "TV"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    tmdb_id = models.IntegerField()
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "tmdb_id", "media_type"],
                name="unique_user_favorite"
            )
        ]