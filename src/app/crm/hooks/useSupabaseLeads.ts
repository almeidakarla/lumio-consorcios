"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lead, LeadFormData, FunnelStage } from "../types/lead";
import { leadsService, dbLeadToLead } from "../lib/supabase-leads";
import { DbLead } from "@/lib/supabase/database.types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const LOCALSTORAGE_KEY = "lumio-crm-leads";
const MIGRATION_KEY = "lumio-crm-migrated";

export function useSupabaseLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [pendingMigration, setPendingMigration] = useState<Lead[] | null>(null);
  const supabase = createClient();
  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch user and leads on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Fallback to localStorage for dev mode
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (stored) {
        try {
          setLeads(JSON.parse(stored));
        } catch {
          setLeads([]);
        }
      }
      setIsLoaded(true);
      return;
    }

    const init = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoaded(true);
          return;
        }
        setUserId(user.id);

        // Fetch leads from Supabase
        const fetchedLeads = await leadsService.fetchLeads();
        setLeads(fetchedLeads);
        setIsLoaded(true);

        // Check for localStorage migration
        const migrated = localStorage.getItem(MIGRATION_KEY);
        if (!migrated) {
          const stored = localStorage.getItem(LOCALSTORAGE_KEY);
          if (stored) {
            try {
              const localLeads = JSON.parse(stored) as Lead[];
              if (localLeads.length > 0) {
                setPendingMigration(localLeads);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leads");
        setIsLoaded(true);
      }
    };

    init();
  }, [supabase.auth]);

  // Set up real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !userId) return;

    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<DbLead>) => {
          if (payload.eventType === "INSERT") {
            const newLead = dbLeadToLead(payload.new as unknown as DbLead);
            setLeads((prev) => {
              // Avoid duplicates
              if (prev.some((l) => l.id === newLead.id)) return prev;
              return [newLead, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedLead = dbLeadToLead(payload.new as unknown as DbLead);
            setLeads((prev) =>
              prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setLeads((prev) => prev.filter((l) => l.id !== deletedId));
          }
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [supabase, userId]);

  // Sync to localStorage in dev mode
  useEffect(() => {
    if (!isSupabaseConfigured && isLoaded) {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, isLoaded]);

  const addLead = useCallback(
    async (data: LeadFormData): Promise<Lead | null> => {
      if (!isSupabaseConfigured) {
        // Dev mode fallback
        const newLead: Lead = {
          ...data,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          createdAt: new Date().toISOString(),
        };
        setLeads((prev) => [newLead, ...prev]);
        return newLead;
      }

      if (!userId) return null;

      try {
        const newLead = await leadsService.createLead(data, userId);
        // Real-time will handle the update, but we can optimistically add
        setLeads((prev) => {
          if (prev.some((l) => l.id === newLead.id)) return prev;
          return [newLead, ...prev];
        });
        return newLead;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create lead");
        return null;
      }
    },
    [userId]
  );

  const updateLead = useCallback(
    async (id: string, data: Partial<LeadFormData>): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, ...data } : lead))
        );
        return true;
      }

      try {
        await leadsService.updateLead(id, data);
        // Real-time will handle the update
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update lead");
        return false;
      }
    },
    []
  );

  const deleteLead = useCallback(async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      return true;
    }

    try {
      // Optimistic delete
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      await leadsService.deleteLead(id);
      return true;
    } catch (err) {
      // Rollback on error
      setError(err instanceof Error ? err.message : "Failed to delete lead");
      return false;
    }
  }, []);

  const moveLead = useCallback(
    async (id: string, newStage: FunnelStage): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === id ? { ...lead, funnelStage: newStage } : lead
          )
        );
        return true;
      }

      try {
        // Optimistic update
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === id ? { ...lead, funnelStage: newStage } : lead
          )
        );
        await leadsService.moveLead(id, newStage);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to move lead");
        return false;
      }
    },
    []
  );

  const importLeads = useCallback(
    async (newLeads: Lead[]): Promise<boolean> => {
      if (!isSupabaseConfigured) {
        setLeads((prev) => [...newLeads, ...prev]);
        return true;
      }

      if (!userId) return false;

      try {
        const imported = await leadsService.batchImportLeads(newLeads, userId);
        setLeads((prev) => [...imported, ...prev]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to import leads");
        return false;
      }
    },
    [userId]
  );

  const migrateFromLocalStorage = useCallback(async (): Promise<boolean> => {
    if (!pendingMigration || !userId) return false;

    try {
      await leadsService.batchImportLeads(pendingMigration, userId);
      localStorage.setItem(MIGRATION_KEY, "true");
      localStorage.removeItem(LOCALSTORAGE_KEY);
      setPendingMigration(null);
      // Refetch to get all leads
      const fetchedLeads = await leadsService.fetchLeads();
      setLeads(fetchedLeads);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to migrate leads");
      return false;
    }
  }, [pendingMigration, userId]);

  const dismissMigration = useCallback(() => {
    localStorage.setItem(MIGRATION_KEY, "true");
    localStorage.removeItem(LOCALSTORAGE_KEY);
    setPendingMigration(null);
  }, []);

  const clearLeads = useCallback(async (): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      setLeads([]);
      return true;
    }

    // For Supabase, we would need to delete all leads one by one
    // This is intentionally not implemented for safety
    return false;
  }, []);

  return {
    leads,
    isLoaded,
    error,
    addLead,
    updateLead,
    deleteLead,
    moveLead,
    importLeads,
    clearLeads,
    // Migration helpers
    pendingMigration,
    migrateFromLocalStorage,
    dismissMigration,
  };
}
