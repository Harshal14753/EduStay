'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect, useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ArrowLeft, Clock, CheckCircle2, XCircle, Send } from 'lucide-react';

type InquiryStatus = 'PENDING' | 'RESPONDED' | 'CLOSED';

type InquiryItem = {
  id: string;
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
    owner: {
      id: string;
      name: string;
    };
  } | null;
  foodServiceListing?: {
    id: string;
    serviceName: string;
    owner: {
      id: string;
      name: string;
    };
  } | null;
};

type ChatMessage = {
  id: string;
  sender: 'student' | 'owner';
  text: string;
  createdAt: string;
  status?: InquiryStatus;
};

type ChatThread = {
  key: string;
  listingType: 'accommodation' | 'food';
  listingId: string;
  listingName: string;
  ownerName: string;
  messages: ChatMessage[];
  latestAt: string;
  latestStatus: InquiryStatus;
};

export default function StudentInquiryPage() {
  const { data: session, status } = useSession() || {};
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const listingType = searchParams.get('listingType');
  const listingId = searchParams.get('listingId');
  const listingName = searchParams.get('listingName') || 'Selected Listing';

  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [activeThreadKey, setActiveThreadKey] = useState<string>('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      redirect('/auth/login');
    }

    const userType = (session.user as any)?.userType;
    if (userType !== 'STUDENT') {
      redirect('/owner/dashboard');
    }

    loadHistory();
  }, [session, status]);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/student/inquiries');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load inquiries');
      }

      setInquiries(data.inquiries || []);
    } catch (error) {
      toast({
        title: 'Unable to load inquiry history',
        description: 'Please refresh and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const isValidType = listingType === 'accommodation' || listingType === 'food';
  const selectedListingKey = isValidType && listingId ? `${listingType}:${listingId}` : '';

  const threads = useMemo<ChatThread[]>(() => {
    const grouped = new Map<string, ChatThread>();

    for (const inquiry of inquiries) {
      const hasAccommodation = !!inquiry.accommodationListing;
      const listingTypeValue = hasAccommodation ? 'accommodation' : 'food';
      const listingIdValue = hasAccommodation
        ? inquiry.accommodationListing?.id
        : inquiry.foodServiceListing?.id;

      if (!listingIdValue) continue;

      const listingNameValue = hasAccommodation
        ? inquiry.accommodationListing?.propertyName
        : inquiry.foodServiceListing?.serviceName;
      const ownerNameValue = hasAccommodation
        ? inquiry.accommodationListing?.owner.name
        : inquiry.foodServiceListing?.owner.name;

      const key = `${listingTypeValue}:${listingIdValue}`;
      const thread = grouped.get(key) || {
        key,
        listingType: listingTypeValue,
        listingId: listingIdValue,
        listingName: listingNameValue || 'Listing',
        ownerName: ownerNameValue || 'Owner',
        messages: [],
        latestAt: inquiry.createdAt,
        latestStatus: inquiry.status,
      };

      if (inquiry.inquiryMessages && inquiry.inquiryMessages.length > 0) {
        inquiry.inquiryMessages.forEach((msg) => {
          thread.messages.push({
            id: msg.id,
            sender: msg.sender === 'OWNER' ? 'owner' : 'student',
            text: msg.message,
            createdAt: msg.createdAt,
            status: msg.sender === 'STUDENT' ? inquiry.status : undefined,
          });
        });
      } else {
        // Legacy fallback for old inquiries created before message history support.
        thread.messages.push({
          id: `${inquiry.id}-student`,
          sender: 'student',
          text: inquiry.message,
          createdAt: inquiry.createdAt,
          status: inquiry.status,
        });

        if (inquiry.response) {
          const ownerResponseChunks = inquiry.response
            .split(/\n\n(?=\[\d{4}-\d{2}-\d{2}T)/)
            .map((chunk) => chunk.trim())
            .filter(Boolean);

          ownerResponseChunks.forEach((chunk, index) => {
            const cleanedText = chunk.replace(/^\[\d{4}-\d{2}-\d{2}T[^\]]+\]\s*/, '');
            thread.messages.push({
              id: `${inquiry.id}-owner-${index}`,
              sender: 'owner',
              text: cleanedText,
              createdAt: inquiry.updatedAt,
            });
          });
        }
      }

      const latestMessageTime = (inquiry.inquiryMessages && inquiry.inquiryMessages.length > 0)
        ? inquiry.inquiryMessages[inquiry.inquiryMessages.length - 1].createdAt
        : (inquiry.response ? inquiry.updatedAt : inquiry.createdAt);
      if (new Date(latestMessageTime).getTime() >= new Date(thread.latestAt).getTime()) {
        thread.latestAt = latestMessageTime;
        thread.latestStatus = inquiry.status;
      }

      grouped.set(key, thread);
    }

    return Array.from(grouped.values())
      .map((thread) => ({
        ...thread,
        messages: thread.messages.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
      }))
      .sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime());
  }, [inquiries]);

  useEffect(() => {
    if (activeThreadKey && threads.some((thread) => thread.key === activeThreadKey)) {
      return;
    }

    if (selectedListingKey) {
      setActiveThreadKey(selectedListingKey);
      return;
    }

    if (threads.length > 0) {
      setActiveThreadKey(threads[0].key);
    }
  }, [threads, activeThreadKey, selectedListingKey]);

  const handleSubmit = async () => {
    const trimmedMessage = message.trim();
    const activeThread = threads.find((thread) => thread.key === activeThreadKey);

    const selectedType = activeThread?.listingType || (isValidType ? listingType : null);
    const selectedId = activeThread?.listingId || listingId;

    if (!selectedId || !selectedType) {
      toast({
        title: 'Invalid listing',
        description: 'Please open a listing chat to send a message.',
        variant: 'destructive',
      });
      return;
    }

    if (trimmedMessage.length < 5) {
      toast({
        title: 'Message too short',
        description: 'Please enter at least 5 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        message: trimmedMessage,
        ...(selectedType === 'accommodation'
          ? { accommodationListingId: selectedId }
          : { foodServiceListingId: selectedId }),
      };

      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: 'Inquiry not sent',
          description: data.error || 'Unable to send inquiry.',
          variant: 'destructive',
        });
        return;
      }

      setMessage('');
      await loadHistory();
      if (selectedType && selectedId) {
        setActiveThreadKey(`${selectedType}:${selectedId}`);
      }
      toast({
        title: 'Inquiry sent',
        description: data.message || 'Your message was sent to the owner.',
      });
    } catch (error) {
      toast({
        title: 'Inquiry not sent',
        description: 'Unexpected error while sending your inquiry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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
    const q = historySearch.trim().toLowerCase();
    if (!q) return inquiries;

    return inquiries.filter((item) => {
      const listingNameText = item.accommodationListing?.propertyName || item.foodServiceListing?.serviceName || '';
      const ownerName = item.accommodationListing?.owner.name || item.foodServiceListing?.owner.name || '';
      const searchable = [listingNameText, ownerName, item.message, item.response || ''].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [inquiries, historySearch]);

  const filteredThreads = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    if (!q) return threads;

    return threads.filter((thread) => {
      const latestMessage = thread.messages[thread.messages.length - 1]?.text || '';
      const searchable = [thread.listingName, thread.ownerName, latestMessage].join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }, [threads, historySearch]);

  const activeThread = threads.find((thread) => thread.key === activeThreadKey);

  const activeContext = activeThread
    ? {
        listingType: activeThread.listingType,
        listingId: activeThread.listingId,
        listingName: activeThread.listingName,
        ownerName: activeThread.ownerName,
      }
    : isValidType && listingId
      ? {
          listingType,
          listingId,
          listingName,
          ownerName: 'Owner',
        }
      : null;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          {listingId && isValidType ? (
            <Link href="/student/search">
              <Button variant="ghost" className="px-0 text-gray-600 hover:text-blue-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            </Link>
          ) : null}
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Inquiries</h1>
          <p className="text-gray-600">Send new requests and track owner responses from previous conversations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">{stats.responded}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-600" />
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-4">
            <Input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search chats by listing or owner"
            />
          </CardContent>
        </Card>

        {isLoadingHistory ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <p className="text-gray-600">Loading your inquiries...</p>
            </CardContent>
          </Card>
        ) : filteredThreads.length === 0 && !activeContext ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-10 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No inquiry history found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">All Chats</CardTitle>
                <CardDescription>Click a chat to view full conversation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredThreads.length === 0 ? (
                  <p className="text-sm text-gray-500">No chats match your search.</p>
                ) : (
                  filteredThreads.map((thread) => {
                    const latest = thread.messages[thread.messages.length - 1];
                    const active = thread.key === activeThreadKey;

                    return (
                      <button
                        key={thread.key}
                        onClick={() => setActiveThreadKey(thread.key)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          active ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{thread.listingName}</p>
                          <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatRelativeTime(thread.latestAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Owner: {thread.ownerName}</p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-1">{latest?.text || 'No messages yet'}</p>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{activeContext?.listingName || 'Select a chat'}</CardTitle>
                    <CardDescription>
                      {activeContext ? `Owner: ${activeContext.ownerName}` : 'Pick a chat from the left panel to continue'}
                    </CardDescription>
                  </div>
                  {activeContext && (
                    <Badge variant="outline">{activeContext.listingType.toUpperCase()}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!activeContext ? (
                  <div className="py-12 text-center text-gray-500">No chat selected.</div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 mb-4">
                      {activeThread?.messages?.length ? (
                        activeThread.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                                msg.sender === 'student'
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
                              }`}
                            >
                              <p className="whitespace-pre-line">{msg.text}</p>
                              <div className={`mt-1 text-[11px] ${msg.sender === 'student' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatRelativeTime(msg.createdAt)}
                                {msg.sender === 'student' && msg.status ? ` • ${msg.status}` : ''}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 text-sm text-gray-500">
                          No previous messages for this listing yet. Start the conversation below.
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        maxLength={1000}
                        placeholder="Type your message to owner..."
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{message.length}/1000</p>
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting || message.trim().length < 5}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSubmitting ? 'Sending...' : 'Send Message'}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
