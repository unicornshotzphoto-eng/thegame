from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import Plant, SharedGarden, GrowthState, CareAction
from .serializers import (
    PlantSerializer,
    SharedGardenSerializer,
    SharedGardenDetailSerializer,
    GrowthStateSerializer,
    CareActionSerializer,
)
from .services import GrowthCalculationService, CareActionService


class PlantViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only access to seed templates"""
    queryset = Plant.objects.all()
    serializer_class = PlantSerializer
    permission_classes = [IsAuthenticated]


class SharedGardenViewSet(viewsets.ModelViewSet):
    """Create, list, and manage co-growing gardens"""
    serializer_class = SharedGardenSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return gardens for current user"""
        user = self.request.user
        return SharedGarden.objects.filter(
            Q(user_a=user) | Q(user_b=user)
        ).select_related('plant', 'user_a', 'user_b', 'growth_state')

    def get_serializer_class(self):
        """Use detail serializer for retrieve action"""
        if self.action == 'retrieve':
            return SharedGardenDetailSerializer
        return SharedGardenSerializer

    def create(self, request):
        """User A creates invitation to User B"""
        data = request.data.copy()
        data['user_a'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            try:
                garden = serializer.save(user_a=request.user)
                return Response(
                    self.get_serializer(garden).data,
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        """Get garden details with care history"""
        try:
            garden = self.get_queryset().get(pk=pk)
        except SharedGarden.DoesNotExist:
            return Response(
                {'detail': 'Garden not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user not in [garden.user_a, garden.user_b]:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(garden)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def accept(self, request, pk=None):
        """User B accepts invitation"""
        try:
            garden = self.get_queryset().get(pk=pk)
        except SharedGarden.DoesNotExist:
            return Response(
                {'detail': 'Garden not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if garden.user_b != request.user:
            return Response(
                {'detail': 'Only invited user can accept'},
                status=status.HTTP_403_FORBIDDEN
            )

        if garden.status != 'pending':
            return Response(
                {'detail': f'Garden is {garden.status}, cannot accept'},
                status=status.HTTP_400_BAD_REQUEST
            )

        garden.status = 'active'
        garden.accepted_at = timezone.now()
        garden.invitation_expires_at = None

        # Create initial GrowthState
        if not hasattr(garden, 'growth_state'):
            GrowthState.objects.create(garden=garden)

        garden.save()

        return Response(
            self.get_serializer(garden).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def plant(self, request, pk=None):
        """Both users confirm planting"""
        try:
            garden = self.get_queryset().get(pk=pk)
        except SharedGarden.DoesNotExist:
            return Response(
                {'detail': 'Garden not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user not in [garden.user_a, garden.user_b]:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        if garden.status != 'active':
            return Response(
                {'detail': 'Garden must be active'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if both have called plant
        if not garden.both_planted_at:
            garden.both_planted_at = timezone.now()
            garden.save()
            return Response(
                {
                    'detail': 'Waiting for partner...',
                    'both_planted': False,
                },
                status=status.HTTP_202_ACCEPTED
            )

        # Both have planted, initialize growth
        growth_state = garden.growth_state
        growth_state.growth_percentage = garden.plant.base_growth_rate * 100
        growth_state.save()

        return Response(
            self.get_serializer(garden).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def water(self, request, pk=None):
        """Water the plant"""
        try:
            garden = self.get_queryset().get(pk=pk)
        except SharedGarden.DoesNotExist:
            return Response(
                {'detail': 'Garden not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user not in [garden.user_a, garden.user_b]:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            result = CareActionService.process_water_action(garden, request.user)
            
            # Refresh garden state
            garden.refresh_from_db()
            
            return Response(
                {
                    'success': True,
                    'garden': self.get_serializer(garden).data,
                    'care_result': result,
                },
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionError as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get care action history"""
        try:
            garden = self.get_queryset().get(pk=pk)
        except SharedGarden.DoesNotExist:
            return Response(
                {'detail': 'Garden not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user not in [garden.user_a, garden.user_b]:
            return Response(
                {'detail': 'Not authorized'},
                status=status.HTTP_403_FORBIDDEN
            )

        actions = garden.care_actions.all()[:50]
        serializer = CareActionSerializer(actions, many=True)
        return Response(serializer.data)
