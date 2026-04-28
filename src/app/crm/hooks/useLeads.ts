"use client";

import { useState, useEffect, useCallback } from "react";
import { Lead, LeadFormData, FunnelStage } from "../types/lead";

const STORAGE_KEY = "lumio-crm-leads";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setLeads(JSON.parse(stored));
      } catch {
        setLeads([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

  const addLead = useCallback((data: LeadFormData) => {
    const newLead: Lead = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, data: Partial<LeadFormData>) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === id ? { ...lead, ...data } : lead))
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const moveLead = useCallback((id: string, newStage: FunnelStage) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, funnelStage: newStage } : lead
      )
    );
  }, []);

  const importLeads = useCallback((newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
  }, []);

  const clearLeads = useCallback(() => {
    setLeads([]);
  }, []);

  return {
    leads,
    isLoaded,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
    importLeads,
    clearLeads,
  };
}
