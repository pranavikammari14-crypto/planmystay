from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.hotels.models import Hotel, Room
from apps.bookings.models import Booking

class BookingsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            email='traveler@india.com',
            password='Password123!',
            name='Arjun Mehra',
            role=User.Role.USER
        )
        self.hotel = Hotel.objects.create(
            id='test-boutique-stay',
            name='The Nilgiri Tea Bungalow',
            location='Ooty, Tamil Nadu',
            city='Ooty',
            state='Tamil Nadu',
            price_per_night=Decimal('5000.00'),
            is_approved=True,
            approval_status=Hotel.ApprovalStatus.APPROVED,
            description='Scenic hill retreat.'
        )
        # Room with inventory of strictly 1 room to test concurrency/double booking
        self.room = Room.objects.create(
            id='test-room-single-inventory',
            hotel=self.hotel,
            name='Colonial Fireplace Suite',
            price=Decimal('5000.00'),
            total_inventory=1,
            is_available=True
        )

    def test_booking_creation_with_server_calculated_pricing(self):
        """Server must calculate nights and 18% GST independently from client data."""
        self.client.force_authenticate(user=self.customer)
        check_in = date.today() + timedelta(days=10)
        check_out = date.today() + timedelta(days=13) # 3 nights

        res = self.client.post('/api/bookings/', {
            'hotel_id': self.hotel.id,
            'room_id': self.room.id,
            'check_in': check_in.isoformat(),
            'check_out': check_out.isoformat(),
            'guest_name': 'Arjun Mehra',
            'guest_email': 'traveler@india.com',
            'guest_phone': '+91 9988776655',
            'coupon_code': 'STAY2026', # Flat 2500 off
            'add_ons': ['Airport Luxury Transfer'], # 1500 add-on
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        booking_data = res.data['booking']
        # 3 nights * 5000 = 15000 base
        self.assertEqual(booking_data['basePrice'], 15000.0)
        # subtotal: 15000 + 1500 - 2500 = 14000. GST: 14000 * 0.18 = 2520. Total = 16520.
        self.assertEqual(booking_data['taxPrice'], 2520.0)
        self.assertEqual(booking_data['totalPrice'], 16520.0)

    def test_prevent_double_booking_and_overlapping_reservations(self):
        """When room inventory is 1, overlapping reservation must be rejected."""
        self.client.force_authenticate(user=self.customer)
        check_in = date.today() + timedelta(days=20)
        check_out = date.today() + timedelta(days=25)

        # First booking succeeds
        res1 = self.client.post('/api/bookings/', {
            'hotel_id': self.hotel.id,
            'room_id': self.room.id,
            'check_in': check_in.isoformat(),
            'check_out': check_out.isoformat(),
            'guest_name': 'Arjun Mehra',
            'guest_email': 'traveler@india.com',
            'guest_phone': '+91 9988776655',
        }, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Second booking with overlapping dates (days 22 to 24) must fail with 409 Conflict
        res2 = self.client.post('/api/bookings/', {
            'hotel_id': self.hotel.id,
            'room_id': self.room.id,
            'check_in': (date.today() + timedelta(days=22)).isoformat(),
            'check_out': (date.today() + timedelta(days=24)).isoformat(),
            'guest_name': 'Another Guest',
            'guest_email': 'other@india.com',
            'guest_phone': '+91 9111222333',
        }, format='json')
        self.assertEqual(res2.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('sold out', res2.data['error'])

    def test_booking_cancellation_and_refund_policy(self):
        """Cancellation more than 48 hours in advance receives full refund."""
        self.client.force_authenticate(user=self.customer)
        check_in = date.today() + timedelta(days=15) # 15 days in advance
        check_out = date.today() + timedelta(days=17)

        res = self.client.post('/api/bookings/', {
            'hotel_id': self.hotel.id,
            'room_id': self.room.id,
            'check_in': check_in.isoformat(),
            'check_out': check_out.isoformat(),
            'guest_name': 'Arjun Mehra',
            'guest_email': 'traveler@india.com',
            'guest_phone': '+91 9988776655',
        }, format='json')
        booking_id = res.data['booking']['id']

        # Cancel
        res_cancel = self.client.patch(f'/api/bookings/{booking_id}/cancel', {
            'reason': 'Change in holiday schedule'
        }, format='json')
        self.assertEqual(res_cancel.status_code, status.HTTP_200_OK)
        self.assertEqual(res_cancel.data['booking']['status'], 'CANCELLED')
        # Full refund
        self.assertEqual(res_cancel.data['refund']['refundAmount'], res.data['booking']['totalPrice'])
