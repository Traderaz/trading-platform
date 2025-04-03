"use client";

import { useSession } from "next-auth/react";
import { ChartBarIcon, CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const STATS = [
  {
    title: "Total Profit",
    value: "$12,450",
    change: "+12.5%",
    trend: "up",
    icon: CurrencyDollarIcon
  },
  {
    title: "Win Rate",
    value: "68.2%",
    change: "+5.2%",
    trend: "up",
    icon: ChartBarIcon
  },
  {
    title: "Best Trade",
    value: "$2,350",
    change: "+18.3%",
    trend: "up",
    icon: ArrowTrendingUpIcon
  },
  {
    title: "Worst Trade",
    value: "$850",
    change: "-8.2%",
    trend: "down",
    icon: ArrowTrendingDownIcon
  }
];

export default function Analytics() {
  const { data: session } = useSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-text">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {STATS.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${
                stat.trend === 'up' ? 'bg-primary/10' : 'bg-red-500/10'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.trend === 'up' ? 'text-primary' : 'text-red-500'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm ${
                stat.trend === 'up' ? 'text-primary' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-text-secondary text-sm ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Performance Over Time</h2>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Chart will be implemented here</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Trade Distribution</h2>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Chart will be implemented here</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Asset Allocation</h2>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Chart will be implemented here</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-text mb-4">Risk Metrics</h2>
          <div className="h-64 bg-card-hover rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">Chart will be implemented here</p>
          </div>
        </div>
      </div>
    </main>
  );
} 