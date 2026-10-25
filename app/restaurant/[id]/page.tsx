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
      <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-neutral-500">This restaurant does not exist.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <p className="text-neutral-400">Loading…</p>
        </div>
      </main>
    );
  }

  const countWord = data.totalReviews === 1 ? "review" : "reviews";

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
      <div className="mx-auto max-w-[560px] px-6 py-16">
        {/* Name, with cuisine and area underneath in smaller muted text */}
        <h1 className="text-3xl font-medium tracking-tight">{data.name}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {data.cuisine} · {data.area}
        </p>

        {/* The average rating — the biggest thing on the page.
            PRINTED AS RECEIVED. No adding, no dividing, no rounding here. */}
        <div className="mt-10 flex items-baseline gap-3">
          <span className="text-6xl font-medium tracking-tight">
            {data.averageRating ?? "–"}
          </span>
          <span className="text-sm text-neutral-500">
            {data.totalReviews} {countWord}
          </span>
        </div>

        {data.totalReviews === 0 && (
          <p className="mt-8 rounded-md border border-neutral-200 bg-white p-5 text-neutral-500">
            No reviews yet — be the first to write one.
          </p>
        )}

        {/* The latest review, visually set apart from the rest */}
        {data.latestReview && (
          <section className="mt-10">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-700">
              Latest review
            </p>
            <div className="mt-3 rounded-lg border border-neutral-200 bg-[#FBF7EF] p-5">
              <div className="flex items-baseline justify-between">
                <div className="text-xl text-amber-700" aria-label={`${data.latestReview.rating} out of 5 stars`}>
                  {"★".repeat(data.latestReview.rating)}
                  {"☆".repeat(5 - data.latestReview.rating)}
                </div>
                <div className="text-xs text-neutral-400">
                  {new Date(data.latestReview.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
              <p className="mt-3 text-neutral-800">{data.latestReview.comment}</p>
            </div>
          </section>
        )}

        {/* Older reviews, plain list */}
        {data.reviews.length > 0 && (
          <section className="mt-10">
            <ul className="divide-y divide-neutral-200">
              {data.reviews.map((review) => (
                <li key={review.id} className="py-4">
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm text-neutral-400" aria-label={`${review.rating} out of 5 stars`}>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                  <p className="mt-2 text-neutral-700">{review.comment}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          href={`/review/${restaurantId}`}
          className="mt-10 inline-block rounded-md bg-amber-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-800"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
