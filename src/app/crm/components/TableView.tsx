"use client";

import { useState, useRef, useCallback } from "react";
import { Lead } from "../types/lead";

interface TableViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  sortField: string;
  sortDir: "asc" | "desc";
  onSort: (field: string) => void;
}

const COLUMNS = [
  { key: "createdAt", label: "Data", sortable: true, minWidth: 80, defaultWidth: 100 },
  { key: "name", label: "Nome", sortable: true, minWidth: 120, defaultWidth: 180 },
  { key: "phone", label: "Telefone", sortable: false, minWidth: 100, defaultWidth: 130, hideClass: "crm-hide-mobile" },
  { key: "type", label: "Tipo", sortable: false, minWidth: 80, defaultWidth: 100, hideClass: "crm-hide-tablet" },
  { key: "broker", label: "Corretor", sortable: false, minWidth: 100, defaultWidth: 130, hideClass: "crm-hide-tablet" },
  { key: "origin", label: "Origem", sortable: false, minWidth: 80, defaultWidth: 100, hideClass: "crm-hide-tablet" },
  { key: "value", label: "Valor", sortable: true, minWidth: 90, defaultWidth: 110, hideClass: "crm-hide-mobile" },
  { key: "funnelStage", label: "Etapa", sortable: false, minWidth: 100, defaultWidth: 140 },
  { key: "actions", label: "Ações", sortable: false, minWidth: 80, defaultWidth: 90 },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function formatCurrency(value?: number): string {
  if (!value) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SortIcon({ field, sortField, sortDir }: { field: string; sortField: string; sortDir: string }) {
  if (field !== sortField) return <span className="crm-sort-icon">↕</span>;
  return <span className="crm-sort-icon active">{sortDir === "asc" ? "↑" : "↓"}</span>;
}

export function TableView({ leads, onEditLead, onDeleteLead, sortField, sortDir, onSort }: TableViewProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    COLUMNS.forEach((col) => {
      widths[col.key] = col.defaultWidth;
    });
    return widths;
  });

  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = {
      key: columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey],
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [columnWidths]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!resizingRef.current) return;
    const { key, startX, startWidth } = resizingRef.current;
    const column = COLUMNS.find((c) => c.key === key);
    const minWidth = column?.minWidth || 50;
    const diff = e.clientX - startX;
    const newWidth = Math.max(minWidth, startWidth + diff);
    setColumnWidths((prev) => ({ ...prev, [key]: newWidth }));
  }, []);

  const handleMouseUp = useCallback(() => {
    resizingRef.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  if (leads.length === 0) {
    return (
      <div className="crm-empty-state">
        <p>Nenhum lead encontrado</p>
        <p className="crm-empty-hint">Adicione um novo lead ou importe dados via Excel/CSV</p>
      </div>
    );
  }

  const renderCell = (lead: Lead, columnKey: string) => {
    switch (columnKey) {
      case "createdAt":
        return formatDate(lead.createdAt);
      case "name":
        return (
          <>
            <div className="crm-lead-name">{lead.name}</div>
            <div className="crm-lead-interest">{lead.interest}</div>
          </>
        );
      case "email":
        return lead.email || "-";
      case "phone":
        return lead.phone || "-";
      case "type":
        return <span className="crm-badge crm-badge-type">{lead.type}</span>;
      case "broker":
        return lead.broker || "-";
      case "origin":
        return lead.origin || "-";
      case "value":
        return formatCurrency(lead.value);
      case "funnelStage":
        return (
          <span className={`crm-badge crm-badge-stage crm-stage-${getStageClass(lead.funnelStage)}`}>
            {lead.funnelStage}
          </span>
        );
      case "actions":
        return (
          <div className="crm-actions">
            <button onClick={() => onEditLead(lead)} className="crm-btn-icon" title="Editar">
              ✏️
            </button>
            <button onClick={() => onDeleteLead(lead.id)} className="crm-btn-icon crm-btn-danger" title="Excluir">
              🗑️
            </button>
          </div>
        );
      default:
        return "-";
    }
  };

  return (
    <div className="crm-table-container">
      <table className="crm-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`${col.sortable ? "crm-th-sortable" : ""} ${col.hideClass || ""}`}
                style={{ width: columnWidths[col.key], minWidth: col.minWidth }}
                onClick={col.sortable ? () => onSort(col.key) : undefined}
              >
                <div className="crm-th-content">
                  <span>
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} sortField={sortField} sortDir={sortDir} />}
                  </span>
                  {col.key !== "actions" && (
                    <div
                      className="crm-resize-handle"
                      onMouseDown={(e) => handleMouseDown(e, col.key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              {COLUMNS.map((col) => (
                <td
                  key={col.key}
                  className={col.hideClass || ""}
                  style={{ width: columnWidths[col.key], minWidth: col.minWidth }}
                >
                  {renderCell(lead, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStageClass(stage: string): string {
  const map: Record<string, string> = {
    "Novo Lead": "novo",
    "Em Prospecção IA": "prospeccao",
    "Em Prospecção Humano": "prospeccao",
    "Reunião Agendada": "reuniao",
    "Proposta Enviada": "proposta",
    Ganho: "ganho",
    Perdido: "perdido",
    "Sem interesse": "perdido",
  };
  return map[stage] || "novo";
}
