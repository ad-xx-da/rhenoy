import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

// Accepts a remote image URL, downloads it, and re-hosts it on Vercel Blob.
// Used when the admin pastes an image URL manually.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  try {
    const imgRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Fetch failed: ${imgRes.status}` }, { status: 400 });
    }
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const buffer = await imgRes.arrayBuffer();
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(filename, buffer, { access: "public", contentType });
    return NextResponse.json({ url: blob.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
