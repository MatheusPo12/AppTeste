import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, Clock, Phone } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatBRL } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { WEEK_DAYS } from "@/lib/mock";

export const Route = createFileRoute("/provider/$id")({
  component: ProviderPage,
});

function ProviderPage() {
  const { id } = Route.useParams();
  const provider = useStore((s) => s.providers.find((p) => p.id === id));
  if (!provider) throw notFound();

  return (
    <Screen bottomTab={false}>
      {provider.portfolio[0] && (
        <div className="relative h-56">
          <img
            src={provider.portfolio[0]}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}
      <ScreenHeader title={provider.name} subtitle={provider.category} back="/" />

      <div className="px-5 space-y-3 pb-6">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 text-foreground">
            <Star className="w-3.5 h-3.5 fill-current" /> {provider.rating.toFixed(1)}
          </span>
          {provider.address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5" /> {provider.address}
            </span>
          )}
        </div>
        {provider.contact && (
          <a
            href={`https://wa.me/${provider.contact}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Phone className="w-3.5 h-3.5" /> WhatsApp: {provider.contact}
          </a>
        )}
      </div>

      <section className="px-5 pb-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Serviços
        </h2>
        <div className="space-y-2">
          {provider.services.map((s) => (
            <Link
              key={s.id}
              to="/book/$providerId/$serviceId"
              params={{ providerId: provider.id, serviceId: s.id }}
              className="block p-4 bg-card rounded-2xl border border-border hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {s.duration} min
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0">{formatBRL(s.price)}</span>
              </div>
            </Link>
          ))}
          {provider.services.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
          )}
        </div>
      </section>

      <section className="px-5 pb-6">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Horário de funcionamento
        </h2>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
          {WEEK_DAYS.map((d, i) => {
            const h = provider.workingHours[i];
            return (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d}</span>
                <span>{h?.enabled ? `${h.start} — ${h.end}` : "Fechado"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {provider.portfolio.length > 1 && (
        <section className="px-5 pb-10">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
            Portfólio
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {provider.portfolio.map((url, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </Screen>
  );
}