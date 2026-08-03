import type { Metadata } from "next";
import Sections from "@/components/sections";
import { getSiteConfig } from "@/lib/content";
import { getMonthCalendar } from "@/lib/calendar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Agenda" };

const pad = (n: number) => String(n).padStart(2, "0");

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;

  const mes = params.mes;
  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const y = Number(mes.slice(0, 4));
    const m = Number(mes.slice(5, 7));
    if (m >= 1 && m <= 12) {
      year = y;
      month = m;
    }
  }

  const config = getSiteConfig();
  const result = await getMonthCalendar(config.calendar, year, month);

  const hrefFor = (d: Date) =>
    `/agenda?mes=${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <Sections
      slug="agenda"
      agenda={{
        year,
        month,
        label,
        days: result.days,
        prevHref: hrefFor(new Date(Date.UTC(year, month - 2, 1))),
        nextHref: hrefFor(new Date(Date.UTC(year, month, 1))),
        todayHref: "/agenda",
        offline: result.offline,
        error: result.error,
      }}
    />
  );
}
