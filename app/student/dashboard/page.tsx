
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, 
  UtensilsIcon, 
  Search, 
  MapPin, 
  Star, 
  TrendingUp,
  Users,
  Clock
} from "lucide-react";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const userType = (session.user as any)?.userType;
  if (userType !== 'STUDENT') {
    redirect('/owner/dashboard');
  }

  const userName = session.user?.name?.split(' ')[0] || 'Student';

  const quickStats = [
    { label: 'Accommodations Available', value: '150+', icon: Building2, color: 'bg-blue-50 text-blue-600' },
    { label: 'Food Services', value: '80+', icon: UtensilsIcon, color: 'bg-green-50 text-green-600' },
    { label: 'Verified Reviews', value: '2.1K+', icon: Star, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Active Students', value: '500+', icon: Users, color: 'bg-purple-50 text-purple-600' }
  ];

  const recentlyViewed = [
    {
      id: 1,
      name: "Cozy PG near IIT Bombay",
      type: "Accommodation",
      price: "₹12,000/month",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      name: "South Indian Tiffin Service",
      type: "Food Service",
      price: "₹3,500/month",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            Find your perfect accommodation and food services for your university life.
          </p>
        </div>

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
            <CardDescription>Get started with finding what you need</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/student/search">
                <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col space-y-2">
                  <Search className="h-6 w-6" />
                  <span>Search All Services</span>
                </Button>
              </Link>
              
              <Link href="/student/accommodation">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <Building2 className="h-6 w-6" />
                  <span>Find Accommodation</span>
                </Button>
              </Link>
              
              <Link href="/student/food">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <UtensilsIcon className="h-6 w-6" />
                  <span>Find Food Services</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recently Viewed */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recently Viewed</CardTitle>
                    <CardDescription>Continue exploring these options</CardDescription>
                  </div>
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentlyViewed.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.type}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-medium text-green-600">{item.price}</span>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Tips for You</CardTitle>
                <CardDescription>Make the most of our platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-blue-900">Use Location Filters</h4>
                        <p className="text-sm text-blue-700">Filter by distance from your university for convenience.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-green-900">Check Reviews</h4>
                        <p className="text-sm text-green-700">Read reviews from other students before making decisions.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <h4 className="font-medium text-purple-900">Compare Options</h4>
                        <p className="text-sm text-purple-700">Use our comparison tools to find the best deals.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
