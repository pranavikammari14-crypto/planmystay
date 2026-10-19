from django.urls import re_path
from .views import (
    TravelStatsView,
    TravelAchievementsView,
    TravelAlbumListCreateView,
    TravelMemoryDetailView,
)

urlpatterns = [
    re_path(r'^travel-stats/?$', TravelStatsView.as_view(), name='travel_stats'),
    re_path(r'^achievements/?$', TravelAchievementsView.as_view(), name='travel_achievements'),
    re_path(r'^album/?$', TravelAlbumListCreateView.as_view(), name='travel_album'),
    re_path(r'^album/(?P<pk>[^/]+)/?$', TravelMemoryDetailView.as_view(), name='travel_memory_detail'),
]
