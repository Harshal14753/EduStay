
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'STUDENT' | 'PROPERTY_OWNER';
  university?: string;
  stream?: 'ENGINEERING' | 'MEDICAL';
  serviceType?: 'ACCOMMODATION' | 'FOOD' | 'BOTH';
  businessType?: 'INDIVIDUAL' | 'COMPANY' | 'INSTITUTION';
  createdAt: Date;
  updatedAt: Date;
}

export interface AccommodationListing {
  id: string;
  propertyName: string;
  photos: string[];
  monthlyRent: number;
  deposit?: number;
  availability: boolean;
  amenities: string[];
  roomType: 'SINGLE' | 'DOUBLE' | 'SHARING' | 'STUDIO' | 'APARTMENT';
  accommodationType: 'PG' | 'HOSTEL' | 'FLAT' | 'ROOM' | 'APARTMENT';
  livingPreferences: string[];
  foodPreference: 'VEG' | 'NON_VEG' | 'BOTH';
  address: string;
  latitude?: number;
  longitude?: number;
  contactInfo: string;
  description?: string;
  nearbyUniversities: string[];
  distanceFromUni?: number;
  owner: User;
  ownerId: string;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodServiceListing {
  id: string;
  serviceName: string;
  photos: string[];
  serviceType: 'MESS' | 'CANTEEN' | 'TIFFIN_SERVICE' | 'RESTAURANT' | 'CAFE';
  priceRange: 'BUDGET' | 'MODERATE' | 'PREMIUM';
  menuDetails?: string;
  cuisineType: string[];
  vegOptions: boolean;
  nonVegOptions: boolean;
  address: string;
  latitude?: number;
  longitude?: number;
  contactInfo: string;
  description?: string;
  operatingHours?: string;
  deliveryAvailable: boolean;
  owner: User;
  ownerId: string;
  reviews: Review[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  user: User;
  userId: string;
  accommodationListing?: AccommodationListing;
  foodServiceListing?: FoodServiceListing;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inquiry {
  id: string;
  message: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  status: 'PENDING' | 'RESPONDED' | 'CLOSED';
  response?: string;
  student: User;
  accommodationListing?: AccommodationListing;
  foodServiceListing?: FoodServiceListing;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchFilters {
  serviceType?: 'ACCOMMODATION' | 'FOOD' | 'BOTH';
  university?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  distance?: number;
  roomType?: string;
  accommodationType?: string;
  amenities?: string[];
  foodPreference?: 'VEG' | 'NON_VEG' | 'BOTH';
  foodServiceType?: string;
  cuisineType?: string[];
  deliveryAvailable?: boolean;
}
