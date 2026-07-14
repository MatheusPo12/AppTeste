import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Screen, ScreenHeader } from "@/components/Screen";
import { Plus, Trash2, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/estabelecimento")({
  component: ProEstabelecimento,
});

function ProEstabelecimento() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const updateProvider = useStore((s) => s.updateProvider);
  const addPortfolio = useStore((s) => s.addPortfolio);
  const removePortfolio = useStore((s) => s.removePortfolio);
  const provider = providers.find((p) => p.id === user?.providerId);

  const [form, setForm] = useState({
    name: provider?.name ?? "",
    category: provider?.category ?? "",
    contact: provider?.contact ?? "",
    address: provider?.address ?? "",
    logo: provider?.logo ?? "",
  });
  const [newPhoto, setNewPhoto] = useState("");

  if (!provider) return null;

  const readFile = (file: File, cb: (dataUrl: string) => void) => {
    const r = new FileReader();
    r.onload = () => cb(r.result as string);
    r.readAsDataURL(file);
  };

  return (
    <Screen>
      <ScreenHeader title="Estabelecimento" subtitle="Informações públicas" />

      <div className="px-5 space-y-3">
        <div className="p-4 bg-card border border-border rounded-2xl space-y-3">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl overflow-hidden border border-border bg-surface-elevated grid place-items-center">
              {form.logo ? (
                <img src={form.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-semibold">{form.name.charAt(0) || "?"}</span>
              )}
            </div>
            <label className="text-xs font-medium text-muted-foreground underline cursor-pointer">
              Trocar logo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) readFile(f, (url) => setForm({ ...form, logo: url }));
                }}
              />
            </label>
          </div>

          <Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input
            label="Categoria"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
          />
          <Input
            label="WhatsApp (com DDI)"
            value={form.contact}
            onChange={(v) => setForm({ ...form, contact: v.replace(/\D/g, "") })}
          />
          <Input label="Endereço" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />

          <button
            onClick={() => {
              updateProvider(provider.id, form);
              toast.success("Salvo");
            }}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
          >
            Salvar informações
          </button>
        </div>

        <Link
          to="/pro/historico"
          className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl"
        >
          <History className="w-5 h-5" />
          <span className="text-sm font-medium flex-1">Ver histórico de atendimentos</span>
        </Link>

        <div className="p-4 bg-card border border-border rounded-2xl">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.14em] mb-3">
            Portfólio
          </h2>
          {provider.portfolio.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {provider.portfolio.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border relative group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePortfolio(provider.id, url)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/80 border border-border"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="w-full py-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground flex items-center justify-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Enviar foto do portfólio
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f)
                  readFile(f, (url) => {
                    addPortfolio(provider.id, url);
                    toast.success("Foto adicionada");
                  });
              }}
            />
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={newPhoto}
              onChange={(e) => setNewPhoto(e.target.value)}
              placeholder="ou cole URL da imagem"
              className="flex-1 bg-surface-elevated rounded-xl py-2 px-3 text-xs border border-border focus:outline-none"
            />
            <button
              onClick={() => {
                if (!newPhoto) return;
                addPortfolio(provider.id, newPhoto);
                setNewPhoto("");
                toast.success("Foto adicionada");
              }}
              className="px-3 rounded-xl bg-surface-elevated text-xs font-medium border border-border"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 bg-surface-elevated rounded-xl py-2.5 px-3 text-sm border border-border focus:outline-none focus:border-foreground/30"
      />
    </label>
  );
}