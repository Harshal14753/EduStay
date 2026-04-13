
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Building2, 
  UtensilsIcon, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  Eye,
  Wifi,
  Car,
  Utensils,
  Waves,
  Wind,
  Search
} from 'lucide-react';
import Image from 'next/image';

interface SearchResultsProps {
  results: {
    accommodations: any[];
    foodServices: any[];
  };
  isLoading: boolean;
  searchQuery: string;
}

export function SearchResults({ results, isLoading, searchQuery }: SearchResultsProps) {
  const [selectedAccommodation, setSelectedAccommodation] = useState<any | null>(null);
  const [selectedFoodService, setSelectedFoodService] = useState<any | null>(null);

  const isDetailsOpen = !!selectedAccommodation || !!selectedFoodService;

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'mess':
        return <Utensils className="h-4 w-4" />;
      case 'laundry':
        return <Waves className="h-4 w-4" />;
      case 'ac':
        return <Wind className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const handleContactOwner = (contactInfo: string) => {
    if (contactInfo.includes('@')) {
      window.open(`mailto:${contactInfo}`, '_blank');
    } else {
      window.open(`tel:${contactInfo}`, '_blank');
    }
  };

  const closeDetailsPanel = () => {
    setSelectedAccommodation(null);
    setSelectedFoodService(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-48 h-32 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalResults = results.accommodations.length + results.foodServices.length;

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {totalResults} results found
          {searchQuery && ` for "${searchQuery}"`}
        </h2>
        <div className="flex space-x-2">
          {results.accommodations.length > 0 && (
            <Badge variant="secondary">
              {results.accommodations.length} Accommodations
            </Badge>
          )}
          {results.foodServices.length > 0 && (
            <Badge variant="secondary">
              {results.foodServices.length} Food Services
            </Badge>
          )}
        </div>
      </div>

      {/* Accommodation Results */}
      {results.accommodations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Accommodation Options
          </h3>
          
          {results.accommodations.map((accommodation) => (
            <Card key={accommodation.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg relative overflow-hidden">
                    {accommodation.photos?.[0] ? (
                      <Image
                        src={accommodation.photos[0]}
                        alt={accommodation.propertyName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {accommodation.propertyName}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {accommodation.address}
                        </p>
                      </div>
                      
                      <div className="text-right mt-2 md:mt-0">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{accommodation.monthlyRent?.toLocaleString()}/month
                        </p>
                        {accommodation.deposit && (
                          <p className="text-sm text-gray-500">
                            + ₹{accommodation.deposit?.toLocaleString()} deposit
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{accommodation.roomType}</Badge>
                      <Badge variant="outline">{accommodation.accommodationType}</Badge>
                      <Badge variant="outline">{accommodation.foodPreference} Food</Badge>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {accommodation.amenities?.slice(0, 5).map((amenity: string, index: number) => (
                        <div key={index} className="flex items-center space-x-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                      {accommodation.amenities?.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{accommodation.amenities.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Rating and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        {accommodation.reviews?.length > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {calculateAverageRating(accommodation.reviews)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({accommodation.reviews.length} reviews)
                            </span>
                          </div>
                        )}
                        <Badge 
                          variant={accommodation.availability ? "secondary" : "destructive"}
                        >
                          {accommodation.availability ? "Available" : "Not Available"}
                        </Badge>
                      </div>

                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => setSelectedAccommodation(accommodation)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleContactOwner(accommodation.contactInfo)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Food Service Results */}
      {results.foodServices.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UtensilsIcon className="h-5 w-5 mr-2 text-green-600" />
            Food Service Options
          </h3>
          
          {results.foodServices.map((foodService) => (
            <Card key={foodService.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
                  {/* Image */}
                  <div className="w-full lg:w-48 h-48 lg:h-32 bg-gray-100 rounded-lg relative overflow-hidden">
                    {foodService.photos?.[0] ? (
                      <Image
                        src={foodService.photos[0]}
                        alt={foodService.serviceName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <UtensilsIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-900">
                          {foodService.serviceName}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {foodService.address}
                        </p>
                      </div>
                      
                      <div className="text-right mt-2 md:mt-0">
                        <Badge variant="secondary" className="text-lg">
                          {foodService.priceRange}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{foodService.serviceType}</Badge>
                      {foodService.vegOptions && <Badge variant="outline" className="bg-green-50 text-green-700">Veg</Badge>}
                      {foodService.nonVegOptions && <Badge variant="outline" className="bg-red-50 text-red-700">Non-Veg</Badge>}
                      {foodService.deliveryAvailable && <Badge variant="outline">Delivery Available</Badge>}
                    </div>

                    {/* Cuisine Types */}
                    <div className="flex flex-wrap gap-1">
                      {foodService.cuisineType?.slice(0, 4).map((cuisine: string, index: number) => (
                        <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {cuisine}
                        </span>
                      ))}
                      {foodService.cuisineType?.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{foodService.cuisineType.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Operating Hours */}
                    {foodService.operatingHours && (
                      <p className="text-sm text-gray-600">
                        <strong>Hours:</strong> {foodService.operatingHours}
                      </p>
                    )}

                    {/* Rating and Actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        {foodService.reviews?.length > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium ml-1">
                              {calculateAverageRating(foodService.reviews)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({foodService.reviews.length} reviews)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 mt-2 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => setSelectedFoodService(foodService)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleContactOwner(foodService.contactInfo)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Contact Owner
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {totalResults === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or search terms to find what you're looking for.
            </p>
          </CardContent>
        </Card>
      )}

      <Sheet open={isDetailsOpen} onOpenChange={(open) => !open && closeDetailsPanel()}>
        <SheetContent
          side="top"
          className="left-1/2 top-6 w-[95vw] max-w-2xl -translate-x-1/2 rounded-2xl border overflow-y-auto max-h-[90vh]"
        >
          {selectedAccommodation && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selectedAccommodation.propertyName}</SheetTitle>
                <SheetDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedAccommodation.address}
                </SheetDescription>
              </SheetHeader>

              {selectedAccommodation.photos?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedAccommodation.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative h-36 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={photo}
                        alt={`${selectedAccommodation.propertyName} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Pricing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Monthly Rent:</span> ₹{selectedAccommodation.monthlyRent?.toLocaleString?.() ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Daily Rate:</span> ₹{selectedAccommodation.dailyRate?.toLocaleString?.() ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Deposit:</span> {selectedAccommodation.deposit ? `₹${selectedAccommodation.deposit.toLocaleString()}` : 'N/A'}</p>
                    <p><span className="text-gray-500">Min Stay:</span> {selectedAccommodation.minStay ?? 'N/A'} day(s)</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Property</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Type:</span> {selectedAccommodation.accommodationType ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Room Type:</span> {selectedAccommodation.roomType ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Food:</span> {selectedAccommodation.foodPreference ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Availability:</span> {selectedAccommodation.availability ? 'Available' : 'Not Available'}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Nearby Universities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAccommodation.nearbyUniversities?.length ? (
                    selectedAccommodation.nearbyUniversities.map((uni: string, index: number) => (
                      <Badge key={index} variant="outline">{uni}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No nearby universities listed.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAccommodation.amenities?.length ? (
                    selectedAccommodation.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary">{amenity}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No amenities added.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedAccommodation.description || 'No description available.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-sm text-gray-700">{selectedAccommodation.contactInfo || 'Not available'}</p>
              </div>
            </div>
          )}

          {selectedFoodService && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selectedFoodService.serviceName}</SheetTitle>
                <SheetDescription className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {selectedFoodService.address}
                </SheetDescription>
              </SheetHeader>

              {selectedFoodService.photos?.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedFoodService.photos.map((photo: string, index: number) => (
                    <div key={index} className="relative h-36 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={photo}
                        alt={`${selectedFoodService.serviceName} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Service Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Type:</span> {selectedFoodService.serviceType ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Price Range:</span> {selectedFoodService.priceRange ?? 'N/A'}</p>
                    <p><span className="text-gray-500">Delivery:</span> {selectedFoodService.deliveryAvailable ? 'Available' : 'Not Available'}</p>
                    <p><span className="text-gray-500">Hours:</span> {selectedFoodService.operatingHours || 'Not specified'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Dietary Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Veg:</span> {selectedFoodService.vegOptions ? 'Yes' : 'No'}</p>
                    <p><span className="text-gray-500">Non-Veg:</span> {selectedFoodService.nonVegOptions ? 'Yes' : 'No'}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cuisine Types</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFoodService.cuisineType?.length ? (
                    selectedFoodService.cuisineType.map((cuisine: string, index: number) => (
                      <Badge key={index} variant="secondary">{cuisine}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No cuisine details added.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedFoodService.description || 'No description available.'}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Contact</h4>
                <p className="text-sm text-gray-700">{selectedFoodService.contactInfo || 'Not available'}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
