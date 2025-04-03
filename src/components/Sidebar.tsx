"use client"

import React from "react";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from "next-auth/react"
import { 
  HomeIcon, 
  BookOpenIcon,
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  PlusIcon,
  VideoCameraIcon,
  ShoppingCartIcon,
  CalendarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  {
    name: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    ]
  },
  {
    name: 'Content',
    items: [
      { name: 'Services', href: '/dashboard/services', icon: BookOpenIcon },
      { name: 'New Service', href: '/dashboard/services/new', icon: PlusIcon },
      { name: 'Livestreams', href: '/dashboard/livestreams', icon: VideoCameraIcon },
    ]
  },
  {
    name: 'Business',
    items: [
      { name: 'Students', href: '/dashboard/students', icon: UserGroupIcon },
      { name: 'Revenue', href: '/dashboard/revenue', icon: CurrencyDollarIcon },
    ]
  },
  {
    name: 'Settings',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    ]
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const session = useSession()

  return (
    <div className="flex flex-col w-64 bg-card border-r border-zinc-700/50">
      <div className="flex items-center h-16 px-4 border-b border-zinc-700/50">
        <Link href="/" className="text-xl font-bold text-text hover:text-primary transition-colors">
          TraderAz
        </Link>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.name}>
            <h2 className="px-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              {section.name}
            </h2>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                      isActive 
                        ? 'bg-primary/20 text-primary' 
                        : 'text-text-secondary hover:bg-card-hover'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-zinc-700/50">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-text-secondary hover:bg-card-hover rounded-lg"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
} 