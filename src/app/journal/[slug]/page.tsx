import { notFound } from "next/navigation";
import { articles } from "@/data/articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return { title: `${article.title} — rhenoy collective` };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const paragraphs = article.body
    .split("\n\n")
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-cream min-h-screen">
      {/* Cover image */}
      <div className="w-full h-[50vh] sm:h-[60vh] overflow-hidden">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "#D4C5B0" }} />
        )}
      </div>

      {/* Article */}
      <div className="max-w-[680px] mx-auto px-6 py-16">
        <p className="text-[10px] tracking-[0.35em] uppercase text-charcoal/50 mb-4">
          {article.date}
        </p>
        <h1
          className="font-display italic text-charcoal leading-[1.1] mb-12"
          style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 300 }}
        >
          {article.title}
        </h1>

        <div className="space-y-6">
          {paragraphs.map((para: string, i: number) => (
            <p
              key={i}
              className="text-[15px] font-light text-charcoal/80 leading-[1.8]"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
