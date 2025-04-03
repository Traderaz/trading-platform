"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { ServiceTile } from "@/components/CourseTile";
import {
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  VideoCameraIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Mock data for services
const mockServices = [
  {
    id: "1",
    title: "1-on-1 Trading Mentorship",
    description: "Personalized trading mentorship with expert guidance",
    price: 299,
    thumbnail: "/images/mentorship.jpg",
    status: "ACTIVE" as const,
    creatorId: "1",
    creator: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      image: "/images/john-doe.jpg",
      role: "USER" as const,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    category: {
      id: "1",
      name: "Mentorship",
      description: "One-on-one mentorship sessions",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    _count: {
      reviews: 15
    },
    averageRating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    title: "Group Trading Session",
    description: "Join a live group trading session with real-time analysis",
    price: 99,
    thumbnail: "/images/group-session.jpg",
    status: "ACTIVE" as const,
    creatorId: "1",
    creator: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      image: "/images/john-doe.jpg",
      role: "USER" as const,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    category: {
      id: "2",
      name: "Group Sessions",
      description: "Interactive group learning sessions",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    _count: {
      reviews: 28
    },
    averageRating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "3",
    title: "Portfolio Review",
    description: "Get your portfolio reviewed by an expert trader",
    price: 149,
    thumbnail: "/images/portfolio-review.jpg",
    status: "ACTIVE" as const,
    creatorId: "1",
    creator: {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      image: "/images/john-doe.jpg",
      role: "USER" as const,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    category: {
      id: "3",
      name: "Portfolio Review",
      description: "Expert portfolio analysis and recommendations",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    _count: {
      reviews: 10
    },
    averageRating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

interface Service {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  enrolledStudents?: number;
  price: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchServices();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-4">Please sign in to access your dashboard</h1>
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const totalServices = services.length;
  const totalStudents = services.reduce((acc, service) => acc + (service.enrolledStudents || 0), 0);
  const totalRevenue = services.reduce((acc, service) => acc + (service.price * (service.enrolledStudents || 0)), 0);
  const completionRate = 85; // Mock completion rate

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {session.user?.name}</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/services/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Create Service
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpenIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Total Services</p>
              <p className="text-2xl font-bold text-text">{totalServices}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <UserGroupIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Active Students</p>
              <p className="text-2xl font-bold text-text">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Revenue</p>
              <p className="text-2xl font-bold text-text">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Completion Rate</p>
              <p className="text-2xl font-bold text-text">{completionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Services Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text">Your Services</h2>
          <Link href="/dashboard/services/new">
            <Button variant="outline" className="gap-2">
              <PlusIcon className="w-5 h-5" />
              New Service
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceTile
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                thumbnail={service.thumbnail}
                enrolledStudents={service.enrolledStudents || 0}
                price={service.price}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-secondary mb-4">You haven't created any services yet</p>
            <Link href="/dashboard/services/new">
              <Button variant="outline" className="gap-2">
                <PlusIcon className="w-5 h-5" />
                Create Your First Service
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Upcoming Livestreams */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">Upcoming Livestreams</h2>
          <Link href="/dashboard/livestreams" className="text-primary hover:underline text-sm">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <VideoCameraIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Live Trading Session</h3>
                <p className="text-text-secondary text-sm mb-4">Join us for a live trading session where we'll analyze market conditions and identify opportunities.</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">Tomorrow, 2:00 PM EST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">12/20 spots filled</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <VideoCameraIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Market Analysis Workshop</h3>
                <p className="text-text-secondary text-sm mb-4">Learn how to analyze market trends and make informed trading decisions.</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">Friday, 3:00 PM EST</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-text-secondary">8/15 spots filled</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">Recent Activity</h2>
          <Link href="/dashboard/activity" className="text-primary hover:underline text-sm">
            View All
          </Link>
        </div>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text">New student enrolled in Technical Analysis Mastery</p>
                <p className="text-text-secondary text-sm">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text">New service booking: 1-on-1 Trading Mentorship</p>
                <p className="text-text-secondary text-sm">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChartBarIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-text">Course completion: Options Trading Fundamentals</p>
                <p className="text-text-secondary text-sm">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}