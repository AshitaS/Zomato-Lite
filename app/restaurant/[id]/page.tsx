"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
};

type RestaurantData = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

// Screen 2: the restaurant page.
// This page calls GET /api/restaurants/[id] and renders what it gets.
// There is NO calculation anywhere in this file: the average arrives as a number
// and is printed as a number. The frontend is a display layer.
export default function RestaurantPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = Number(params.id);

  const [data, setData] = useState<RestaurantData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`).then(async (res) => {
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      setData(await res.json());
    });
  }, [restaurantId]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] text-stone-900">
        <div className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
          <Brand />
          <p className="mt-16 text-stone-500">This restaurant does not exist.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#FAF9F7] text-stone-900">
        <div className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
          <Brand />
          <p className="mt-16 text-stone-400">Loading…</p>
        </div>
      </main>
    );
  }

  const countWord = data.totalReviews === 1 ? "review" : "reviews";

  return (
    <main className="min-h-screen bg-[#FAF9F7] text-stone-900">
      <div className="mx-auto max-w-[720px] px-6 pb-28 pt-10">
        <Brand />

        {/* Compact identity header: avatar, name, metadata, rating summary */}
        <header className="mt-12 flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold tracking-wide text-white"
            aria-hidden="true"
          >
            {initialsOf(data.name)}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-medium leading-snug tracking-tight">{data.name}</h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {data.cuisine} · {data.area}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              {/* The average is PRINTED AS RECEIVED. No adding, no dividing, no rounding here. */}
              <span className="text-lg font-semibold leading-none text-[#E23744]">
                {data.averageRating ?? "–"}
              </span>
              <span className="text-xs text-stone-500">
                {data.totalReviews} {countWord}
              </span>
            </div>
          </div>
        </header>

        {/* Section header: "Reviews" and the write action share one row */}
        <div className="mt-14 flex items-end justify-between border-b border-stone-200/80 pb-3">
          <h2 className="text-lg font-medium tracking-tight">Reviews</h2>
          <Link
            href={`/review/${restaurantId}`}
            className="text-sm font-medium text-[#E23744] transition-opacity hover:opacity-70"
          >
            Write a review →
          </Link>
        </div>

        {data.totalReviews === 0 && (
          <div className="mt-6 rounded-2xl border border-stone-200/80 bg-white p-6 text-stone-500">
            No reviews yet — be the first to write one.
          </div>
        )}

        {/* The latest review, featured in a subtle card */}
        {data.latestReview && (
          <section className="mt-6">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#E23744]">
                Latest review
              </p>
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <div
                  className="text-base tracking-widest text-stone-900"
                  aria-label={`${data.latestReview.rating} out of 5 stars`}
                >
                  {"★".repeat(data.latestReview.rating)}
                  {"☆".repeat(5 - data.latestReview.rating)}
                </div>
                <div className="text-xs text-stone-400">
                  {new Date(data.latestReview.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <p className="mt-3 text-stone-800">{data.latestReview.comment}</p>
            </div>
          </section>
        )}

        {/* Earlier reviews: clean list rows with thin dividers, no cards */}
        {data.reviews.length > 0 && (
          <section className="mt-2">
            <ul>
              {data.reviews.map((review) => (
                <li
                  key={review.id}
                  className="border-b border-stone-200/70 py-6 last:border-b-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <div
                      className="text-sm tracking-widest text-stone-400"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <div className="text-xs text-stone-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <p className="mt-2 text-[15px] text-stone-700">{review.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}

// Presentation-only: first letter of the first two words, upper-cased.
// No business data is computed here — same category as date formatting.
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Brand() {
  return (
    <p className="text-center text-sm tracking-wide">
      <span className="font-semibold text-[#E23744]">Zomato</span>
      <span className="text-stone-400"> Lite</span>
    </p>
  );
}
