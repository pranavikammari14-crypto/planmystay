from django.urls import re_path
from .views import (
    BookingListCreateView,
    BookingDetailView,
    BookingCancelView,
)

urlpatterns = [
    re_path(r'^$', BookingListCreateView.as_view(), name='booking_list_create'),
    re_path(r'^(?P<pk>[^/]+)/cancel/?$', BookingCancelView.as_view(), name='booking_cancel'),
    re_path(r'^(?P<pk>[^/]+)/?$', BookingDetailView.as_view(), name='booking_detail'),
]
