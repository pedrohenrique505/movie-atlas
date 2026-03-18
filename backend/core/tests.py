from django.test import SimpleTestCase
from rest_framework.test import APITestCase

from .views import build_health_payload


class HealthPayloadUnitTests(SimpleTestCase):
    def test_build_health_payload_returns_expected_contract(self):
        payload = build_health_payload()

        self.assertEqual(payload['status'], 'ok')
        self.assertEqual(payload['service'], 'movie-atlas-api')


class HealthCheckIntegrationTests(APITestCase):
    def test_health_endpoint_returns_200(self):
        response = self.client.get('/api/health')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {'status': 'ok', 'service': 'movie-atlas-api'},
        )
