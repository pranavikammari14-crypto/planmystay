import json
from decimal import Decimal
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Payment
from .services import razorpay_service
from apps.bookings.models import Booking

class CreateOrderView(views.APIView):
    """
    Create a Razorpay order with server-calculated or verified amount.
    Never trusts client amounts blindly when a booking ID is provided.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        booking_id = request.data.get('bookingId') or request.data.get('booking_id')
        receipt = f"rcpt_{booking_id}" if booking_id else f"rcpt_{int(Decimal(request.data.get('amount', 5000)))}"

        booking = None
        if booking_id:
            try:
                booking = Booking.objects.get(id=booking_id)
                amount_in_rupees = booking.total_price
            except Booking.DoesNotExist:
                return Response({'error': 'Invalid booking specified'}, status=status.HTTP_404_NOT_FOUND)
        else:
            raw_amount = request.data.get('amount')
            if not raw_amount:
                return Response({'error': 'Amount or bookingId is required'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                amount_in_rupees = Decimal(str(raw_amount))
            except Exception:
                return Response({'error': 'Invalid amount format'}, status=status.HTTP_400_BAD_REQUEST)

        notes = {
            'hotel_name': request.data.get('hotelName', 'PlanMyStay Heritage'),
            'booking_id': str(booking_id or 'DIRECT'),
            'guest_name': request.data.get('guestName', 'Guest Traveler'),
        }

        try:
            order_data = razorpay_service.create_order(
                amount_in_rupees=amount_in_rupees,
                receipt=receipt,
                notes=notes
            )

            # Record pending payment in database for audit & idempotency
            Payment.objects.create(
                booking=booking,
                user=request.user if request.user.is_authenticated else (booking.user if booking else None),
                razorpay_order_id=order_data['order_id'],
                amount=Decimal(str(amount_in_rupees)),
                amount_in_paise=order_data['amount_in_paise'],
                currency=order_data.get('currency', 'INR'),
                status=Payment.PaymentStatus.PENDING,
                is_live_mode=order_data.get('is_live', False),
                metadata=notes,
            )

            return Response({
                'success': True,
                'orderId': order_data['order_id'],
                'amount': order_data['amount'],
                'amountInPaise': order_data['amount_in_paise'],
                'currency': order_data['currency'],
                'keyId': order_data['key_id'],
                'isLive': order_data.get('is_live', False),
                'provider': order_data.get('provider'),
            })
        except Exception as e:
            return Response({'error': 'Failed to create payment order'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyPaymentView(views.APIView):
    """
    Verify payment signature server-side and update booking status.
    Idempotent operation preventing duplicate settlement triggers.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('orderId') or request.data.get('order_id')
        payment_id = request.data.get('paymentId') or request.data.get('payment_id')
        signature = request.data.get('signature', '')
        booking_id = request.data.get('bookingId') or request.data.get('booking_id')

        if not order_id or not payment_id:
            return Response({'error': 'orderId and paymentId are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Cryptographic verification
        is_valid = razorpay_service.verify_payment_signature(
            razorpay_order_id=order_id,
            razorpay_payment_id=payment_id,
            razorpay_signature=signature
        )

        if not is_valid:
            return Response({
                'success': False,
                'error': 'Payment signature verification failed. Tampered or invalid credentials.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Idempotently update payment record and booking
        with transaction.atomic():
            payment = Payment.objects.filter(razorpay_order_id=order_id).first()
            if payment:
                payment.razorpay_payment_id = payment_id
                payment.razorpay_signature = signature
                payment.status = Payment.PaymentStatus.SUCCESS
                payment.method = request.data.get('paymentMethod', 'UPI')
                payment.save()

            if booking_id:
                try:
                    booking = Booking.objects.get(id=booking_id)
                    booking.status = Booking.BookingStatus.CONFIRMED
                    booking.payment_id = payment_id
                    booking.is_paid = True
                    booking.save()
                except Booking.DoesNotExist:
                    pass

        return Response({
            'success': True,
            'verified': True,
            'message': 'Payment verified and reservation confirmed.',
            'orderId': order_id,
            'paymentId': payment_id,
        })


@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(views.APIView):
    """
    Official Razorpay Webhook receiver for automated payment capture reconciliation.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        signature = request.headers.get('X-Razorpay-Signature', '')
        raw_body = request.body

        # Verify signature if secret configured
        if razorpay_service.webhook_secret:
            if not razorpay_service.verify_webhook_signature(raw_body, signature):
                return Response({'error': 'Invalid webhook signature'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            event = json.loads(raw_body)
            event_type = event.get('event')
            payload = event.get('payload', {})

            if event_type == 'payment.captured':
                payment_entity = payload.get('payment', {}).get('entity', {})
                order_id = payment_entity.get('order_id')
                pay_id = payment_entity.get('id')

                payment = Payment.objects.filter(razorpay_order_id=order_id).first()
                if payment:
                    payment.razorpay_payment_id = pay_id
                    payment.status = Payment.PaymentStatus.SUCCESS
                    payment.save()
                    if payment.booking:
                        payment.booking.status = Booking.BookingStatus.CONFIRMED
                        payment.booking.is_paid = True
                        payment.booking.payment_id = pay_id
                        payment.booking.save()

            elif event_type == 'payment.failed':
                payment_entity = payload.get('payment', {}).get('entity', {})
                order_id = payment_entity.get('order_id')
                payment = Payment.objects.filter(razorpay_order_id=order_id).first()
                if payment:
                    payment.status = Payment.PaymentStatus.FAILED
                    payment.save()

            return Response({'status': 'webhook processed'})
        except Exception:
            return Response({'error': 'Failed to process webhook'}, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatusView(views.APIView):
    """Status endpoint for payments gateway."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(razorpay_service.get_status())
