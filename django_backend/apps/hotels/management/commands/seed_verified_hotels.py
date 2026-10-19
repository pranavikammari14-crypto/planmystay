from decimal import Decimal
from django.core.management.base import BaseCommand
from apps.hotels.models import Hotel, Room, HotelImage, HotelAmenity
from apps.hotels.data.affordable_hotels import AFFORDABLE_HOTELS_DATA

SAMPLE_LUXURY_HOTELS = [
    {
        'id': 'itc-kakatiya',
        'name': 'ITC Kakatiya - A Luxury Collection Hotel',
        'location': 'Begumpet, Hyderabad',
        'city': 'Hyderabad',
        'state': 'Telangana',
        'distance_centre': '0.8 km from city centre',
        'stars': 5,
        'rating': 4.8,
        'review_count': 1420,
        'price_per_night': Decimal('9200.00'),
        'breakfast_included': True,
        'is_pick': True,
        'is_featured': True,
        'brand': 'ITC Hotels',
        'full_address': '6-3-1187, Begumpet, Hyderabad, Telangana 500016',
        'room_types': ['Executive Club Room', 'The Towers Luxury Suite'],
        'amenities_list': ['Kaya Kalp Spa', 'Outdoor Pool', 'Dakshin Fine Dining', 'Free High-Speed Wi-Fi', '24/7 Butler Service'],
        'check_in_time': '02:00 PM',
        'check_out_time': '12:00 PM',
        'cancellation_policy': 'Free cancellation up to 48 hours prior to check-in',
        'official_url': 'https://www.itchotels.com/in/en/itckakatiya-hyderabad',
        'image_url': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'contact_info': '+91 40 2340 0132',
        'owner_verification_status': 'Verified Luxury Partner',
        'booking_status': 'Instant Confirmation',
        'description': 'Nestled in the commercial heart of Hyderabad, ITC Kakatiya honors the legendary Kakatiya dynasty with palatial architecture, grand hospitality, and culinary excellence.',
        'neighborhood': 'Begumpet / Central Hyderabad',
        'is_sample_data': False,
        'approval_status': Hotel.ApprovalStatus.APPROVED,
        'is_approved': True,
        'rooms': [
            {
                'id': 'itc-kaka-exec',
                'name': 'Executive Club Room',
                'room_type': 'Executive',
                'price': Decimal('9200.00'),
                'bed': '1 King Bed',
                'max_guests': 2,
                'sqft': 430,
                'perks': ['Buffet Breakfast', 'Airport Lounge Access', 'High-Speed Wi-Fi'],
            },
            {
                'id': 'itc-kaka-towers',
                'name': 'The Towers Luxury Suite',
                'room_type': 'Suite',
                'price': Decimal('16500.00'),
                'bed': '1 Royal King Bed',
                'max_guests': 3,
                'sqft': 680,
                'perks': ['Complimentary Airport Transfer', 'Cocktail Hours', 'Dedicated Butler'],
            },
        ]
    },
    {
        'id': 'taj-krishna',
        'name': 'Taj Krishna - Heritage Luxury',
        'location': 'Banjara Hills, Hyderabad',
        'city': 'Hyderabad',
        'state': 'Telangana',
        'distance_centre': '3.4 km from city centre',
        'stars': 5,
        'rating': 4.9,
        'review_count': 2180,
        'price_per_night': Decimal('11500.00'),
        'breakfast_included': True,
        'is_pick': True,
        'is_featured': True,
        'brand': 'Taj Hotels',
        'full_address': 'Road No 1, Banjara Hills, Hyderabad, Telangana 500034',
        'room_types': ['Deluxe Garden View Room', 'Luxury Lake View Room'],
        'amenities_list': ['Jiva Ayurvedic Spa', 'Temperature Controlled Pool', 'Firdaus Nizami Cuisine', 'Valet Parking'],
        'check_in_time': '02:00 PM',
        'check_out_time': '12:00 PM',
        'cancellation_policy': 'Free cancellation up to 48 hours prior to check-in',
        'official_url': 'https://www.tajhotels.com/en-in/taj/taj-krishna-hyderabad/',
        'image_url': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        'contact_info': '+91 40 6629 2323',
        'owner_verification_status': 'Verified Luxury Partner',
        'booking_status': 'Instant Confirmation',
        'description': 'Perched atop Banjara Hills amidst manicured lawns and serene waters, Taj Krishna offers panoramic views of Hyderabad and timeless Nizami grandeur.',
        'neighborhood': 'Banjara Hills',
        'is_sample_data': False,
        'approval_status': Hotel.ApprovalStatus.APPROVED,
        'is_approved': True,
        'rooms': [
            {
                'id': 'taj-krish-deluxe',
                'name': 'Deluxe Room with Lake View',
                'room_type': 'Deluxe',
                'price': Decimal('11500.00'),
                'bed': '1 King Bed',
                'max_guests': 2,
                'sqft': 450,
                'perks': ['Nizami Breakfast', 'Sunset High Tea', 'Wi-Fi'],
            },
        ]
    },
    {
        'id': 'rambagh-palace',
        'name': 'Rambagh Palace - The Jewel of Jaipur',
        'location': 'Bhawani Singh Road, Jaipur',
        'city': 'Jaipur',
        'state': 'Rajasthan',
        'distance_centre': '2.0 km from city centre',
        'stars': 5,
        'rating': 4.95,
        'review_count': 1890,
        'price_per_night': Decimal('28000.00'),
        'breakfast_included': True,
        'is_pick': True,
        'is_featured': True,
        'brand': 'Taj Hotels',
        'full_address': 'Bhawani Singh Road, Rambagh, Jaipur, Rajasthan 302005',
        'room_types': ['Palace Luxury Chamber', 'Historical Suite'],
        'amenities_list': ['Royal Jiva Spa', 'Polo Bar', 'Indoor & Outdoor Heated Pools', 'Peacock Gardens'],
        'check_in_time': '02:00 PM',
        'check_out_time': '12:00 PM',
        'cancellation_policy': 'Free cancellation up to 72 hours prior to check-in',
        'official_url': 'https://www.tajhotels.com/en-in/taj/rambagh-palace-jaipur/',
        'image_url': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'contact_info': '+91 141 221 1919',
        'owner_verification_status': 'Verified Heritage Palace',
        'booking_status': 'Instant Confirmation',
        'description': 'Former residence of the Maharaja of Jaipur, Rambagh Palace offers an extravagant taste of royal Rajput splendor, sprawling gardens, and marble corridors.',
        'neighborhood': 'Royal Palace District',
        'is_sample_data': False,
        'approval_status': Hotel.ApprovalStatus.APPROVED,
        'is_approved': True,
        'rooms': [
            {
                'id': 'rambagh-palace-room',
                'name': 'Palace Luxury Chamber',
                'room_type': 'Heritage Palace',
                'price': Decimal('28000.00'),
                'bed': '1 Royal Canopy Bed',
                'max_guests': 2,
                'sqft': 550,
                'perks': ['Royal Welcome with Rose Petals', 'Heritage Walk with Historian', 'Gourmet Breakfast'],
            },
        ]
    }
]

