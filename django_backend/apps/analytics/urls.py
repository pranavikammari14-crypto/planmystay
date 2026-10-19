from django.urls import path
from .views import AnalyticsOverviewView, SearchEventRecordView

urlpatterns = [
    path('overview', AnalyticsOverviewView.as_view(), name='analytics_overview'),
    path('search-event', SearchEventRecordView.as_view(), name='analytics_search_event'),
]
