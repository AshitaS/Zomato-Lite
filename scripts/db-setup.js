// Applies db/schema.sql to Neon, seeds one restaurant + three reviews,
// then prints every row so a human can verify.
// Run with: npm run db:setup

const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  // Start from a clean slate so the script is safe to run more than once.
  // (Warning: this wipes any reviews added later by hand.)
  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  const runRaw = (text) => sql`${sql.unsafe(text)}`;
  // Start from a clean slate so the script is safe to run more than once.
  // (Warning: this wipes any reviews added later by hand.)
  await runRaw(`DROP TABLE IF EXISTS reviews`);
  await runRaw(`DROP TABLE IF EXISTS restaurants`);
  // The HTTP endpoint takes one SQL command per request, so split on ";"
  // and send each separately (safe here: no strings in db/schema.sql contain ";").
  for (const statement of schema.split(";").map((s) => s.trim()).filter(Boolean)) {
    await runRaw(statement);
  }

  const seed = await sql`
    INSERT INTO restaurants (name, cuisine, area)
    VALUES ('Ludhiana Burrito', 'Indian', 'Sector 32')
    RETURNING id
  `;
  const restaurantId = seed[0].id;

  await sql`
    INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
      (${restaurantId}, 5, 'Paneer burrito is unreal',      NOW() - INTERVAL '8 days'),
      (${restaurantId}, 4, 'Good, but slow service',        NOW() - INTERVAL '6 days'),
      (${restaurantId}, 4, 'Solid. Would repeat.',          NOW() - INTERVAL '2 days')
  `;

  const restaurants = await sql`SELECT * FROM restaurants ORDER BY id`;
  const reviews = await sql`SELECT * FROM reviews ORDER BY id`;

  console.log("== restaurants ==");
  for (const r of restaurants) {
    console.log(`${r.id} | ${r.name} | ${r.cuisine} | ${r.area}`);
  }
  console.log("\n== reviews ==");
  for (const r of reviews) {
    console.log(`${r.id} | restaurant ${r.restaurant_id} | ${r.rating} stars | "${r.comment}" | ${r.created_at}`);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("db:setup failed:", err.message);
  process.exit(1);
});
