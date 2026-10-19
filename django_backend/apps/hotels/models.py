import uuid
from django.db import models
from django.conf import settings

class Hotel(models.Model):
    """
    Hotel listing model with multi-tenant property owner assignment,
    full spreadsheet fields, and administrative verification workflow.
    """

    class VerificationStatus(models.TextChoices):
        PENDING_VERIFICATION = 'Pending Verification', 'Pending Verification'
        VERIFIED = 'Verified', 'Verified'
        REJECTED = 'Rejected', 'Rejected'
        TEMPORARILY_UNAVAILABLE = 'Temporarily Unavailable', 'Temporarily Unavailable'
        INACTIVE = 'Inactive', 'Inactive'

    class BookingAuthorizationStatus(models.TextChoices):
        DIRECT_BOOKING_AUTHORIZED = 'Direct Booking Authorized', 'Direct Booking Authorized'
        VERIFIED_INFORMATIONAL = 'Verified Informational Listing', 'Verified Informational Listing'
        EXTERNAL_OFFICIAL = 'External Official Channel', 'External Official Channel'

    id = models.CharField(primary_key=True, max_length=100, default=uuid.uuid4)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_hotels',
        help_text="Hotel Partner / Owner authorized to manage this property."
    )

    # Core Directory Fields
    state = models.CharField(max_length=100, db_index=True)
    city = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=255, db_index=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2, db_index=True)
    rating = models.FloatField(default=4.3)
    review_count = models.IntegerField(default=500)
    brand = models.CharField(max_length=100, default='Independent', db_index=True)
    full_address = models.CharField(max_length=500, blank=True, default='')
    room_types = models.JSONField(default=list, blank=True)
    amenities_list = models.JSONField(default=list, blank=True)
    check_in_time = models.CharField(max_length=20, default='12:00 PM')
    check_out_time = models.CharField(max_length=20, default='11:00 AM')
    cancellation_policy = models.CharField(
        max_length=255,
        default='Free cancellation up to 24 hours prior to check-in.'
    )
    official_url = models.URLField(max_length=500, blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, default='')
    contact_info = models.CharField(max_length=255, blank=True, default='+91 1800 209 1800')

    # Governance, Verification & Authorization
    verification_status = models.CharField(
        max_length=40,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING_VERIFICATION,
        db_index=True
    )
    verification_source = models.CharField(
        max_length=255,
        default='Corporate Directory & State Tourism Register'
    )
    last_verified_date = models.DateField(auto_now=True)
    booking_authorized = models.BooleanField(
        default=False,
        help_text="True only when valid inventory and booking authorization agreement are active."
    )
    booking_status = models.CharField(
        max_length=50,
        choices=BookingAuthorizationStatus.choices,
        default=BookingAuthorizationStatus.VERIFIED_INFORMATIONAL
    )
    rejection_reason = models.TextField(blank=True, null=True)
    verification_evidence = models.JSONField(default=dict, blank=True)
    audit_history = models.JSONField(default=list, blank=True)

    # Legacy Compatibility flags
    is_approved = models.BooleanField(default=False, db_index=True)
    is_sample_data = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price_per_night', '-rating']
        indexes = [
            models.Index(fields=['city', 'is_approved']),
            models.Index(fields=['brand', 'city']),
            models.Index(fields=['price_per_night']),
        ]

    def __str__(self):
        return f"{self.name} ({self.city}, {self.state}) - ₹{self.price_per_night}/night"

    def approve(self):
        self.approval_status = self.ApprovalStatus.APPROVED
        self.is_approved = True
        self.rejection_reason = None
        self.save()

    def reject(self, reason='Listing does not meet verification guidelines'):
        self.approval_status = self.ApprovalStatus.REJECTED
        self.is_approved = False
        self.rejection_reason = reason
        self.save()


class Room(models.Model):
    """Room type and live inventory under a specific hotel."""
    id = models.CharField(primary_key=True, max_length=100, default=uuid.uuid4)
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=255)
    room_type = models.CharField(max_length=100, default='Standard')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bed = models.CharField(max_length=100, default='1 Queen Bed')
    max_guests = models.IntegerField(default=2)
    sqft = models.IntegerField(default=280)
    perks = models.JSONField(default=list, blank=True)
    total_inventory = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.hotel.name} - {self.name} (₹{self.price}/night)"


class HotelImage(models.Model):
    """Hotel gallery images."""
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='images')
    url = models.URLField(max_length=1000)
    alt = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Image for {self.hotel.name} (#{self.order})"


class HotelAmenity(models.Model):
    """Specific hotel amenity tag."""
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='amenities')
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = 'Hotel Amenities'

    def __str__(self):
        return f"{self.name} ({self.hotel.name})"


class Favorite(models.Model):
    """Customer saved favorite stays."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'hotel')

    def __str__(self):
        return f"{self.user.email} -> {self.hotel.name}"


class HotelReview(models.Model):
    """Verified guest reviews."""
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    is_verified_stay = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user.email} for {self.hotel.name} ({self.rating}/5)"
