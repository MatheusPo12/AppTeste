import type { Appointment } from "./store";
import type { Provider, Service } from "./mock";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const fromMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/** Weekday for a yyyy-MM-dd string as 0..6 (Sun..Sat) in local time. */
export function weekdayOf(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function addMinutes(hhmm: string, minutes: number) {
  return fromMin(toMin(hhmm) + minutes);
}

/**
 * Compute available slot start times for a given service on a date.
 * Step = 15 minutes. Skips any interval overlapping existing confirmed appts.
 */
export function computeSlots(
  provider: Provider,
  service: Service,
  dateISO: string,
  appointments: Appointment[],
  step = 15,
): string[] {
  const dow = weekdayOf(dateISO);
  const day = provider.workingHours[dow];
  if (!day?.enabled) return [];
  const open = toMin(day.start);
  const close = toMin(day.end);
  const dur = service.duration;

  const booked = appointments
    .filter(
      (a) =>
        a.providerId === provider.id &&
        a.date === dateISO &&
        a.status === "confirmed",
    )
    .map((a) => ({ s: toMin(a.start), e: toMin(a.end) }));

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  for (let t = open; t + dur <= close; t += step) {
    if (dateISO === today && t <= nowMin) continue;
    const overlap = booked.some((b) => t < b.e && t + dur > b.s);
    if (!overlap) slots.push(fromMin(t));
  }
  return slots;
}

export function isoToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function formatBRDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}