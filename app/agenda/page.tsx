import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import MonthCalendar from "@/components/MonthCalendar";
import { getPage, getSiteConfig } from "@/lib/content";
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
  const page = getPage("agenda");

  const hrefFor = (d: Date) =>
    `/agenda?mes=${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return (
    <article className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="mb-6 text-3xl font-bold text-navy-900">
        {page?.title ?? "Agenda"}
      </h1>

      {page && (
        <div className="prose prose-slate mb-8 max-w-3xl">
          <Markdown>{page.body}</Markdown>
        </div>
      )}

      {result.offline && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {result.error ??
            "Não foi possível acessar o Nextcloud no momento. Exibindo eventos já sincronizados."}
        </div>
      )}

      <MonthCalendar
        year={year}
        month={month}
        label={label}
        days={result.days}
        prevHref={hrefFor(new Date(Date.UTC(year, month - 2, 1)))}
        nextHref={hrefFor(new Date(Date.UTC(year, month, 1)))}
        todayHref="/agenda"
      />
    </article>
  );
}
