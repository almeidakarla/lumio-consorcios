"use client";

import { Lead } from "../types/lead";

interface StatsBarProps {
  leads: Lead[];
}

export function StatsBar({ leads }: StatsBarProps) {
  const total = leads.length;
  const ganhos = leads.filter((l) => l.funnelStage === "Ganho").length;
  const perdidos = leads.filter((l) => l.funnelStage === "Perdido").length;
  const emProspeccao = leads.filter(
    (l) => l.funnelStage === "Em Prospecção IA" || l.funnelStage === "Em Prospecção Humano"
  ).length;

  const stats = [
    { label: "Total", value: total, color: "var(--crm-blue)" },
    { label: "Em Prospecção", value: emProspeccao, color: "var(--crm-blue-light)" },
    { label: "Ganhos", value: ganhos, color: "var(--crm-green)" },
    { label: "Perdidos", value: perdidos, color: "var(--crm-red)" },
  ];

  return (
    <div className="crm-stats-bar">
      {stats.map((stat) => (
        <div key={stat.label} className="crm-stat-card">
          <span className="crm-stat-value" style={{ color: stat.color }}>
            {stat.value}
          </span>
          <span className="crm-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
