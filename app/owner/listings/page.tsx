
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Building2, UtensilsIcon, Eye, Edit, Trash2, PlusCircle } from 'lucide-react';

export default function OwnerListingsPage() {
  const { data: session, status } = useSession() || {};
  const [listings, setListings] = useState<{accommodations: any[], foodServices: any[]}>({
    accommodations: [],
    foodServices: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/login');
    }
    
    const userType = (session.user as any)?.userType;
    if (userType !== 'PROPERTY_OWNER') {
      redirect('/student/dashboard');
    }

    loadListings();
  }, [session, status]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd have an API endpoint to get listings by owner
      // For now, we'll fetch all listings (this should be filtered by owner on the backend)
      const [accommodationResponse, foodResponse] = await Promise.all([
        fetch('/api/listings/accommodation'),
        fetch('/api/listings/food')
      ]);

      const accommodationData = await accommodationResponse.json();
      const foodData = await foodResponse.json();

      // Filter by current user (in real app, this filtering should be done on backend)
      const currentUserId = (session?.user as any)?.id;
      
      setListings({
        accommodations: (accommodationData.accommodations || []).filter((acc: any) => acc.ownerId === currentUserId),
        foodServices: (foodData.foodServices || []).filter((food: any) => food.ownerId === currentUserId)
      });
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  const totalListings = listings.accommodations.length + listings.foodServices.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">
              Manage your accommodation and food service listings
            </p>
          </div>
          <Link href="/owner/add-listing">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Listings</p>
                  <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Accommodations</p>
                  <p className="text-2xl font-bold text-gray-900">{listings.accommodations.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Food Services</p>
                  <p className="text-2xl font-bold text-gray-900">{listings.foodServices.length}</p>
                </div>
                <UtensilsIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accommodation Listings */}
        {listings.accommodations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-purple-600" />
              Accommodation Listings ({listings.accommodations.length})
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.accommodations.map((accommodation) => (
                <Card key={accommodation.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{accommodation.propertyName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{accommodation.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ₹{accommodation.monthlyRent?.toLocaleString()}/month
                        </p>
                        <Badge variant={accommodation.availability ? "secondary" : "destructive"}>
                          {accommodation.availability ? "Available" : "Not Available"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{accommodation.roomType}</Badge>
                      <Badge variant="outline">{accommodation.accommodationType}</Badge>
                      <Badge variant="outline">{accommodation.foodPreference} Food</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{accommodation.reviews?.length || 0} reviews</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Food Service Listings */}
        {listings.foodServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UtensilsIcon className="h-5 w-5 mr-2 text-green-600" />
              Food Service Listings ({listings.foodServices.length})
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.foodServices.map((foodService) => (
                <Card key={foodService.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{foodService.serviceName}</h3>
                        <p className="text-sm text-gray-600 mt-1">{foodService.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="text-lg">
                          {foodService.priceRange}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{foodService.serviceType}</Badge>
                      {foodService.vegOptions && <Badge variant="outline" className="bg-green-50 text-green-700">Veg</Badge>}
                      {foodService.nonVegOptions && <Badge variant="outline" className="bg-red-50 text-red-700">Non-Veg</Badge>}
                      {foodService.deliveryAvailable && <Badge variant="outline">Delivery</Badge>}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{foodService.reviews?.length || 0} reviews</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Listings State */}
        {totalListings === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Building2 className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">
                Start by creating your first accommodation or food service listing.
              </p>
              <Link href="/owner/add-listing">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
