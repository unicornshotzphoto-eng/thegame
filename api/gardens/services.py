from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from .models import SharedGarden, GrowthState, CareAction, Plant


class GrowthCalculationService:
    """Handles all growth calculations"""

    @staticmethod
    def calculate_daily_growth(garden: SharedGarden) -> dict:
        """
        Calculate daily growth:
        - Base growth (time-based)
        - Care action growth
        - Multiplier (flat 1x for MVP)
        """
        growth_state = garden.growth_state
        plant = garden.plant

        # Time-based growth (since planting)
        if not garden.both_planted_at:
            return {
                'new_percentage': 0.0,
                'base_growth': 0.0,
                'action_growth': 0.0,
                'is_stage_advance': False
            }

        days_elapsed = (timezone.now() - garden.both_planted_at).days + 1
        base_growth = min(
            plant.base_growth_rate * days_elapsed * 100,
            100.0 - growth_state.growth_percentage
        )

        # Care actions today (UTC day)
        today = timezone.now().date()
        today_actions = CareAction.objects.filter(
            garden=garden,
            action_type='water',
            timestamp__date=today
        ).count()

        points_from_actions = today_actions * 10
        growth_from_actions = (points_from_actions / 100) * (plant.base_growth_rate * 100)

        # Total (no multiplier in MVP)
        total_growth = base_growth + growth_from_actions
        new_percentage = min(growth_state.growth_percentage + total_growth, 100.0)

        return {
            'new_percentage': new_percentage,
            'base_growth': base_growth,
            'action_growth': growth_from_actions,
            'is_stage_advance': GrowthCalculationService.check_stage_advance(
                growth_state, new_percentage, plant
            )
        }

    @staticmethod
    def check_stage_advance(growth_state, new_percentage, plant) -> bool:
        """Check if plant should advance to next stage"""
        current_stage = growth_state.current_stage

        # Stage thresholds (simplified MVP)
        stage_thresholds = {
            1: (0, 1),
            2: (25, 50),
            3: (50, 70),
            4: (70, 90),
            5: (90, 100),
        }

        if current_stage >= 5:
            return False

        min_threshold, max_threshold = stage_thresholds[current_stage]

        # Time gate (minimum days in stage)
        days_in_stage = (timezone.now() - growth_state.stage_started_at).days
        min_days_in_stage = {1: 2, 2: 3, 3: 3, 4: 3, 5: 1}

        return (
            new_percentage >= max_threshold and
            days_in_stage >= min_days_in_stage[current_stage]
        )

    @staticmethod
    def update_streak(garden: SharedGarden) -> dict:
        """
        Determine if streak should increment/break
        Streak increments if both users watered same calendar day
        """
        growth_state = garden.growth_state
        today = timezone.now().date()

        # Get waters today
        today_waters = CareAction.objects.filter(
            garden=garden,
            action_type='water',
            timestamp__date=today
        ).values_list('user_id', flat=True).distinct()

        both_watered_today = len(today_waters) == 2

        if both_watered_today:
            if growth_state.current_streak_days == 0:
                growth_state.streak_started_at = timezone.now()
            growth_state.current_streak_days += 1
            growth_state.all_time_max_streak = max(
                growth_state.all_time_max_streak,
                growth_state.current_streak_days
            )
        else:
            growth_state.current_streak_days = 0
            growth_state.streak_started_at = None

        return {
            'streak_days': growth_state.current_streak_days,
            'both_participated': both_watered_today,
        }

    @staticmethod
    def update_health_status(garden: SharedGarden) -> str:
        """Determine plant health based on last care + inactivity"""
        growth_state = garden.growth_state

        if growth_state.is_bloomed:
            return 'healthy'

        last_care = growth_state.last_care_action_at
        if not last_care:
            return 'healthy'

        days_inactive = (timezone.now() - last_care).days

        if days_inactive >= 7:
            return 'dead'
        elif days_inactive >= 3:
            return 'wilting'
        elif days_inactive >= 2:
            return 'declining'
        elif days_inactive >= 1:
            return 'healthy'
        else:
            return 'thriving'

    @staticmethod
    def check_auto_abandon(garden: SharedGarden) -> bool:
        """Check if garden should be auto-abandoned (7+ days inactivity)"""
        growth_state = garden.growth_state

        if garden.status in ['bloomed', 'abandoned', 'archived']:
            return False

        last_care = growth_state.last_care_action_at
        if not last_care:
            days_inactive = (timezone.now() - garden.both_planted_at).days if garden.both_planted_at else 0
        else:
            days_inactive = (timezone.now() - last_care).days

        if days_inactive >= 7:
            garden.status = 'abandoned'
            garden.save()
            return True

        return False


