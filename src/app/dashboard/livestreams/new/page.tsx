"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  videoId: string;
  isPrivate: boolean;
}

export default function NewLivestreamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    videoId: "",
    isPrivate: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time into a single ISO string
      const scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();

      const response = await fetch("/api/livestreams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          scheduledFor,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create livestream");
      }

      router.push("/dashboard/livestreams");
    } catch (error) {
      console.error("Error creating livestream:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Schedule New Livestream</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Stream Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-zinc-700/50 rounded-lg bg-card text-text"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-zinc-700/50 rounded-lg bg-card text-text"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="scheduledDate"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-zinc-700/50 rounded-lg bg-card text-text"
            />
          </div>

          <div>
            <label htmlFor="scheduledTime" className="block text-sm font-medium mb-1">
              Time
            </label>
            <input
              type="time"
              id="scheduledTime"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-zinc-700/50 rounded-lg bg-card text-text"
            />
          </div>
        </div>

        <div>
          <label htmlFor="videoId" className="block text-sm font-medium mb-1">
            YouTube Video ID
          </label>
          <input
            type="text"
            id="videoId"
            name="videoId"
            value={formData.videoId}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-zinc-700/50 rounded-lg bg-card text-text"
          />
          <p className="mt-1 text-sm text-text-secondary">
            You can find this in your YouTube Studio under "Live" {'>'} "Schedule" {'>'} "Get shareable link"
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPrivate"
            name="isPrivate"
            checked={formData.isPrivate}
            onChange={handleChange}
            className="h-4 w-4 rounded border-zinc-700/50 text-primary focus:ring-primary"
          />
          <label htmlFor="isPrivate" className="ml-2 text-sm font-medium">
            Make this a premium stream
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Livestream'}
          </button>
        </div>
      </form>
    </div>
  );
} 