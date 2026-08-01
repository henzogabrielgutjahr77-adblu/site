import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getPage } from "@/lib/content";

interface PageViewProps {
  slug: string;
  children?: React.ReactNode;
}

export default function PageView({ slug, children }: PageViewProps) {
  const page = getPage(slug);
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="mb-6 text-3xl font-bold text-navy-900">{page.title}</h1>
      <Markdown>{page.body}</Markdown>
      {children}
    </article>
  );
}
