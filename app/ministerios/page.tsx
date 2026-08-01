import type { Metadata } from "next";
import PageView from "@/components/PageView";

export const revalidate = 60;

export const metadata: Metadata = { title: "Ministérios" };

export default function MinisteriosPage() {
  return <PageView slug="ministerios" />;
}
