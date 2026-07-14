import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Calendar, User, LayoutDashboard, Scissors, Clock, Store } from "lucide-react";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const clientItems: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/agenda", label: "Agenda", icon: Calendar },
  { to: "/perfil", label: "Perfil", icon: User },
];

const proItems: Item[] = [
  { to: "/pro", label: "Painel", icon: LayoutDashboard },
  { to: "/pro/agenda", label: "Agenda", icon: Calendar },
  { to: "/pro/servicos", label: "Serviços", icon: Scissors },
  { to: "/pro/horarios", label: "Horários", icon: Clock },
  { to: "/pro/estabelecimento", label: "Loja", icon: Store },
];

export function BottomTab({ variant }: { variant: "client" | "pro" }) {
  const items = variant === "pro" ? proItems : clientItems;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/pro" ? path === "/pro" : path === to || path.startsWith(to + "/"));

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="h-20 border-t border-border bg-background/85 backdrop-blur-xl flex items-center justify-around px-4 pb-4 pt-2">
          {items.map((it) => {
            const active = isActive(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex flex-col items-center gap-1 flex-1 transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-tight">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}