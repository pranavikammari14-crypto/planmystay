from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from apps.accounts.models import User
from apps.travel_album.models import TravelMemory

class TravelAlbumTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='priya@gmail.com',
            password='Password123!',
            name='Vijaya Priya'
        )
        self.user2 = User.objects.create_user(
            email='stranger@gmail.com',
            password='Password123!',
            name='Stranger'
        )

    def test_travel_album_private_by_default(self):
        self.client.force_authenticate(user=self.user1)
        res = self.client.post('/api/user/album', {
            'destination': 'Hawa Mahal, Jaipur',
            'caption': 'Sunset glow on pink terracotta facade',
            'photoUrl': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
            'tags': ['Jaipur', 'Architecture', 'Sunset']
        }, format='json')

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        memory = TravelMemory.objects.get(id=res.data['memory']['id'])
        self.assertTrue(memory.is_private)
        self.assertEqual(memory.user, self.user1)

    def test_user_isolation_privacy(self):
        """User 2 must not see or modify User 1's private memories."""
        memory1 = TravelMemory.objects.create(
            user=self.user1,
            destination='Qutub Minar',
            date='2026-09-10',
            photo_url='https://example.com/qutub.jpg',
            is_private=True
        )

        self.client.force_authenticate(user=self.user2)
        # GET user2 album should not include user1's memory
        res_list = self.client.get('/api/user/album')
        self.assertEqual(len(res_list.data['album']), 0)

        # Attempt to delete User 1's memory
        res_del = self.client.delete(f'/api/user/album/{memory1.id}')
        self.assertEqual(res_del.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(TravelMemory.objects.filter(id=memory1.id).exists())
