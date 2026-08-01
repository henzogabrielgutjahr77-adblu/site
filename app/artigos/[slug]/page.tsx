import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { formatDate, getPost, getPosts } from "@/lib/content";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post?.title ?? "Artigo" };
}

export default async function ArtigoPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const todos = getPosts();
  const atual = todos.findIndex((p) => p.slug === slug);
  const anterior = atual > 0 ? todos[atual - 1] : null;
  const proximo = atual >= 0 && atual < todos.length - 1 ? todos[atual + 1] : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <p className="text-sm text-slate-400">{formatDate(post.date)}</p>
      <h1 className="mt-2 mb-6 text-3xl font-bold text-navy-900">
        {post.title}
      </h1>
      <Markdown>{post.body}</Markdown>

      <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 text-sm">
        <Link href="/artigos" className="text-accent hover:underline">
          ← Voltar para Artigos
        </Link>
        <div className="flex gap-4">
          {anterior && (
            <Link href={`/artigos/${anterior.slug}`} className="hover:underline">
              {anterior.title} →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
