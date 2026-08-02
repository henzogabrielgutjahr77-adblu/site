"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatDateLong,
  formatTime,
  formatTimeRange,
  isToday,
  type CalendarEvent,
} from "@/lib/calendar-shared";

interface DayCell {
  date: string;
  items: CalendarEvent[];
}

interface MonthCalendarProps {
  year: number;
  month: number;
  label: string;
  days: DayCell[];
  prevHref: string;
  nextHref: string;
  todayHref: string;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const navBtnCls =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-navy-900 transition-colors hover:bg-slate-100";

export default function MonthCalendar({
  year,
  month,
  label,
  days,
  prevHref,
  nextHref,
  todayHref,
}: MonthCalendarProps) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const offset = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const byDate = new Map(days.map((d) => [d.date, d.items]));

  const cells: { day: number; items: CalendarEvent[] }[] = [];
  for (let i = 0; i < offset; i++) cells.push({ day: 0, items: [] });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, items: byDate.get(key) ?? [] });
  }
  while (cells.length % 7 !== 0) cells.push({ day: 0, items: [] });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold capitalize text-navy-900">{label}</h2>
        <div className="flex items-center gap-2">
          <Link href={prevHref} className={navBtnCls} aria-label="Mês anterior">
            ‹
          </Link>
          <Link href={todayHref} className={navBtnCls}>
            Hoje
          </Link>
          <Link href={nextHref} className={navBtnCls} aria-label="Próximo mês">
            ›
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs"
          >
            {w}
          </div>
        ))}
        {cells.map((c, i) => {
          const today =
            c.day > 0 && isToday(new Date(Date.UTC(year, month - 1, c.day)));
          return (
            <div
              key={i}
              className={`min-h-[74px] rounded-lg border p-1 sm:p-1.5 ${
                today ? "border-accent bg-orange-50" : "border-slate-200 bg-white"
              } ${c.day === 0 ? "invisible" : ""}`}
            >
              {c.day > 0 && (
                <>
                  <span
                    className={`text-xs font-semibold ${
                      today ? "text-accent" : "text-slate-600"
                    }`}
                  >
                    {c.day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {c.items.slice(0, 3).map((ev, j) => (
                      <button
                        key={`${ev.uid}-${j}`}
                        type="button"
                        onClick={() => setSelected(ev)}
                        title="Ver detalhes do evento"
                        className="block w-full truncate rounded bg-navy-800 px-1 py-0.5 text-left text-[10px] font-medium leading-tight text-white transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-[11px]"
                      >
                        {!ev.allDay && `${formatTime(ev.start)} `}
                        {ev.summary}
                      </button>
                    ))}
                    {c.items.length > 3 && (
                      <div className="px-1 text-[10px] text-slate-400">
                        +{c.items.length - 3} mais
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes do evento"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-navy-900">{selected.summary}</h3>
              <button
                type="button"
                aria-label="Fechar detalhes"
                onClick={() => setSelected(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="font-semibold text-navy-900">Data:</dt>
                <dd className="capitalize">{formatDateLong(selected.start)}</dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="font-semibold text-navy-900">Horário:</dt>
                <dd>{selected.allDay ? "Dia inteiro" : formatTimeRange(selected.start, selected.end)}</dd>
              </div>
              {selected.location && (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="font-semibold text-navy-900">Local:</dt>
                  <dd>{selected.location}</dd>
                </div>
              )}
              {selected.description && (
                <div className="pt-1">
                  <dt className="mb-1 font-semibold text-navy-900">Descrição:</dt>
                  <dd className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-slate-700">
                    {selected.description}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
