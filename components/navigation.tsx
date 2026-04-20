
'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  Building2,
  UtensilsIcon,
  Search,
  PlusCircle,
  MessageSquare,
  BarChart3,
  LogOut,
  User,
  Landmark,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';

export function Navigation() {
  const { data: session, status } = useSession() || {};
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('edu-stay-sidebar-collapsed');
    if (saved === 'true') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!session) return;

    document.body.classList.add('has-left-taskbar');
    if (isSidebarCollapsed) {
      document.body.classList.add('left-taskbar-collapsed');
    } else {
      document.body.classList.remove('left-taskbar-collapsed');
    }

    return () => {
      document.body.classList.remove('has-left-taskbar');
      document.body.classList.remove('left-taskbar-collapsed');
    };
  }, [session, isSidebarCollapsed]);

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
    { href: '/student/inquiries', label: 'Inquiries', icon: MessageSquare },
    { href: '/student/government-schemes', label: 'Govt. Schemes', icon: Landmark },
  ];

  const ownerNavItems = [
    { href: '/owner/dashboard', label: 'Dashboard', icon: HomeIcon },
    { href: '/owner/listings', label: 'My Listings', icon: Building2 },
    { href: '/owner/add-listing', label: 'Add Listing', icon: PlusCircle },
    { href: '/owner/inquiries', label: 'Inquiries', icon: MessageSquare },
    { href: '/owner/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = userType === 'STUDENT' ? studentNavItems : ownerNavItems;
  const defaultDashboardHref = userType === 'STUDENT' ? '/student/dashboard' : '/owner/dashboard';
  const quickAction =
    userType === 'STUDENT'
      ? { href: '/student/search', label: 'Find Stay' }
      : { href: '/owner/add-listing', label: 'Add Listing' };

  const handleSidebarToggle = () => {
    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    window.localStorage.setItem('edu-stay-sidebar-collapsed', String(next));
  };

  return (
    <>
      <aside
        className={`hidden md:flex fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] flex-col border-r bg-white/95 backdrop-blur-sm transition-all duration-200 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`border-b px-3 py-2 ${isSidebarCollapsed ? '' : 'pr-2'}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Navigation</p>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              className="h-8 w-8"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isPrimaryAction = item.href.includes('/add-listing');

            return (
              <Link key={item.href} href={item.href} className="block" title={item.label}>
                <Button
                  variant="ghost"
                  className={`h-10 w-full rounded-lg border-l-2 transition-all ${
                    isSidebarCollapsed ? 'justify-center px-2' : 'justify-start px-3'
                  } ${
                    isActive
                      ? 'border-l-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'border-l-transparent text-gray-700 hover:bg-gray-100'
                  } ${isPrimaryAction && !isActive ? 'text-emerald-700 hover:bg-emerald-50' : ''}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {!isSidebarCollapsed && item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="border-t p-3 space-y-1">
          <Link href="/profile" className="block" title="Profile">
            <Button
              variant="ghost"
              className={`h-10 w-full rounded-lg ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start px-3'} text-gray-700 hover:bg-gray-100`}
            >
              <User className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && 'Profile'}
            </Button>
          </Link>

          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={`h-10 w-full rounded-lg ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start px-3'} text-red-600 hover:bg-red-50 hover:text-red-700`}
            title="Sign Out"
          >
            <LogOut className={`h-4 w-4 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
            {!isSidebarCollapsed && 'Sign Out'}
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden"
              title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link href={defaultDashboardHref} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <HomeIcon className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-gray-900 md:text-base">EduStay Portal</p>
                <p className="hidden text-xs text-gray-500 md:block">
                  {userType === 'STUDENT' ? 'Student Workspace' : 'Owner Workspace'}
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link href={quickAction.href}>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                {quickAction.label}
              </Button>
            </Link>

            <Link href="/profile" className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
              <User className="h-4 w-4" />
              <span className="max-w-[170px] truncate">{session.user?.name}</span>
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

        {isMobileMenuOpen && (
          <div className="border-t bg-white px-4 py-3 md:hidden">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className="block">
                    <Button
                      variant="ghost"
                      className={`h-10 w-full justify-start rounded-lg px-3 ${
                        isActive ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 border-t pt-3 space-y-1">
              <Link href="/profile" className="block">
                <Button variant="ghost" className="h-10 w-full justify-start rounded-lg px-3 text-gray-700 hover:bg-gray-100">
                  <User className="mr-3 h-4 w-4" />
                  {session.user?.name || 'Profile'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="h-10 w-full justify-start rounded-lg px-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
