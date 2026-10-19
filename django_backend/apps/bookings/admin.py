from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'hotel', 'guest_name', 'check_in', 'check_out', 'total_price', 'status', 'is_paid')
    list_filter = ('status', 'is_paid', 'hotel__city')
    search_fields = ('id', 'guest_name', 'guest_email', 'hotel__name')
    readonly_fields = ('id', 'created_at', 'updated_at')
