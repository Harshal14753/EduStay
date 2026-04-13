
'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Filter } from 'lucide-react';

import { AccommodationDetailsDialog } from "@/components/accommodation-details-dialog";

export default function StudentSearchPage() {
  const [searchResults, setSearchResults] = useState<any>({ accommodations: [], foodServices: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [selectedAccommodation, setSelectedAccommodation] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
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
    // Load initial data on component mount
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    setIsFilterExpanded(false); // Collapse filters when searching
    
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
      // Scroll to results after a short delay to ensure DOM updates
      setTimeout(() => {
        document.getElementById('searchResults')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addToFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: [...(prev[key as keyof typeof prev] as string[]), value]
    }));
  };

  const removeFromFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key as keyof typeof prev] as string[]).filter((item: string) => item !== value)
    }));
  };



  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Search Accommodation & Food Services
          </h1>
          
          
        </div>

        {/* Filters Panel - Collapsible */}
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
                {/* Service Type */}
                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select 
                    value={filters.serviceType} 
                    onValueChange={(value) => updateFilter('serviceType', value)}
                  >
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

                {/* University */}
                <div>
                  <Label htmlFor="university">University</Label>
                  <Select 
                    value={filters.university} 
                    onValueChange={(value) => updateFilter('university', value)}
                  >
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

                {/* Price Range - Min */}
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

                {/* Price Range - Max */}
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

                {/* Room Type */}
                {(filters.serviceType === 'ACCOMMODATION' || filters.serviceType === 'BOTH') && (
                  <div>
                    <Label htmlFor="roomType">Room Type</Label>
                    <Select 
                      value={filters.roomType} 
                      onValueChange={(value) => updateFilter('roomType', value)}
                    >
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

                {/* Food Service Type */}
                {(filters.serviceType === 'FOOD' || filters.serviceType === 'BOTH') && (
                  <div>
                    <Label htmlFor="foodServiceType">Food Service Type</Label>
                    <Select 
                      value={filters.foodServiceType} 
                      onValueChange={(value) => updateFilter('foodServiceType', value)}
                    >
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
                      foodPreference: 'BOTH'
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

        {/* Search Results */}
        <div id="searchResults" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.accommodations.map((accommodation: any) => (
            <Card 
              key={accommodation.id} 
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => {
                setSelectedAccommodation(accommodation);
                setIsDetailsDialogOpen(true);
              }}
            >
              <CardHeader>
                <CardTitle>{accommodation.propertyName}</CardTitle>
                <CardDescription className="line-clamp-2">{accommodation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-blue-600">
                      ₹{accommodation.dailyRate}/day
                    </p>
                    <span className="text-sm text-gray-500">
                      Min stay: {accommodation.minStay} {accommodation.minStay === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <p>{accommodation.address}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {accommodation.roomType}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {accommodation.accommodationType}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {searchResults.foodServices.map((service: any) => (
            <Card key={service.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold text-green-600">₹{service.price}/meal</p>
                <p className="text-sm text-gray-600">{service.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Accommodation Details Dialog */}
        <AccommodationDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          accommodation={selectedAccommodation}
        />
      </main>
    </div>
  );
}
