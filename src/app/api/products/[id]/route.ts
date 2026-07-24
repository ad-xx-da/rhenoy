import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
  try {
    const { rows } = isAdmin
      ? await sql`SELECT * FROM products WHERE id = ${id}`
      : await sql`SELECT * FROM products WHERE id = ${id} AND published = true`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  // Bare publish toggle — used by the Publish/Unpublish button
  if (!("product_name" in body)) {
    try {
      const { rows } = await sql`
        UPDATE products SET published = ${body.published} WHERE id = ${id} RETURNING id, published
      `;
      if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(rows[0]);
    } catch {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  }

  // Full edit — overwrite every field with the current form state
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
      UPDATE products SET
        url = ${url},
        brand = ${brand},
        product_name = ${product_name},
        fibre_composition = ${JSON.stringify(fibre_composition)},
        price = ${price ?? null},
        fair_price_low = ${fair_price_low ?? null},
        fair_price_high = ${fair_price_high ?? null},
        fair_price_spanning_countries = ${fair_price_spanning_countries ?? null},
        manufacturing_location = ${manufacturing_location},
        garment_type = ${garment_type ?? null},
        image_url = ${image_url ?? null},
        breathability_score = ${breathability_score ?? null},
        clean_score = ${clean_score ?? null},
        factory_transparency = ${factory_transparency},
        data_completeness = ${data_completeness ?? null}
      WHERE id = ${id}
      RETURNING id
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[products] Update failed:", detail);
    return NextResponse.json({ error: "Update failed", detail }, { status: 500 });
  }
}
