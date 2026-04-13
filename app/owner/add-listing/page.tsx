
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, UtensilsIcon, PlusCircle, Camera, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AddListingPage() {
  const { data: session, status } = useSession() || {};
  const { toast } = useToast();
  const [listingType, setListingType] = useState<'accommodation' | 'food'>('accommodation');
  const [isLoading, setIsLoading] = useState(false);

  const [accommodationData, setAccommodationData] = useState({
    propertyName: '',
    monthlyRent: '',
    deposit: '',
    roomType: '',
    accommodationType: '',
    foodPreference: '',
    address: '',
    contactInfo: '',
    description: '',
    nearbyUniversities: [] as string[],
    amenities: [] as string[],
    livingPreferences: [] as string[]
  });

  const [foodServiceData, setFoodServiceData] = useState({
    serviceName: '',
    serviceType: '',
    priceRange: '',
    address: '',
    contactInfo: '',
    description: '',
    operatingHours: '',
    cuisineType: [] as string[],
    vegOptions: false,
    nonVegOptions: false,
    deliveryAvailable: false
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/login');
    }
    
    const userType = (session.user as any)?.userType;
    if (userType !== 'PROPERTY_OWNER') {
      redirect('/student/dashboard');
    }
  }, [session, status]);

  const handleAccommodationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/listings/accommodation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...accommodationData,
          monthlyRent: parseInt(accommodationData.monthlyRent),
          deposit: accommodationData.deposit ? parseInt(accommodationData.deposit) : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your accommodation listing has been created successfully.'
        });
        // Reset form
        setAccommodationData({
          propertyName: '',
          monthlyRent: '',
          deposit: '',
          roomType: '',
          accommodationType: '',
          foodPreference: '',
          address: '',
          contactInfo: '',
          description: '',
          nearbyUniversities: [],
          amenities: [],
          livingPreferences: []
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create listing',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFoodServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/listings/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(foodServiceData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Your food service listing has been created successfully.'
        });
        // Reset form
        setFoodServiceData({
          serviceName: '',
          serviceType: '',
          priceRange: '',
          address: '',
          contactInfo: '',
          description: '',
          operatingHours: '',
          cuisineType: [],
          vegOptions: false,
          nonVegOptions: false,
          deliveryAvailable: false
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create listing',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: any) => void, key: string) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
    
    if (listingType === 'accommodation') {
      setter({ ...accommodationData, [key]: newArray });
    } else {
      setter({ ...foodServiceData, [key]: newArray });
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Listing</h1>
          <p className="text-gray-600">Add your property or food service to connect with students</p>
        </div>

        {/* Listing Type Selection */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle>What would you like to list?</CardTitle>
            <CardDescription>Choose the type of service you want to offer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setListingType('accommodation')}
                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                  listingType === 'accommodation'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <Building2 className={`h-8 w-8 ${listingType === 'accommodation' ? 'text-blue-600' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="text-lg font-semibold">Accommodation</h3>
                    <p className="text-sm text-gray-600">PG, Hostel, Room, Apartment</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setListingType('food')}
                className={`cursor-pointer p-6 rounded-lg border-2 transition-all ${
                  listingType === 'food'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <UtensilsIcon className={`h-8 w-8 ${listingType === 'food' ? 'text-green-600' : 'text-gray-500'}`} />
                  <div>
                    <h3 className="text-lg font-semibold">Food Service</h3>
                    <p className="text-sm text-gray-600">Mess, Tiffin, Restaurant, Canteen</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accommodation Form */}
        {listingType === 'accommodation' && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Accommodation Details
              </CardTitle>
              <CardDescription>Provide information about your property</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAccommodationSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyName">Property Name *</Label>
                    <Input
                      id="propertyName"
                      value={accommodationData.propertyName}
                      onChange={(e) => setAccommodationData({...accommodationData, propertyName: e.target.value})}
                      placeholder="e.g., Cozy PG near Campus"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent (₹) *</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={accommodationData.monthlyRent}
                      onChange={(e) => setAccommodationData({...accommodationData, monthlyRent: e.target.value})}
                      placeholder="15000"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="deposit">Security Deposit (₹)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      value={accommodationData.deposit}
                      onChange={(e) => setAccommodationData({...accommodationData, deposit: e.target.value})}
                      placeholder="10000"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Select 
                      value={accommodationData.roomType} 
                      onValueChange={(value) => setAccommodationData({...accommodationData, roomType: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SINGLE">Single</SelectItem>
                        <SelectItem value="DOUBLE">Double</SelectItem>
                        <SelectItem value="SHARING">Sharing</SelectItem>
                        <SelectItem value="STUDIO">Studio</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accommodationType">Accommodation Type *</Label>
                    <Select 
                      value={accommodationData.accommodationType} 
                      onValueChange={(value) => setAccommodationData({...accommodationData, accommodationType: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PG">PG</SelectItem>
                        <SelectItem value="HOSTEL">Hostel</SelectItem>
                        <SelectItem value="FLAT">Flat</SelectItem>
                        <SelectItem value="ROOM">Room</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="foodPreference">Food Preference *</Label>
                  <Select 
                    value={accommodationData.foodPreference} 
                    onValueChange={(value) => setAccommodationData({...accommodationData, foodPreference: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select food preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VEG">Veg Only</SelectItem>
                      <SelectItem value="NON_VEG">Non-Veg Only</SelectItem>
                      <SelectItem value="BOTH">Both Veg & Non-Veg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={accommodationData.address}
                    onChange={(e) => setAccommodationData({...accommodationData, address: e.target.value})}
                    placeholder="Complete address with landmarks"
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contactInfo">Contact Information *</Label>
                  <Input
                    id="contactInfo"
                    value={accommodationData.contactInfo}
                    onChange={(e) => setAccommodationData({...accommodationData, contactInfo: e.target.value})}
                    placeholder="Phone number or email"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Property Description</Label>
                  <Textarea
                    id="description"
                    value={accommodationData.description}
                    onChange={(e) => setAccommodationData({...accommodationData, description: e.target.value})}
                    placeholder="Describe your property, facilities, rules, etc."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {/* Amenities */}
                <div>
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['WiFi', 'AC', 'Parking', 'Laundry', 'Security', 'Mess', 'Gym', 'Study Room'].map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={accommodationData.amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAccommodationData({
                                ...accommodationData, 
                                amenities: [...accommodationData.amenities, amenity]
                              });
                            } else {
                              setAccommodationData({
                                ...accommodationData, 
                                amenities: accommodationData.amenities.filter(a => a !== amenity)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={amenity} className="text-sm">{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Universities */}
                <div>
                  <Label>Nearby Universities</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {['IIT Bombay', 'IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'AIIMS Delhi', 'PGIMER Chandigarh'].map((university) => (
                      <div key={university} className="flex items-center space-x-2">
                        <Checkbox
                          id={university}
                          checked={accommodationData.nearbyUniversities.includes(university)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAccommodationData({
                                ...accommodationData, 
                                nearbyUniversities: [...accommodationData.nearbyUniversities, university]
                              });
                            } else {
                              setAccommodationData({
                                ...accommodationData, 
                                nearbyUniversities: accommodationData.nearbyUniversities.filter(u => u !== university)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={university} className="text-sm">{university}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Creating Listing...' : 'Create Accommodation Listing'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Food Service Form */}
        {listingType === 'food' && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UtensilsIcon className="h-5 w-5 mr-2 text-green-600" />
                Food Service Details
              </CardTitle>
              <CardDescription>Provide information about your food service</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFoodServiceSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceName">Service Name *</Label>
                    <Input
                      id="serviceName"
                      value={foodServiceData.serviceName}
                      onChange={(e) => setFoodServiceData({...foodServiceData, serviceName: e.target.value})}
                      placeholder="e.g., South Indian Tiffin Service"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select 
                      value={foodServiceData.serviceType} 
                      onValueChange={(value) => setFoodServiceData({...foodServiceData, serviceType: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MESS">Mess</SelectItem>
                        <SelectItem value="TIFFIN_SERVICE">Tiffin Service</SelectItem>
                        <SelectItem value="CANTEEN">Canteen</SelectItem>
                        <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                        <SelectItem value="CAFE">Cafe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceRange">Price Range *</Label>
                    <Select 
                      value={foodServiceData.priceRange} 
                      onValueChange={(value) => setFoodServiceData({...foodServiceData, priceRange: value})}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUDGET">Budget (₹50-100/meal)</SelectItem>
                        <SelectItem value="MODERATE">Moderate (₹100-200/meal)</SelectItem>
                        <SelectItem value="PREMIUM">Premium (₹200+/meal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="operatingHours">Operating Hours</Label>
                    <Input
                      id="operatingHours"
                      value={foodServiceData.operatingHours}
                      onChange={(e) => setFoodServiceData({...foodServiceData, operatingHours: e.target.value})}
                      placeholder="e.g., 7:00 AM - 10:00 PM"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Textarea
                    id="address"
                    value={foodServiceData.address}
                    onChange={(e) => setFoodServiceData({...foodServiceData, address: e.target.value})}
                    placeholder="Complete address with landmarks"
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="contactInfo">Contact Information *</Label>
                  <Input
                    id="contactInfo"
                    value={foodServiceData.contactInfo}
                    onChange={(e) => setFoodServiceData({...foodServiceData, contactInfo: e.target.value})}
                    placeholder="Phone number or email"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Service Description</Label>
                  <Textarea
                    id="description"
                    value={foodServiceData.description}
                    onChange={(e) => setFoodServiceData({...foodServiceData, description: e.target.value})}
                    placeholder="Describe your food service, specialties, etc."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {/* Food Options */}
                <div>
                  <Label>Food Options</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegOptions"
                        checked={foodServiceData.vegOptions}
                        onCheckedChange={(checked) => setFoodServiceData({...foodServiceData, vegOptions: !!checked})}
                      />
                      <Label htmlFor="vegOptions">Vegetarian Options</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="nonVegOptions"
                        checked={foodServiceData.nonVegOptions}
                        onCheckedChange={(checked) => setFoodServiceData({...foodServiceData, nonVegOptions: !!checked})}
                      />
                      <Label htmlFor="nonVegOptions">Non-Vegetarian Options</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="deliveryAvailable"
                        checked={foodServiceData.deliveryAvailable}
                        onCheckedChange={(checked) => setFoodServiceData({...foodServiceData, deliveryAvailable: !!checked})}
                      />
                      <Label htmlFor="deliveryAvailable">Delivery Available</Label>
                    </div>
                  </div>
                </div>

                {/* Cuisine Types */}
                <div>
                  <Label>Cuisine Types</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {['North Indian', 'South Indian', 'Chinese', 'Continental', 'Fast Food', 'Snacks', 'Desserts', 'Beverages'].map((cuisine) => (
                      <div key={cuisine} className="flex items-center space-x-2">
                        <Checkbox
                          id={cuisine}
                          checked={foodServiceData.cuisineType.includes(cuisine)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFoodServiceData({
                                ...foodServiceData, 
                                cuisineType: [...foodServiceData.cuisineType, cuisine]
                              });
                            } else {
                              setFoodServiceData({
                                ...foodServiceData, 
                                cuisineType: foodServiceData.cuisineType.filter(c => c !== cuisine)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={cuisine} className="text-sm">{cuisine}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Creating Listing...' : 'Create Food Service Listing'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
