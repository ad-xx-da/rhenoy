import { sql } from "@vercel/postgres";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface DbArticle {
  id: number;
  slug: string;
  title: string | null;
  excerpt: string | null;
  cover_image: string | null;
  cover_position: string | null;
  body: string | null;
  created_at: string;
}

async function getArticle(slug: string): Promise<DbArticle | null> {
  try {
    const { rows } = await sql`
      SELECT * FROM articles WHERE slug = ${slug} AND published = true
    `;
    return (rows[0] as DbArticle) ?? null;
  } catch (err) {
    console.error("[journal/[slug]] DB query failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return { title: `${article.title} — rhenoy collective` };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <div className="bg-cream min-h-screen">
      {/* Cover image */}
      <div className="w-full h-[50vh] sm:h-[60vh] overflow-hidden">
        {article.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.cover_image}
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: article.cover_position || "50% 50%" }}
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "#D4C5B0" }} />
        )}
      </div>

      {/* Article */}
      <div className="max-w-[680px] mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-4">
          {formatDate(article.created_at)}
        </p>
        <h1
          className="font-display italic text-charcoal leading-[1.1] mb-12"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300 }}
        >
          {article.title}
        </h1>

        <div
          className="journal-article-body"
          dangerouslySetInnerHTML={{ __html: article.body ?? "" }}
        />
      </div>
    </div>
  );
}
