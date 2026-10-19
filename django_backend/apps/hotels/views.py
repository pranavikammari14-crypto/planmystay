from rest_framework import status, views, permissions, generics
from rest_framework.response import Response
from django.db.models import Q
from .models import Hotel, Room, Favorite
from .serializers import (
    HotelSerializer,
    HotelCreateUpdateSerializer,
    RoomSerializer,
)
from apps.accounts.permissions import IsHotelOwner, IsPlatformAdmin

class PublicHotelListView(views.APIView):
    """
    Public hotel directory & search endpoint.
    Strictly displays properties with verification_status='Verified'.
    Pending, unverified, rejected, temporarily unavailable, and inactive are excluded.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Hotel.objects.filter(
            verification_status=Hotel.VerificationStatus.VERIFIED
        ).prefetch_related('rooms', 'images', 'amenities')

        city = request.query_params.get('city')
        if city:
            queryset = queryset.filter(Q(city__icontains=city) | Q(location__icontains=city) | Q(neighborhood__icontains=city))

        min_price = request.query_params.get('min_price') or request.query_params.get('minPrice')
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)

        max_price = request.query_params.get('max_price') or request.query_params.get('maxPrice')
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)

        stars = request.query_params.get('stars')
        if stars:
            queryset = queryset.filter(stars=stars)

        serializer = HotelSerializer(queryset, many=True)
        return Response({
            'success': True,
            'totalVerified': queryset.count(),
            'catalogNotice': 'Only verified properties are displayed. Unverified and pending hotels are excluded.',
            'hotels': serializer.data,
        })


class HotelSearchView(views.APIView):
    """Search verified hotels by city, checkIn, checkOut, guests."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        city = request.data.get('city', '')
        min_price = request.data.get('minPrice')
        max_price = request.data.get('maxPrice')

        queryset = Hotel.objects.filter(
            verification_status=Hotel.VerificationStatus.VERIFIED
        ).prefetch_related('rooms', 'images', 'amenities')
        if city:
            queryset = queryset.filter(
                Q(city__icontains=city) | Q(location__icontains=city) | Q(name__icontains=city)
            )
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)

        serializer = HotelSerializer(queryset, many=True)
        return Response({
            'success': True,
            'totalVerified': queryset.count(),
            'hotels': serializer.data,
        })


class HotelDetailView(views.APIView):
    """Public detail view for a specific hotel."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            hotel = Hotel.objects.prefetch_related('rooms', 'images', 'amenities', 'reviews').get(id=pk)
            # If not approved, only owner or admin can view
            if not hotel.is_approved:
                if not (request.user.is_authenticated and (request.user == hotel.owner or request.user.role == 'ADMIN')):
                    return Response({'error': 'Hotel listing is currently under review.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'success': True, 'hotel': HotelSerializer(hotel).data})
        except Hotel.DoesNotExist:
            return Response({'error': 'Hotel not found'}, status=status.HTTP_404_NOT_FOUND)


class OwnerHotelListCreateView(views.APIView):
    """
    Hotel Owner property management view.
    Owners can only view and manage properties they own.
    """
    permission_classes = [IsHotelOwner]

    def get(self, request):
        # Admin can view all, owners can only view their own
        if request.user.role == 'ADMIN' or request.user.is_superuser:
            hotels = Hotel.objects.all().prefetch_related('rooms', 'images', 'amenities')
        else:
            hotels = Hotel.objects.filter(owner=request.user).prefetch_related('rooms', 'images', 'amenities')

        return Response({
            'success': True,
            'hotels': HotelSerializer(hotels, many=True).data,
        })

    def post(self, request):
        serializer = HotelCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            hotel = serializer.save()
            return Response({
                'success': True,
                'message': 'Hotel submitted successfully. Status: ' + hotel.approval_status,
                'hotel': HotelSerializer(hotel).data,
            }, status=status.HTTP_201_CREATED)
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class OwnerHotelDetailView(views.APIView):
    """Update or delete an owned hotel property."""
    permission_classes = [IsHotelOwner]

    def get_object(self, pk, user):
        try:
            hotel = Hotel.objects.get(id=pk)
            if user.role != 'ADMIN' and not user.is_superuser and hotel.owner != user:
                return None
            return hotel
        except Hotel.DoesNotExist:
            return None

    def put(self, request, pk):
        hotel = self.get_object(pk, request.user)
        if not hotel:
            return Response({'error': 'Hotel not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)

        serializer = HotelCreateUpdateSerializer(hotel, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response({'success': True, 'hotel': HotelSerializer(updated).data})
        return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        hotel = self.get_object(pk, request.user)
        if not hotel:
            return Response({'error': 'Hotel not found or unauthorized'}, status=status.HTTP_404_NOT_FOUND)
        hotel.delete()
        return Response({'success': True, 'message': 'Property removed from directory.'})


class OwnerRoomCreateView(views.APIView):
    """Add a room to an owned hotel property."""
    permission_classes = [IsHotelOwner]

    def post(self, request, hotel_id):
        try:
            hotel = Hotel.objects.get(id=hotel_id)
            if request.user.role != 'ADMIN' and not request.user.is_superuser and hotel.owner != request.user:
                return Response({'error': 'Unauthorized to manage rooms for this property'}, status=status.HTTP_403_FORBIDDEN)

            serializer = RoomSerializer(data={**request.data, 'hotel': hotel.id})
            if serializer.is_valid():
                room = serializer.save()
                return Response({'success': True, 'room': RoomSerializer(room).data}, status=status.HTTP_201_CREATED)
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Hotel.DoesNotExist:
            return Response({'error': 'Hotel not found'}, status=status.HTTP_404_NOT_FOUND)


class AdminHotelApprovalView(views.APIView):
    """
    Administrative approval workflow for hotel listings.
    Admins can approve or reject submitted properties.
    """
    permission_classes = [IsPlatformAdmin]

    def post(self, request, pk):
        action = request.data.get('action') # 'approve' or 'reject'
        reason = request.data.get('reason', '')

        try:
            hotel = Hotel.objects.get(id=pk)
            if action == 'approve':
                hotel.approve()
                return Response({
                    'success': True,
                    'message': f"Hotel '{hotel.name}' has been approved and published to the live directory.",
                    'hotel': HotelSerializer(hotel).data,
                })
            elif action == 'reject':
                hotel.reject(reason or 'Listing rejected by administrator')
                return Response({
                    'success': True,
                    'message': f"Hotel '{hotel.name}' listing was rejected.",
                    'hotel': HotelSerializer(hotel).data,
                })
            else:
                return Response({'error': "Action must be 'approve' or 'reject'"}, status=status.HTTP_400_BAD_REQUEST)
        except Hotel.DoesNotExist:
            return Response({'error': 'Hotel not found'}, status=status.HTTP_404_NOT_FOUND)


class DestinationListView(views.APIView):
    """
    Returns verified unique destinations with city, state, property count, and starting prices.
    GET /api/destinations/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.db.models import Min, Count
        destinations = (
            Hotel.objects.filter(is_approved=True)
            .values('city', 'state')
            .annotate(
                count=Count('id'),
                min_price=Min('price_per_night')
            )
            .order_by('city')
        )
        formatted = [
            {
                'city': d['city'],
                'state': d['state'],
                'hotelCount': d['count'],
                'minPrice': float(d['min_price']) if d['min_price'] else 0,
            }
            for d in destinations
        ]
        return Response({
            'success': True,
            'count': len(formatted),
            'destinations': formatted,
        })
