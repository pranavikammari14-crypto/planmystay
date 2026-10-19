from decimal import Decimal
from datetime import datetime, date
from rest_framework import serializers
from .models import Booking
from apps.hotels.models import Hotel, Room

class BookingSerializer(serializers.ModelSerializer):
    hotel_name = serializers.ReadOnlyField(source='hotel.name')
    hotel_location = serializers.ReadOnlyField(source='hotel.location')
    hotel_city = serializers.ReadOnlyField(source='hotel.city')
    room_name = serializers.SerializerMethodField()
    hotel_image = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'hotel',
            'hotel_name',
            'hotel_location',
            'hotel_city',
            'hotel_image',
            'room',
            'room_name',
            'check_in',
            'check_out',
            'nights',
            'guests',
            'guest_name',
            'guest_email',
            'guest_phone',
            'special_requests',
            'add_ons',
            'base_price',
            'tax_price',
            'total_price',
            'coupon_code',
            'discount_amount',
            'status',
            'payment_method',
            'payment_id',
            'is_paid',
            'refund_amount',
            'refund_status',
            'cancelled_at',
            'created_at',
        ]
        read_only_fields = fields

    def get_room_name(self, obj):
        return obj.room.name if obj.room else 'Standard Selected Room'

    def get_hotel_image(self, obj):
        first_img = obj.hotel.images.first()
        return first_img.url if first_img else 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Frontend compatibility mappings
        data['hotelId'] = instance.hotel_id
        data['hotelName'] = instance.hotel.name
        data['hotelLocation'] = instance.hotel.location
        data['hotelImage'] = self.get_hotel_image(instance)
        data['roomName'] = self.get_room_name(instance)
        data['checkIn'] = instance.check_in.isoformat()
        data['checkOut'] = instance.check_out.isoformat()
        data['guestName'] = instance.guest_name
        data['guestEmail'] = instance.guest_email
        data['guestPhone'] = instance.guest_phone
        data['specialRequests'] = instance.special_requests
        data['addOns'] = instance.add_ons
        data['basePrice'] = float(instance.base_price)
        data['taxPrice'] = float(instance.tax_price)
        data['totalPrice'] = float(instance.total_price)
        data['paymentMethod'] = instance.payment_method
        data['paymentId'] = instance.payment_id
        data['bookedAt'] = instance.created_at.isoformat()
        return data


class BookingCreateSerializer(serializers.Serializer):
    hotel_id = serializers.CharField(required=True)
    room_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    check_in = serializers.DateField(required=True)
    check_out = serializers.DateField(required=True)
    guests = serializers.IntegerField(default=2, min_value=1)
    guest_name = serializers.CharField(required=True, max_length=255)
    guest_email = serializers.EmailField(required=True)
    guest_phone = serializers.CharField(required=True, max_length=30)
    special_requests = serializers.CharField(required=False, allow_blank=True, default='')
    add_ons = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        check_in = attrs['check_in']
        check_out = attrs['check_out']

        if check_in >= check_out:
            raise serializers.ValidationError({'check_out': 'Check-out date must be after check-in date.'})

        today = date.today()
        if check_in < today:
            raise serializers.ValidationError({'check_in': 'Check-in date cannot be in the past.'})

        try:
            hotel = Hotel.objects.get(id=attrs['hotel_id'])
            if not hotel.is_approved:
                raise serializers.ValidationError({'hotel_id': 'Selected hotel is currently not open for reservations.'})
            attrs['hotel_obj'] = hotel
        except Hotel.DoesNotExist:
            raise serializers.ValidationError({'hotel_id': 'Invalid hotel specified.'})

        room_id = attrs.get('room_id')
        if room_id:
            try:
                room = Room.objects.get(id=room_id, hotel=hotel)
                if not room.is_available:
                    raise serializers.ValidationError({'room_id': 'Selected room is currently unavailable.'})
                attrs['room_obj'] = room
            except Room.DoesNotExist:
                raise serializers.ValidationError({'room_id': 'Invalid room specified for this hotel.'})
        else:
            first_room = hotel.rooms.filter(is_available=True).first()
            if not first_room:
                raise serializers.ValidationError({'room_id': 'No available rooms found for this property.'})
            attrs['room_obj'] = first_room

        return attrs
