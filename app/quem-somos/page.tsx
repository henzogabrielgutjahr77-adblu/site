import type { Metadata } from "next";
import PageView from "@/components/PageView";

export const revalidate = 60;

export const metadata: Metadata = { title: "Quem Somos" };

export default function QuemSomosPage() {
  return <PageView slug="quem-somos" />;
}
