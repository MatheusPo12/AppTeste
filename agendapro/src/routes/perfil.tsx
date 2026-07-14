import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { Screen, ScreenHeader } from "@/components/Screen";
import { BottomTab } from "@/components/BottomTab";
import { LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const nav = useNavigate();
  const user = useStore((s) => s.currentUser);
  const logout = useStore((s) => s.logout);

  if (!user) {
    return (
      <Screen>
        <ScreenHeader title="Perfil" />
        <div className="px-5">
          <div className="p-6 bg-card border border-border rounded-3xl text-center">
            <UserIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              Entre para gerenciar seus agendamentos.
            </p>
            <Link
              to="/auth"
              className="inline-block px-5 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              Entrar ou criar conta
            </Link>
          </div>
        </div>
        <BottomTab variant="client" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title={user.name} subtitle={user.email} />
      <div className="px-5 space-y-3">
        <div className="p-4 bg-card border border-border rounded-2xl space-y-2 text-sm">
          <Row k="WhatsApp" v={user.contact || "—"} />
          <Row k="Perfil" v={user.role === "provider" ? "Prestador" : "Cliente"} />
        </div>

        {user.role === "provider" && (
          <Link
            to="/pro"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium flex-1">Ir para o painel do prestador</span>
          </Link>
        )}

        <button
          onClick={() => {
            logout();
            nav({ to: "/" });
          }}
          className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-2xl text-destructive"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
      <BottomTab variant="client" />
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