from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantViewSet, SharedGardenViewSet

router = DefaultRouter()
router.register(r'plants', PlantViewSet, basename='plant')
router.register(r'', SharedGardenViewSet, basename='garden')

urlpatterns = [
    path('', include(router.urls)),
]
