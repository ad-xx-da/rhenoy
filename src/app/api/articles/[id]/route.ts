import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isAdmin = req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;

  try {
    const { rows } = isAdmin
      ? await sql`SELECT * FROM articles WHERE id = ${id}`
      : await sql`SELECT * FROM articles WHERE id = ${id} AND published = true`;
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
  const { title, excerpt, cover_image, cover_position, body, published } = await req.json();

  try {
    const { rows } = await sql`
      UPDATE articles SET
        title = COALESCE(${title ?? null}, title),
        excerpt = COALESCE(${excerpt ?? null}, excerpt),
        cover_image = COALESCE(${cover_image ?? null}, cover_image),
        cover_position = COALESCE(${cover_position ?? null}, cover_position),
        body = COALESCE(${body ?? null}, body),
        published = COALESCE(${published ?? null}, published)
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[articles] Update failed:", detail);
    return NextResponse.json({ error: "Update failed", detail }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { rows } = await sql`DELETE FROM articles WHERE id = ${id} RETURNING id`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[articles] Delete failed:", detail);
    return NextResponse.json({ error: "Delete failed", detail }, { status: 500 });
  }
}
