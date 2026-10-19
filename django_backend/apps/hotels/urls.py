from django.urls import re_path
from .views import (
    PublicHotelListView,
    HotelSearchView,
    HotelDetailView,
    OwnerHotelListCreateView,
    OwnerHotelDetailView,
    OwnerRoomCreateView,
    AdminHotelApprovalView,
)

urlpatterns = [
    # Public endpoints
    re_path(r'^$', PublicHotelListView.as_view(), name='hotel_list'),
    re_path(r'^search/?$', HotelSearchView.as_view(), name='hotel_search'),

    # Owner management endpoints
    re_path(r'^owner/properties/?$', OwnerHotelListCreateView.as_view(), name='owner_hotel_list_create'),
    re_path(r'^owner/properties/(?P<pk>[^/]+)/?$', OwnerHotelDetailView.as_view(), name='owner_hotel_detail'),
    re_path(r'^owner/properties/(?P<hotel_id>[^/]+)/rooms/?$', OwnerRoomCreateView.as_view(), name='owner_room_create'),

    # Admin approval endpoint
    re_path(r'^admin/(?P<pk>[^/]+)/approval/?$', AdminHotelApprovalView.as_view(), name='admin_hotel_approval'),

    # Hotel detail endpoint (placed last so it doesn't collide with search/owner)
    re_path(r'^(?P<pk>[^/]+)/?$', HotelDetailView.as_view(), name='hotel_detail'),
]
