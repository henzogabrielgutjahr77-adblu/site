/**
 * Tipos e utilitários de exibição do calendário, sem dependências de Node.
 * Podem ser importados tanto por componentes client quanto pelo servidor.
 */

/** Evento exibido na agenda. */
export interface CalendarEvent {
  uid: string;
  summary: string;
  location?: string;
  description?: string;
  /** Início no horário local de exibição. */
  start: Date;
  /** Fim no horário local de exibição. */
  end: Date;
  allDay: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Data de hoje no fuso do site (Brasil, UTC-3 fixo). */
function todayInSite(): Date {
  const tz = -3 * 60 * 60_000;
  return new Date(Date.now() + tz);
}

function dateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Hora de um evento no formato HH:MM. */
export function formatTime(d: Date): string {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** Indica se a data é hoje no fuso do site. */
export function isToday(d: Date): boolean {
  return dateKey(d) === dateKey(todayInSite());
}

/** Data longa em pt-BR, ex.: "sexta-feira, 13 de agosto de 2026". */
export function formatDateLong(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/** Intervalo de horário em pt-BR, ex.: "19:30 – 20:30". */
export function formatTimeRange(start: Date, end: Date): string {
  const f = (d: Date) =>
    new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(d);
  return `${f(start)} – ${f(end)}`;
}
