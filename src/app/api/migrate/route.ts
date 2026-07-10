import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id                          SERIAL PRIMARY KEY,
      url                         TEXT NOT NULL,
      brand                       TEXT,
      product_name                TEXT,
      fibre_composition           JSONB,
      price                       NUMERIC,
      fair_price_low              NUMERIC,
      fair_price_high             NUMERIC,
      fair_price_spanning_countries TEXT[],
      manufacturing_location      TEXT,
      breathability_score         NUMERIC,
      clean_score                 NUMERIC,
      factory_transparency        TEXT,
      data_completeness           NUMERIC,
      created_at                  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add columns if table already existed without them
  await sql`
    ALTER TABLE products
      ADD COLUMN IF NOT EXISTS fair_price_spanning_countries TEXT[],
      ADD COLUMN IF NOT EXISTS manufacturing_location TEXT,
      ADD COLUMN IF NOT EXISTS garment_type TEXT,
      ADD COLUMN IF NOT EXISTS image_url TEXT
  `;

  return NextResponse.json({ ok: true });
}
