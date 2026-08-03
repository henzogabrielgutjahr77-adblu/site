import type { Metadata } from "next";
import Sections from "@/components/sections";

export const revalidate = 60;

export const metadata: Metadata = { title: "Fale Conosco" };

export default function FaleConoscoPage() {
  return <Sections slug="fale-conosco" />;
}