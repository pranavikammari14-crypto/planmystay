import uuid
from django.db import models
from django.conf import settings
from apps.bookings.models import Booking

class Payment(models.Model):
    """
    Razorpay transaction audit record.
    Maintains tamper-proof records of order IDs, payment IDs, signatures,
    and webhook settlement states.
    """

    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment Capture'
        SUCCESS = 'SUCCESS', 'Payment Verified & Captured'
        FAILED = 'FAILED', 'Payment Failed'
        REFUNDED = 'REFUNDED', 'Payment Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments',
        null=True,
        blank=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments'
    )

    # Razorpay Transaction Identifiers
    razorpay_order_id = models.CharField(max_length=100, unique=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)

    # Financials
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount in INR Rupees")
    amount_in_paise = models.BigIntegerField(help_text="Amount in Paise (Rupees * 100)")
    currency = models.CharField(max_length=10, default='INR')

    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True
    )
    method = models.CharField(max_length=50, default='UPI')
    is_live_mode = models.BooleanField(default=False)

    # Webhook & Idempotency
    idempotency_key = models.CharField(max_length=100, unique=True, blank=True, null=True)
    webhook_event_id = models.CharField(max_length=100, blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.razorpay_order_id} - ₹{self.amount} [{self.status}]"
