import random
from datetime import date
from django.db import models
from django.conf import settings
from apps.hotels.models import Hotel, Room

class Booking(models.Model):
    """
    Hotel & Stay reservation model with strict lifecycle state,
    server-calculated pricing, and double-booking prevention.
    """

    class BookingStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment / Confirmation'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        CANCELLED = 'CANCELLED', 'Cancelled'
        COMPLETED = 'COMPLETED', 'Completed'

    id = models.CharField(primary_key=True, max_length=50, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    hotel = models.ForeignKey(Hotel, on_delete=models.PROTECT, related_name='bookings')
    room = models.ForeignKey(Room, on_delete=models.PROTECT, related_name='bookings', null=True, blank=True)

    # Dates & Capacity
    check_in = models.DateField(db_index=True)
    check_out = models.DateField(db_index=True)
    nights = models.PositiveIntegerField(default=1)
    guests = models.PositiveIntegerField(default=2)

    # Guest Contact
    guest_name = models.CharField(max_length=255)
    guest_email = models.EmailField(db_index=True)
    guest_phone = models.CharField(max_length=30)
    special_requests = models.TextField(blank=True, default='')
    add_ons = models.JSONField(default=list, blank=True)

    # Server-Calculated Financials
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Status & Payment
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING,
        db_index=True
    )
    payment_method = models.CharField(max_length=100, default='UPI / Card / NetBanking')
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    is_paid = models.BooleanField(default=False)

    # Cancellation & Refund
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    refund_status = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['hotel', 'room', 'check_in', 'check_out']),
            models.Index(fields=['guest_email']),
        ]

    def __str__(self):
        return f"{self.id} - {self.hotel.name} ({self.guest_name}) [{self.status}]"

    @classmethod
    def generate_reference(cls, city='INDIA'):
        prefix = city[:3].upper() if city else 'IND'
        num = random.randint(10000, 99999)
        ref = f"PMS-{prefix}-{num}"
        while cls.objects.filter(id=ref).exists():
            num = random.randint(10000, 99999)
            ref = f"PMS-{prefix}-{num}"
        return ref
