import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { addDaysISO, addMinutes, computeSlots, formatBRDate, formatBRL, isoToday } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { toast } from "sonner";
import { MessageCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/book/$providerId/$serviceId")({
  component: BookPage,
});

function BookPage() {
  const { providerId, serviceId } = Route.useParams();
  const nav = useNavigate();
  const provider = useStore((s) => s.providers.find((p) => p.id === providerId));
  const appointments = useStore((s) => s.appointments);
  const user = useStore((s) => s.currentUser);
  const addAppointment = useStore((s) => s.addAppointment);

  if (!provider) throw notFound();
  const service = provider.services.find((s) => s.id === serviceId);
  if (!service) throw notFound();

  const today = isoToday();
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDaysISO(today, i)), [today]);
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<null | { id: string; date: string; start: string; end: string }>(null);
  const [guestName, setGuestName] = useState(user?.name ?? "");
  const [guestContact, setGuestContact] = useState(user?.contact ?? "");

  const slots = useMemo(
    () => computeSlots(provider, service, date, appointments),
    [provider, service, date, appointments],
  );

  const confirm = () => {
    if (!slot) return toast.error("Escolha um horário");
    if (!guestName || !guestContact) return toast.error("Informe seu nome e WhatsApp");
    const end = addMinutes(slot, service.duration);
    const appt = addAppointment({
      providerId: provider.id,
      serviceId: service.id,
      clientId: user?.id ?? "guest",
      clientName: guestName,
      clientContact: guestContact.replace(/\D/g, ""),
      date,
      start: slot,
      end,
    });
    setConfirmed({ id: appt.id, date, start: slot, end });
  };

  if (confirmed) {
    const msg = encodeURIComponent(
      `Olá ${provider.name}! Confirmo meu agendamento:\n\n` +
        `• Serviço: ${service.name}\n` +
        `• Data: ${formatBRDate(confirmed.date)}\n` +
        `• Horário: ${confirmed.start} — ${confirmed.end}\n` +
        `• Valor: ${formatBRL(service.price)}\n` +
        `• Cliente: ${guestName}`,
    );
    const wa = `https://wa.me/${provider.contact}?text=${msg}`;

    return (
      <Screen bottomTab={false}>
        <ScreenHeader title="Agendado" back="/" />
        <div className="px-5 space-y-6">
          <div className="p-6 bg-card border border-border rounded-3xl text-center">
            <div className="size-14 mx-auto rounded-full bg-success/15 grid place-items-center mb-3">
              <CheckCircle2 className="w-7 h-7" style={{ color: "var(--success)" }} />
            </div>
            <p className="text-lg font-semibold">Reserva confirmada</p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatBRDate(confirmed.date)} · {confirmed.start} — {confirmed.end}
            </p>
          </div>

          <div className="p-5 bg-card border border-border rounded-3xl space-y-2 text-sm">
            <Row k="Estabelecimento" v={provider.name} />
            <Row k="Serviço" v={service.name} />
            <Row k="Duração" v={`${service.duration} min`} />
            <Row k="Valor" v={formatBRL(service.price)} />
          </div>

          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            <MessageCircle className="w-4 h-4" /> Enviar confirmação por WhatsApp
          </a>

          <Link
            to="/agenda"
            className="block text-center text-sm text-muted-foreground"
          >
            Ver minha agenda
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen bottomTab={false}>
      <ScreenHeader title={service.name} subtitle={provider.name} back={`/provider/${provider.id}`} />

      <div className="px-5 pb-4">
        <div className="p-4 bg-card border border-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Duração</p>
            <p className="font-medium">{service.duration} min</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Valor</p>
            <p className="font-semibold">{formatBRL(service.price)}</p>
          </div>
        </div>
      </div>

      <section className="pb-4">
        <h2 className="px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Escolha a data
        </h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5">
          {days.map((d) => {
            const [y, m, dd] = d.split("-").map(Number);
            const dt = new Date(y, m - 1, dd);
            const active = d === date;
            return (
              <button
                key={d}
                onClick={() => {
                  setDate(d);
                  setSlot(null);
                }}
                className={`shrink-0 w-16 py-3 rounded-2xl border text-center transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider opacity-70">
                  {dt.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}
                </span>
                <span className="block text-lg font-semibold">{dt.getDate()}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Horários disponíveis
        </h2>
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-2xl p-4">
            Sem horários livres neste dia.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => setSlot(s)}
                className={`py-3 rounded-xl text-sm font-medium border transition-colors ${
                  slot === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 pb-6 space-y-3">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
          Seus dados
        </h2>
        <input
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Nome completo"
          className="w-full bg-card rounded-2xl py-3 px-4 text-sm border border-border focus:outline-none focus:border-foreground/30"
        />
        <input
          value={guestContact}
          onChange={(e) => setGuestContact(e.target.value)}
          placeholder="WhatsApp (5511...)"
          className="w-full bg-card rounded-2xl py-3 px-4 text-sm border border-border focus:outline-none focus:border-foreground/30"
        />
      </section>

      <div className="sticky bottom-0 p-5 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={confirm}
          disabled={!slot}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
        >
          {slot ? `Confirmar ${slot}` : "Escolha um horário"}
        </button>
      </div>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}