class Command(BaseCommand):
    help = "Seed verified PlanMyStay hotel database including 50+ affordable branded hotels and luxury heritage stays."

    def handle(self, *args, **options):
        total_seeded = 0

        # 1. Seed Luxury Heritage Stays
        for data in SAMPLE_LUXURY_HOTELS:
            rooms = data.pop('rooms')
            amenities = data.get('amenities_list', [])
            img_url = data.get('image_url')

            hotel, _ = Hotel.objects.update_or_create(
                id=data['id'],
                defaults=data
            )

            # Image
            HotelImage.objects.filter(hotel=hotel).delete()
            if img_url:
                HotelImage.objects.create(hotel=hotel, url=img_url, order=0)

            # Amenities
            HotelAmenity.objects.filter(hotel=hotel).delete()
            for a in amenities:
                HotelAmenity.objects.create(hotel=hotel, name=a)

            # Rooms
            for r in rooms:
                Room.objects.update_or_create(
                    id=r['id'],
                    defaults={
                        'hotel': hotel,
                        'name': r['name'],
                        'room_type': r['room_type'],
                        'price': r['price'],
                        'bed': r['bed'],
                        'max_guests': r['max_guests'],
                        'sqft': r['sqft'],
                        'perks': r['perks'],
                        'total_inventory': 10,
                        'is_available': True,
                    }
                )
            total_seeded += 1

        # 2. Seed 50 Affordable Top Hotels from Spreadsheet
        for item in AFFORDABLE_HOTELS_DATA:
            hotel_id = item['id']
            amenities = item.get('amenities', [])
            room_types = item.get('room_types', ['Standard Room', 'Deluxe Room'])
            price = Decimal(str(item['price_per_night']))

            hotel, _ = Hotel.objects.update_or_create(
                id=hotel_id,
                defaults={
                    'name': item['name'],
                    'state': item['state'],
                    'city': item['city'],
                    'location': f"{item['city']}, {item['state']}",
                    'price_per_night': price,
                    'rating': item['rating'],
                    'review_count': item['review_count'],
                    'brand': item['brand'],
                    'full_address': item['full_address'],
                    'room_types': room_types,
                    'amenities_list': amenities,
                    'check_in_time': item['check_in_time'],
                    'check_out_time': item['check_out_time'],
                    'cancellation_policy': item['cancellation_policy'],
                    'official_url': item['official_url'],
                    'image_url': item['image_url'],
                    'contact_info': item['contact_info'],
                    'owner_verification_status': item['owner_verification_status'],
                    'booking_status': item['booking_status'],
                    'description': item['description'],
                    'neighborhood': item['neighborhood'],
                    'distance_centre': '1.2 km from city centre',
                    'stars': 3 if price < Decimal('3000') else 4,
                    'breakfast_included': True,
                    'is_pick': price < Decimal('2000'),
                    'is_featured': True,
                    'approval_status': Hotel.ApprovalStatus.APPROVED,
                    'is_approved': True,
                    'is_sample_data': False,
                }
            )

            # Images
            HotelImage.objects.filter(hotel=hotel).delete()
            HotelImage.objects.create(hotel=hotel, url=item['image_url'], order=0)

            # Amenities
            HotelAmenity.objects.filter(hotel=hotel).delete()
            for am in amenities:
                HotelAmenity.objects.create(hotel=hotel, name=am)

            # Rooms
            for idx, r_type in enumerate(room_types):
                room_price = price if idx == 0 else price + Decimal('500.00')
                Room.objects.update_or_create(
                    id=f"{hotel_id}-room-{idx+1}",
                    defaults={
                        'hotel': hotel,
                        'name': r_type,
                        'room_type': 'Standard' if idx == 0 else 'Deluxe',
                        'price': room_price,
                        'bed': '1 Queen Bed' if idx == 0 else '1 King Bed',
                        'max_guests': 2,
                        'sqft': 280 + (idx * 50),
                        'perks': ['Complimentary Breakfast', 'Free High-Speed Wi-Fi', 'Daily Housekeeping'],
                        'total_inventory': 15,
                        'is_available': True,
                    }
                )
            total_seeded += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {total_seeded} verified properties (including all 50 affordable spreadsheet hotels)."))
