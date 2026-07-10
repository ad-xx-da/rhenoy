import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "You are a product data extraction tool. When given a URL, use web search to find the product and extract its material composition, price, certifications, and treatments. " +
  "Respond with ONLY valid JSON. No preamble, no explanation, no markdown code fences, no commentary — just the raw JSON object itself, starting with { and ending with }. " +
  "Fields: productName, brand, fibres (array of objects with name and percentage), price, currency, countryOfOrigin, certifications (array of strings), treatments (array of strings), dataCompleteness (0–100). Set unknown fields to null.";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  console.log("[scrape] API key present:", !!process.env.ANTHROPIC_API_KEY);
  console.log("[scrape] Requesting URL:", url);

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Extract product data from this URL: ${url}`,
        },
      ],
    });

    console.log("[scrape] Stop reason:", response.stop_reason);
    console.log("[scrape] Content blocks:", response.content.map((b) => b.type));

    // Pull the final text block out of the response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("[scrape] No text block in response. Full content:", JSON.stringify(response.content, null, 2));
      return NextResponse.json({ error: "No text response from model" }, { status: 500 });
    }

    console.log("[scrape] Raw text:", textBlock.text.slice(0, 200));

    // Extract JSON robustly: find the first { and last } in the response,
    // discarding any preamble, explanation, or markdown fences the model adds.
    const text = textBlock.text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      console.error("[scrape] No JSON object found in response:", text.slice(0, 300));
      return NextResponse.json({ error: "Model did not return JSON" }, { status: 500 });
    }
    const data = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number }).status;
    console.error("[scrape] Error:", message);
    console.error("[scrape] Full error:", err);
    return NextResponse.json(
      { error: "Failed to extract product data", detail: message, apiStatus: status },
      { status: 500 }
    );
  }
}
