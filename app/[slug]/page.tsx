import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageView from "@/components/PageView";
import { getPage, getPages } from "@/lib/content";

export const revalidate = 60;

export async function generateStaticParams() {
  return getPages()
    .filter((p) => p.slug !== "quem-somos" && p.slug !== "agenda")
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  return { title: page?.title ?? "Página" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return <PageView slug={slug} />;
}
