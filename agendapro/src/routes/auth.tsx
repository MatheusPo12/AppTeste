import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Screen, ScreenHeader } from "@/components/Screen";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const login = useStore((s) => s.login);
  const signup = useStore((s) => s.signup);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"client" | "provider">("client");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    contact: "",
    businessName: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const r = login(form.email, form.password);
      if (!r.ok) return toast.error(r.error!);
      toast.success("Bem-vindo de volta");
      const user = useStore.getState().currentUser;
      nav({ to: user?.role === "provider" ? "/pro" : "/" });
    } else {
      if (!form.name || !form.email || !form.password) return toast.error("Preencha nome, e-mail e senha");
      const r = signup({ ...form, role });
      if (!r.ok) return toast.error(r.error!);
      toast.success("Conta criada");
      nav({ to: role === "provider" ? "/pro/estabelecimento" : "/" });
    }
  };

  return (
    <Screen bottomTab={false}>
      <ScreenHeader title={mode === "login" ? "Entrar" : "Criar conta"} back="/" />
      <div className="px-5">
        <div className="grid grid-cols-2 p-1 bg-card rounded-2xl border border-border mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2.5 text-sm font-medium rounded-xl transition-colors ${
                mode === m ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(["client", "provider"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-3 text-sm font-medium rounded-2xl border transition-colors ${
                  role === r
                    ? "border-foreground bg-surface-elevated"
                    : "border-border text-muted-foreground"
                }`}
              >
                {r === "client" ? "Sou cliente" : "Sou prestador"}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Field
                label="Nome"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              {role === "provider" && (
                <Field
                  label="Nome do estabelecimento"
                  value={form.businessName}
                  onChange={(v) => setForm({ ...form, businessName: v })}
                />
              )}
              <Field
                label="WhatsApp"
                placeholder="5511999990000"
                value={form.contact}
                onChange={(v) => setForm({ ...form, contact: v.replace(/\D/g, "") })}
              />
            </>
          )}
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label="Senha"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
          />

          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Protótipo — os dados ficam no seu dispositivo.
        </p>
      </div>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1.5 bg-card rounded-2xl py-3 px-4 text-sm border border-border focus:outline-none focus:border-foreground/30"
      />
    </label>
  );
}