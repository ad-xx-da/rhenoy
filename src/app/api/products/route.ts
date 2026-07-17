import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const wantsAll = req.nextUrl.searchParams.get("all") === "true";
  const isAdmin = req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;

  try {
    const { rows } = wantsAll && isAdmin
      ? await sql`SELECT * FROM products ORDER BY created_at DESC`
      : await sql`SELECT * FROM products WHERE published = true ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[products] DB query failed:", err instanceof Error ? err.message : err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    url,
    brand,
    product_name,
    fibre_composition,
    price,
    fair_price_low,
    fair_price_high,
    fair_price_spanning_countries,
    manufacturing_location,
    garment_type,
    image_url,
    breathability_score,
    clean_score,
    factory_transparency,
    data_completeness,
  } = body;

  try {
    const { rows } = await sql`
      INSERT INTO products (
        url, brand, product_name, fibre_composition, price,
        fair_price_low, fair_price_high, fair_price_spanning_countries,
        manufacturing_location, garment_type, image_url,
        breathability_score, clean_score,
        factory_transparency, data_completeness
      ) VALUES (
        ${url}, ${brand}, ${product_name},
        ${JSON.stringify(fibre_composition)},
        ${price ?? null}, ${fair_price_low ?? null}, ${fair_price_high ?? null},
        ${fair_price_spanning_countries ?? null},
        ${manufacturing_location}, ${garment_type ?? null}, ${image_url ?? null},
        ${breathability_score ?? null}, ${clean_score ?? null},
        ${factory_transparency}, ${data_completeness ?? null}
      )
      RETURNING id
    `;

    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[products] Insert failed:", detail);
    return NextResponse.json({ error: "Save failed", detail }, { status: 500 });
  }
}
