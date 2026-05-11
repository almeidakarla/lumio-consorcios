export const FUNNEL_STAGES = [
  "Novo Lead",
  "Em Prospecção IA",
  "Em Prospecção Humano",
  "Reunião Agendada",
  "Proposta Enviada",
  "Ganho",
  "Perdido",
  "Sem interesse",
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const LEAD_TYPES = [
  "Locatário",
  "Inquilino",
  "Lead",
  "Indicação",
] as const;

export const INTERESSE_OPTIONS = [
  "Apartamento",
  "Casa",
  "Cobertura",
  "Terreno",
  "Studio",
  "Apartamento Garden",
  "Chácara",
  "Fazenda",
  "Loja",
  "Sítio",
] as const;

export type InteresseOption = (typeof INTERESSE_OPTIONS)[number];

export type LeadType = (typeof LEAD_TYPES)[number];

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  type: LeadType;
  broker: string;
  origin: string;
  interest: string;
  value?: number;
  city: string;
  neighborhood: string;
  funnelStage: FunnelStage;
}

export type LeadFormData = Omit<Lead, "id" | "createdAt">;
