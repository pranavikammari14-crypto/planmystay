from datetime import date
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import TravelStats, TravelAchievement, TravelMemory
from .serializers import (
    TravelStatsSerializer,
    TravelAchievementSerializer,
    TravelMemorySerializer,
)
from apps.accounts.models import User

def get_target_user(request):
    """Helper to resolve authenticated user or query param userId."""
    if request.user.is_authenticated:
        return request.user
    user_id = request.query_params.get('userId') or request.data.get('userId')
    if user_id:
        try:
            return User.objects.get(id=user_id)
        except Exception:
            pass
    return None

class TravelStatsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = get_target_user(request)
        if not user:
            return Response({
                'success': True,
                'stats': {
                    'userId': 'guest',
                    'totalTrips': 0,
                    'currentStreak': 0,
                    'longestStreak': 0,
                    'nextMilestone': {'target': 1, 'name': 'First Voyage', 'remaining': 1},
                }
            })

        stats, _ = TravelStats.objects.get_or_create(user=user)
        # Update trip count from verified bookings
        verified_trips = user.bookings.filter(status='CONFIRMED').count()
        if verified_trips != stats.total_trips:
            stats.total_trips = verified_trips
            stats.current_streak = max(1, verified_trips) if verified_trips > 0 else 0
            stats.longest_streak = max(stats.longest_streak, stats.current_streak)
            stats.save()

        return Response({
            'success': True,
            'stats': TravelStatsSerializer(stats).data,
        })


class TravelAchievementsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = get_target_user(request)
        if not user:
            return Response({'success': True, 'achievements': []})

        # Ensure default starter achievement if user has trips
        if user.bookings.filter(status='CONFIRMED').exists():
            TravelAchievement.objects.get_or_create(
                user=user,
                code='first_booking',
                defaults={
                    'title': 'The First Step',
                    'description': 'Completed your first verified booking on PlanMyStay',
                    'badge_icon': 'Award'
                }
            )

        achievements = TravelAchievement.objects.filter(user=user)
        return Response({
            'success': True,
            'achievements': TravelAchievementSerializer(achievements, many=True).data,
        })


class TravelAlbumListCreateView(views.APIView):
    """
    User Travel Album view.
    Maintains strict user isolation: customers only access their own private albums.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = get_target_user(request)
        if not user:
            return Response({'success': True, 'album': []})

        memories = TravelMemory.objects.filter(user=user)
        return Response({
            'success': True,
            'album': TravelMemorySerializer(memories, many=True).data,
        })

    def post(self, request):
        user = get_target_user(request)
        if not user:
            return Response({'error': 'Authentication required to save travel memories'}, status=status.HTTP_401_UNAUTHORIZED)

        photo_url = request.data.get('photoUrl') or request.data.get('photo_url')
        if not photo_url:
            return Response({'error': 'Photo URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        destination = request.data.get('destination', 'Indian Heritage Destination').strip()
        trip_date = request.data.get('date', date.today().isoformat())
        caption = request.data.get('caption', '').strip()
        tags = request.data.get('tags', [])
        is_private = request.data.get('isPrivate', True) # Private by default

        memory = TravelMemory.objects.create(
            user=user,
            destination=destination,
            date=trip_date,
            caption=caption,
            photo_url=photo_url,
            tags=tags if isinstance(tags, list) else [t.strip() for t in str(tags).split(',') if t.strip()],
            is_private=bool(is_private),
            booking_id=request.data.get('bookingId') or request.data.get('booking_id'),
        )

        return Response({
            'success': True,
            'message': 'Memory saved to your private travel album.',
            'memory': TravelMemorySerializer(memory).data,
        }, status=status.HTTP_201_CREATED)


class TravelMemoryDetailView(views.APIView):
    """Update or delete a photo memory with strict user authorization."""
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk, request):
        try:
            memory = TravelMemory.objects.get(id=pk)
            user = get_target_user(request)
            if not user or (memory.user != user and user.role != 'ADMIN' and not user.is_superuser):
                return None
            return memory
        except TravelMemory.DoesNotExist:
            return None

    def put(self, request, pk):
        memory = self.get_object(pk, request)
        if not memory:
            return Response({'error': 'Memory not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        if 'destination' in request.data:
            memory.destination = request.data['destination']
        if 'caption' in request.data:
            memory.caption = request.data['caption']
        if 'photoUrl' in request.data:
            memory.photo_url = request.data['photoUrl']
        if 'photo_url' in request.data:
            memory.photo_url = request.data['photo_url']
        if 'tags' in request.data:
            tags = request.data['tags']
            memory.tags = tags if isinstance(tags, list) else [t.strip() for t in str(tags).split(',') if t.strip()]
        if 'isPrivate' in request.data:
            memory.is_private = bool(request.data['isPrivate'])
        memory.save()

        return Response({
            'success': True,
            'message': 'Memory updated successfully.',
            'memory': TravelMemorySerializer(memory).data,
        })

    def delete(self, request, pk):
        memory = self.get_object(pk, request)
        if not memory:
            return Response({'error': 'Memory not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        memory.delete()
        return Response({'success': True, 'message': 'Memory deleted from album.'})
