import uuid
from django.db import models
from django.conf import settings
from apps.bookings.models import Booking

class TravelStats(models.Model):
    """User travel streaks and milestone metrics."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='travel_stats'
    )
    total_trips = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_trip_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Trips: {self.total_trips}, Streak: {self.current_streak}"


class TravelAchievement(models.Model):
    """Badges and achievements unlocked by travelers."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    code = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    description = models.TextField()
    badge_icon = models.CharField(max_length=50, default='Award')
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'code')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.name} - {self.title}"


class TravelMemory(models.Model):
    """
    Travel Album photo memories.
    Private by default to protect customer privacy and personal photo authorization.
    """
    id = models.CharField(primary_key=True, max_length=50, default=uuid.uuid4)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='travel_memories'
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='memories',
        help_text="Optional verified booking associated with this trip memory."
    )
    destination = models.CharField(max_length=255)
    date = models.DateField()
    caption = models.TextField(blank=True)
    photo_url = models.URLField(max_length=1000)
    tags = models.JSONField(default=list, blank=True)
    is_private = models.BooleanField(
        default=True,
        help_text="Private by default. Customer can choose to share selectively."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.user.name} @ {self.destination} ({self.date})"
