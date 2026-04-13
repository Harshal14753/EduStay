'use client';
import ChatBot from '@/components/chat/Chatbot';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">EduBot Chat</h1>
      <ChatBot />
    </div>
  );
}