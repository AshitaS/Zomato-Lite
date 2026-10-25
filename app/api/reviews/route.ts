import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// One shared connection to the database. Backend-only code lives here in the kitchen.
const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  // Read the JSON the visitor sent. If it isn't JSON at all, treat as empty.
  const body = await request.json().catch(() => null);
  const { restaurantId, rating, comment } = body ?? {};

  // Check 1: rating must be a whole number from 1 to 5.
  // This is where "rating": 500 dies. The frontend's star picker is not proof of anything.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5" },
      { status: 400 }
    );
  }

  // Check 2: comment must be a non-empty string after trimming away blank edges.
  if (typeof comment !== "string" || comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400 }
    );
  }

  // Check 3: the restaurant must actually exist. A database lookup — no assumption.
  const restaurant = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (restaurant.length === 0) {
    return NextResponse.json(
      { error: "That restaurant does not exist" },
      { status: 400 }
    );
  }

  // Everything passed: write exactly one row. Nothing else in the database changes.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment})
    RETURNING id
  `;

  return NextResponse.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}
