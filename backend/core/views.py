from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework.response import Response
from rest_framework.views import APIView


def build_health_payload():
    return {
        'status': 'ok',
        'service': 'movie-atlas-api',
    }


class HealthCheckView(APIView):
    @extend_schema(
        operation_id='health_check',
        summary='Verifica se a API esta saudavel',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'status': {'type': 'string', 'example': 'ok'},
                        'service': {
                            'type': 'string',
                            'example': 'movie-atlas-api',
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Health check response',
                        value={'status': 'ok', 'service': 'movie-atlas-api'},
                    )
                ],
            )
        },
    )
    def get(self, request):
        return Response(build_health_payload())
