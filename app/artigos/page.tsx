import type { Metadata } from "next";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { formatDate, getPage, getPosts } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = { title: "Artigos e Notícias" };

export default function ArtigosPage() {
  const intro = getPage("artigos-e-noticias");
  const posts = getPosts();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      {intro && (
        <div className="mb-10">
          <h1 className="mb-4 text-3xl font-bold text-navy-900">
            {intro.title}
          </h1>
          <Markdown>{intro.body}</Markdown>
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-slate-500">Nenhum artigo publicado ainda.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/artigos/${post.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs text-slate-400">{formatDate(post.date)}</p>
              <h2 className="mt-1 text-xl font-semibold text-navy-900 hover:text-accent">
                {post.title}
              </h2>
              {post.description && (
                <p className="mt-2 text-sm text-slate-600">{post.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
