
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeIcon, Eye, EyeOff, UserPlus, Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams?.get('type') === 'owner' ? 'PROPERTY_OWNER' : 'STUDENT';
  
  // Lock the user type based on URL parameter
  const [userType] = useState<'STUDENT' | 'PROPERTY_OWNER'>(initialType);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    university: '',
    stream: '',
    serviceType: '',
    propertyType: '',
    location: '',
    nearbyUniversity: '',
    price: '',
    minStay: '1', // Default minimum stay is 1 day
    capacity: '',
    roomType: '',
    description: '',
    images: [] as File[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const universities = [
    { value: 'iit_bombay', label: 'IIT Bombay', stream: 'ENGINEERING' },
    { value: 'iit_delhi', label: 'IIT Delhi', stream: 'ENGINEERING' },
    { value: 'bits_pilani', label: 'BITS Pilani', stream: 'ENGINEERING' },
    { value: 'nit_trichy', label: 'NIT Trichy', stream: 'ENGINEERING' },
    { value: 'aiims_delhi', label: 'AIIMS Delhi', stream: 'MEDICAL' },
    { value: 'pgimer_chandigarh', label: 'PGIMER Chandigarh', stream: 'MEDICAL' },
    { value: 'jipmer_puducherry', label: 'JIPMER Puducherry', stream: 'MEDICAL' },
    { value: 'kmc_manipal', label: 'KMC Manipal', stream: 'MEDICAL' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a single FormData instance for the entire submission
      const uploadFormData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          // Add each image file
          value.forEach((file: File) => {
            uploadFormData.append('images', file);
          });
        } else {
          // Add other form fields
          uploadFormData.append(key, String(value));
        }
      });
      
      // Add user type
      uploadFormData.append('userType', userType);

      const response = await fetch('/api/signup', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Account Created!',
          description: 'Your account has been created successfully. Please sign in.'
        });
        router.push('/auth/login');
      } else {
        toast({
          title: 'Registration Failed',
          description: data.error || 'Failed to create account. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-set stream when university is selected
    if (field === 'university') {
      const university = universities.find(u => u.value === value);
      if (university) {
        setFormData(prev => ({
          ...prev,
          stream: university.stream
        }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700">
            <HomeIcon className="h-6 w-6" />
            <span className="text-xl font-bold">EduStay Portal</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              {userType === 'PROPERTY_OWNER' 
                ? 'List your property or food service for students'
                : 'Join our platform to find accommodation and food services'
              }
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Registration Type Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                {userType === 'PROPERTY_OWNER' ? (
                  <>
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Property Owner Registration</span>
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="text-blue-600 font-medium">Student Registration</span>
                  </>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              {/* Student Specific Fields */}
              {userType === 'STUDENT' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="university">University *</Label>
                    <Select value={formData.university} onValueChange={(value) => handleSelectChange('university', value)} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select your university" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni.value} value={uni.value}>
                            {uni.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stream">Stream</Label>
                      <Input
                        id="stream"
                        value={formData.stream}
                        readOnly
                        placeholder="Auto-selected based on university"
                        className="h-11 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serviceType">Services Needed *</Label>
                      <Select onValueChange={(value) => handleSelectChange('serviceType', value)} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select services" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACCOMMODATION">Accommodation Only</SelectItem>
                          <SelectItem value="FOOD">Food Only</SelectItem>
                          <SelectItem value="BOTH">Both Accommodation & Food</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Property Owner Specific Fields */}
              {userType === 'PROPERTY_OWNER' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select onValueChange={(value) => handleSelectChange('propertyType', value)} required>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PG">PG/Hostel</SelectItem>
                        <SelectItem value="HOSTEL">Hostel</SelectItem>
                        <SelectItem value="FLAT">Flat</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="ROOM">Room</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location/Area *</Label>
                      <Input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="Enter property location"
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nearbyUniversity">Nearby University *</Label>
                      <Select onValueChange={(value) => handleSelectChange('nearbyUniversity', value)} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select nearby university" />
                        </SelectTrigger>
                        <SelectContent>
                          {universities.map((uni) => (
                            <SelectItem key={uni.value} value={uni.value}>
                              {uni.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Daily Rate (₹) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        placeholder="Enter price per day"
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                      <p className="text-sm text-gray-500">Base rate per day</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minStay">Minimum Stay (Days) *</Label>
                      <Input
                        id="minStay"
                        name="minStay"
                        type="number"
                        min="1"
                        placeholder="Minimum days required"
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                      <p className="text-sm text-gray-500">Minimum booking duration</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Total Capacity *</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        placeholder="Number of rooms/beds"
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                      <p className="text-sm text-gray-500">Available rooms/beds</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roomType">Room Type *</Label>
                      <Select onValueChange={(value) => handleSelectChange('roomType', value)} required>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single Bed</SelectItem>
                          <SelectItem value="DOUBLE">Double Bed</SelectItem>
                          <SelectItem value="SHARING">Shared Room</SelectItem>
                          <SelectItem value="STUDIO">Studio</SelectItem>
                          <SelectItem value="APARTMENT">Apartment Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Property Description *</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe your property, amenities, rules, etc."
                      onChange={(e) => handleChange(e as any)}
                      required
                      className="w-full h-24 p-2 border rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Property Images *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="flex flex-col items-center">
                        <div className="mb-3">
                          <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                          </svg>
                        </div>
                        <div className="text-center">
                          <div className="mt-1 text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                              <span>Upload property images</span>
                              <input 
                                id="file-upload" 
                                name="images" 
                                type="file" 
                                className="sr-only" 
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  if (e.target.files && e.target.files.length > 0) {
                                    const files = Array.from(e.target.files);
                                    
                                    // Validate file sizes
                                    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024); // 5MB limit
                                    
                                    if (validFiles.length !== files.length) {
                                      toast({
                                        title: 'File Size Error',
                                        description: 'Some files exceed the 5MB limit and were not added.',
                                        variant: 'destructive'
                                      });
                                    }
                                    
                                    setFormData(prev => ({
                                      ...prev,
                                      images: validFiles
                                    }));
                                  }
                                }}
                                required
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB each</p>
                        </div>
                      </div>
                      {formData.images && formData.images.length > 0 && (
                        <div className="mt-4">
                          <div className="grid grid-cols-3 gap-4">
                            {Array.from(formData.images).map((file: File, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="h-24 w-full object-cover rounded"
                                />
                                <button
                                  type="button"
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-lg transform translate-x-1/2 -translate-y-1/2"
                                  onClick={() => {
                                    setFormData(prev => ({
                                      ...prev,
                                      images: Array.from(prev.images || []).filter((_, i) => i !== index)
                                    }));
                                  }}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
