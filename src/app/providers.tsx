"use client";

import { SessionProvider } from "next-auth/react";
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="dark min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
} 