"use client";

import { useState, useEffect } from "react";
import { Lead, LeadFormData, FUNNEL_STAGES, LEAD_TYPES, FunnelStage, LeadType } from "../types/lead";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onSave: (data: LeadFormData) => void;
  onUpdate: (id: string, data: Partial<LeadFormData>) => void;
}

const EMPTY_FORM: LeadFormData = {
  name: "",
  email: "",
  phone: "",
  type: "Lead",
  interest: "",
  notes: "",
  rentValue: undefined,
  city: "",
  neighborhood: "",
  funnelStage: "Novo Lead",
};

export function LeadFormDialog({ open, onOpenChange, lead, onSave, onUpdate }: LeadFormDialogProps) {
  const [form, setForm] = useState<LeadFormData>(EMPTY_FORM);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        type: lead.type,
        interest: lead.interest,
        notes: lead.notes,
        rentValue: lead.rentValue,
        city: lead.city,
        neighborhood: lead.neighborhood,
        funnelStage: lead.funnelStage,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [lead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (lead) {
      onUpdate(lead.id, form);
    } else {
      onSave(form);
    }
    onOpenChange(false);
  };

  const handleChange = (field: keyof LeadFormData, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="crm-modal-overlay" onClick={() => onOpenChange(false)}>
      <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crm-modal-header">
          <h2>{lead ? "Editar Lead" : "Novo Lead"}</h2>
          <button onClick={() => onOpenChange(false)} className="crm-modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="crm-form">
          <div className="crm-form-grid">
            <div className="crm-form-group crm-form-full">
              <label>Nome *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="crm-form-group">
              <label>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="crm-form-group">
              <label>Telefone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="crm-form-group">
              <label>Tipo</label>
              <select value={form.type} onChange={(e) => handleChange("type", e.target.value as LeadType)}>
                {LEAD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="crm-form-group">
              <label>Etapa do Funil</label>
              <select value={form.funnelStage} onChange={(e) => handleChange("funnelStage", e.target.value as FunnelStage)}>
                {FUNNEL_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="crm-form-group crm-form-full">
              <label>Interesse</label>
              <input
                type="text"
                value={form.interest}
                onChange={(e) => handleChange("interest", e.target.value)}
                placeholder="Ex: Consórcio Imobiliário - Carta 200k"
              />
            </div>

            {form.type === "Locatário" && (
              <div className="crm-form-group">
                <label>Valor do Aluguel (R$)</label>
                <input
                  type="number"
                  value={form.rentValue ?? ""}
                  onChange={(e) => handleChange("rentValue", e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="2500"
                />
              </div>
            )}

            <div className="crm-form-group">
              <label>Cidade</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="São Paulo"
              />
            </div>

            <div className="crm-form-group">
              <label>Bairro</label>
              <input
                type="text"
                value={form.neighborhood}
                onChange={(e) => handleChange("neighborhood", e.target.value)}
                placeholder="Centro"
              />
            </div>

            <div className="crm-form-group crm-form-full">
              <label>Observações</label>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Notas adicionais sobre o lead..."
                rows={3}
              />
            </div>
          </div>

          <div className="crm-form-actions">
            <button type="button" onClick={() => onOpenChange(false)} className="crm-btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="crm-btn-primary">
              {lead ? "Salvar" : "Criar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
