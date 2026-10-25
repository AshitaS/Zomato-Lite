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
          <Brand />
          <p className="mt-12 text-neutral-500">This restaurant does not exist.</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
        <div className="mx-auto max-w-[560px] px-6 py-16">
          <Brand />
          <p className="mt-12 text-neutral-400">Loading…</p>
        </div>
      </main>
    );
  }

  const countWord = data.totalReviews === 1 ? "review" : "reviews";

  return (
    <main className="min-h-screen bg-[#FAFAF8] text-neutral-900">
      <div className="mx-auto max-w-[560px] px-6 pb-24 pt-8">
        <Brand />

        {/* Identity card: name, type, area — and the average, the biggest thing on the page.
            PRINTED AS RECEIVED. No adding, no dividing, no rounding here. */}
        <section className="mt-8 rounded-lg border border-neutral-200/70 bg-white p-6">
          <h1 className="text-3xl font-medium tracking-tight">{data.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {data.cuisine} · {data.area}
          </p>

          <div className="mt-6 flex items-baseline gap-3 border-t border-neutral-100 pt-6">
            <span className="text-6xl font-medium tracking-tight text-[#E23744]">
              {data.averageRating ?? "–"}
            </span>
            <span className="text-sm text-neutral-500">
              {data.totalReviews} {countWord}
            </span>
          </div>
        </section>

        {data.totalReviews === 0 && (
          <div className="mt-6 rounded-lg border border-neutral-200/70 bg-white p-5 text-neutral-500">
            No reviews yet — be the first to write one.
          </div>
        )}

        {/* The latest review, set apart on its own card */}
        {data.latestReview && (
          <section className="mt-6">
            <p className="px-1 text-xs font-medium uppercase tracking-wider text-[#E23744]">
              Latest review
            </p>
            <div className="mt-2 rounded-lg border border-neutral-200/70 bg-white p-5">
              <div className="flex items-baseline justify-between">
                <div
                  className="text-xl text-[#E23744]"
                  aria-label={`${data.latestReview.rating} out of 5 stars`}
                >
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

        {/* Older reviews, grouped in one plain card */}
        {data.reviews.length > 0 && (
          <section className="mt-6">
            <p className="px-1 text-xs font-medium uppercase tracking-wider text-neutral-400">
              Earlier reviews
            </p>
            <div className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200/70 bg-white px-5">
              {data.reviews.map((review) => (
                <div key={review.id} className="py-4">
                  <div className="flex items-baseline justify-between">
                    <div
                      className="text-sm text-neutral-400"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
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
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8">
          <Link
            href={`/review/${restaurantId}`}
            className="inline-block rounded-md bg-[#E23744] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#c92f3b]"
          >
            Write a review
          </Link>
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
