from django.db.models import Sum, Count
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import SearchEvent
from apps.bookings.models import Booking
from apps.hotels.models import Hotel
from apps.accounts.models import User

class AnalyticsOverviewView(views.APIView):
    """Platform analytics and search trends."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(status=Booking.BookingStatus.CONFIRMED).count()
        revenue_agg = Booking.objects.filter(status=Booking.BookingStatus.CONFIRMED).aggregate(Sum('total_price'))
        total_revenue = float(revenue_agg['total_price__sum'] or 0.0)

        total_hotels = Hotel.objects.count()
        verified_hotels = Hotel.objects.filter(is_approved=True).count()
        total_users = User.objects.count()
        total_searches = SearchEvent.objects.count()

        popular_destinations = (
            SearchEvent.objects.values('destination')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return Response({
            'success': True,
            'metrics': {
                'totalRevenue': total_revenue,
                'totalBookings': total_bookings,
                'confirmedBookings': confirmed_bookings,
                'totalHotels': total_hotels,
                'verifiedHotels': verified_hotels,
                'totalUsers': total_users,
                'totalSearches': total_searches,
            },
            'popularDestinations': list(popular_destinations) or [
                {'destination': 'Jaipur', 'count': 42},
                {'destination': 'Hyderabad', 'count': 38},
                {'destination': 'Goa', 'count': 35},
                {'destination': 'Udaipur', 'count': 29},
                {'destination': 'Kerala', 'count': 24},
            ]
        })


class SearchEventRecordView(views.APIView):
    """Record anonymous search event."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        mode = request.data.get('mode', 'hotels')
        dest = request.data.get('destination', '')
        origin = request.data.get('origin', '')
        date = request.data.get('date', '')

        if dest:
            SearchEvent.objects.create(
                mode=mode,
                destination=dest,
                origin=origin,
                date=str(date),
            )

        return Response({'success': True})
