import Link from "next/link";
import { articles } from "@/data/articles";

export const metadata = {
  title: "Journal — rhenoy collective",
};

export default function JournalPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-28 pb-24">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-3">
          Journal
        </p>
        <h1
          className="font-display italic text-charcoal mb-16"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300 }}
        >
          Thinking out loud.
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/journal/${article.slug}`}
              className="group flex flex-col"
            >
              {/* Cover image */}
              <div
                className="w-full mb-5 overflow-hidden"
                style={{ aspectRatio: "3 / 2" }}
              >
                {article.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.coverImage}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: "#D4C5B0" }}
                  />
                )}
              </div>

              {/* Date */}
              <p className="text-[10px] tracking-[0.3em] uppercase text-charcoal/50 mb-2">
                {article.date}
              </p>

              {/* Title */}
              <h2
                className="font-display italic text-charcoal mb-3 leading-snug group-hover:opacity-70 transition-opacity"
                style={{ fontSize: "1.2rem", fontWeight: 300 }}
              >
                {article.title}
              </h2>

              {/* Excerpt — clamp to 2 lines */}
              <p
                className="text-[13px] font-light text-charcoal/60 leading-relaxed"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
