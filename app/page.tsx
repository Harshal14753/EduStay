import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeIcon, Building2, UtensilsIcon, MapPin, Star, Users, BookOpen, Coffee, Shield } from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    const userType = (session.user as any)?.userType;
    if (userType === 'STUDENT') {
      redirect('/student/dashboard');
    } else if (userType === 'PROPERTY_OWNER') {
      redirect('/owner/dashboard');
    }
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-50 via-white to-rose-50 overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/images/pattern-bg.png')] opacity-5 bg-repeat"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-gradient"></div>
        <div className="absolute -top-48 -left-48 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-48 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-48 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <BookOpen className="h-8 w-8 text-indigo-600 transform group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur"></div>
            </div>
            <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
              EduStay
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-base font-medium hover:text-indigo-600 relative overflow-hidden group">
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-base px-6 py-5 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/students-bg.jpg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg opacity-30 blur-2xl"></div>
              
              {/* Enhanced Sparkle Effects */}
              <div className="absolute -inset-20 pointer-events-none">
                <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping animation-delay-200 opacity-75"></div>
                <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-400 opacity-75"></div>
                <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full animate-ping animation-delay-2000 opacity-75"></div>
                <div className="absolute bottom-1/2 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-4000 opacity-75"></div>
                
                {/* Additional subtle sparkles */}
                <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-50"></div>
                <div className="absolute bottom-2/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200 opacity-50"></div>
                <div className="absolute top-1/2 right-1/2 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400 opacity-50"></div>
              </div>
              
              <h1 className="relative text-5xl md:text-7xl font-bold tracking-tight">
                <div className="relative inline-block group">
                  <span className="text-gradient pb-2 relative z-10">
                    Find Your Perfect
                  </span>
                  <div className="absolute -inset-2 bg-white/20 blur-xl group-hover:bg-white/30 transition-colors duration-300"></div>
                </div>
                <br />
                <div className="relative inline-block group perspective-1000">
                  <div className="text-3d mt-4 block relative z-10">
                    <span className="animate-rainbow-text font-extrabold tracking-wider relative group-hover:scale-105 transition-transform duration-300 inline-block">
                      Student
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg scale-110"></div>
                    </span>
                    <span className="text-gradient ml-2">
                      Experience
                    </span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-purple-500/20 blur-2xl rounded-lg group-hover:from-violet-500/30 group-hover:via-blue-500/30 group-hover:to-purple-500/30 transition-colors duration-300"></div>
                  
                  {/* Light beam effect */}
                  <div className="absolute -inset-x-6 -inset-y-4 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up animation-delay-200">
              Discover quality accommodation and food services near your exam center. 
              <br className="hidden md:block" />
              Connect directly with verified property owners for a seamless experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12 animate-fade-in-up animation-delay-400">
              <Link href="/student/search">
                <Button size="lg" className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[300px]">
                  <span className="relative z-10 flex items-center justify-center">
                    <Users className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    I'm a Student
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Button>
              </Link>
              <Link href="/auth/register?type=owner">
                <Button size="lg" variant="outline" className="relative overflow-hidden group border-2 border-indigo-600 text-indigo-600 hover:text-purple-600 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[300px]">
                  <span className="relative z-10 flex items-center justify-center">
                    <Building2 className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    I'm a Property Owner
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6 text-gray-900">Why Choose EduStay?</h2>
          <p className="text-lg text-gray-600">Discover a seamless experience designed specifically for students seeking accommodation during exams.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <Building2 className="h-8 w-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">Premium Accommodation</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Discover carefully selected PGs, hostels, and rooms near your exam center with essential amenities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mb-6 group-hover:bg-rose-600 transition-colors duration-300">
                <Coffee className="h-8 w-8 text-rose-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">Food Services</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Access quality mess services, tiffin providers, and restaurants that cater to student preferences.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <MapPin className="h-8 w-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">Smart Location</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Find accommodations strategically located near your exam center with our interactive maps.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-6 group-hover:bg-amber-600 transition-colors duration-300">
                <Star className="h-8 w-8 text-amber-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">Verified Reviews</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Make informed decisions with authentic reviews and ratings from fellow students.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors duration-300">
                <Users className="h-8 w-8 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">Direct Connect</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Connect and communicate directly with property owners without any intermediaries.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 group hover:scale-105 transition-all duration-300 bg-white shadow-lg hover:shadow-2xl">
            <CardHeader>
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Shield className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <CardTitle className="text-xl mb-3">100% Verified</CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed">
                Rest assured with our thoroughly verified listings ensuring safety and quality standards.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 max-w-7xl">
        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="relative px-8 py-16 md:p-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
              <div className="relative z-10 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-6 text-white">Ready for Your Next Step?</h2>
                <p className="text-xl mb-10 text-white/90">
                  Join thousands of students who've found their ideal accommodation near exam centers through our platform.
                </p>
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    Create Your Account
                  </Button>
                </Link>
              </div>
              <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                EduStay
              </Link>
            </div>
            <nav className="flex gap-8">
              <Link href="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors">Contact</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">Terms</Link>
            </nav>
            <p className="text-gray-600">
              © 2025 EduStay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}