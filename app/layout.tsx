import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VisualProvider from "@/components/visual/VisualProvider";
import PreviewBreakpoint from "@/components/visual/PreviewBreakpoint";
import { getSiteConfig } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export function generateMetadata(): Metadata {
  const config = getSiteConfig();
  return {
    title: {
      default: `${config.nome} | ${config.slogan}`,
      template: `%s | ${config.nome}`,
    },
    description: config.descricao,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-slate-900">
        <VisualProvider />
        <PreviewBreakpoint />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
