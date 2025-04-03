'use client'

import { useSession, signOut } from 'next-auth/react'
import { BellIcon } from '@heroicons/react/24/outline'

export default function TopNav() {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-700/50 bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-end px-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-text-secondary hover:text-text rounded-lg hover:bg-card-hover transition-colors">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">
              2
            </span>
          </button>
          
          {session && (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-sm text-text-secondary hover:text-text transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
} 