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
    <main className="min-h-screen bg-[#FAF9F7] text-stone-900">
      <div className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
        <Brand />

        {/* Editorial masthead: task first, restaurant under it */}
        <header className="mt-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone-400">
            Write a review
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            {restaurantName ?? "Ludhiana Burrito"}
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="mt-12">
          <label className="block text-sm text-stone-600">Rating</label>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                aria-pressed={star <= rating}
                onClick={() => setRating(star)}
                className={`text-4xl leading-none transition-all duration-150 ${
                  star <= rating
                    ? "scale-110 text-[#E23744]"
                    : "scale-100 text-stone-300 hover:scale-105 hover:text-stone-400"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <label className="mt-10 block text-sm text-stone-600" htmlFor="comment">
            Your review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={7}
            placeholder="What was it like? The food, the service, the mood…"
            className="mt-2 w-full resize-none rounded-2xl border border-stone-200/90 bg-white px-5 py-4 text-[15px] leading-relaxed text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-[#E23744]/50 focus:ring-4 focus:ring-[#E23744]/5"
          />

          <div className="mt-2 flex items-start justify-between gap-4">
            <p className="text-xs text-stone-400">
              Your review is public and can't be edited later.
            </p>
            <p className="shrink-0 text-xs tabular-nums text-stone-400" aria-live="off">
              {comment.length} characters
            </p>
          </div>

          {error && <p className="mt-4 text-sm text-[#E23744]">{error}</p>}

          <div className="mt-10 flex justify-end">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-full bg-[#E23744] px-9 py-3.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#C92F3B] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:hover:bg-stone-200"
            >
              {submitting ? "Sending…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <p className="text-center text-sm tracking-wide">
      <span className="font-semibold text-[#E23744]">Zomato</span>
      <span className="text-stone-400"> Lite</span>
    </p>
  );
}
