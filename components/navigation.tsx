
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { HomeIcon, Building2, UtensilsIcon, Search, PlusCircle, MessageSquare, BarChart3, LogOut, User } from 'lucide-react';

export function Navigation() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();

  if (status === 'loading') {
    return null;
  }

  if (!session) {
    return null;
  }

  const userType = (session.user as any)?.userType;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const studentNavItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/student/search', label: 'Search', icon: Search },
    { href: '/student/accommodation', label: 'Accommodation', icon: Building2 },
    { href: '/student/food', label: 'Food Services', icon: UtensilsIcon },
  ];

  const ownerNavItems = [
    { href: '/owner/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/owner/listings', label: 'My Listings', icon: Building2 },
    { href: '/owner/add-listing', label: 'Add Listing', icon: PlusCircle },
    { href: '/owner/inquiries', label: 'Inquiries', icon: MessageSquare },
    { href: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = userType === 'STUDENT' ? studentNavItems : ownerNavItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <HomeIcon className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EduStay Portal</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button 
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={isActive ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/profile" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <User className="h-4 w-4" />
            <span>{session.user?.name}</span>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
