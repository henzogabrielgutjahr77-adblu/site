import type { Metadata } from "next";
import PageView from "@/components/PageView";

export const revalidate = 60;

export const metadata: Metadata = { title: "Agenda" };

export default function AgendaPage() {
  return <PageView slug="agenda" />;
}
