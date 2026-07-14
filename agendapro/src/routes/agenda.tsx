import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { formatBRDate, formatBRL } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { BottomTab } from "@/components/BottomTab";
import { MessageCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/agenda")({
  component: AgendaPage,
});

function AgendaPage() {
  const user = useStore((s) => s.currentUser);
  const appts = useStore((s) => s.appointments);
  const providers = useStore((s) => s.providers);
  const cancel = useStore((s) => s.cancelAppointment);

  const mine = appts
    .filter((a) => (user ? a.clientId === user.id : true))
    .sort((a, b) => (a.date + a.start > b.date + b.start ? 1 : -1));

  return (
    <Screen>
      <ScreenHeader title="Minha agenda" subtitle={`${mine.length} agendamentos`} />

      <div className="px-5 space-y-3">
        {mine.length === 0 && (
          <div className="p-6 bg-card border border-border rounded-3xl text-center">
            <p className="text-sm text-muted-foreground">Nenhum agendamento ainda.</p>
            <Link to="/" className="inline-block mt-4 text-sm font-medium underline">
              Explorar profissionais
            </Link>
          </div>
        )}

        {mine.map((a) => {
          const provider = providers.find((p) => p.id === a.providerId);
          const service = provider?.services.find((s) => s.id === a.serviceId);
          if (!provider || !service) return null;
          const wa = `https://wa.me/${provider.contact}?text=${encodeURIComponent(
            `Olá ${provider.name}, sobre meu agendamento em ${formatBRDate(a.date)} às ${a.start}.`,
          )}`;
          return (
            <div
              key={a.id}
              className={`p-4 bg-card border border-border rounded-3xl space-y-3 ${
                a.status === "cancelled" ? "opacity-50" : ""
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {formatBRDate(a.date)} · {a.start} — {a.end}
                  </p>
                  <p className="font-medium mt-1 truncate">{service.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{provider.name}</p>
                </div>
                <span className="text-sm font-semibold shrink-0">{formatBRL(service.price)}</span>
              </div>
              {a.status === "confirmed" && (
                <div className="flex gap-2">
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-surface-elevated text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  <button
                    onClick={() => {
                      cancel(a.id);
                      toast.success("Agendamento cancelado");
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-1.5 text-muted-foreground"
                  >
                    <XCircle className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              )}
              {a.status === "cancelled" && (
                <p className="text-xs text-center text-muted-foreground">Cancelado</p>
              )}
            </div>
          );
        })}
      </div>

      <BottomTab variant="client" />
    </Screen>
  );
}