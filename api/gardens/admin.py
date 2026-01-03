from django.contrib import admin
from .models import Plant, SharedGarden, GrowthState, CareAction


@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'duration_days', 'base_growth_rate', 'difficulty']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['name', 'id']


@admin.register(SharedGarden)
class SharedGardenAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_a', 'user_b', 'plant', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user_a__username', 'user_b__username', 'plant__name']
    readonly_fields = ['id', 'created_at']


@admin.register(GrowthState)
class GrowthStateAdmin(admin.ModelAdmin):
    list_display = ['garden', 'growth_percentage', 'current_stage', 'current_streak_days', 'is_bloomed']
    list_filter = ['is_bloomed', 'bloom_type', 'health_status']
    readonly_fields = ['updated_at']


@admin.register(CareAction)
class CareActionAdmin(admin.ModelAdmin):
    list_display = ['user', 'garden', 'action_type', 'timestamp', 'points_earned']
    list_filter = ['action_type', 'timestamp']
    search_fields = ['user__username', 'garden__id']
    readonly_fields = ['id', 'timestamp']
