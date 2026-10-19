import uuid
from django.db import models

class SearchEvent(models.Model):
    """Anonymous telemetry tracking traveler search demand across India."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mode = models.CharField(max_length=50) # 'flights', 'trains', 'buses', 'hotels'
    origin = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=100, db_index=True)
    date = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.mode.upper()}: {self.origin or ''} -> {self.destination}"
