from django.contrib import admin
from .models import Hotel, Room, HotelImage, HotelAmenity, HotelReview, Favorite

class RoomInline(admin.TabularInline):
    model = Room
    extra = 1

class HotelImageInline(admin.TabularInline):
    model = HotelImage
    extra = 1

class HotelAmenityInline(admin.TabularInline):
    model = HotelAmenity
    extra = 1

@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'brand', 'price_per_night', 'rating', 'approval_status', 'is_approved', 'owner')
    list_filter = ('brand', 'approval_status', 'is_approved', 'city', 'state')
    search_fields = ('name', 'city', 'location', 'brand')
    inlines = [RoomInline, HotelImageInline, HotelAmenityInline]
    actions = ['approve_selected_hotels', 'reject_selected_hotels']

    def approve_selected_hotels(self, request, queryset):
        queryset.update(approval_status=Hotel.ApprovalStatus.APPROVED, is_approved=True, rejection_reason=None)
    approve_selected_hotels.short_description = "Approve and publish selected hotels"

    def reject_selected_hotels(self, request, queryset):
        queryset.update(approval_status=Hotel.ApprovalStatus.REJECTED, is_approved=False)
    reject_selected_hotels.short_description = "Reject selected hotels"

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'hotel', 'room_type', 'price', 'total_inventory', 'is_available')
    list_filter = ('room_type', 'is_available')
    search_fields = ('name', 'hotel__name')

@admin.register(HotelReview)
class HotelReviewAdmin(admin.ModelAdmin):
    list_display = ('hotel', 'user', 'rating', 'created_at')
    list_filter = ('rating',)
