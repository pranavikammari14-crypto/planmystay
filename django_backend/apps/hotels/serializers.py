from rest_framework import serializers
from .models import Hotel, Room, HotelImage, HotelAmenity, HotelReview, Favorite

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            'id',
            'hotel',
            'name',
            'room_type',
            'price',
            'bed',
            'max_guests',
            'sqft',
            'perks',
            'total_inventory',
            'is_available',
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Add frontend-compatible camelCase keys
        data['type'] = instance.room_type
        data['maxGuests'] = instance.max_guests
        data['price'] = float(instance.price)
        return data


class HotelImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelImage
        fields = ['id', 'url', 'alt', 'order']


class HotelReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')

    class Meta:
        model = HotelReview
        fields = ['id', 'user_name', 'rating', 'comment', 'is_verified_stay', 'created_at']


class HotelSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    amenities = serializers.SerializerMethodField()
    reviews = HotelReviewSerializer(many=True, read_only=True)
    owner_email = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Hotel
        fields = [
            'id',
            'name',
            'location',
            'city',
            'state',
            'brand',
            'full_address',
            'room_types',
            'amenities_list',
            'distance_centre',
            'stars',
            'rating',
            'review_count',
            'price_per_night',
            'breakfast_included',
            'is_pick',
            'is_featured',
            'description',
            'neighborhood',
            'check_in_time',
            'check_out_time',
            'cancellation_policy',
            'official_url',
            'image_url',
            'contact_info',
            'verification_status',
            'verification_source',
            'booking_authorized',
            'booking_status',
            'last_verified_date',
            'rejection_reason',
            'verification_evidence',
            'audit_history',
            'is_approved',
            'is_sample_data',
            'images',
            'amenities',
            'rooms',
            'reviews',
            'owner',
            'owner_email',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'owner',
            'created_at',
            'updated_at',
        ]

    def get_images(self, obj):
        img_urls = list(obj.images.values_list('url', flat=True))
        if obj.image_url and obj.image_url not in img_urls:
            img_urls.insert(0, obj.image_url)
        if not img_urls:
            return [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
            ]
        return img_urls

    def get_amenities(self, obj):
        if obj.amenities_list and len(obj.amenities_list) > 0:
            return obj.amenities_list
        amenity_names = list(obj.amenities.values_list('name', flat=True))
        if not amenity_names:
            return ['Free Wi-Fi', 'Air Conditioning', 'Room Service', 'Daily Housekeeping', '24/7 Front Desk']
        return amenity_names

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Compatibility keys for frontend PlanMyStay
        data['verificationStatus'] = instance.verification_status
        data['verificationSource'] = instance.verification_source
        data['bookingAuthorized'] = instance.booking_authorized
        data['bookingStatus'] = instance.booking_status
        data['verificationEvidence'] = instance.verification_evidence
        data['auditHistory'] = instance.audit_history
        data['rejectionReason'] = instance.rejection_reason
        data['distanceCentre'] = instance.distance_centre
        data['pricePerNight'] = float(instance.price_per_night)
        data['breakfastIncluded'] = instance.breakfast_included
        data['isPick'] = instance.is_pick
        data['isFeatured'] = instance.is_featured
        data['reviewCount'] = instance.review_count
        data['fullAddress'] = instance.full_address or f"{instance.name}, {instance.city}, {instance.state}"
        data['checkInTime'] = instance.check_in_time
        data['checkOutTime'] = instance.check_out_time
        data['cancellationPolicy'] = instance.cancellation_policy
        data['officialUrl'] = instance.official_url
        data['imageUrl'] = instance.image_url or (data['images'][0] if data.get('images') else '')
        data['contactInfo'] = instance.contact_info
        data['lastVerifiedDate'] = str(instance.last_verified_date) if instance.last_verified_date else '2026-10-18'
        return data


class HotelCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer used by hotel owners to add or update listings."""
    class Meta:
        model = Hotel
        fields = [
            'name',
            'location',
            'city',
            'state',
            'brand',
            'full_address',
            'price_per_night',
            'description',
            'neighborhood',
            'check_in_time',
            'check_out_time',
            'cancellation_policy',
            'official_url',
            'image_url',
            'contact_info',
            'breakfast_included',
        ]
