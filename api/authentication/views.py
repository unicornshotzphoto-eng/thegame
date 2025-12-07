from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Create your views here.

@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint
    """
    return Response({'status': 'healthy'}, status=status.HTTP_200_OK)
