import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-migrate-secret");
  if (secret !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id                     SERIAL PRIMARY KEY,
      url                    TEXT NOT NULL,
      brand                  TEXT,
      product_name           TEXT,
      fibre_composition      JSONB,
      price                  NUMERIC,
      fair_price_low         NUMERIC,
      fair_price_high        NUMERIC,
      breathability_score    NUMERIC,
      clean_score            NUMERIC,
      factory_transparency   TEXT,
      data_completeness      NUMERIC,
      created_at             TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  return NextResponse.json({ ok: true });
}
