from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Favorite

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_email_verified"]
        read_only_fields = ["id", "is_email_verified"]


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "tmdb_id", "media_type", "created_at"]
        read_only_fields = ["id", "created_at"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    is_email_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "is_email_verified"]
        read_only_fields = ["id", "is_email_verified"]

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            is_email_verified=False,
        )
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class DetailSerializer(serializers.Serializer):
    detail = serializers.CharField()


class UserDetailSerializer(serializers.Serializer):
    detail = serializers.CharField()
    user = UserSerializer()


class EmailVerificationSentSerializer(UserDetailSerializer):
    pass


class EmailVerificationSerializer(UserDetailSerializer):
    pass

