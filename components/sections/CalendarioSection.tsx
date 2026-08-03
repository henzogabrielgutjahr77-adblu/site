import MonthCalendar from "@/components/MonthCalendar";
import type { CalendarEvent } from "@/lib/calendar-shared";

export interface AgendaSectionData {
  year: number;
  month: number;
  label: string;
  days: { date: string; items: CalendarEvent[] }[];
  prevHref: string;
  nextHref: string;
  todayHref: string;
  offline: boolean;
  error?: string;
}

export default function CalendarioSection({ data }: { data?: AgendaSectionData }) {
  if (!data) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      {data.offline && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {data.error ??
            "Não foi possível acessar o Nextcloud no momento. Exibindo eventos já sincronizados."}
        </div>
      )}
      <MonthCalendar
        year={data.year}
        month={data.month}
        label={data.label}
        days={data.days}
        prevHref={data.prevHref}
        nextHref={data.nextHref}
        todayHref={data.todayHref}
      />
    </div>
  );
}
