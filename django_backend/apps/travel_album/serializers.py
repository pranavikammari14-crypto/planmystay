from rest_framework import serializers
from .models import TravelStats, TravelAchievement, TravelMemory

class TravelStatsSerializer(serializers.ModelSerializer):
    userId = serializers.ReadOnlyField(source='user_id')
    totalTrips = serializers.ReadOnlyField(source='total_trips')
    currentStreak = serializers.ReadOnlyField(source='current_streak')
    longestStreak = serializers.ReadOnlyField(source='longest_streak')
    nextMilestone = serializers.SerializerMethodField()

    class Meta:
        model = TravelStats
        fields = ['userId', 'totalTrips', 'currentStreak', 'longestStreak', 'nextMilestone']

    def get_nextMilestone(self, obj):
        target = 1 if obj.total_trips < 1 else 3 if obj.total_trips < 3 else 5 if obj.total_trips < 5 else 10
        name = 'First Voyage' if target == 1 else 'Weekend Wanderer' if target == 3 else 'Heritage Connoisseur' if target == 5 else 'Grand Voyager'
        return {
            'target': target,
            'name': name,
            'remaining': max(0, target - obj.total_trips),
        }


class TravelAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelAchievement
        fields = ['id', 'code', 'title', 'description', 'badge_icon', 'unlocked_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['badgeIcon'] = instance.badge_icon
        data['unlockedAt'] = instance.unlocked_at.isoformat()
        return data


class TravelMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelMemory
        fields = [
            'id',
            'destination',
            'date',
            'caption',
            'photo_url',
            'tags',
            'is_private',
            'booking',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Frontend compatibility mappings
        data['userId'] = str(instance.user_id)
        data['photoUrl'] = instance.photo_url
        data['isPrivate'] = instance.is_private
        data['date'] = instance.date.isoformat() if hasattr(instance.date, 'isoformat') else str(instance.date)
        if instance.booking_id:
            data['bookingId'] = instance.booking_id
        return data
