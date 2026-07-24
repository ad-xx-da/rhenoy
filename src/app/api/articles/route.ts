import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(req: NextRequest) {
  const wantsAll = req.nextUrl.searchParams.get("all") === "true";
  const isAdmin = req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;

  try {
    const { rows } = wantsAll && isAdmin
      ? await sql`SELECT * FROM articles ORDER BY created_at DESC`
      : await sql`SELECT * FROM articles WHERE published = true ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error("[articles] DB query failed:", err instanceof Error ? err.message : err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, excerpt, cover_image, cover_position, body } = await req.json();

  const baseSlug = slugify(title || "untitled");

  try {
    // Ensure slug uniqueness by suffixing -2, -3, ... if needed
    let slug = baseSlug || "untitled";
    let suffix = 1;
    for (;;) {
      const { rows: existing } = await sql`SELECT id FROM articles WHERE slug = ${slug}`;
      if (existing.length === 0) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const { rows } = await sql`
      INSERT INTO articles (slug, title, excerpt, cover_image, cover_position, body, published)
      VALUES (${slug}, ${title ?? null}, ${excerpt ?? null}, ${cover_image ?? null}, ${cover_position ?? "50% 50%"}, ${body ?? ""}, false)
      RETURNING id, slug
    `;

    return NextResponse.json({ ok: true, id: rows[0].id, slug: rows[0].slug });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[articles] Insert failed:", detail);
    return NextResponse.json({ error: "Save failed", detail }, { status: 500 });
  }
}
