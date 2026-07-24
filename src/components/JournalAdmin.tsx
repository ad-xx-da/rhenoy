"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import ImagePositioner from "./ImagePositioner";

type Article = {
  id: number;
  slug: string;
  title: string | null;
  excerpt: string | null;
  cover_image: string | null;
  cover_position: string | null;
  body: string | null;
  published: boolean;
  created_at: string;
};

function parsePosition(pos: string | null | undefined): { x: number; y: number } {
  const match = pos?.match(/(-?[\d.]+)%\s+(-?[\d.]+)%/);
  if (!match) return { x: 50, y: 50 };
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}

function formatPosition(p: { x: number; y: number }): string {
  return `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`;
}

const inputCls =
  "w-full bg-cream border border-[#C8BFB0] text-charcoal text-[13px] px-3 py-2 focus:outline-none focus:border-charcoal/40 transition-colors";

const buttonCls =
  "text-[11px] tracking-widest uppercase text-charcoal px-4 py-1.5 whitespace-nowrap";

type EditorState = {
  id: number | null;
  title: string;
  excerpt: string;
  cover_image: string;
  cover_position: { x: number; y: number };
  body: string;
};

const EMPTY_DRAFT: EditorState = {
  id: null,
  title: "",
  excerpt: "",
  cover_image: "",
  cover_position: { x: 50, y: 50 },
  body: "",
};

export default function JournalAdmin({ password }: { password: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [view, setView] = useState<"list" | "editor">("list");
  const [draft, setDraft] = useState<EditorState>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/articles?all=true", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) setArticles(await res.json());
    } catch {}
  }, [password]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  function openNew() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setView("editor");
  }

  function openEdit(a: Article) {
    setDraft({
      id: a.id,
      title: a.title ?? "",
      excerpt: a.excerpt ?? "",
      cover_image: a.cover_image ?? "",
      cover_position: parsePosition(a.cover_position),
      body: a.body ?? "",
    });
    setError(null);
    setView("editor");
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "x-admin-password": password },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) setDraft((d) => ({ ...d, cover_image: data.url }));
    } catch {}
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const isNew = draft.id === null;
      const res = await fetch(isNew ? "/api/articles" : `/api/articles/${draft.id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({
          title: draft.title,
          excerpt: draft.excerpt,
          cover_image: draft.cover_image || null,
          cover_position: formatPosition(draft.cover_position),
          body: draft.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail ?? data.error ?? "Save failed");
      await loadArticles();
      setView("list");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(a: Article) {
    const res = await fetch(`/api/articles/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ published: !a.published }),
    });
    if (res.ok) {
      setArticles((prev) => prev.map((x) => x.id === a.id ? { ...x, published: !a.published } : x));
    }
  }

  async function handleDelete(a: Article) {
    if (!window.confirm(`Delete "${a.title ?? "Untitled"}"? This can't be undone.`)) return;
    const res = await fetch(`/api/articles/${a.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) setArticles((prev) => prev.filter((x) => x.id !== a.id));
  }

  if (view === "editor") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2
            className="font-display italic text-charcoal"
            style={{ fontSize: "1.5rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
          >
            {draft.id === null ? "New entry" : "Edit entry"}
          </h2>
          <button
            type="button"
            onClick={() => setView("list")}
            className="text-[11px] tracking-widest uppercase text-charcoal/40 hover:text-charcoal/70"
          >
            ← Back to list
          </button>
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.25em] uppercase text-charcoal/50 mb-1">Title</label>
          <input
            className={inputCls}
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            placeholder="Article title"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.25em] uppercase text-charcoal/50 mb-1">Excerpt</label>
          <textarea
            className={inputCls}
            rows={2}
            value={draft.excerpt}
            onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
            placeholder="Short summary shown on the Journal listing page"
          />
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.25em] uppercase text-charcoal/50 mb-1">Cover image</label>
          <div className="flex items-center gap-3">
            <input
              className={`${inputCls} flex-1`}
              value={draft.cover_image}
              onChange={(e) => setDraft((d) => ({ ...d, cover_image: e.target.value }))}
              placeholder="Image URL, or upload below"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className={buttonCls}
              style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
            >
              Upload
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>
          {draft.cover_image && (
            <div className="mt-3">
              <ImagePositioner
                src={draft.cover_image}
                value={draft.cover_position}
                onChange={(pos) => setDraft((d) => ({ ...d, cover_position: pos }))}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] tracking-[0.25em] uppercase text-charcoal/50 mb-1">Body</label>
          <RichTextEditor
            content={draft.body}
            onChange={(html) => setDraft((d) => ({ ...d, body: html }))}
            adminPassword={password}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-[13px] text-charcoal disabled:opacity-40"
            style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          {error && <p className="text-[12px] text-charcoal/50">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2
          className="font-display italic text-charcoal"
          style={{ fontSize: "1.5rem", fontWeight: 300, fontFamily: "var(--font-cormorant)" }}
        >
          {articles.filter((a) => a.published).length} live, {articles.filter((a) => !a.published).length} draft
        </h2>
        <button
          type="button"
          onClick={openNew}
          className={buttonCls}
          style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
        >
          + New entry
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {articles.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 px-4 py-4"
            style={{ border: "1px solid #EDE8DC", background: "#F7F4EE" }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-charcoal truncate">{a.title || "Untitled"}</p>
              <p className="text-[10px] text-charcoal/35 mt-0.5">/{a.slug}</p>
            </div>
            <span
              className="text-[10px] tracking-widest uppercase px-2 py-1"
              style={{ color: a.published ? "#8FA68A" : "#C8974A" }}
            >
              {a.published ? "Live" : "Draft"}
            </span>
            <button
              type="button"
              onClick={() => openEdit(a)}
              className="text-[11px] tracking-widest uppercase text-charcoal/50 hover:text-charcoal px-2"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => togglePublish(a)}
              className={buttonCls}
              style={{ backgroundColor: "#E8C8BE", borderRadius: 0 }}
            >
              {a.published ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(a)}
              className="text-[11px] tracking-widest uppercase text-charcoal/30 hover:text-charcoal/60 px-2"
            >
              Delete
            </button>
          </div>
        ))}
        {articles.length === 0 && (
          <p className="text-[13px] text-charcoal/40 italic">No journal entries yet.</p>
        )}
      </div>
    </div>
  );
}
