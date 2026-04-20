'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

type InquiryStatus = 'PENDING' | 'RESPONDED' | 'CLOSED';
type FilterStatus = InquiryStatus | 'ALL';

type InquiryItem = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  message: string;
  status: InquiryStatus;
  response?: string | null;
  createdAt: string;
  updatedAt: string;
  inquiryMessages?: {
    id: string;
    sender: 'STUDENT' | 'OWNER';
    message: string;
    createdAt: string;
  }[];
  accommodationListing?: {
    id: string;
    propertyName: string;
  } | null;
  foodServiceListing?: {
    id: string;
    serviceName: string;
  } | null;
};

export default function OwnerInquiriesPage() {
  const { data: session, status } = useSession() || {};
  const { toast } = useToast();

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingId, setIsSavingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchText, setSearchText] = useState('');
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/login');
    }

    const userType = (session.user as any)?.userType;
    if (userType !== 'PROPERTY_OWNER') {
      redirect('/student/dashboard');
    }

    loadInquiries();
  }, [session, status]);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/owner/inquiries');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load inquiries');
      }

      const nextInquiries = data.inquiries || [];
      setInquiries(nextInquiries);

      const initialDrafts: Record<string, string> = {};
      for (const item of nextInquiries) {
        initialDrafts[item.id] = item.response || '';
      }
      setResponseDrafts(initialDrafts);
    } catch (error) {
      toast({
        title: 'Unable to load inquiries',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateInquiry = async (id: string, payload: { status?: InquiryStatus; response?: string }) => {
    setIsSavingId(id);
    try {
      const response = await fetch(`/api/owner/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update inquiry');
      }

      setResponseDrafts((prev) => ({
        ...prev,
        [id]: '',
      }));

      await loadInquiries();

      toast({
        title: 'Updated',
        description: 'Inquiry updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: error.message || 'Could not update inquiry.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingId(null);
    }
  };

  const stats = useMemo(() => {
    const pending = inquiries.filter((item) => item.status === 'PENDING').length;
    const responded = inquiries.filter((item) => item.status === 'RESPONDED').length;
    const closed = inquiries.filter((item) => item.status === 'CLOSED').length;
    return {
      total: inquiries.length,
      pending,
      responded,
      closed,
    };
  }, [inquiries]);

  const filteredInquiries = useMemo(() => {
    const normalizedQuery = searchText.trim().toLowerCase();

    return inquiries.filter((item) => {
      const statusMatch = activeFilter === 'ALL' ? true : item.status === activeFilter;
      if (!statusMatch) return false;

      if (!normalizedQuery) return true;

      const listingName = item.accommodationListing?.propertyName || item.foodServiceListing?.serviceName || '';
      const text = [item.studentName, item.studentEmail, item.studentPhone, item.message, listingName]
        .join(' ')
        .toLowerCase();

      return text.includes(normalizedQuery);
    });
  }, [inquiries, activeFilter, searchText]);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (status === 'loading' || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inquiries</h1>
          <p className="text-gray-600">Track and respond to student inquiries for your listings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-7 w-7 text-blue-600" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-7 w-7 text-yellow-600" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responded}</p>
              </div>
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
              <XCircle className="h-7 w-7 text-gray-600" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-2 flex-wrap">
              {(['ALL', 'PENDING', 'RESPONDED', 'CLOSED'] as FilterStatus[]).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={activeFilter === status ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(status)}
                  className={activeFilter === status ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {status}
                </Button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by student or listing"
              />
            </div>
          </CardContent>
        </Card>

        {filteredInquiries.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No inquiries found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => {
              const listingName = inquiry.accommodationListing?.propertyName || inquiry.foodServiceListing?.serviceName || 'Listing';
              const draftText = responseDrafts[inquiry.id] ?? '';

              return (
                <Card key={inquiry.id} className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">{inquiry.studentName}</CardTitle>
                        <CardDescription>{listingName}</CardDescription>
                        <p className="text-xs text-gray-500 mt-1">{inquiry.studentEmail} • {inquiry.studentPhone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={inquiry.status === 'PENDING' ? 'secondary' : inquiry.status === 'RESPONDED' ? 'outline' : 'destructive'}>
                          {inquiry.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{formatRelativeTime(inquiry.createdAt)}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {(!inquiry.inquiryMessages || inquiry.inquiryMessages.length === 0) && (
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{inquiry.message}</p>
                      </div>
                    )}

                    {(inquiry.inquiryMessages && inquiry.inquiryMessages.length > 0) && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-600 font-medium">Conversation</p>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {inquiry.inquiryMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender === 'OWNER' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                                  msg.sender === 'OWNER'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p className="whitespace-pre-line">{msg.message}</p>
                                <p className={`mt-1 text-[11px] ${msg.sender === 'OWNER' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatRelativeTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {inquiry.response && (
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                        <p className="text-xs text-green-700 font-medium mb-1">Latest Response Snapshot</p>
                        <p className="text-sm text-green-900 whitespace-pre-line">{inquiry.response}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">Update Status</Label>
                        <Select
                          value={inquiry.status}
                          onValueChange={(value: InquiryStatus) => updateInquiry(inquiry.id, { status: value })}
                          disabled={isSavingId === inquiry.id}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">PENDING</SelectItem>
                            <SelectItem value="RESPONDED">RESPONDED</SelectItem>
                            <SelectItem value="CLOSED">CLOSED</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-xs text-gray-600">Reply to Student</Label>
                        <Textarea
                          className="mt-1"
                          rows={3}
                          value={draftText}
                          onChange={(e) =>
                            setResponseDrafts((prev) => ({
                              ...prev,
                              [inquiry.id]: e.target.value,
                            }))
                          }
                          placeholder="Write your response here..."
                        />
                        <div className="mt-2 flex justify-end">
                          <Button
                            size="sm"
                            onClick={() => updateInquiry(inquiry.id, { response: draftText, status: 'RESPONDED' })}
                            disabled={isSavingId === inquiry.id}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isSavingId === inquiry.id ? 'Saving...' : 'Save Response'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