class CareActionService:
    """Handle care actions (watering, etc)"""

    @staticmethod
    def process_water_action(garden: SharedGarden, user) -> dict:
        """
        Process a water action:
        1. Validate user can water (once per 24 hours)
        2. Create CareAction
        3. Update GrowthState
        4. Check for stage advance
        5. Check streak
        6. Return updated state
        """

        # Validate: User is part of this garden
        if user not in [garden.user_a, garden.user_b]:
            raise PermissionError("User not part of this garden")

        # Validate: Garden is active
        if garden.status != 'active':
            raise ValueError(f"Garden is {garden.status}, cannot care for it")

        # Validate: User hasn't watered today (UTC)
        today = timezone.now().date()
        today_water = CareAction.objects.filter(
            garden=garden,
            user=user,
            action_type='water',
            timestamp__date=today
        ).first()

        if today_water:
            raise ValueError("Already watered today")

        # Create CareAction
        care_action = CareAction.objects.create(
            garden=garden,
            user=user,
            action_type='water',
            points_earned=10,
        )

        # Update GrowthState
        growth_state = garden.growth_state
        growth_state.last_care_action_at = timezone.now()

        # Recalculate growth
        growth_calc = GrowthCalculationService.calculate_daily_growth(garden)
        old_percentage = growth_state.growth_percentage
        growth_state.growth_percentage = growth_calc['new_percentage']
        care_action.growth_delta = growth_calc['new_percentage'] - old_percentage

        # Check stage advance
        if growth_calc['is_stage_advance'] and growth_state.current_stage < 5:
            growth_state.current_stage += 1
            growth_state.stage_started_at = timezone.now()

        # Check bloom
        if growth_state.growth_percentage >= 100.0:
            growth_state.is_bloomed = True
            growth_state.bloom_timestamp = timezone.now()
            growth_state.bloomed_at_streak = growth_state.current_streak_days
            growth_state.final_care_score = CareAction.objects.filter(
                garden=garden
            ).count() * 10

            # Determine bloom type
            other_user = garden.user_b if user == garden.user_a else garden.user_a
            other_watered_today = CareAction.objects.filter(
                garden=garden,
                user=other_user,
                action_type='water',
                timestamp__date=today
            ).exists()

            if other_watered_today:
                growth_state.bloom_type = 'perfect'
            else:
                growth_state.bloom_type = 'partial'

            garden.status = 'bloomed'

        # Update streak
        streak_info = GrowthCalculationService.update_streak(garden)
        care_action.is_synchronized = streak_info['both_participated']

        # Update health
        growth_state.health_status = GrowthCalculationService.update_health_status(garden)

        # Check auto-abandon
        GrowthCalculationService.check_auto_abandon(garden)

        # Save all
        care_action.save()
        growth_state.save()
        garden.save()

        return {
            'care_action_id': str(care_action.id),
            'growth_percentage': growth_state.growth_percentage,
            'current_stage': growth_state.current_stage,
            'streak_days': growth_state.current_streak_days,
            'is_bloomed': growth_state.is_bloomed,
            'bloom_type': growth_state.bloom_type,
            'health_status': growth_state.health_status,
            'synchronized': care_action.is_synchronized,
        }
