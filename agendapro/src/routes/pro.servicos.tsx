import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { formatBRL } from "@/lib/slots";
import { Screen, ScreenHeader } from "@/components/Screen";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/servicos")({
  component: ProServicos,
});

function ProServicos() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const addService = useStore((s) => s.addService);
  const removeService = useStore((s) => s.removeService);
  const provider = providers.find((p) => p.id === user?.providerId);

  const [form, setForm] = useState({ name: "", description: "", duration: 30, price: 0 });

  if (!provider) return null;

  return (
    <Screen>
      <ScreenHeader title="Serviços" subtitle={`${provider.services.length} cadastrados`} />

      <div className="px-5 space-y-2 mb-6">
        {provider.services.map((s) => (
          <div key={s.id} className="p-4 bg-card border border-border rounded-2xl flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {s.duration} min · {formatBRL(s.price)}
              </p>
            </div>
            <button
              onClick={() => {
                removeService(provider.id, s.id);
                toast.success("Serviço removido");
              }}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="px-5">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
          Novo serviço
        </h2>
        <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
          <Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input
            label="Descrição"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duração (min)"
              type="number"
              value={String(form.duration)}
              onChange={(v) => setForm({ ...form, duration: Number(v) || 0 })}
            />
            <Input
              label="Preço (R$)"
              type="number"
              value={String(form.price)}
              onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
            />
          </div>
          <button
            onClick={() => {
              if (!form.name || !form.duration || !form.price) return toast.error("Preencha todos os campos");
              addService(provider.id, form);
              setForm({ name: "", description: "", duration: 30, price: 0 });
              toast.success("Serviço adicionado");
            }}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar serviço
          </button>
        </div>
      </div>
    </Screen>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-surface-elevated rounded-xl py-2.5 px-3 text-sm border border-border focus:outline-none focus:border-foreground/30"
      />
    </label>
  );
}