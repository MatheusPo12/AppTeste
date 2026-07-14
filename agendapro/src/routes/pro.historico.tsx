import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { formatBRDate, formatBRL, isoToday } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";

export const Route = createFileRoute("/pro/historico")({
  component: ProHistorico,
});

function ProHistorico() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const appts = useStore((s) => s.appointments);
  const provider = providers.find((p) => p.id === user?.providerId);

  if (!provider) return null;
  const today = isoToday();
  const past = appts
    .filter((a) => a.providerId === provider.id && a.date < today)
    .sort((a, b) => (a.date + a.start < b.date + b.start ? 1 : -1));

  const total = past
    .filter((a) => a.status !== "cancelled")
    .reduce(
      (acc, a) => acc + (provider.services.find((s) => s.id === a.serviceId)?.price ?? 0),
      0,
    );

  return (
    <Screen>
      <ScreenHeader title="Histórico" back="/pro/estabelecimento" subtitle={`${past.length} atendimentos · ${formatBRL(total)}`} />
      <div className="px-5 space-y-2">
        {past.length === 0 && (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-4 text-center">
            Nenhum atendimento passado ainda.
          </p>
        )}
        {past.map((a) => {
          const s = provider.services.find((x) => x.id === a.serviceId);
          return (
            <div key={a.id} className="p-4 bg-card border border-border rounded-2xl flex justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {formatBRDate(a.date)} · {a.start}
                </p>
                <p className="font-medium truncate">{a.clientName}</p>
                <p className="text-xs text-muted-foreground truncate">{s?.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{formatBRL(s?.price ?? 0)}</p>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {a.status === "cancelled" ? "Cancelado" : "Concluído"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}