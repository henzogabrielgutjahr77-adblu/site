import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Sections from "@/components/sections";
import { getPage, getPages } from "@/lib/content";

export const revalidate = 60;

const SPECIAL_ROUTES = new Set(["quem-somos", "agenda", "galeria", "fale-conosco"]);

export async function generateStaticParams() {
  return getPages()
    .filter((p) => !SPECIAL_ROUTES.has(p.slug))
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
  return <Sections slug={slug} />;
}