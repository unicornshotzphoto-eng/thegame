from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

# Create your tests here.

class HealthCheckTestCase(APITestCase):
    """
    Test case for the health check endpoint
    """
    
    def test_health_check_endpoint(self):
        """
        Test that the health check endpoint returns a successful response
        """
        url = reverse('health_check')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {'status': 'healthy'})
    
    def test_imports_are_correct(self):
        """
        Test that all necessary imports work correctly
        """
        # This test will fail if imports are broken
        from authentication import views
        from rest_framework import status as drf_status
        from rest_framework.decorators import api_view
        from rest_framework.response import Response
        
        # Verify the view function exists
        self.assertTrue(callable(views.health_check))

