import type { Metadata } from "next";
import Sections from "@/components/sections";

export const revalidate = 60;

export const metadata: Metadata = { title: "Quem Somos" };

export default function QuemSomosPage() {
  return <Sections slug="quem-somos" />;
}