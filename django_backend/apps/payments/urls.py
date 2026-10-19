from django.urls import re_path
from .views import (
    CreateOrderView,
    VerifyPaymentView,
    RazorpayWebhookView,
    PaymentStatusView,
)

urlpatterns = [
    re_path(r'^status/?$', PaymentStatusView.as_view(), name='payment_status'),
    re_path(r'^create-order/?$', CreateOrderView.as_view(), name='payment_create_order'),
    re_path(r'^verify/?$', VerifyPaymentView.as_view(), name='payment_verify'),
    re_path(r'^webhook/?$', RazorpayWebhookView.as_view(), name='payment_webhook'),
]
