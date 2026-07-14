import { create } from "zustand";
import { persist } from "zustand/middleware";
import { seedProviders, type Provider, type Service, type WorkingHours } from "./mock";

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export type Appointment = {
  id: string;
  providerId: string;
  serviceId: string;
  clientId: string;
  clientName: string;
  clientContact: string;
  date: string; // yyyy-MM-dd
  start: string; // HH:MM
  end: string; // HH:MM
  status: AppointmentStatus;
  createdAt: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  contact: string;
  role: "client" | "provider";
  providerId?: string;
};

type State = {
  currentUser: User | null;
  providers: Provider[];
  appointments: Appointment[];
  login: (email: string, password: string) => { ok: boolean; error?: string };
  signup: (input: {
    name: string;
    email: string;
    password: string;
    contact: string;
    role: "client" | "provider";
    businessName?: string;
  }) => { ok: boolean; error?: string };
  logout: () => void;
  addAppointment: (a: Omit<Appointment, "id" | "createdAt" | "status"> & { status?: AppointmentStatus }) => Appointment;
  cancelAppointment: (id: string) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  addService: (providerId: string, s: Omit<Service, "id">) => void;
  updateService: (providerId: string, s: Service) => void;
  removeService: (providerId: string, serviceId: string) => void;
  setWorkingHours: (providerId: string, wh: WorkingHours) => void;
  addPortfolio: (providerId: string, url: string) => void;
  removePortfolio: (providerId: string, url: string) => void;
};

type Creds = { email: string; password: string; userId: string };

const rid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      currentUser: null,
      providers: seedProviders,
      appointments: [],
      login: (email, password) => {
        const creds = (get() as State & { _creds?: Creds[] })._creds ?? [];
        const match = creds.find((c) => c.email === email && c.password === password);
        if (!match) return { ok: false, error: "Credenciais inválidas" };
        const users = (get() as State & { _users?: User[] })._users ?? [];
        const user = users.find((u) => u.id === match.userId);
        if (!user) return { ok: false, error: "Usuário não encontrado" };
        set({ currentUser: user });
        return { ok: true };
      },
      signup: ({ name, email, password, contact, role, businessName }) => {
        const s = get() as State & { _creds?: Creds[]; _users?: User[] };
        const creds = s._creds ?? [];
        if (creds.some((c) => c.email === email)) return { ok: false, error: "E-mail já cadastrado" };
        const userId = rid();
        let providerId: string | undefined;
        if (role === "provider") {
          providerId = "p" + rid();
          const newProvider: Provider = {
            id: providerId,
            name: businessName || name,
            category: "Novo estabelecimento",
            contact,
            address: "",
            logo: "",
            rating: 5.0,
            portfolio: [],
            services: [],
            workingHours: {
              0: { enabled: false, start: "09:00", end: "18:00" },
              1: { enabled: true, start: "09:00", end: "19:00" },
              2: { enabled: true, start: "09:00", end: "19:00" },
              3: { enabled: true, start: "09:00", end: "19:00" },
              4: { enabled: true, start: "09:00", end: "19:00" },
              5: { enabled: true, start: "09:00", end: "19:00" },
              6: { enabled: false, start: "09:00", end: "16:00" },
            },
          };
          set({ providers: [...get().providers, newProvider] });
        }
        const user: User = { id: userId, name, email, contact, role, providerId };
        (set as (p: Partial<State> & Record<string, unknown>) => void)({
          currentUser: user,
          _creds: [...creds, { email, password, userId }],
          _users: [...(s._users ?? []), user],
        });
        return { ok: true };
      },
      logout: () => set({ currentUser: null }),
      addAppointment: (a) => {
        const app: Appointment = {
          ...a,
          id: rid(),
          status: a.status ?? "confirmed",
          createdAt: Date.now(),
        };
        set({ appointments: [...get().appointments, app] });
        return app;
      },
      cancelAppointment: (id) =>
        set({
          appointments: get().appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a,
          ),
        }),
      updateProvider: (id, patch) =>
        set({
          providers: get().providers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }),
      addService: (providerId, s) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId
              ? { ...p, services: [...p.services, { ...s, id: "s" + rid() }] }
              : p,
          ),
        }),
      updateService: (providerId, s) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId
              ? { ...p, services: p.services.map((x) => (x.id === s.id ? s : x)) }
              : p,
          ),
        }),
      removeService: (providerId, serviceId) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId
              ? { ...p, services: p.services.filter((x) => x.id !== serviceId) }
              : p,
          ),
        }),
      setWorkingHours: (providerId, wh) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId ? { ...p, workingHours: wh } : p,
          ),
        }),
      addPortfolio: (providerId, url) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId ? { ...p, portfolio: [...p.portfolio, url] } : p,
          ),
        }),
      removePortfolio: (providerId, url) =>
        set({
          providers: get().providers.map((p) =>
            p.id === providerId
              ? { ...p, portfolio: p.portfolio.filter((x) => x !== url) }
              : p,
          ),
        }),
    }),
    {
      name: "agendapro-store",
      version: 1,
    },
  ),
);

export const useHydrated = () => {
  // zustand/persist hydrates async; expose helper if needed
  return true;
};