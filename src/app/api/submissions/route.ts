import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Ensure table exists on first use
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id         SERIAL PRIMARY KEY,
      url        TEXT NOT NULL,
      note       TEXT,
      status     TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function POST(req: NextRequest) {
  const { url, note } = await req.json();
  if (!url?.trim()) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  await ensureTable();

  const { rows } = await sql`
    INSERT INTO submissions (url, note)
    VALUES (${url.trim()}, ${note?.trim() || null})
    RETURNING id
  `;

  // Fire email notification (non-blocking — we don't wait for it)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  fetch(`${baseUrl}/api/submissions/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.trim(), note: note?.trim() || null }),
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: rows[0].id });
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureTable();

  const { rows } = await sql`
    SELECT * FROM submissions ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}
