from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.hotels.models import Hotel, Room

class HotelManagementTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@planmystay.in',
            password='AdminPassword123!',
            name='Master Admin'
        )
        self.owner1 = User.objects.create_user(
            email='owner1@palace.in',
            password='Password123!',
            name='Palace Owner',
            role=User.Role.OWNER
        )
        self.owner2 = User.objects.create_user(
            email='owner2@resort.in',
            password='Password123!',
            name='Resort Owner',
            role=User.Role.OWNER
        )
        self.customer = User.objects.create_user(
            email='user@gmail.com',
            password='Password123!',
            name='Guest User',
            role=User.Role.USER
        )

        # Approved Hotel
        self.hotel_approved = Hotel.objects.create(
            id='approved-hotel-01',
            owner=self.owner1,
            name='Royal Heritage Haveli',
            location='Old City, Udaipur',
            city='Udaipur',
            state='Rajasthan',
            price_per_night=Decimal('7500.00'),
            is_approved=True,
            approval_status=Hotel.ApprovalStatus.APPROVED,
            description='Authentic Haveli experience.'
        )
        Room.objects.create(
            id='room-approved-01',
            hotel=self.hotel_approved,
            name='Haveli Courtyard Room',
            price=Decimal('7500.00'),
            total_inventory=5,
            is_available=True
        )

        # Pending Hotel (Under review)
        self.hotel_pending = Hotel.objects.create(
            id='pending-hotel-02',
            owner=self.owner2,
            name='New Beach Resort',
            location='Candolim, Goa',
            city='Goa',
            state='Goa',
            price_per_night=Decimal('6000.00'),
            is_approved=False,
            approval_status=Hotel.ApprovalStatus.PENDING,
            description='Under review by platform admins.'
        )

    def test_public_hotel_search_only_returns_approved_hotels(self):
        """Unapproved / pending listings must NOT be published in public search."""
        res = self.client.get('/api/hotels/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        hotel_ids = [h['id'] for h in res.data['hotels']]
        self.assertIn('approved-hotel-01', hotel_ids)
        self.assertNotIn('pending-hotel-02', hotel_ids)

    def test_owner_hotel_isolation(self):
        """Owner 1 must not be able to modify Owner 2's property."""
        self.client.force_authenticate(user=self.owner1)
        res = self.client.put(f'/api/hotels/owner/properties/{self.hotel_pending.id}', {
            'name': 'Hacked Resort Name'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Verify name unchanged
        self.hotel_pending.refresh_from_db()
        self.assertEqual(self.hotel_pending.name, 'New Beach Resort')

    def test_admin_approval_workflow(self):
        """Admin can approve a pending listing, publishing it immediately."""
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/hotels/admin/{self.hotel_pending.id}/approval', {
            'action': 'approve'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.hotel_pending.refresh_from_db()
        self.assertTrue(self.hotel_pending.is_approved)
        self.assertEqual(self.hotel_pending.approval_status, 'APPROVED')

        # Now it appears in public search
        res_public = self.client.get('/api/hotels/')
        hotel_ids = [h['id'] for h in res_public.data['hotels']]
        self.assertIn('pending-hotel-02', hotel_ids)
