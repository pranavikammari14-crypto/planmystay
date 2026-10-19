from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User

class AccountsAuthTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@planmystay.in',
            password='AdminPassword123!',
            name='Master Admin'
        )
        self.owner = User.objects.create_user(
            email='owner@heritagehotel.in',
            password='OwnerPassword123!',
            name='Jaipur Palace Partner',
            role=User.Role.OWNER
        )
        self.customer = User.objects.create_user(
            email='customer@gmail.com',
            password='CustomerPassword123!',
            name='Rahul Sharma',
            role=User.Role.USER
        )

    def test_customer_registration(self):
        res = self.client.post('/api/auth/register', {
            'name': 'Pooja Verma',
            'email': 'pooja@example.com',
            'password': 'SecurePassword123!',
            'phone': '+91 9876543210'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['user']['role'], 'USER')
        self.assertIn('token', res.data)

    def test_registration_cannot_escalate_to_admin(self):
        """Public registration must strictly prevent creating an ADMIN account."""
        res = self.client.post('/api/auth/register', {
            'name': 'Malicious Hacker',
            'email': 'hacker@example.com',
            'password': 'SecurePassword123!',
            'role': 'ADMIN'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # Should be downgraded to USER
        self.assertEqual(res.data['user']['role'], 'USER')

    def test_login_success_and_failure(self):
        # Valid login
        res = self.client.post('/api/auth/login', {
            'email': 'customer@gmail.com',
            'password': 'CustomerPassword123!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('token', res.data)

        # Invalid password
        res_fail = self.client.post('/api/auth/login', {
            'email': 'customer@gmail.com',
            'password': 'WrongPassword999!'
        }, format='json')
        self.assertEqual(res_fail.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_only_access_to_user_management(self):
        # Customer cannot list all users
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/auth/admin/users')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can list all users
        self.client.force_authenticate(user=self.admin)
        res_admin = self.client.get('/api/auth/admin/users')
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res_admin.data['users']) >= 3)
