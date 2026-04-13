
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { SearchResults } from '@/components/search-results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UtensilsIcon, Filter } from 'lucide-react';

export default function FoodPage() {
  const { data: session, status } = useSession() || {};
  const [foodServices, setFoodServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    serviceType: 'all',
    priceRange: 'all',
    vegOptions: false,
    deliveryAvailable: false
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/login');
    }
    
    const userType = (session.user as any)?.userType;
    if (userType !== 'STUDENT') {
      redirect('/owner/dashboard');
    }

    loadFoodServices();
  }, [session, status]);

  const loadFoodServices = async () => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.serviceType !== 'all') params.set('serviceType', filters.serviceType);
      if (filters.priceRange !== 'all') params.set('priceRange', filters.priceRange);
      if (filters.vegOptions) params.set('vegOptions', 'true');
      if (filters.deliveryAvailable) params.set('deliveryAvailable', 'true');

      const response = await fetch(`/api/listings/food?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFoodServices(data.foodServices || []);
      }
    } catch (error) {
      console.error('Error loading food services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <UtensilsIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Find Food Services</h1>
          </div>
          <p className="text-gray-600">
            Explore delicious and affordable food options for students.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Search Food Services</CardTitle>
                <CardDescription>Filter by your preferences</CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </CardHeader>
          
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="MESS">Mess</SelectItem>
                      <SelectItem value="TIFFIN_SERVICE">Tiffin Service</SelectItem>
                      <SelectItem value="CANTEEN">Canteen</SelectItem>
                      <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                      <SelectItem value="CAFE">Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priceRange">Price Range</Label>
                  <Select 
                    value={filters.priceRange} 
                    onValueChange={(value) => updateFilter('priceRange', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranges</SelectItem>
                      <SelectItem value="BUDGET">Budget</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Food Preferences</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="vegOptions"
                        checked={filters.vegOptions}
                        onCheckedChange={(checked) => updateFilter('vegOptions', !!checked)}
                      />
                      <Label htmlFor="vegOptions" className="text-sm">Vegetarian Options</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Additional Services</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="deliveryAvailable"
                        checked={filters.deliveryAvailable}
                        onCheckedChange={(checked) => updateFilter('deliveryAvailable', !!checked)}
                      />
                      <Label htmlFor="deliveryAvailable" className="text-sm">Delivery Available</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      serviceType: 'all',
                      priceRange: 'all',
                      vegOptions: false,
                      deliveryAvailable: false
                    });
                  }}
                >
                  Clear All
                </Button>
                <Button onClick={loadFoodServices} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Apply Filters'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results */}
        <SearchResults 
          results={{ accommodations: [], foodServices }}
          isLoading={isLoading}
          searchQuery=""
        />
      </main>
    </div>
  );
}
