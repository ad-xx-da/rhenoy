"use client";

import { useState } from "react";

export default function EmailCapture({
  heading,
  subtext,
  hideHeading,
}: {
  heading?: string;
  subtext?: string;
  hideHeading?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <div>
      {!hideHeading && (
        <>
          <h2
            className="font-display italic text-charcoal mb-3"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 300 }}
          >
            {heading ?? "Stay in the loop."}
          </h2>
          <p className="text-[14px] font-light text-charcoal/60 leading-relaxed mb-6 max-w-sm">
            {subtext ?? "We'll let you know when the shop and calculator go live. No noise, just signal."}
          </p>
        </>
      )}

      {state === "done" ? (
        <p className="text-[13px] text-sage">You&apos;re on the list. We&apos;ll be in touch.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-cream border border-[#C8BFB0] text-charcoal text-[13px] px-3 py-2 focus:outline-none focus:border-charcoal/40 transition-colors"
            style={{ borderRadius: 0 }}
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="px-4 py-2 text-[12px] text-charcoal transition-opacity disabled:opacity-50"
            style={{ backgroundColor: "#E8C8BE", borderRadius: 0, whiteSpace: "nowrap" }}
          >
            {state === "loading" ? "…" : "Notify me"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="text-[12px] text-charcoal/40 mt-2">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
