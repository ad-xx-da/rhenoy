import Anthropic from "@anthropic-ai/sdk";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a product data extraction tool. When given a URL, use web search to find the product and extract its material composition, price, certifications, and treatments. " +
  "Respond with ONLY valid JSON. No preamble, no explanation, no markdown code fences, no commentary — just the raw JSON object itself, starting with { and ending with }. " +
  "Fields: productName, brand, fibres (array of objects with name and percentage — omit if unknown), price (number or null), currency (string or null), " +
  "countryOfOrigin (string or null), certifications (array of strings or null), treatments (array of strings or null), " +
  "imageUrl (the primary hero/product image URL — not a thumbnail or lifestyle shot; null if not found), " +
  "dataCompleteness (0–100). Set any unknown fields to null, never to 0 or empty string.";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  console.log("[scrape] Requesting URL:", url);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Extract product data from this URL: ${url}` }],
    });

    console.log("[scrape] Stop reason:", response.stop_reason);

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from model" }, { status: 500 });
    }

    // Robustly extract JSON — slice from first { to last }
    const text = textBlock.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      console.error("[scrape] No JSON object found:", text.slice(0, 300));
      return NextResponse.json({ error: "Model did not return JSON" }, { status: 500 });
    }
    const data = JSON.parse(text.slice(start, end + 1));

    // Download and re-host the product image via Vercel Blob
    let hostedImageUrl: string | null = null;
    if (data.imageUrl && typeof data.imageUrl === "string") {
      try {
        const imgRes = await fetch(data.imageUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; rhenoy-bot/1.0)" },
          signal: AbortSignal.timeout(10_000),
        });
        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
          const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
          const imgBuffer = await imgRes.arrayBuffer();
          const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const blob = await put(filename, imgBuffer, {
            access: "public",
            contentType,
          });
          hostedImageUrl = blob.url;
          console.log("[scrape] Image uploaded to Blob:", hostedImageUrl);
        } else {
          console.warn("[scrape] Image fetch failed:", imgRes.status, data.imageUrl);
        }
      } catch (imgErr) {
        console.warn("[scrape] Image download error:", imgErr instanceof Error ? imgErr.message : imgErr);
      }
    }

    return NextResponse.json({ ...data, hostedImageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scrape] Error:", message);
    return NextResponse.json(
      { error: "Failed to extract product data", detail: message },
      { status: 500 }
    );
  }
}
