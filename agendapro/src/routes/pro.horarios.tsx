import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Screen, ScreenHeader } from "@/components/Screen";
import { WEEK_DAYS, type WorkingHours } from "@/lib/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/horarios")({
  component: ProHorarios,
});

function ProHorarios() {
  const user = useStore((s) => s.currentUser);
  const providers = useStore((s) => s.providers);
  const setWorkingHours = useStore((s) => s.setWorkingHours);
  const provider = providers.find((p) => p.id === user?.providerId);

  const [wh, setWh] = useState<WorkingHours>(provider?.workingHours ?? ({} as WorkingHours));

  if (!provider) return null;

  const update = (day: number, patch: Partial<{ enabled: boolean; start: string; end: string }>) => {
    setWh({ ...wh, [day]: { ...wh[day], ...patch } });
  };

  return (
    <Screen>
      <ScreenHeader title="Horários" subtitle="Dias e intervalos de atendimento" />
      <div className="px-5 space-y-2">
        {WEEK_DAYS.map((d, i) => (
          <div key={i} className="p-4 bg-card border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="font-medium">{d}</span>
              <button
                onClick={() => update(i, { enabled: !wh[i]?.enabled })}
                className={`w-11 h-6 rounded-full relative transition-colors ${
                  wh[i]?.enabled ? "bg-foreground" : "bg-border"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${
                    wh[i]?.enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
            {wh[i]?.enabled && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Abre</span>
                  <input
                    type="time"
                    value={wh[i].start}
                    onChange={(e) => update(i, { start: e.target.value })}
                    className="w-full mt-1 bg-surface-elevated rounded-xl py-2.5 px-3 text-sm border border-border focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Fecha</span>
                  <input
                    type="time"
                    value={wh[i].end}
                    onChange={(e) => update(i, { end: e.target.value })}
                    className="w-full mt-1 bg-surface-elevated rounded-xl py-2.5 px-3 text-sm border border-border focus:outline-none"
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => {
            setWorkingHours(provider.id, wh);
            toast.success("Horários salvos");
          }}
          className="w-full py-3.5 mt-4 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold"
        >
          Salvar horários
        </button>
      </div>
    </Screen>
  );
}