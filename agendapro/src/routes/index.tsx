import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Search, Star, MapPin } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatBRL } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { BottomTab } from "@/components/BottomTab";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const providers = useStore((s) => s.providers);
  const user = useStore((s) => s.currentUser);
  const [q, setQ] = useState("");

  const filtered = providers.filter(
    (p) =>
      !q ||
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()) ||
      p.services.some((s) => s.name.toLowerCase().includes(q.toLowerCase())),
  );

  const allPortfolio = providers.flatMap((p) => p.portfolio.map((url) => ({ url, provider: p })));

  return (
    <Screen>
      <ScreenHeader
        title="Olá,"
        subtitle={user ? user.name : "encontre profissionais premium"}
        right={
          user ? (
            <Link
              to="/perfil"
              className="size-11 rounded-full bg-card border border-border grid place-items-center text-sm font-medium"
            >
              {user.name.charAt(0).toUpperCase()}
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-full bg-primary text-primary-foreground"
            >
              Entrar
            </Link>
          )
        }
      />

      <div className="px-5 pb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar serviços ou profissionais"
            className="w-full bg-card rounded-2xl py-3.5 pl-10 pr-4 text-sm border border-border focus:outline-none focus:border-foreground/30 placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      <section className="pb-6">
        <h2 className="px-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Portfólio · Trabalhos recentes
        </h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {allPortfolio.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem fotos ainda.</p>
          ) : (
            allPortfolio.map(({ url, provider }, i) => (
              <Link
                key={i}
                to="/provider/$id"
                params={{ id: provider.id }}
                className="shrink-0 w-60 aspect-[3/2] rounded-2xl overflow-hidden border border-border relative group"
              >
                <img src={url} alt={provider.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-medium text-white">{provider.name}</p>
                  <p className="text-[10px] text-white/70">{provider.category}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="px-5 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em]">
            Profissionais em destaque
          </h2>
          <span className="text-[11px] text-muted-foreground">{filtered.length} resultados</span>
        </div>

        <div className="space-y-3">
          {filtered.map((p) => (
            <Link
              key={p.id}
              to="/provider/$id"
              params={{ id: p.id }}
              className="block p-4 bg-card rounded-3xl border border-border transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center gap-3">
                <div className="size-14 rounded-2xl bg-surface-elevated overflow-hidden border border-border shrink-0 grid place-items-center">
                  {p.logo ? (
                    <img src={p.logo} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-lg font-semibold">{p.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-medium truncate">{p.name}</h3>
                    <span className="text-xs font-medium flex items-center gap-1 shrink-0">
                      <Star className="w-3 h-3 fill-current" /> {p.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{p.category}</p>
                </div>
              </div>
              {p.services.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.services.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-1 bg-surface-elevated text-[11px] font-medium rounded-md text-muted-foreground"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3" /> {p.address || "Endereço não informado"}
                </span>
                {p.services.length > 0 && (
                  <span className="text-sm font-semibold shrink-0">
                    a partir de {formatBRL(Math.min(...p.services.map((s) => s.price)))}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BottomTab variant="client" />
    </Screen>
  );
}
