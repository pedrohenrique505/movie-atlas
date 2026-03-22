from django.contrib import admin

from .models import Favorite, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "is_staff", "is_superuser")
    search_fields = ("username", "email")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "tmdb_id", "media_type", "created_at")
    search_fields = ("user__username", "user__email", "tmdb_id")
    list_filter = ("media_type", "created_at")