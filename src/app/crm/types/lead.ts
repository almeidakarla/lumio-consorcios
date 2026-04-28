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

export type LeadType = (typeof LEAD_TYPES)[number];

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  type: LeadType;
  interest: string;
  notes: string;
  rentValue?: number;
  city: string;
  neighborhood: string;
  funnelStage: FunnelStage;
}

export type LeadFormData = Omit<Lead, "id" | "createdAt">;
