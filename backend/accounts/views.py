from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from .models import Favorite
from .serializers import (
    DetailSerializer,
    EmailVerificationSentSerializer,
    EmailVerificationSerializer,
    FavoriteSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .tokens import email_verification_token

User = get_user_model()


def build_detail_response(detail):
    return DetailSerializer({"detail": detail}).data


def build_user_detail_response(detail, user, serializer_class=EmailVerificationSerializer):
    return serializer_class({"detail": detail, "user": user}).data


def build_verification_url(request, user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = email_verification_token.make_token(user)
    path = reverse("verify-email", kwargs={"uidb64": uid, "token": token})
    return request.build_absolute_uri(path)


@extend_schema_view(
    get=extend_schema(
        operation_id="accounts_favorites_list",
        summary="Lista os favoritos do usuario autenticado",
        tags=["accounts"],
        responses={
            200: OpenApiResponse(
                response=FavoriteSerializer(many=True),
                examples=[
                    OpenApiExample(
                        "Favorite list response",
                        value=[
                            {
                                "id": 1,
                                "tmdb_id": 550,
                                "media_type": "movie",
                                "created_at": "2026-03-21T22:30:00-03:00",
                            }
                        ],
                    )
                ],
            ),
            403: DetailSerializer,
        },
    ),
    post=extend_schema(
        operation_id="accounts_favorites_create",
        summary="Cria um favorito para o usuario autenticado",
        tags=["accounts"],
        request=FavoriteSerializer,
        responses={
            201: FavoriteSerializer,
            400: DetailSerializer,
            403: DetailSerializer,
        },
    ),
)
class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        if not self.request.user.is_email_verified:
            raise PermissionDenied("Verifique seu e-mail antes de adicionar favoritos.")
        serializer.save(user=self.request.user)


@extend_schema_view(
    delete=extend_schema(
        operation_id="accounts_favorites_delete",
        summary="Remove um favorito do usuario autenticado",
        tags=["accounts"],
        responses={204: None, 403: DetailSerializer, 404: DetailSerializer},
    )
)
class FavoriteDestroyView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


@extend_schema_view(
    post=extend_schema(
        operation_id="accounts_register",
        summary="Cria uma conta de usuario",
        tags=["accounts"],
        request=RegisterSerializer,
        responses={201: RegisterSerializer, 400: DetailSerializer},
    )
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    @extend_schema(
        operation_id="accounts_login",
        summary="Autentica um usuario com sessao Django",
        tags=["accounts"],
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(
                response=UserSerializer,
                examples=[
                    OpenApiExample(
                        "Login response",
                        value={
                            "id": 1,
                            "username": "moviefan",
                            "email": "moviefan@example.com",
                            "is_email_verified": False,
                        },
                    )
                ],
            ),
            400: DetailSerializer,
        },
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                build_detail_response("Credenciais invalidas."),
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


class MeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        operation_id="accounts_me",
        summary="Retorna o usuario autenticado",
        tags=["accounts"],
        responses={200: UserSerializer, 403: DetailSerializer},
    )
    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DetailSerializer

    @extend_schema(
        operation_id="accounts_logout",
        summary="Encerra a sessao do usuario autenticado",
        tags=["accounts"],
        responses={
            200: OpenApiResponse(
                response=DetailSerializer,
                examples=[
                    OpenApiExample(
                        "Logout response",
                        value={"detail": "Logout realizado com sucesso."},
                    )
                ],
            ),
            403: DetailSerializer,
        },
    )
    def post(self, request):
        logout(request)
        return Response(
            build_detail_response("Logout realizado com sucesso."),
            status=status.HTTP_200_OK,
        )


class SendVerificationEmailView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EmailVerificationSentSerializer

    @extend_schema(
        operation_id="accounts_verify_email_send",
        summary="Envia o e-mail de verificacao para o usuario autenticado",
        tags=["accounts"],
        responses={
            200: OpenApiResponse(
                response=EmailVerificationSentSerializer,
                examples=[
                    OpenApiExample(
                        "Verification email sent response",
                        value={
                            "detail": "E-mail de verificacao enviado com sucesso.",
                            "user": {
                                "id": 1,
                                "username": "moviefan",
                                "email": "moviefan@example.com",
                                "is_email_verified": False,
                            },
                        },
                    )
                ],
            ),
            400: DetailSerializer,
            403: DetailSerializer,
        },
    )
    def post(self, request):
        user = request.user

        if user.is_email_verified:
            return Response(
                build_detail_response("E-mail ja verificado."),
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification_url = build_verification_url(request, user)

        send_mail(
            subject="Verifique seu e-mail",
            message=f"Use este link para verificar seu e-mail: {verification_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response(
            build_user_detail_response(
                "E-mail de verificacao enviado com sucesso.",
                user,
                serializer_class=EmailVerificationSentSerializer,
            ),
            status=status.HTTP_200_OK,
        )


class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = EmailVerificationSerializer

    @extend_schema(
        operation_id="accounts_verify_email_confirm",
        summary="Confirma a verificacao de e-mail por link com token",
        tags=["accounts"],
        parameters=[
            OpenApiParameter("uidb64", str, OpenApiParameter.PATH),
            OpenApiParameter("token", str, OpenApiParameter.PATH),
        ],
        responses={
            200: OpenApiResponse(
                response=EmailVerificationSerializer,
                examples=[
                    OpenApiExample(
                        "Verification confirmed response",
                        value={
                            "detail": "E-mail verificado com sucesso.",
                            "user": {
                                "id": 1,
                                "username": "moviefan",
                                "email": "moviefan@example.com",
                                "is_email_verified": True,
                            },
                        },
                    )
                ],
            ),
            400: DetailSerializer,
        },
    )
    def get(self, request, uidb64, token):
        try:
            user_id = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                build_detail_response("Link de verificacao invalido."),
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_email_verified:
            return Response(
                build_user_detail_response("E-mail ja verificado.", user),
                status=status.HTTP_200_OK,
            )

        if not email_verification_token.check_token(user, token):
            return Response(
                build_detail_response("Token de verificacao invalido ou expirado."),
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        return Response(
            build_user_detail_response("E-mail verificado com sucesso.", user),
            status=status.HTTP_200_OK,
        )
