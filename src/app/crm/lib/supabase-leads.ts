import { createClient } from "@/lib/supabase/client";
import { DbLead, DbLeadInsert, DbLeadUpdate } from "@/lib/supabase/database.types";
import { Lead, LeadFormData, FunnelStage } from "../types/lead";

// Convert database lead to app lead
export function dbLeadToLead(dbLead: DbLead): Lead {
  return {
    id: dbLead.id,
    createdAt: dbLead.created_at,
    name: dbLead.name,
    phone: dbLead.phone || "",
    email: dbLead.email || "",
    type: dbLead.type as Lead["type"],
    broker: dbLead.broker || "",
    origin: dbLead.origin || "",
    interest: dbLead.interest || "",
    value: dbLead.value ?? undefined,
    city: dbLead.city || "",
    neighborhood: dbLead.neighborhood || "",
    funnelStage: dbLead.funnel_stage as FunnelStage,
  };
}

// Convert app lead to database insert
export function leadToDbInsert(lead: LeadFormData, userId: string): DbLeadInsert {
  return {
    user_id: userId,
    name: lead.name,
    phone: lead.phone || null,
    email: lead.email || null,
    type: lead.type,
    broker: lead.broker || null,
    origin: lead.origin || null,
    interest: lead.interest || null,
    value: lead.value ?? null,
    city: lead.city || null,
    neighborhood: lead.neighborhood || null,
    funnel_stage: lead.funnelStage,
  };
}

// Convert partial lead update to database update
export function leadToDbUpdate(data: Partial<LeadFormData>): DbLeadUpdate {
  const update: DbLeadUpdate = {};

  if (data.name !== undefined) update.name = data.name;
  if (data.phone !== undefined) update.phone = data.phone || null;
  if (data.email !== undefined) update.email = data.email || null;
  if (data.type !== undefined) update.type = data.type;
  if (data.broker !== undefined) update.broker = data.broker || null;
  if (data.origin !== undefined) update.origin = data.origin || null;
  if (data.interest !== undefined) update.interest = data.interest || null;
  if (data.value !== undefined) update.value = data.value ?? null;
  if (data.city !== undefined) update.city = data.city || null;
  if (data.neighborhood !== undefined) update.neighborhood = data.neighborhood || null;
  if (data.funnelStage !== undefined) update.funnel_stage = data.funnelStage;

  return update;
}

// Supabase leads service
export class LeadsService {
  private supabase = createClient();

  async fetchLeads(): Promise<Lead[]> {
    const { data, error } = await this.supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(dbLeadToLead);
  }

  async createLead(leadData: LeadFormData, userId: string): Promise<Lead> {
    const { data, error } = await this.supabase
      .from("leads")
      .insert(leadToDbInsert(leadData, userId))
      .select()
      .single();

    if (error) throw error;
    return dbLeadToLead(data);
  }

  async updateLead(id: string, data: Partial<LeadFormData>): Promise<Lead> {
    const { data: updated, error } = await this.supabase
      .from("leads")
      .update(leadToDbUpdate(data))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return dbLeadToLead(updated);
  }

  async deleteLead(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("leads")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async batchImportLeads(leads: Lead[], userId: string): Promise<Lead[]> {
    const inserts: DbLeadInsert[] = leads.map((lead) => ({
      user_id: userId,
      name: lead.name,
      phone: lead.phone || null,
      email: lead.email || null,
      type: lead.type,
      broker: lead.broker || null,
      origin: lead.origin || null,
      interest: lead.interest || null,
      value: lead.value ?? null,
      city: lead.city || null,
      neighborhood: lead.neighborhood || null,
      funnel_stage: lead.funnelStage,
    }));

    const { data, error } = await this.supabase
      .from("leads")
      .insert(inserts)
      .select();

    if (error) throw error;
    return (data || []).map(dbLeadToLead);
  }

  async moveLead(id: string, newStage: FunnelStage): Promise<void> {
    const { error } = await this.supabase
      .from("leads")
      .update({ funnel_stage: newStage })
      .eq("id", id);

    if (error) throw error;
  }
}

export const leadsService = new LeadsService();
