from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.payments.services import razorpay_service
from apps.payments.models import Payment

class RazorpayPaymentTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_create_payment_order(self):
        res = self.client.post('/api/payments/create-order', {
            'amount': 8500,
            'hotelName': 'ITC Kakatiya',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['success'])
        self.assertIn('orderId', res.data)
        self.assertEqual(res.data['amountInPaise'], 850000)
        self.assertEqual(res.data['amount'], 8500.0)

        # Audit payment record created in database
        payment = Payment.objects.get(razorpay_order_id=res.data['orderId'])
        self.assertEqual(payment.status, 'PENDING')
        self.assertEqual(payment.amount, Decimal('8500.00'))

    def test_verify_payment_signature(self):
        # 1. Create order
        res_order = self.client.post('/api/payments/create-order', {
            'amount': 5000,
            'hotelName': 'Taj Krishna',
        }, format='json')
        order_id = res_order.data['orderId']

        # 2. Verify payment
        res_verify = self.client.post('/api/payments/verify', {
            'orderId': order_id,
            'paymentId': f"pay_rzp_test_{order_id[-6:]}",
            'signature': 'test_signature',
        }, format='json')
        self.assertEqual(res_verify.status_code, status.HTTP_200_OK)
        self.assertTrue(res_verify.data['verified'])

        payment = Payment.objects.get(razorpay_order_id=order_id)
        self.assertEqual(payment.status, 'SUCCESS')
