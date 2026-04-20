
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { OpenChatAssistantButton } from "@/components/owner/open-chat-assistant-button";
import Link from "next/link";
import { 
  Building2, 
  UtensilsIcon, 
  PlusCircle, 
  MessageSquare, 
  TrendingUp,
  Clock,
  Star,
  ArrowRight
} from "lucide-react";

export default async function OwnerDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userType = (session.user as any)?.userType;
  if (userType !== 'PROPERTY_OWNER') {
    redirect('/student/dashboard');
  }

  const userId = (session.user as any)?.id as string;
  const userName = session.user?.name?.split(' ')[0] || 'Owner';

  const [accommodations, foodServices, inquiries] = await Promise.all([
    prisma.accommodationListing.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        propertyName: true,
        address: true,
        monthlyRent: true,
        dailyRate: true,
        availability: true,
        createdAt: true,
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.foodServiceListing.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        serviceName: true,
        address: true,
        priceRange: true,
        createdAt: true,
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.inquiry.findMany({
      where: {
        OR: [
          { accommodationListing: { ownerId: userId } },
          { foodServiceListing: { ownerId: userId } }
        ]
      },
      select: {
        id: true,
        studentName: true,
        message: true,
        status: true,
        createdAt: true,
        accommodationListing: {
          select: { propertyName: true }
        },
        foodServiceListing: {
          select: { serviceName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 6
    })
  ]);

  const totalListings = accommodations.length + foodServices.length;
  const activeAccommodations = accommodations.filter((item) => item.availability).length;
  const pendingInquiries = inquiries.filter((item) => item.status === 'PENDING').length;

  const allRatings = [
    ...accommodations.flatMap((item) => item.reviews.map((review) => review.rating)),
    ...foodServices.flatMap((item) => item.reviews.map((review) => review.rating))
  ];
  const averageRating = allRatings.length
    ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
    : 'N/A';

  const estimatedMonthlyRevenue = accommodations
    .filter((item) => item.availability)
    .reduce((sum, item) => sum + (item.monthlyRent || item.dailyRate * 30 || 0), 0);

  const quickStats = [
    { label: 'Total Listings', value: String(totalListings), icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Stays', value: String(activeAccommodations), icon: TrendingUp, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Inquiries', value: String(pendingInquiries), icon: MessageSquare, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Avg. Rating', value: averageRating === 'N/A' ? 'N/A' : `${averageRating}★`, icon: Star, color: 'bg-purple-50 text-purple-600' }
  ];

  const formatRelativeTime = (date: Date) => {
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 🏢
          </h1>
          <p className="text-gray-600">
            Manage your listings and connect with students looking for accommodation and food services.
          </p>
        </div>

        <Card className="mb-8 border-0 shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-blue-100 text-sm">Estimated Monthly Potential</p>
                <p className="text-3xl font-bold">₹{estimatedMonthlyRevenue.toLocaleString('en-IN')}</p>
                <p className="text-blue-100 text-sm mt-1">Based on active accommodation pricing</p>
              </div>
              <div className="flex gap-3">
                <Link href="/owner/add-listing">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Listing
                  </Button>
                </Link>
                <Link href="/owner/listings">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50">
                    Manage Listings
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Manage your business efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/owner/add-listing">
                <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col space-y-2">
                  <PlusCircle className="h-6 w-6" />
                  <span>Add New Listing</span>
                </Button>
              </Link>
              
              <Link href="/owner/listings">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <Building2 className="h-6 w-6" />
                  <span>Manage Listings</span>
                </Button>
              </Link>
              
              <OpenChatAssistantButton />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inquiries */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Inquiries</CardTitle>
                    <CardDescription>New messages from students</CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No inquiries yet. Keep your listings active to attract students.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => {
                      const listingName = inquiry.accommodationListing?.propertyName || inquiry.foodServiceListing?.serviceName || 'Listing';
                      return (
                        <div key={inquiry.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between mb-2 gap-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{inquiry.studentName}</h4>
                              <p className="text-sm text-blue-600">{listingName}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatRelativeTime(inquiry.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{inquiry.message}</p>
                          <Badge variant={inquiry.status === 'PENDING' ? 'secondary' : 'outline'}>
                            {inquiry.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Listings */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Recent Listings</CardTitle>
                <CardDescription>Your latest published items</CardDescription>
              </CardHeader>
              <CardContent>
                {(accommodations.length === 0 && foodServices.length === 0) ? (
                  <div className="text-center py-10">
                    <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">You have not added any listings yet.</p>
                    <Link href="/owner/add-listing">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create Listing
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accommodations.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg border bg-white">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.propertyName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.address}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={item.availability ? 'secondary' : 'destructive'}>
                            {item.availability ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-gray-600">₹{(item.monthlyRent || item.dailyRate * 30).toLocaleString('en-IN')}/mo</span>
                        </div>
                      </div>
                    ))}

                    {foodServices.map((item) => (
                      <div key={item.id} className="p-3 rounded-lg border bg-white">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.serviceName}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.address}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{item.priceRange}</Badge>
                          <span className="text-xs text-gray-600">Food Service</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
