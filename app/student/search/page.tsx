'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Filter, MapPin, MessageSquare, Search, Star } from 'lucide-react';

export default function StudentSearchPage() {
  const { data: session } = useSession() || {};
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any>({ accommodations: [], foodServices: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any | null>(null);
  const [selectedFoodService, setSelectedFoodService] = useState<any | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [filters, setFilters] = useState({
    serviceType: 'BOTH',
    university: '',
    minRent: '',
    maxRent: '',
    roomType: 'all',
    accommodationType: 'all',
    amenities: [] as string[],
    foodServiceType: 'all',
    cuisineType: [] as string[],
    foodPreference: 'BOTH'
  });

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setIsFilterExpanded(false);

    try {
      const results = { accommodations: [], foodServices: [] };

      if (filters.serviceType === 'ACCOMMODATION' || filters.serviceType === 'BOTH') {
        const accommodationParams = new URLSearchParams();
        if (filters.university) accommodationParams.set('university', filters.university);
        if (filters.minRent) accommodationParams.set('minRent', filters.minRent);
        if (filters.maxRent) accommodationParams.set('maxRent', filters.maxRent);
        if (filters.roomType !== 'all') accommodationParams.set('roomType', filters.roomType);
        if (filters.accommodationType !== 'all') accommodationParams.set('accommodationType', filters.accommodationType);
        if (filters.amenities.length > 0) accommodationParams.set('amenities', filters.amenities.join(','));

        const accommodationResponse = await fetch(`/api/listings/accommodation?${accommodationParams}`);
        if (accommodationResponse.ok) {
          const data = await accommodationResponse.json();
          results.accommodations = data.accommodations || [];
        }
      }

      if (filters.serviceType === 'FOOD' || filters.serviceType === 'BOTH') {
        const foodParams = new URLSearchParams();
        if (filters.foodServiceType !== 'all') foodParams.set('serviceType', filters.foodServiceType);
        if (filters.cuisineType.length > 0) foodParams.set('cuisineType', filters.cuisineType.join(','));

        const foodResponse = await fetch(`/api/listings/food?${foodParams}`);
        if (foodResponse.ok) {
          const data = await foodResponse.json();
          results.foodServices = data.foodServices || [];
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        document.getElementById('searchResults')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isDetailsOpen = !!selectedAccommodation || !!selectedFoodService;
  const currentUserId = (session?.user as any)?.id;
  const isStudent = (session?.user as any)?.userType === 'STUDENT';

  const currentStudentReview = useMemo(() => {
    const reviews = selectedAccommodation?.reviews || selectedFoodService?.reviews || [];
    if (!currentUserId) return null;
    return reviews.find((review: any) => review.userId === currentUserId) || null;
  }, [selectedAccommodation, selectedFoodService, currentUserId]);

  useEffect(() => {
    if (currentStudentReview) {
      setReviewRating(currentStudentReview.rating || 5);
      setReviewComment(currentStudentReview.comment || '');
      return;
    }

    setReviewRating(5);
    setReviewComment('');
  }, [currentStudentReview, selectedAccommodation?.id, selectedFoodService?.id]);

  const calculateAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return '0.0';
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const upsertReviewInList = (items: any[], listingId: string, nextReview: any) =>
    items.map((item) => {
      if (item.id !== listingId) return item;
      const existingIndex = (item.reviews || []).findIndex((review: any) => review.id === nextReview.id);
      if (existingIndex >= 0) {
        const updatedReviews = [...item.reviews];
        updatedReviews[existingIndex] = nextReview;
        return { ...item, reviews: updatedReviews };
      }
      return { ...item, reviews: [nextReview, ...(item.reviews || [])] };
    });

  const handleReviewSubmit = async (listingType: 'accommodation' | 'food') => {
    const listingId = listingType === 'accommodation' ? selectedAccommodation?.id : selectedFoodService?.id;
    if (!listingId || isSubmittingReview) return;

    setIsSubmittingReview(true);
    try {
      const payload = {
        rating: reviewRating,
        comment: reviewComment,
        ...(listingType === 'accommodation'
          ? { accommodationListingId: listingId }
          : { foodServiceListingId: listingId }),
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Review not submitted',
          description: data.error || 'Something went wrong while saving your review.',
          variant: 'destructive',
        });
        return;
      }

      const nextReview = data.review;

      setSearchResults((prev: any) => {
        if (listingType === 'accommodation') {
          return {
            ...prev,
            accommodations: upsertReviewInList(prev.accommodations, listingId, nextReview),
          };
        }

        return {
          ...prev,
          foodServices: upsertReviewInList(prev.foodServices, listingId, nextReview),
        };
      });

      if (listingType === 'accommodation') {
        setSelectedAccommodation((prev: any) => {
          if (!prev) return prev;
          const reviews = prev.reviews || [];
          const existingIndex = reviews.findIndex((review: any) => review.id === nextReview.id);
          if (existingIndex >= 0) {
            const updatedReviews = [...reviews];
            updatedReviews[existingIndex] = nextReview;
            return { ...prev, reviews: updatedReviews };
          }
          return { ...prev, reviews: [nextReview, ...reviews] };
        });
      } else {
        setSelectedFoodService((prev: any) => {
          if (!prev) return prev;
          const reviews = prev.reviews || [];
          const existingIndex = reviews.findIndex((review: any) => review.id === nextReview.id);
          if (existingIndex >= 0) {
            const updatedReviews = [...reviews];
            updatedReviews[existingIndex] = nextReview;
            return { ...prev, reviews: updatedReviews };
          }
          return { ...prev, reviews: [nextReview, ...reviews] };
        });
      }

      toast({
        title: 'Success',
        description: data.message || 'Your review has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Review not submitted',
        description: 'Unexpected error while saving review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleInquirySubmit = async (listingType: 'accommodation' | 'food') => {
    const listingId = listingType === 'accommodation' ? selectedAccommodation?.id : selectedFoodService?.id;
    const message = inquiryMessage.trim();
    if (!listingId || !message || isSubmittingInquiry) return;

    setIsSubmittingInquiry(true);
    try {
      const payload = {
        message,
        ...(listingType === 'accommodation'
          ? { accommodationListingId: listingId }
          : { foodServiceListingId: listingId }),
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Inquiry not sent',
          description: data.error || 'Unable to send inquiry. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      setInquiryMessage('');
      toast({
        title: 'Inquiry sent',
        description: data.message || 'Your inquiry has been shared with the owner.',
      });
    } catch (error) {
      toast({
        title: 'Inquiry not sent',
        description: 'Unexpected error while sending inquiry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const closeDetailsPanel = () => {
    setSelectedAccommodation(null);
    setSelectedFoodService(null);
    setInquiryMessage('');
    setReviewRating(5);
    setReviewComment('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Accommodation & Food Services</h1>
        </div>

        <Card className="mb-8 border-0 shadow-md">
          <CardHeader className="cursor-pointer flex flex-row items-center justify-between" onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search Filters
              </CardTitle>
              <CardDescription>Refine your search results</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              {isFilterExpanded ? '▼' : '▶'}
            </Button>
          </CardHeader>
          <CardContent className={`overflow-hidden transition-all duration-300 ${isFilterExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Select value={filters.serviceType} onValueChange={(value) => updateFilter('serviceType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOTH">Both</SelectItem>
                    <SelectItem value="ACCOMMODATION">Accommodation Only</SelectItem>
                    <SelectItem value="FOOD">Food Services Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="university">University</Label>
                <Select value={filters.university} onValueChange={(value) => updateFilter('university', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Universities</SelectItem>
                    <SelectItem value="iit_bombay">IIT Bombay</SelectItem>
                    <SelectItem value="iit_delhi">IIT Delhi</SelectItem>
                    <SelectItem value="bits_pilani">BITS Pilani</SelectItem>
                    <SelectItem value="aiims_delhi">AIIMS Delhi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="minRent">Min Budget (₹)</Label>
                <Input
                  id="minRent"
                  type="number"
                  placeholder="0"
                  value={filters.minRent}
                  onChange={(e) => updateFilter('minRent', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="maxRent">Max Budget (₹)</Label>
                <Input
                  id="maxRent"
                  type="number"
                  placeholder="50000"
                  value={filters.maxRent}
                  onChange={(e) => updateFilter('maxRent', e.target.value)}
                  className="mt-1"
                />
              </div>

              {(filters.serviceType === 'ACCOMMODATION' || filters.serviceType === 'BOTH') && (
                <div>
                  <Label htmlFor="roomType">Room Type</Label>
                  <Select value={filters.roomType} onValueChange={(value) => updateFilter('roomType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="SINGLE">Single</SelectItem>
                      <SelectItem value="DOUBLE">Double</SelectItem>
                      <SelectItem value="SHARING">Sharing</SelectItem>
                      <SelectItem value="STUDIO">Studio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(filters.serviceType === 'FOOD' || filters.serviceType === 'BOTH') && (
                <div>
                  <Label htmlFor="foodServiceType">Food Service Type</Label>
                  <Select value={filters.foodServiceType} onValueChange={(value) => updateFilter('foodServiceType', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MESS">Mess</SelectItem>
                      <SelectItem value="TIFFIN_SERVICE">Tiffin Service</SelectItem>
                      <SelectItem value="CANTEEN">Canteen</SelectItem>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    serviceType: 'BOTH',
                    university: '',
                    minRent: '',
                    maxRent: '',
                    roomType: 'all',
                    accommodationType: 'all',
                    amenities: [],
                    foodServiceType: 'all',
                    cuisineType: [],
                    foodPreference: 'BOTH',
                  });
                }}
              >
                Clear All
              </Button>
              <Button onClick={handleSearch} disabled={isLoading}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        <div id="searchResults" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && [1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-md animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}

          {!isLoading && searchResults.accommodations.map((accommodation: any) => (
            <Card
              key={accommodation.id}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => {
                setSelectedFoodService(null);
                setSelectedAccommodation(accommodation);
              }}
            >
              <CardHeader>
                <CardTitle>{accommodation.propertyName}</CardTitle>
                <CardDescription className="line-clamp-2">{accommodation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-blue-600">₹{accommodation.dailyRate}/day</p>
                    <span className="text-sm text-gray-500">
                      Min stay: {accommodation.minStay} {accommodation.minStay === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    {accommodation.reviews?.length > 0 ? (
                      <>
                        <span className="font-medium">{calculateAverageRating(accommodation.reviews)}</span>
                        <span className="ml-1">({accommodation.reviews.length} reviews)</span>
                      </>
                    ) : (
                      <span>No reviews yet</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <p>{accommodation.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{accommodation.roomType}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{accommodation.accommodationType}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFoodService(null);
                          setSelectedAccommodation(accommodation);
                        }}
                      >
                        More Details
                      </Button>
                      <Link
                        href={`/student/inquiries?listingType=accommodation&listingId=${accommodation.id}&listingName=${encodeURIComponent(accommodation.propertyName)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Inquiry
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!isLoading && searchResults.foodServices.map((service: any) => (
            <Card
              key={service.id}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => {
                setSelectedAccommodation(null);
                setSelectedFoodService(service);
              }}
            >
              <CardHeader>
                <CardTitle>{service.serviceName}</CardTitle>
                <CardDescription className="line-clamp-2">{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-green-600">{service.priceRange}</p>
                    <span className="text-sm text-gray-500">{service.serviceType}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    {service.reviews?.length > 0 ? (
                      <>
                        <span className="font-medium">{calculateAverageRating(service.reviews)}</span>
                        <span className="ml-1">({service.reviews.length} reviews)</span>
                      </>
                    ) : (
                      <span>No reviews yet</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <p>{service.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {service.vegOptions && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Veg</span>}
                    {service.nonVegOptions && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Non-Veg</span>}
                    {service.deliveryAvailable && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Delivery</span>}
                  </div>
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAccommodation(null);
                          setSelectedFoodService(service);
                        }}
                      >
                        More Details
                      </Button>
                      <Link
                        href={`/student/inquiries?listingType=food&listingId=${service.id}&listingName=${encodeURIComponent(service.serviceName)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Inquiry
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {!isLoading && searchResults.accommodations.length === 0 && searchResults.foodServices.length === 0 && (
            <Card className="border-0 shadow-md col-span-full">
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search filters to find what you're looking for.</p>
              </CardContent>
            </Card>
          )}
        </div>

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
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedAccommodation.description || 'No description available.'}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-sm text-gray-700">{selectedAccommodation.contactInfo || 'Not available'}</p>
                </div>

                {isStudent && (
                  <Card className="border border-indigo-100 bg-indigo-50/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Send Inquiry to Owner</CardTitle>
                      <CardDescription>Your message will be delivered to this listing owner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Hi, I am interested in this accommodation. Please share availability and visit timings."
                        maxLength={1000}
                        rows={4}
                      />
                      <p className="text-xs text-gray-500">{inquiryMessage.length}/1000</p>
                      <Button
                        onClick={() => handleInquirySubmit('accommodation')}
                        disabled={isSubmittingInquiry || inquiryMessage.trim().length < 5}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Student Reviews</h4>
                    {selectedAccommodation.reviews?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        {calculateAverageRating(selectedAccommodation.reviews)}
                        <span className="ml-1">({selectedAccommodation.reviews.length})</span>
                      </div>
                    )}
                  </div>

                  {isStudent && (
                    <Card className="border border-blue-100 bg-blue-50/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{currentStudentReview ? 'Update your review' : 'Write a review'}</CardTitle>
                        <CardDescription>Share your experience to help other students.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Your Rating</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewRating(value)}
                                className="p-1"
                                aria-label={`Rate ${value} stars`}
                              >
                                <Star
                                  className={`h-5 w-5 ${value <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Your Comment</p>
                          <Textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="What did you like or dislike?"
                            maxLength={500}
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">{reviewComment.length}/500</p>
                        </div>
                        <Button
                          onClick={() => handleReviewSubmit('accommodation')}
                          disabled={isSubmittingReview}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmittingReview ? 'Saving...' : currentStudentReview ? 'Update Review' : 'Submit Review'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedAccommodation.reviews?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedAccommodation.reviews
                        .slice()
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((review: any) => (
                          <div key={review.id} className="rounded-lg border bg-white p-3">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Student'}</p>
                              <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Star
                                  key={value}
                                  className={`h-4 w-4 ${value <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No reviews yet. Be the first student to review this listing.</p>
                  )}
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
                  <p className="text-sm text-gray-700 whitespace-pre-line">{selectedFoodService.description || 'No description available.'}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-sm text-gray-700">{selectedFoodService.contactInfo || 'Not available'}</p>
                </div>

                {isStudent && (
                  <Card className="border border-indigo-100 bg-indigo-50/40">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Send Inquiry to Owner</CardTitle>
                      <CardDescription>Your message will be delivered to this listing owner.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        placeholder="Hi, I am interested in this food service. Please share pricing and monthly plans."
                        maxLength={1000}
                        rows={4}
                      />
                      <p className="text-xs text-gray-500">{inquiryMessage.length}/1000</p>
                      <Button
                        onClick={() => handleInquirySubmit('food')}
                        disabled={isSubmittingInquiry || inquiryMessage.trim().length < 5}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Student Reviews</h4>
                    {selectedFoodService.reviews?.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                        {calculateAverageRating(selectedFoodService.reviews)}
                        <span className="ml-1">({selectedFoodService.reviews.length})</span>
                      </div>
                    )}
                  </div>

                  {isStudent && (
                    <Card className="border border-green-100 bg-green-50/40">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{currentStudentReview ? 'Update your review' : 'Write a review'}</CardTitle>
                        <CardDescription>Help other students choose better food services.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Your Rating</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setReviewRating(value)}
                                className="p-1"
                                aria-label={`Rate ${value} stars`}
                              >
                                <Star
                                  className={`h-5 w-5 ${value <= reviewRating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Your Comment</p>
                          <Textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Tell others about food quality, hygiene, and value."
                            maxLength={500}
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">{reviewComment.length}/500</p>
                        </div>
                        <Button
                          onClick={() => handleReviewSubmit('food')}
                          disabled={isSubmittingReview}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isSubmittingReview ? 'Saving...' : currentStudentReview ? 'Update Review' : 'Submit Review'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedFoodService.reviews?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedFoodService.reviews
                        .slice()
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((review: any) => (
                          <div key={review.id} className="rounded-lg border bg-white p-3">
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <p className="text-sm font-medium text-gray-900">{review.user?.name || 'Student'}</p>
                              <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center mb-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Star
                                  key={value}
                                  className={`h-4 w-4 ${value <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-700">{review.comment || 'No comment provided.'}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No reviews yet. Be the first student to review this service.</p>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
