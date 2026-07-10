"use client";

import { useState } from "react";

const inputCls =
  "w-full bg-cream border border-[#C8BFB0] text-charcoal text-[13px] px-3 py-2.5 focus:outline-none focus:border-charcoal/40 transition-colors placeholder:text-charcoal/30";

export default function SuggestPage() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), note: note.trim() || null }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Submission failed");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-6 sm:px-10 pt-28 pb-24">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/40 mb-3">Suggest</p>
        <h1
          className="font-display italic text-charcoal mb-3"
          style={{ fontSize: "clamp(1.8rem, 5vw, 2.6rem)", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
        >
          Suggest a product.
        </h1>
        <p className="text-[13px] font-light text-charcoal/55 leading-relaxed mb-10 max-w-sm">
          Found something we should score? Share the link and we&apos;ll take a look.
          Submissions are anonymous.
        </p>

        {done ? (
          <p
            className="text-[14px] font-light"
            style={{ color: "#8FA68A" }}
          >
            Thanks, we&apos;ll take a look.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1 block">
                Product URL <span className="text-charcoal/30">(required)</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.25em] uppercase text-charcoal/40 mb-1 block">
                Note <span className="text-charcoal/30">(optional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Why you think we should score this…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <p className="text-[12px] text-charcoal/40">Error: {error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !url.trim()}
              className="self-start px-8 py-3 text-[12px] tracking-[0.15em] uppercase text-charcoal disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
