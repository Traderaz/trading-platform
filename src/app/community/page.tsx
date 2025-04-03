"use client";

import { useSession } from "next-auth/react";
import { ChatBubbleLeftIcon, FireIcon, ClockIcon } from '@heroicons/react/24/outline';

const FORUM_POSTS = [
  {
    title: "Best Technical Indicators for Crypto Trading",
    author: "Alex Bitcoin",
    category: "Crypto",
    replies: 24,
    views: 156,
    lastReply: "2h ago",
    isHot: true
  },
  {
    title: "Forex Trading Strategies for Beginners",
    author: "John FX Pro",
    category: "Forex",
    replies: 18,
    views: 98,
    lastReply: "4h ago",
    isHot: false
  },
  {
    title: "Risk Management Tips",
    author: "Sarah Ethereum",
    category: "General",
    replies: 32,
    views: 245,
    lastReply: "1h ago",
    isHot: true
  },
  {
    title: "Market Analysis Tools",
    author: "Mike Altcoin",
    category: "Tools",
    replies: 15,
    views: 87,
    lastReply: "5h ago",
    isHot: false
  },
  {
    title: "Trading Psychology Guide",
    author: "Lisa Currency",
    category: "Psychology",
    replies: 28,
    views: 189,
    lastReply: "3h ago",
    isHot: true
  },
  {
    title: "Portfolio Diversification Strategies",
    author: "David Index",
    category: "Portfolio",
    replies: 21,
    views: 134,
    lastReply: "6h ago",
    isHot: false
  }
];

export default function Community() {
  const { data: session } = useSession();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold text-text">Community</h1>

      {/* Forum Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {["Crypto", "Forex", "Stocks", "Metals", "General", "Tools"].map((category) => (
          <div key={category} className="card hover:bg-card-hover cursor-pointer transition-colors">
            <h3 className="text-lg font-semibold text-text">{category}</h3>
            <p className="text-text-secondary text-sm mt-2">Join the discussion about {category.toLowerCase()} trading</p>
          </div>
        ))}
      </div>

      {/* Forum Posts */}
      <div className="space-y-4">
        {FORUM_POSTS.map((post, index) => (
          <div key={index} className="card hover:bg-card-hover transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-text">{post.title}</h3>
                  {post.isHot && (
                    <FireIcon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                  <span>Posted by {post.author}</span>
                  <span>•</span>
                  <span>{post.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-text-secondary">
                <div className="flex items-center gap-1">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span>{post.replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{post.lastReply}</span>
                </div>
                <div>
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Button */}
      <div className="fixed bottom-8 right-8">
        <button className="btn-primary rounded-full p-4 shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </main>
  );
} 