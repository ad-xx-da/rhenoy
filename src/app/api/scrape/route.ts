import Anthropic from "@anthropic-ai/sdk";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a product data extraction tool. When given a URL, use web search to find the product and extract its material composition, price, certifications, and treatments. " +
  "Respond with ONLY valid JSON. No preamble, no explanation, no markdown code fences, no commentary — just the raw JSON object itself, starting with { and ending with }. " +
  "Fields: productName, brand, fibres (array of objects with name and percentage — omit if unknown), price (number or null), currency (string or null), " +
  "countryOfOrigin (string or null), certifications (array of strings or null), treatments (array of strings or null), " +
  "garmentType (one of: top, pants, skirt, dress, outerwear, knitwear — pick the closest match based on the product name and description; null if genuinely unknown), " +
  "imageUrl (the direct URL to the primary product/hero image — look for og:image or the main product photo; null if not found), " +
  "dataCompleteness (0–100). Set any unknown fields to null, never to 0 or empty string.";

function normaliseImageUrl(url: string, pageOrigin: string): string {
  const decoded = url.replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  if (decoded.startsWith("//")) return `https:${decoded}`;
  if (decoded.startsWith("/")) return `${pageOrigin}${decoded}`;
  if (decoded.startsWith("http://")) return decoded.replace("http://", "https://");
  return decoded;
}

function extractImageFromHtml(html: string, pageUrl: string): string | null {
  const origin = new URL(pageUrl).origin;

  const ogSecureMatch = html.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["']/i);
  if (ogSecureMatch?.[1]) return normaliseImageUrl(ogSecureMatch[1], origin);

  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch?.[1]) return normaliseImageUrl(ogMatch[1], origin);

  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (twitterMatch?.[1]) return normaliseImageUrl(twitterMatch[1], origin);

  const jsonLdMatch = html.match(/"image"\s*:\s*"(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
  if (jsonLdMatch?.[1]) return normaliseImageUrl(jsonLdMatch[1], origin);

  const shopifyMatch = html.match(/cdn\.shopify\.com\/s\/files\/[^"'\s]+\.(jpg|jpeg|png|webp)/i);
  if (shopifyMatch?.[0]) return `https://${shopifyMatch[0]}`;

  return null;
}

async function fetchImageUrlFromPage(productUrl: string): Promise<string | null> {
  try {
    const res = await fetch(productUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      console.warn("[scrape] Page fetch failed:", res.status);
      return null;
    }
    const html = await res.text();
    const imageUrl = extractImageFromHtml(html, productUrl);
    console.log("[scrape] HTML image extraction result:", imageUrl ?? "none");
    return imageUrl;
  } catch (err) {
    console.warn("[scrape] Page fetch error:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function uploadImageToBlob(imageUrl: string): Promise<string | null> {
  try {
    const url = imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;
    const imgRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": new URL(url).origin,
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!imgRes.ok) {
      console.warn("[scrape] Image download failed:", imgRes.status, url);
      return null;
    }
    const contentType = imgRes.headers.get("content-type") ?? "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const imgBuffer = await imgRes.arrayBuffer();
    const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(filename, imgBuffer, { access: "public", contentType });
    console.log("[scrape] Image uploaded to Blob:", blob.url);
    return blob.url;
  } catch (err) {
    console.warn("[scrape] Image upload error:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  console.log("[scrape] Requesting URL:", url);

  // Run Claude extraction and direct page fetch in parallel
  const [claudeResponse, htmlImageUrl] = await Promise.all([
    client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content: `Extract product data from this URL: ${url}` }],
    }).catch((err) => {
      console.error("[scrape] Claude error:", err instanceof Error ? err.message : err);
      return null;
    }),
    fetchImageUrlFromPage(url),
  ]);

  if (!claudeResponse) {
    return NextResponse.json({ error: "Failed to extract product data" }, { status: 500 });
  }

  const textBlock = claudeResponse.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "No text response from model" }, { status: 500 });
  }

  const text = textBlock.text;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    console.error("[scrape] No JSON found:", text.slice(0, 300));
    return NextResponse.json({ error: "Model did not return JSON" }, { status: 500 });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("[scrape] JSON parse error:", err);
    return NextResponse.json({ error: "Failed to parse model response as JSON" }, { status: 500 });
  }

  // Prefer direct HTML extraction; fall back to what Claude found
  const claudeImageUrl = typeof data.imageUrl === "string" ? data.imageUrl : null;
  const bestImageUrl = htmlImageUrl ?? claudeImageUrl;
  console.log("[scrape] Image sources — HTML:", htmlImageUrl, "Claude:", claudeImageUrl, "Using:", bestImageUrl);

  const hostedImageUrl = bestImageUrl
    ? await uploadImageToBlob(normaliseImageUrl(bestImageUrl, new URL(url).origin))
    : null;

  return NextResponse.json({ ...data, hostedImageUrl });
}
