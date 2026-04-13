import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, GraduationCap, Building2, UtensilsIcon } from "lucide-react";

function formatEnum(value?: string | null) {
  if (!value) return "Not set";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = (session.user as any)?.id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      userType: true,
      university: true,
      stream: true,
      serviceType: true,
      createdAt: true,
      accommodationListings: {
        select: { id: true, propertyName: true, availability: true },
        orderBy: { createdAt: "desc" },
        take: 5
      },
      foodServiceListings: {
        select: { id: true, serviceName: true },
        orderBy: { createdAt: "desc" },
        take: 5
      },
      _count: {
        select: {
          accommodationListings: true,
          foodServiceListings: true,
          inquiries: true,
          reviews: true
        }
      }
    }
  });

  if (!user) {
    redirect("/auth/login");
  }

  const isOwner = user.userType === "PROPERTY_OWNER";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View your account and activity details.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Account Details
              </CardTitle>
              <CardDescription>Your registered details on EduStay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                <Badge>{formatEnum(user.userType)}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone || "Not set"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">User Type</p>
                  <p className="text-sm font-medium text-gray-900">{formatEnum(user.userType)}</p>
                </div>
              </div>

              {!isOwner && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500 mb-1">University</p>
                    <p className="text-sm font-medium text-gray-900">{user.university || "Not set"}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500 mb-1">Stream</p>
                    <p className="text-sm font-medium text-gray-900">{formatEnum(user.stream as string)}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-gray-500 mb-1">Service Need</p>
                    <p className="text-sm font-medium text-gray-900">{formatEnum(user.serviceType as string)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Quick account summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-blue-50 p-3 flex items-center justify-between">
                <span className="text-sm text-blue-800">Reviews</span>
                <span className="font-semibold text-blue-900">{user._count.reviews}</span>
              </div>
              <div className="rounded-lg bg-purple-50 p-3 flex items-center justify-between">
                <span className="text-sm text-purple-800">Inquiries</span>
                <span className="font-semibold text-purple-900">{user._count.inquiries}</span>
              </div>
              {isOwner && (
                <>
                  <div className="rounded-lg bg-green-50 p-3 flex items-center justify-between">
                    <span className="text-sm text-green-800">Accommodation Listings</span>
                    <span className="font-semibold text-green-900">{user._count.accommodationListings}</span>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3 flex items-center justify-between">
                    <span className="text-sm text-amber-800">Food Listings</span>
                    <span className="font-semibold text-amber-900">{user._count.foodServiceListings}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {isOwner && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-blue-600" /> Recent Accommodation Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {user.accommodationListings.length === 0 ? (
                  <p className="text-sm text-gray-600">No accommodation listings yet.</p>
                ) : (
                  <div className="space-y-2">
                    {user.accommodationListings.map((item) => (
                      <div key={item.id} className="p-3 rounded-md border flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{item.propertyName}</p>
                        <Badge variant={item.availability ? "secondary" : "destructive"}>
                          {item.availability ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UtensilsIcon className="h-5 w-5 text-green-600" /> Recent Food Listings</CardTitle>
              </CardHeader>
              <CardContent>
                {user.foodServiceListings.length === 0 ? (
                  <p className="text-sm text-gray-600">No food service listings yet.</p>
                ) : (
                  <div className="space-y-2">
                    {user.foodServiceListings.map((item) => (
                      <div key={item.id} className="p-3 rounded-md border">
                        <p className="text-sm font-medium text-gray-900">{item.serviceName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
