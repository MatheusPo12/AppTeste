import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { BottomTab } from "@/components/BottomTab";

export const Route = createFileRoute("/pro")({
  component: ProLayout,
});

function ProLayout() {
  const user = useStore((s) => s.currentUser);
  const nav = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "provider") {
      nav({ to: "/auth" });
    }
  }, [user, nav]);

  if (!user || user.role !== "provider") {
    return (
      <div className="app-shell grid place-items-center min-h-dvh px-6 text-center">
        <p className="text-sm text-muted-foreground">Redirecionando para login…</p>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <BottomTab variant="pro" />
    </>
  );
}