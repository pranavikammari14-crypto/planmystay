from django.contrib import admin
from .models import SearchEvent

@admin.register(SearchEvent)
class SearchEventAdmin(admin.ModelAdmin):
    list_display = ('mode', 'origin', 'destination', 'date', 'created_at')
    list_filter = ('mode', 'created_at')
    search_fields = ('destination', 'origin')
