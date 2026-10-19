import { Hotel } from '../types/travel';
import { VERIFIED_HOTELS_CATALOG } from './verifiedHotels';
import heroImg from '../assets/images/hero_indian_palace_1790355024750.jpg';

export const HERO_BACKGROUND_IMAGE = heroImg;

/**
 * Public catalog of hotel properties.
 * Public listings MUST only contain verified hotels.
 * Pending, rejected, temporarily unavailable, and inactive records are strictly excluded from public display.
 */
export const INITIAL_HOTELS: Hotel[] = VERIFIED_HOTELS_CATALOG.filter(
  (hotel) => hotel.verificationStatus === 'Verified'
);

/**
 * Complete catalog across all statuses, strictly for founder administrative review and audit.
 */
export const ALL_ADMIN_CATALOG_HOTELS: Hotel[] = VERIFIED_HOTELS_CATALOG;
