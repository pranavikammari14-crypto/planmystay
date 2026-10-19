from django.urls import path
from .views import (
    FlightsSearchView,
    FlightsBookView,
    TrainsSearchView,
    TrainsBookView,
    BusesSearchView,
    BusesBookView,
    AITripPlanView,
)

urlpatterns = [
    path('flights/search', FlightsSearchView.as_view(), name='flights_search'),
    path('flights/book', FlightsBookView.as_view(), name='flights_book'),
    path('trains/search', TrainsSearchView.as_view(), name='trains_search'),
    path('trains/book', TrainsBookView.as_view(), name='trains_book'),
    path('buses/search', BusesSearchView.as_view(), name='buses_search'),
    path('buses/book', BusesBookView.as_view(), name='buses_book'),
    path('ai/trip-plan', AITripPlanView.as_view(), name='ai_trip_plan'),
]
