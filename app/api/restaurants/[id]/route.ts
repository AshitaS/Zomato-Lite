import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js hands us the id from the URL: /api/restaurants/1, /api/restaurants/999, ...
  const { id } = await params;
  const restaurantId = Number(id);

  // The restaurant itself: facts from the restaurants table.
  const restaurantRows = await sql`
    SELECT id, name, cuisine, area FROM restaurants WHERE id = ${restaurantId}
  `;
  if (restaurantRows.length === 0) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  // The answers, computed FRESH from the facts, every single call. Nothing is stored:
  //   averageRating <- AVG(rating)                    where restaurant_id = $1
  //   totalReviews  <- COUNT(*)                       where restaurant_id = $1
  const statsRows = await sql`
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS average_rating,
      COUNT(*) AS total_reviews
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;
  const averageRating = statsRows[0].average_rating !== null
    ? Number(statsRows[0].average_rating)
    : null;
  const totalReviews = Number(statsRows[0].total_reviews);

  // All reviews for this restaurant, newest first.
  const reviewRows = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC
  `;

  // latestReview <- ORDER BY created_at DESC ... and take one.
  // reviews <- everything except the latest, so the page never prints it twice.
  const latestReview = reviewRows[0] ?? null;
  const reviews = reviewRows.slice(1).map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));

  const latestReviewOut = latestReview
    ? {
        id: latestReview.id,
        rating: latestReview.rating,
        comment: latestReview.comment,
        createdAt: latestReview.created_at,
      }
    : null;

  return NextResponse.json({
    name: restaurantRows[0].name,
    cuisine: restaurantRows[0].cuisine,
    area: restaurantRows[0].area,
    averageRating,
    totalReviews,
    latestReview: latestReviewOut,
    reviews,
  });
}
