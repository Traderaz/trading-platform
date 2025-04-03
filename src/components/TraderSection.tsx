'use client';

import TraderCard from './TraderCard';

interface TraderSectionProps {
  title: string;
  traders: {
    name: string;
    image: string;
    category: string;
    rating: number;
    subscribers: number;
    price: number;
  }[];
}

export default function TraderSection({ title, traders }: TraderSectionProps) {
  return (
    <section className="py-8">
      <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-700">
          {traders.map((trader, index) => (
            <div key={index} className="min-w-[300px]">
              <TraderCard {...trader} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 