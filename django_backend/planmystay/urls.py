"""
PlanMyStay API URL Configuration
Supports both with and without trailing slash to accommodate SPA frontends.
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.http import JsonResponse
from apps.travel_services.views import system_status
from apps.hotels.views import DestinationListView
from apps.bookings.views import MyBookingsView

def health_check(request):
    return JsonResponse({
        'status': 'healthy',
        'service': 'PlanMyStay Django REST API',
        'version': '1.0.0',
    })

urlpatterns = [
    re_path(r'^health/?$', health_check, name='health_check'),
    re_path(r'^api/health/?$', health_check, name='api_health_check'),
    path('admin/', admin.site.urls),

    # System Status & Health
    re_path(r'^api/system/status/?$', system_status, name='system_status'),

    # Direct Top-Level Endpoints
    re_path(r'^api/destinations/?$', DestinationListView.as_view(), name='api_destinations'),
    re_path(r'^api/my-bookings/?$', MyBookingsView.as_view(), name='api_my_bookings'),

    # Modular App Endpoints
    re_path(r'^api/auth/', include('apps.accounts.urls')),
    re_path(r'^api/hotels/', include('apps.hotels.urls')),
    re_path(r'^api/bookings/', include('apps.bookings.urls')),
    re_path(r'^api/payments/', include('apps.payments.urls')),
    re_path(r'^api/user/', include('apps.travel_album.urls')),
    re_path(r'^api/analytics/', include('apps.analytics.urls')),
    re_path(r'^api/', include('apps.travel_services.urls')),
]
