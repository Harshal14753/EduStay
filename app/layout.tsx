// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Chatbot from "@/components/chat/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Accommodation Portal",
  description: "Find accommodation and food services for university students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}

          {/* Floating Chatbot */}
          <div className="fixed bottom-4 right-4 z-50">
            <Chatbot />
          </div>
        </Providers>
      </body>
    </html>
  );
}
