import portfolioBarber from "@/assets/portfolio-barber.jpg";
import portfolioClinic from "@/assets/portfolio-clinic.jpg";
import portfolioSalon from "@/assets/portfolio-salon.jpg";
import logoMarcus from "@/assets/logo-marcus.jpg";
import logoElena from "@/assets/logo-elena.jpg";
import logoLuna from "@/assets/logo-luna.jpg";

export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
};

export type DayHours = {
  enabled: boolean;
  start: string; // "HH:MM"
  end: string;
};

// 0 = Sunday .. 6 = Saturday
export type WorkingHours = Record<number, DayHours>;

export const WEEK_DAYS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export type Provider = {
  id: string;
  name: string;
  category: string;
  contact: string; // whatsapp with country code, digits only
  address: string;
  logo: string;
  rating: number;
  portfolio: string[];
  services: Service[];
  workingHours: WorkingHours;
};

const defaultHours = (): WorkingHours => ({
  0: { enabled: false, start: "09:00", end: "18:00" },
  1: { enabled: true, start: "09:00", end: "19:00" },
  2: { enabled: true, start: "09:00", end: "19:00" },
  3: { enabled: true, start: "09:00", end: "19:00" },
  4: { enabled: true, start: "09:00", end: "20:00" },
  5: { enabled: true, start: "09:00", end: "20:00" },
  6: { enabled: true, start: "09:00", end: "16:00" },
});

export const seedProviders: Provider[] = [
  {
    id: "p1",
    name: "Marcus Vinícius",
    category: "Corte & Barba",
    contact: "5511999990001",
    address: "R. Oscar Freire, 500 — Jardins, São Paulo",
    logo: logoMarcus,
    rating: 4.9,
    portfolio: [portfolioBarber, portfolioSalon],
    workingHours: defaultHours(),
    services: [
      { id: "s1", name: "Corte Social", description: "Corte clássico com acabamento.", duration: 45, price: 85 },
      { id: "s2", name: "Barba Terapia", description: "Barba com toalha quente e óleos.", duration: 30, price: 55 },
      { id: "s3", name: "Combo Corte + Barba", description: "Pacote completo.", duration: 75, price: 130 },
    ],
  },
  {
    id: "p2",
    name: "Elena Studio",
    category: "Colorimetria & Hair",
    contact: "5511999990002",
    address: "R. Haddock Lobo, 220 — Cerqueira César",
    logo: logoElena,
    rating: 5.0,
    portfolio: [portfolioSalon, portfolioClinic],
    workingHours: defaultHours(),
    services: [
      { id: "s4", name: "Coloração", description: "Coloração completa personalizada.", duration: 90, price: 220 },
      { id: "s5", name: "Escova Modeladora", description: "Escova com finalização.", duration: 45, price: 90 },
      { id: "s6", name: "Hidratação Premium", description: "Tratamento profundo.", duration: 60, price: 140 },
    ],
  },
  {
    id: "p3",
    name: "Luna Aesthetics",
    category: "Estética Facial",
    contact: "5511999990003",
    address: "Al. Lorena, 1400 — Jardins",
    logo: logoLuna,
    rating: 4.8,
    portfolio: [portfolioClinic, portfolioBarber],
    workingHours: defaultHours(),
    services: [
      { id: "s7", name: "Limpeza de Pele", description: "Limpeza profunda com extração.", duration: 60, price: 180 },
      { id: "s8", name: "Peeling Químico", description: "Renovação celular.", duration: 45, price: 250 },
    ],
  },
];