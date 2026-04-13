
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { SearchResults } from '@/components/search-results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Filter, Search } from 'lucide-react';

export default function AccommodationPage() {
  const { data: session, status } = useSession() || {};
  const [accommodations, setAccommodations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    university: '',
    minRent: '',
    maxRent: '',
    roomType: 'all',
    accommodationType: 'all'
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

    loadAccommodations();
  }, [session, status]);

  const loadAccommodations = async () => {
    setIsLoading(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.university && filters.university !== 'all') params.set('university', filters.university);
      if (filters.minRent) params.set('minRent', filters.minRent);
      if (filters.maxRent) params.set('maxRent', filters.maxRent);
      if (filters.roomType !== 'all') params.set('roomType', filters.roomType);
      if (filters.accommodationType !== 'all') params.set('accommodationType', filters.accommodationType);

      const response = await fetch(`/api/listings/accommodation?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAccommodations(data.accommodations || []);
      }
    } catch (error) {
      console.error('Error loading accommodations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Find Accommodation</h1>
          </div>
          <p className="text-gray-600">
            Discover comfortable and affordable accommodation options near your university.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Search Accommodations</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <Select 
                    value={filters.university} 
                    onValueChange={(value) => updateFilter('university', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Universities</SelectItem>
                      <SelectItem value="IIT Bombay">IIT Bombay</SelectItem>
                      <SelectItem value="IIT Delhi">IIT Delhi</SelectItem>
                      <SelectItem value="BITS Pilani">BITS Pilani</SelectItem>
                      <SelectItem value="AIIMS Delhi">AIIMS Delhi</SelectItem>
                      <SelectItem value="PGIMER Chandigarh">PGIMER Chandigarh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minRent">Min Rent (₹)</Label>
                  <Input
                    id="minRent"
                    type="number"
                    placeholder="5000"
                    value={filters.minRent}
                    onChange={(e) => updateFilter('minRent', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxRent">Max Rent (₹)</Label>
                  <Input
                    id="maxRent"
                    type="number"
                    placeholder="30000"
                    value={filters.maxRent}
                    onChange={(e) => updateFilter('maxRent', e.target.value)}
                    className="mt-1"
                  />
                </div>

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

                <div>
                  <Label htmlFor="accommodationType">Property Type</Label>
                  <Select 
                    value={filters.accommodationType} 
                    onValueChange={(value) => updateFilter('accommodationType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="PG">PG</SelectItem>
                      <SelectItem value="HOSTEL">Hostel</SelectItem>
                      <SelectItem value="FLAT">Flat</SelectItem>
                      <SelectItem value="APARTMENT">Apartment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      university: '',
                      minRent: '',
                      maxRent: '',
                      roomType: 'all',
                      accommodationType: 'all'
                    });
                  }}
                >
                  Clear All
                </Button>
                <Button onClick={loadAccommodations} disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Apply Filters'}
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Results */}
        <SearchResults 
          results={{ accommodations, foodServices: [] }}
          isLoading={isLoading}
          searchQuery=""
        />
      </main>
    </div>
  );
}
