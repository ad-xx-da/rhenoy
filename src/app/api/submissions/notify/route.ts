import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, note } = await req.json();

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL ?? "temminckap@gmail.com";

  if (!apiKey) {
    console.warn("[submissions/notify] RESEND_API_KEY not set — skipping email");
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body = [
    `URL: ${url}`,
    note ? `Note: ${note}` : null,
  ].filter(Boolean).join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "rhenoy collective <onboarding@resend.dev>",
      to: [toEmail],
      subject: "New shop submission",
      text: body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[submissions/notify] Resend error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
