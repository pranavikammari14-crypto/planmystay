from django.contrib import admin
from .models import TravelStats, TravelAchievement, TravelMemory

@admin.register(TravelStats)
class TravelStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_trips', 'current_streak', 'longest_streak', 'updated_at')

@admin.register(TravelAchievement)
class TravelAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'code', 'unlocked_at')
    list_filter = ('code',)

@admin.register(TravelMemory)
class TravelMemoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'destination', 'date', 'is_private', 'created_at')
    list_filter = ('is_private', 'date')
    search_fields = ('user__email', 'destination', 'caption')
