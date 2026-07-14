import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addDaysISO, formatBRDate, isoToday } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { XCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/agenda")({
  component: ProAgenda,
});

function ProAgenda() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const appts = useStore((s) => s.appointments);
  const cancel = useStore((s) => s.cancelAppointment);
  const provider = providers.find((p) => p.id === user?.providerId);

  const today = isoToday();
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysISO(today, i)), [today]);
  const [date, setDate] = useState(today);

  if (!provider) return null;

  const day = provider.workingHours[new Date(date + "T00:00").getDay()];
  const dayAppts = appts
    .filter((a) => a.providerId === provider.id && a.date === date)
    .sort((a, b) => (a.start > b.start ? 1 : -1));

  return (
    <Screen>
      <ScreenHeader title="Agenda" subtitle={formatBRDate(date)} />

      <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-3">
        {days.map((d) => {
          const [y, m, dd] = d.split("-").map(Number);
          const dt = new Date(y, m - 1, dd);
          const active = d === date;
          return (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`shrink-0 w-14 py-3 rounded-2xl border text-center ${
                active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              <span className="block text-[10px] uppercase opacity-70">
                {dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
              </span>
              <span className="block text-lg font-semibold">{dt.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="px-5">
        {!day?.enabled && (
          <p className="p-4 bg-card border border-border rounded-2xl text-sm text-muted-foreground text-center">
            Fechado neste dia
          </p>
        )}
        {day?.enabled && dayAppts.length === 0 && (
          <p className="p-4 bg-card border border-border rounded-2xl text-sm text-muted-foreground text-center">
            Nenhum agendamento — {day.start} às {day.end}
          </p>
        )}
        <div className="space-y-2 mt-2">
          {dayAppts.map((a) => {
            const s = provider.services.find((x) => x.id === a.serviceId);
            const wa = `https://wa.me/${a.clientContact}?text=${encodeURIComponent(
              `Olá ${a.clientName}, confirmando seu horário às ${a.start} para ${s?.name}.`,
            )}`;
            return (
              <div
                key={a.id}
                className={`p-4 bg-card border border-border rounded-2xl flex gap-3 ${
                  a.status === "cancelled" ? "opacity-40" : ""
                }`}
              >
                <div className="w-14 text-right shrink-0">
                  <p className="text-sm font-semibold">{a.start}</p>
                  <p className="text-[10px] text-muted-foreground">{a.end}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s?.name}</p>
                </div>
                {a.status === "confirmed" && (
                  <div className="flex gap-1 shrink-0">
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-surface-elevated"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => {
                        cancel(a.id);
                        toast.success("Cancelado");
                      }}
                      className="p-2 rounded-lg bg-surface-elevated text-destructive"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}