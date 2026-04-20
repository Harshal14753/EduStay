import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Building2, MessageSquare, Star, TrendingUp, UtensilsIcon } from 'lucide-react';

type MonthPoint = {
  key: string;
  label: string;
  inquiries: number;
  responded: number;
};

export default async function OwnerAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userType = (session.user as any)?.userType;
  if (userType !== 'PROPERTY_OWNER') {
    redirect('/student/dashboard');
  }

  const ownerId = (session.user as any)?.id as string;

  const [accommodations, foodServices, inquiries] = await Promise.all([
    prisma.accommodationListing.findMany({
      where: { ownerId },
      select: {
        id: true,
        propertyName: true,
        monthlyRent: true,
        dailyRate: true,
        availability: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
    prisma.foodServiceListing.findMany({
      where: { ownerId },
      select: {
        id: true,
        serviceName: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    }),
    prisma.inquiry.findMany({
      where: {
        OR: [
          { accommodationListing: { ownerId } },
          { foodServiceListing: { ownerId } },
        ],
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        accommodationListing: {
          select: {
            propertyName: true,
          },
        },
        foodServiceListing: {
          select: {
            serviceName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ]);

  const totalListings = accommodations.length + foodServices.length;
  const pendingInquiries = inquiries.filter((item) => item.status === 'PENDING').length;
  const respondedInquiries = inquiries.filter((item) => item.status === 'RESPONDED').length;
  const closedInquiries = inquiries.filter((item) => item.status === 'CLOSED').length;

  const allRatings = [
    ...accommodations.flatMap((item) => item.reviews.map((review) => review.rating)),
    ...foodServices.flatMap((item) => item.reviews.map((review) => review.rating)),
  ];

  const averageRating = allRatings.length
    ? (allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length).toFixed(1)
    : 'N/A';

  const estimatedMonthlyRevenue = accommodations
    .filter((item) => item.availability)
    .reduce((sum, item) => sum + (item.monthlyRent || item.dailyRate * 30 || 0), 0);

  const today = new Date();
  const monthBuckets: MonthPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', { month: 'short' });
    monthBuckets.push({ key, label, inquiries: 0, responded: 0 });
  }

  const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));

  inquiries.forEach((inquiry) => {
    const d = new Date(inquiry.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthMap.get(key);
    if (!bucket) return;

    bucket.inquiries += 1;
    if (inquiry.status === 'RESPONDED' || inquiry.status === 'CLOSED') {
      bucket.responded += 1;
    }
  });

  const maxMonthlyInquiries = Math.max(1, ...monthBuckets.map((bucket) => bucket.inquiries));

  const listingInquiryCount = new Map<string, number>();
  inquiries.forEach((inquiry) => {
    const listingName = inquiry.accommodationListing?.propertyName || inquiry.foodServiceListing?.serviceName || 'Listing';
    listingInquiryCount.set(listingName, (listingInquiryCount.get(listingName) || 0) + 1);
  });

  const topListings = Array.from(listingInquiryCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Performance overview of your listings and inquiries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{totalListings}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating === 'N/A' ? 'N/A' : `${averageRating}★`}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Est. Monthly Potential</p>
                <p className="text-2xl font-bold text-gray-900">₹{estimatedMonthlyRevenue.toLocaleString('en-IN')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Inquiry Trend (Last 6 Months)
              </CardTitle>
              <CardDescription>Monthly inquiries and response activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {monthBuckets.map((month) => {
                const width = Math.max(6, Math.round((month.inquiries / maxMonthlyInquiries) * 100));
                const respondedWidth = month.inquiries
                  ? Math.round((month.responded / month.inquiries) * width)
                  : 0;

                return (
                  <div key={month.key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">{month.label}</span>
                      <span className="text-gray-500">{month.inquiries} inquiries</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-blue-500 relative" style={{ width: `${width}%` }}>
                        <div className="h-full bg-green-500 absolute top-0 left-0" style={{ width: `${respondedWidth}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                  Total inquiries
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                  Responded/Closed
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
              <CardDescription>Current inquiry pipeline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <Badge variant="secondary">{pendingInquiries}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Responded</span>
                <Badge variant="outline">{respondedInquiries}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Closed</span>
                <Badge variant="destructive">{closedInquiries}</Badge>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Listings Mix</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 text-gray-700"><Building2 className="h-4 w-4" />Accommodation</span>
                  <span className="font-medium">{accommodations.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="inline-flex items-center gap-1 text-gray-700"><UtensilsIcon className="h-4 w-4" />Food Service</span>
                  <span className="font-medium">{foodServices.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Top Listings By Inquiries</CardTitle>
            <CardDescription>Listings that attract the highest student interest</CardDescription>
          </CardHeader>
          <CardContent>
            {topListings.length === 0 ? (
              <p className="text-sm text-gray-600">No inquiry data yet.</p>
            ) : (
              <div className="space-y-3">
                {topListings.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border p-3 bg-white">
                    <div className="flex items-center gap-3">
                      <span className="text-xs h-6 w-6 rounded-full bg-blue-50 text-blue-700 inline-flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    </div>
                    <Badge variant="outline">{item.count} inquiries</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
