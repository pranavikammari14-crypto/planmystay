import { INITIAL_HOTELS } from '../src/data/hotels';

export async function seedDatabase() {
  console.log(`Seeding database with ${INITIAL_HOTELS.length} initial stays across India...`);
  for (const h of INITIAL_HOTELS) {
    console.log(`Seeded: ${h.name} (${h.city}) - ₹${h.pricePerNight}/night`);
  }
  console.log('Seeding completed successfully!');
}

seedDatabase().catch((err) => {
  console.error('Seeding error:', err);
});
