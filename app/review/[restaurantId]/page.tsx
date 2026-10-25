"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// Screen 1: write a review for one restaurant.
// This page does no maths and makes no rules. It picks up a rating and a comment,
// hands them to POST /api/reviews, and follows the router to the restaurant page.
export default function ReviewPage() {
  const params = useParams<{ restaurantId: string }>();
  const restaurantId = Number(params.restaurantId);
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // The name comes from the API, like everything else. No assumptions.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRestaurantName(data?.name ?? null))
      .catch(() => setRestaurantName(null));
  }, [restaurantId]);

  const canSubmit = rating >= 1 && comment.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, rating, comment }),
    });
    setSubmitting(false);

    if (res.ok) {
      router.push(`/restaurant/${restaurantId}`);
      return;
    }

    // The backend rejected this. Show ITS message, word for word.
    const data = await res.json().catch(() => null);
    setError(data?.error ?? "The request could not be completed");
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-8">
        <Brand />

        <div className="mt-8 rounded-lg border border-neutral-200/70 bg-white p-6">
          <h1 className="text-2xl font-medium tracking-tight">
            {restaurantName ?? "Ludhiana Burrito"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">Write a review</p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label className="block text-sm text-neutral-700">Rating</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                  onClick={() => setRating(star)}
                  className={`text-3xl leading-none transition-colors ${
                    star <= rating ? "text-[#E23744]" : "text-neutral-300"
                  } hover:text-[#E23744]`}
                >
                  ★
                </button>
              ))}
            </div>

            <label className="mt-8 block text-sm text-neutral-700" htmlFor="comment">
              Your review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What was it like?"
              className="mt-2 w-full rounded-md border border-neutral-200 bg-[#FAFAF8] px-4 py-3 text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#E23744]"
            />

            {error && <p className="mt-4 text-sm text-[#E23744]">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-6 rounded-md bg-[#E23744] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#c92f3b] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {submitting ? "Sending…" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <p className="text-center text-sm tracking-wide">
      <span className="font-semibold text-[#E23744]">Zomato</span>
      <span className="text-neutral-400"> Lite</span>
    </p>
  );
}
