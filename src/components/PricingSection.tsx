"use client";

interface PricingSectionProps {
  price: number;
  onChange: (price: number) => void;
}

export default function PricingSection({ price, onChange }: PricingSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text mb-4">Course Pricing</h3>
        <p className="text-text-secondary mb-6">Set the price for your course</p>
        
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-2 text-text-secondary">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => onChange(Number(e.target.value))}
              min="0"
              step="0.01"
              className="w-full bg-card border border-zinc-700/50 rounded-lg pl-8 pr-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="29.99"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 