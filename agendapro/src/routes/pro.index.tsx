import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { formatBRL, isoToday, addDaysISO } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/pro/")({
  component: ProDashboard,
});

function ProDashboard() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const appts = useStore((s) => s.appointments);

  const provider = providers.find((p) => p.id === user?.providerId);

  const today = isoToday();
  const weekStart = addDaysISO(today, -6);
  const monthStart = addDaysISO(today, -29);

  const stats = useMemo(() => {
    if (!provider) return { today: 0, week: 0, month: 0, todayCount: 0, bars: [] as number[] };
    const mine = appts.filter((a) => a.providerId === provider.id && a.status === "confirmed");
    const priceOf = (id: string) => provider.services.find((s) => s.id === id)?.price ?? 0;
    const sum = (start: string) =>
      mine.filter((a) => a.date >= start && a.date <= today).reduce((acc, a) => acc + priceOf(a.serviceId), 0);
    const bars = Array.from({ length: 7 }, (_, i) => {
      const d = addDaysISO(today, -6 + i);
      return mine.filter((a) => a.date === d).reduce((acc, a) => acc + priceOf(a.serviceId), 0);
    });
    return {
      today: sum(today),
      week: sum(weekStart),
      month: sum(monthStart),
      todayCount: mine.filter((a) => a.date === today).length,
      bars,
    };
  }, [appts, provider, today, weekStart, monthStart]);

  const upcoming = provider
    ? appts
        .filter((a) => a.providerId === provider.id && a.status === "confirmed" && a.date >= today)
        .sort((a, b) => (a.date + a.start > b.date + b.start ? 1 : -1))
        .slice(0, 5)
    : [];

  const maxBar = Math.max(1, ...stats.bars);

  if (!provider) return null;

  return (
    <Screen>
      <ScreenHeader
        title={`Olá, ${user?.name.split(" ")[0]}`}
        subtitle={
          stats.todayCount === 0
            ? "Sem agendamentos hoje."
            : `Você tem ${stats.todayCount} agendamento${stats.todayCount > 1 ? "s" : ""} hoje.`
        }
      />

      <div className="px-5 grid grid-cols-3 gap-2">
        <Kpi label="Hoje" value={formatBRL(stats.today)} />
        <Kpi label="Semana" value={formatBRL(stats.week)} />
        <Kpi label="Mês" value={formatBRL(stats.month)} />
      </div>

      <div className="px-5 mt-5">
        <div className="p-5 bg-card rounded-3xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Faturamento — 7 dias</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> últimos dias
            </span>
          </div>
          <div className="h-28 flex items-end justify-between gap-1.5">
            {stats.bars.map((v, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-sm ${i === stats.bars.length - 1 ? "bg-foreground" : "bg-muted-foreground/20"}`}
                style={{ height: `${(v / maxBar) * 100 || 4}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            {stats.bars.map((_, i) => {
              const d = addDaysISO(today, -6 + i);
              const [y, m, dd] = d.split("-").map(Number);
              return (
                <span key={i} className="flex-1 text-center">
                  {new Date(y, m - 1, dd)
                    .toLocaleDateString("pt-BR", { weekday: "short" })
                    .replace(".", "")
                    .slice(0, 3)}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
            Próximos horários
          </h2>
          <Link to="/pro/agenda" className="text-xs font-medium">Ver todos</Link>
        </div>
        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-4">
              Nenhum horário marcado.
            </p>
          )}
          {upcoming.map((a) => {
            const s = provider.services.find((x) => x.id === a.serviceId);
            return (
              <div key={a.id} className="flex gap-4 items-start">
                <div className="w-14 pt-1 text-right shrink-0">
                  <p className="text-sm font-semibold">{a.start}</p>
                  <p className="text-[10px] text-muted-foreground">{a.date.slice(5)}</p>
                </div>
                <div className="flex-1 p-4 bg-surface-elevated rounded-2xl border border-border">
                  <p className="text-sm font-medium truncate">{a.clientName}</p>
                  <p className="text-xs text-muted-foreground truncate">{s?.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-6" />
    </Screen>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-card rounded-2xl border border-border">
      <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
        {label}
      </span>
      <p className="text-sm font-semibold mt-1 truncate">{value}</p>
    </div>
  );
}