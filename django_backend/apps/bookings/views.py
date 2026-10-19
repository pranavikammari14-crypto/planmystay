from decimal import Decimal
from datetime import datetime, date, timedelta
from django.db import transaction
from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from apps.hotels.models import Hotel, Room

class BookingListCreateView(views.APIView):
    """
    List and create bookings with concurrency control & role-based visibility.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        queryset = Booking.objects.select_related('hotel', 'room', 'user')

        if user.is_authenticated:
            if user.role == 'ADMIN' or user.is_superuser:
                # Admins see all bookings
                pass
            elif user.role == 'OWNER':
                # Owners see bookings for properties they own
                queryset = queryset.filter(hotel__owner=user)
            else:
                # Customers see only their own bookings
                queryset = queryset.filter(user=user)
        else:
            # Guest lookup by email parameter
            guest_email = request.query_params.get('email')
            if guest_email:
                queryset = queryset.filter(guest_email=guest_email.strip().lower())
            else:
                return Response({'success': True, 'bookings': []})

        serializer = BookingSerializer(queryset, many=True)
        return Response({'success': True, 'bookings': serializer.data})

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        hotel = data['hotel_obj']
        room_obj = data['room_obj']
        check_in = data['check_in']
        check_out = data['check_out']
        guest_name = data['guest_name']
        guest_email = data['guest_email']
        guest_phone = data['guest_phone']
        special_requests = data.get('special_requests', '')
        add_ons = data.get('add_ons', [])
        coupon_code = data.get('coupon_code', '').strip().upper()

        # Database Transaction & Row Lock to prevent double bookings
        with transaction.atomic():
            # Lock the room row to serialize concurrent reservations for this room
            locked_room = Room.objects.select_for_update().get(id=room_obj.id)

            # Check overlapping active reservations
            overlapping_count = Booking.objects.filter(
                room=locked_room,
                status__in=[Booking.BookingStatus.CONFIRMED, Booking.BookingStatus.PENDING],
                check_in__lt=check_out,
                check_out__gt=check_in
            ).count()

            if overlapping_count >= locked_room.total_inventory:
                return Response({
                    'error': 'Selected room is sold out for these dates. Please choose different dates or room type.'
                }, status=status.HTTP_409_CONFLICT)

            # Server-Side Price Calculation (Do NOT trust client amounts)
            nights = max(1, (check_out - check_in).days)
            base_price = locked_room.price * nights
            add_ons_total = Decimal(len(add_ons) * 1500)

            discount = Decimal('0.00')
            if coupon_code == 'STAY2026':
                discount = Decimal('2500.00')
            elif coupon_code == 'WELCOME500':
                discount = Decimal('500.00')
            elif coupon_code == 'LUXURYWAY':
                discount = base_price * Decimal('0.20')

            taxable_subtotal = max(Decimal('0.00'), base_price + add_ons_total - discount)
            gst = (taxable_subtotal * Decimal('0.18')).quantize(Decimal('1.00'))
            total_price = taxable_subtotal + gst

            ref_id = Booking.generate_reference(hotel.city)

            booking = Booking.objects.create(
                id=ref_id,
                user=request.user if request.user.is_authenticated else None,
                hotel=hotel,
                room=locked_room,
                check_in=check_in,
                check_out=check_out,
                nights=nights,
                guests=data.get('guests', 2),
                guest_name=guest_name,
                guest_email=guest_email,
                guest_phone=guest_phone,
                special_requests=special_requests,
                add_ons=add_ons,
                base_price=base_price,
                tax_price=gst,
                total_price=total_price,
                coupon_code=coupon_code if discount > 0 else '',
                discount_amount=discount,
                status=Booking.BookingStatus.CONFIRMED,
                payment_method=request.data.get('paymentMethod', 'UPI (Google Pay / PhonePe)'),
                payment_id=request.data.get('paymentId', f"pay_{ref_id}"),
                is_paid=True,
            )

        return Response({
            'success': True,
            'message': f'Booking {booking.id} confirmed successfully.',
            'booking': BookingSerializer(booking).data,
        }, status=status.HTTP_201_CREATED)


class BookingDetailView(views.APIView):
    """Retrieve details of a single booking with authorization boundary."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            booking = Booking.objects.select_related('hotel', 'room', 'user').get(id=pk)
            # Enforce boundary
            if request.user.is_authenticated:
                if request.user.role == 'ADMIN' or request.user.is_superuser:
                    pass
                elif request.user.role == 'OWNER':
                    if booking.hotel.owner != request.user:
                        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
                else:
                    if booking.user != request.user and booking.guest_email != request.user.email:
                        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            return Response({'success': True, 'booking': BookingSerializer(booking).data})
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


class BookingCancelView(views.APIView):
    """
    Cancel an existing reservation with server-verified refund policy calculation.
    """
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk):
        try:
            booking = Booking.objects.select_related('hotel', 'user').get(id=pk)

            # Boundary check
            if request.user.is_authenticated:
                if request.user.role == 'ADMIN' or request.user.is_superuser:
                    pass
                elif request.user.role == 'OWNER' and booking.hotel.owner == request.user:
                    pass
                elif booking.user == request.user or booking.guest_email == request.user.email:
                    pass
                else:
                    return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

            if booking.status == Booking.BookingStatus.CANCELLED:
                return Response({'error': 'Booking is already cancelled.'}, status=status.HTTP_400_BAD_REQUEST)

            today = date.today()
            days_before_checkin = (booking.check_in - today).days

            # Server-verified refund calculation
            if days_before_checkin >= 2:
                refund_amt = booking.total_price  # 100% full refund
                refund_note = 'Full refund processed according to 48-hour free cancellation policy.'
            elif days_before_checkin >= 0:
                refund_amt = booking.total_price * Decimal('0.50')  # 50% refund
                refund_note = 'Partial 50% refund processed for late cancellation.'
            else:
                refund_amt = Decimal('0.00')
                refund_note = 'No refund available after scheduled check-in date.'

            booking.status = Booking.BookingStatus.CANCELLED
            booking.cancelled_at = timezone.now()
            booking.refund_amount = refund_amt
            booking.refund_status = 'REFUND_PROCESSED' if refund_amt > 0 else 'NO_REFUND_APPLICABLE'
            booking.cancellation_reason = request.data.get('reason', 'Customer requested cancellation')
            booking.save()

            return Response({
                'success': True,
                'message': f"Booking {booking.id} cancelled. {refund_note}",
                'booking': BookingSerializer(booking).data,
                'refund': {
                    'refundAmount': float(refund_amt),
                    'refundStatus': booking.refund_status,
                    'note': refund_note,
                }
            })
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)


class MyBookingsView(views.APIView):
    """
    Returns authenticated user's bookings.
    GET /api/my-bookings/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = (
            Booking.objects.filter(user=request.user)
            .select_related('hotel', 'room')
            .order_by('-created_at')
        )
        return Response({
            'success': True,
            'count': bookings.count(),
            'bookings': BookingSerializer(bookings, many=True).data,
        })
