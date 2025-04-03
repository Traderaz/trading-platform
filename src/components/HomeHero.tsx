"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export function HomeHero() {
  const { data: session } = useSession();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-foreground sm:text-5xl md:text-6xl">
        Welcome to CreatorHub
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        Turn your expertise into income. The all-in-one platform for creators to teach, mentor, and grow.
      </p>
      <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/explore"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10"
            >
              Explore Creators
            </Link>
            <Link
              href="/auth/signin"
              className="w-full flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-lg text-primary bg-transparent hover:bg-primary/10 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 md:py-4 md:text-lg md:px-10"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/explore"
              className="w-full flex items-center justify-center px-8 py-3 border border-primary text-base font-medium rounded-lg text-primary bg-transparent hover:bg-primary/10 md:py-4 md:text-lg md:px-10"
            >
              Explore Creators
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 