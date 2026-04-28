"use client";

import { useState, useRef } from "react";
import { Lead, FUNNEL_STAGES, FunnelStage } from "../types/lead";

interface KanbanViewProps {
  leads: Lead[];
  onMoveLead: (id: string, stage: FunnelStage) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const STAGE_COLORS: Record<FunnelStage, string> = {
  "Novo Lead": "var(--crm-blue)",
  "Em Prospecção IA": "var(--crm-blue-light)",
  "Em Prospecção Humano": "var(--crm-blue-dark)",
  "Reunião Agendada": "var(--crm-purple)",
  "Proposta Enviada": "var(--crm-orange)",
  Ganho: "var(--crm-green)",
  Perdido: "var(--crm-red)",
  "Sem interesse": "var(--crm-gray)",
};

export function KanbanView({ leads, onMoveLead, onEditLead, onDeleteLead }: KanbanViewProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FunnelStage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stage: FunnelStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: FunnelStage) => {
    e.preventDefault();
    if (draggedId) {
      onMoveLead(draggedId, stage);
    }
    setDraggedId(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStage(null);
  };

  // Touch support for mobile
  const handleTouchMove = (id: string) => {
    setDraggedId(id);
  };

  return (
    <div className="crm-kanban-wrapper" ref={scrollRef}>
      <div className="crm-kanban-board">
        {FUNNEL_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.funnelStage === stage);
          const isOver = dragOverStage === stage;

          return (
            <div
              key={stage}
              className={`crm-kanban-column ${isOver ? "crm-kanban-column-over" : ""}`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="crm-kanban-header" style={{ borderColor: STAGE_COLORS[stage] }}>
                <span className="crm-kanban-title">{stage}</span>
                <span className="crm-kanban-count">{stageLeads.length}</span>
              </div>
              <div className="crm-kanban-cards">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className={`crm-kanban-card ${draggedId === lead.id ? "crm-kanban-card-dragging" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="crm-kanban-card-header">
                      <span className="crm-kanban-card-name">{lead.name}</span>
                      <span className="crm-kanban-card-type">{lead.type}</span>
                    </div>
                    <div className="crm-kanban-card-info">
                      {lead.interest && <p className="crm-kanban-card-interest">{lead.interest}</p>}
                      {lead.phone && <p className="crm-kanban-card-phone">{lead.phone}</p>}
                      {lead.city && (
                        <p className="crm-kanban-card-location">
                          {lead.city}{lead.neighborhood ? `, ${lead.neighborhood}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="crm-kanban-card-actions">
                      <button onClick={() => onEditLead(lead)} className="crm-btn-small">
                        Editar
                      </button>
                      <button onClick={() => onDeleteLead(lead.id)} className="crm-btn-small crm-btn-danger">
                        Excluir
                      </button>
                    </div>
                    {/* Mobile stage selector */}
                    <select
                      className="crm-kanban-mobile-select"
                      value={lead.funnelStage}
                      onChange={(e) => onMoveLead(lead.id, e.target.value as FunnelStage)}
                    >
                      {FUNNEL_STAGES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div className="crm-kanban-empty">Arraste leads aqui</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
