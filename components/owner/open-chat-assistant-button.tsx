'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import Chatbot from '@/components/chat/Chatbot';
import { Button } from '@/components/ui/button';

export function OpenChatAssistantButton() {
  const [openTrigger, setOpenTrigger] = useState(0);

  return (
    <>
      <Button
        variant="outline"
        className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50"
        onClick={() => setOpenTrigger((prev) => prev + 1)}
      >
        <MessageSquare className="h-6 w-6" />
        <span>Open Chat Assistant</span>
      </Button>

      <div className="fixed bottom-6 right-6 z-50">
        <Chatbot hideLauncher externalOpenTrigger={openTrigger} />
      </div>
    </>
  );
}
